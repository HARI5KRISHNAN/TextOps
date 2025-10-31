import { db } from '../db';
import { encryptMessage, decryptMessage } from '../services/encryption.service';
import type { Role, BroadcastMessage } from '../types';

const ensureUserExists = async (userId: number) => {
    if (!userId) return;
    const user = await db.query('SELECT id FROM users WHERE id = $1', [userId]);
    if (user.rows.length === 0) {
        if (userId === 1) {
            await db.query(
                `INSERT INTO users (id, name, email, password_hash, avatar) 
                 VALUES (1, 'Demo User', 'demo@whooper.com', 'none', 'https://i.pravatar.cc/40?u=demo@whooper.com') 
                 ON CONFLICT (id) DO NOTHING`
            );
        }
    }
};

export const getMessages = async (req, res) => {
    const { channelId } = req.params;
    const userId = req.query.userId as string;

    try {
        await ensureUserExists(parseInt(userId, 10));
        
        const result = await db.query(`
            SELECT 
              m.id, 
              m.content_encrypted, 
              m.is_encrypted,
              m.iv,
              m.auth_tag,
              m.created_at as timestamp, 
              m.is_read as "isRead", 
              m.reactions,
              json_build_object('id', u.id, 'name', u.name, 'avatar', u.avatar) as sender,
              CASE WHEN u.id::text = $2 THEN 'user' ELSE 'model' END as role
            FROM messages m
            JOIN users u ON m.user_id = u.id
            WHERE m.channel_id = $1
            ORDER BY m.created_at ASC
        `, [channelId, userId]);

        const decryptedMessages = result.rows.map(msg => {
            if (msg.is_encrypted && msg.content_encrypted) {
                try {
                    msg.content = decryptMessage({
                        ciphertext: msg.content_encrypted,
                        iv: msg.iv,
                        authTag: msg.auth_tag,
                    });
                } catch (error) {
                    console.error('Failed to decrypt message ID:', msg.id, error);
                    msg.content = '[Decryption Error]';
                }
            } else {
                msg.content = msg.content_encrypted; // Fallback for non-encrypted or legacy messages
            }
            
            delete msg.content_encrypted;
            delete msg.iv;
            delete msg.auth_tag;
            delete msg.is_encrypted;
            return msg;
        });

        res.status(200).json(decryptedMessages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Server error while fetching messages.' });
    }
};

export const sendMessage = async (req, res) => {
    const { channelId } = req.params;
    const { content, userId } = req.body;

    // Validation is now handled by middleware, but we keep checks as a fallback.
    if (!content || !userId) {
        return res.status(400).json({ message: 'Content and userId are required.' });
    }

    try {
        await ensureUserExists(userId);

        // Encrypt the message content before storing
        const encrypted = encryptMessage(content);

        const result = await db.query(`
            INSERT INTO messages (
              channel_id, 
              user_id, 
              content_encrypted, 
              is_encrypted,
              iv,
              auth_tag,
              reactions
            )
            VALUES ($1, $2, $3, $4, $5, $6, '{}')
            RETURNING id, created_at as timestamp
        `, [
            channelId, 
            userId, 
            encrypted.ciphertext,
            true,
            encrypted.iv,
            encrypted.authTag
        ]);

        const userResult = await db.query('SELECT id, name, avatar FROM users WHERE id = $1', [userId]);

        const newMessage: BroadcastMessage = {
            id: result.rows[0].id,
            channelId: channelId,
            content: content, // Send the original plaintext content back
            sender: userResult.rows[0],
            role: 'user' as Role,
            timestamp: result.rows[0].timestamp,
            isRead: false,
            reactions: {},
        };

        req.io.to(channelId).emit('new_message', newMessage);
        res.status(201).json(newMessage);

    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Server error while sending message.' });
    }
};
