import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        const [existing] = await db.execute(
            'SELECT email FROM Users WHERE email = ?',
            [email]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: 'Email already registered.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.execute(
            'INSERT INTO Users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, role]
        );

        res.status(201).json({ message: 'User registered successfully!' });

    } catch (err) {
        console.error("REGISTER ERROR FULL:", err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const [users] = await db.execute(
            'SELECT * FROM Users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(400).json({ error: 'Invalid email or password.' });
        }

        const user = users[0];

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid email or password.' });
        }

        const token = jwt.sign(
            { id: user.user_id, role: user.role, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({ token, role: user.role, name: user.name });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

export default router;