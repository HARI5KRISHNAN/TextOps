import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db';

// FIX: Removed explicit Request and Response types to allow for correct type inference from Express router.
export const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide name, email, and password.' });
    }

    try {
        const existingUserResult = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUserResult.rows.length > 0) {
            return res.status(409).json({ message: 'User with this email already exists.' });
        }
        
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        
        const avatar = `https://i.pravatar.cc/40?u=${email}`; // Generate a consistent avatar

        const result = await db.query(
            'INSERT INTO users (name, email, password_hash, avatar) VALUES ($1, $2, $3, $4) RETURNING id, name, email, avatar',
            [name, email, password_hash, avatar]
        );
        
        const newUser = result.rows[0];

        const token = jwt.sign({ id: newUser.id, email: newUser.email }, process.env.JWT_SECRET!, { expiresIn: '1d' });
        
        res.status(201).json({ token, user: newUser });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};

// FIX: Removed explicit Request and Response types to allow for correct type inference from Express router.
export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password.' });
    }

    try {
        const result = await db.query('SELECT id, name, email, avatar, password_hash FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        
        const userPayload = {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar
        };

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: '1d' });
        
        res.status(200).json({ token, user: userPayload });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};