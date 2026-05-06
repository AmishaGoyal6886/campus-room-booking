import express from 'express';
import db from '../db.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all rooms (with filters)
router.get('/', async (req, res) => {
    try {
        const { capacity, facility } = req.query;

        let query = `
            SELECT r.*, GROUP_CONCAT(rf.facility) as facilities 
            FROM Rooms r
            LEFT JOIN Room_Facilities rf ON r.room_id = rf.room_id
        `;

        const params = [];
        const conditions = [];

        if (capacity) {
            conditions.push(`r.capacity >= ?`);
            params.push(capacity);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' GROUP BY r.room_id';

        if (facility) {
            query += ` HAVING facilities LIKE ?`;
            params.push(`%${facility}%`);
        }

        const [rooms] = await db.execute(query, params);
        res.json(rooms);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch rooms' });
    }
});

// Admin: Add new room
router.post('/', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const { room_number, building, capacity, facilities } = req.body;

        if (!room_number || !building || !capacity) {
            return res.status(400).json({
                error: 'Room number, building, and capacity are required.'
            });
        }

        const [result] = await db.execute(
            'INSERT INTO Rooms (room_number, building, capacity) VALUES (?, ?, ?)',
            [room_number, building, capacity]
        );

        const roomId = result.insertId;

        if (facilities && facilities.length > 0) {
            for (let f of facilities) {
                await db.execute(
                    'INSERT INTO Room_Facilities (room_id, facility) VALUES (?, ?)',
                    [roomId, f]
                );
            }
        }

        res.status(201).json({ message: 'Room added successfully' });

    } catch (err) {
        console.error(err);

        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                error: 'Room already exists in this building.'
            });
        }

        res.status(500).json({ error: 'Failed to add room' });
    }
});

// Admin: Delete room
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
    try {
        await db.execute(
            'DELETE FROM Rooms WHERE room_id = ?',
            [req.params.id]
        );

        res.json({ message: 'Room deleted successfully' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete room' });
    }
});

export default router;