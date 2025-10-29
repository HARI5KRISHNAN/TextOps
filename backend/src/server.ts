import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

import aiRoutes from './routes/ai.routes';
import chatRoutes from './routes/chat.routes';
import authRoutes from './routes/auth.routes';
import { db } from './db';

// Augment Express's Request interface to include custom properties `io` and `user`.
// This makes them available throughout the application without TypeScript errors.
declare global {
    namespace Express {
        export interface Request {
            io: Server;
            user?: any;
        }
    }
    // Augment the 'Process' interface to include the 'exit' method.
    namespace NodeJS {
        interface Process {
            exit(code?: number): never;
        }
    }
}

const app = express();
const httpServer = createServer(app);

const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        // FOR DEVELOPMENT & TESTING: This allows any origin to facilitate testing in sandboxed environments.
        // In a production environment, you should replace this with a strict list
        // of allowed domains for security.
        callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
};

const io = new Server(httpServer, {
    cors: corsOptions
});

const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Attach io instance to request object.
// FIX: Removed explicit type annotations to allow TypeScript to infer correct Express types.
app.use((req, res, next) => {
    req.io = io;
    next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chat', chatRoutes);

// Health check route
// FIX: Removed explicit type annotations to allow TypeScript to infer correct Express types.
app.get('/', (req, res) => {
  res.send('Whooper API is running!');
});

// Socket.IO connection
io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`);
    
    socket.on('join_chat', (channelId) => {
        console.log(`Socket ${socket.id} joining channel ${channelId}`);
        socket.join(channelId);
    });

    socket.on('typing_start', ({ channelId, user }) => {
        socket.to(channelId).emit('user_typing', { channelId, user });
    });

    socket.on('typing_stop', ({ channelId }) => {
        socket.to(channelId).emit('user_stopped_typing', { channelId });
    });

    socket.on('mark_as_read', async ({ channelId, userId }) => {
        try {
            await db.query(
                'UPDATE messages SET is_read = true WHERE channel_id = $1 AND user_id != $2 AND is_read = false',
                [channelId, userId]
            );
            // Notify clients in the room that messages have been read
            io.to(channelId).emit('messages_read', { channelId, readerId: userId });
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    });

    socket.on('add_reaction', async ({ channelId, messageId, userId, emoji }) => {
        if (!messageId || !userId || !emoji) return;
        try {
            const messageResult = await db.query('SELECT reactions FROM messages WHERE id = $1', [messageId]);
            if (messageResult.rows.length === 0) return;

            const reactions = messageResult.rows[0].reactions || {};
            const usersForEmoji = reactions[emoji] || [];

            if (usersForEmoji.includes(userId)) {
                // User has already reacted with this emoji, so remove their reaction
                reactions[emoji] = usersForEmoji.filter((id: number) => id !== userId);
                if (reactions[emoji].length === 0) {
                    delete reactions[emoji];
                }
            } else {
                // Add user's reaction
                reactions[emoji] = [...usersForEmoji, userId];
            }
            
            await db.query('UPDATE messages SET reactions = $1 WHERE id = $2', [JSON.stringify(reactions), messageId]);

            // Notify all clients in the channel about the updated reaction
            io.to(channelId).emit('reaction_updated', {
                channelId,
                messageId,
                reactions
            });

        } catch (error) {
            console.error('Error handling reaction:', error);
        }
    });

    socket.on('start_call', ({ channelId, caller, type }) => {
        io.to(channelId).emit('incoming_call', {
            channelId,
            caller,
            type
        });
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});


httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});