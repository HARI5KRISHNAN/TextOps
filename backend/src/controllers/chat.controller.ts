import { db } from '../db';
import type { Role, BroadcastMessage } from '../types';

const ensureUserExists = async (userId: number) => {
    if (!userId) return;
    const user = await db.query('SELECT id FROM users WHERE id = $1', [userId]);
    if (user.rows.length === 0) {
        // If the user doesn't exist, create it. This is for the default demo user.
        if (userId === 1) {
            await db.query(
                `INSERT INTO users (id, name, email, password_hash, avatar) 
                 VALUES (1, 'Demo User', 'demo@whooper.com', 'none', 'https://i.pravatar.cc/40?u=demo@whooper.com') 
                 ON CONFLICT (id) DO NOTHING`
            );
        }
    }
};

// FIX: Removed explicit Request and Response types to allow for correct type inference from Express router.
export const getMessages = async (req, res) => {
    const { channelId } = req.params;
    const userId = req.query.userId as string;

    try {
        await ensureUserExists(parseInt(userId, 10));
        
        const result = await db.query(`
            SELECT m.id, m.content, m.created_at as timestamp, m.is_read as "isRead", m.reactions,
                   json_build_object('id', u.id, 'name', u.name, 'avatar', u.avatar) as sender,
                   CASE WHEN u.id::text = $2 THEN 'user' ELSE 'model' END as role
            FROM messages m
            JOIN users u ON m.user_id = u.id
            WHERE m.channel_id = $1
            ORDER BY m.created_at ASC
        `, [channelId, userId]);

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Server error while fetching messages.' });
    }
};

// FIX: Removed explicit Request and Response types to allow for correct type inference from Express router.
export const sendMessage = async (req, res) => {
    const { channelId } = req.params;
    const { content, userId } = req.body;

    if (!content) {
        return res.status(400).json({ message: 'Message content cannot be empty.' });
    }
    if (!userId) {
        return res.status(400).json({ message: 'User ID is required.' });
    }

    try {
        await ensureUserExists(userId);

        const result = await db.query(`
            INSERT INTO messages (channel_id, user_id, content)
            VALUES ($1, $2, $3)
            RETURNING id, content, created_at as timestamp, reactions
        `, [channelId, userId, content]);

        const userResult = await db.query('SELECT id, name, avatar FROM users WHERE id = $1', [userId]);

        const newMessage: BroadcastMessage = {
            ...result.rows[0],
            channelId: channelId,
            sender: userResult.rows[0],
            role: 'user' as Role, // Sent by a user
            isRead: false,
        };

        req.io.to(channelId).emit('new_message', newMessage);

        res.status(201).json(newMessage);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Server error while sending message.' });
    }
};