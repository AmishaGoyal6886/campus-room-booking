import express from 'express';
import db from '../db.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

// User: Create booking
router.post('/', authenticate, async (req, res) => {
    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        const { room_id, start_date, end_date, slots } = req.body;

        if (!room_id || !start_date || !end_date || !slots || slots.length === 0) {
            throw new Error('All booking details are required.');
        }

        if (new Date(start_date) > new Date(end_date)) {
            throw new Error('Start date must be before or equal to end date.');
        }

        // Conflict check
        for (let slot of slots) {
            const [conflicts] = await conn.execute(`
                SELECT b.booking_id FROM Bookings b
                JOIN Booking_Slots bs ON b.booking_id = bs.booking_id
                WHERE b.room_id = ? AND b.status IN ('pending', 'approved')
                AND bs.booking_date = ? 
                AND (
                    (bs.start_time < ? AND bs.end_time > ?) OR
                    (bs.start_time >= ? AND bs.start_time < ?)
                )
            `, [
                room_id,
                slot.date,
                slot.end_time,
                slot.start_time,
                slot.start_time,
                slot.end_time
            ]);

            if (conflicts.length > 0) {
                throw new Error(
                    `Time slot conflict on ${slot.date} (${slot.start_time} - ${slot.end_time})`
                );
            }
        }

        const [bookingRes] = await conn.execute(
            'INSERT INTO Bookings (user_id, room_id, start_date, end_date, status) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, room_id, start_date, end_date, 'pending']
        );

        const bookingId = bookingRes.insertId;

        for (let slot of slots) {
            await conn.execute(
                'INSERT INTO Booking_Slots (booking_id, booking_date, start_time, end_time) VALUES (?, ?, ?, ?)',
                [bookingId, slot.date, slot.start_time, slot.end_time]
            );
        }

        await conn.commit();

        res.status(201).json({
            message: 'Booking requested successfully! Waiting for admin approval.'
        });

    } catch (err) {
        await conn.rollback();
        console.error(err);

        res.status(400).json({
            error: err.message || 'Failed to create booking.'
        });

    } finally {
        conn.release();
    }
});

// View bookings
router.get('/', authenticate, async (req, res) => {
    try {
        let query = `
            SELECT b.*, r.room_number, r.building, u.name as user_name 
            FROM Bookings b
            JOIN Rooms r ON b.room_id = r.room_id
            JOIN Users u ON b.user_id = u.user_id
        `;

        const params = [];

        if (req.user.role !== 'admin') {
            query += ' WHERE b.user_id = ?';
            params.push(req.user.id);
        }

        query += ' ORDER BY b.created_at DESC';

        const [bookings] = await db.execute(query, params);

        for (let i = 0; i < bookings.length; i++) {
            const [slots] = await db.execute(
                'SELECT * FROM Booking_Slots WHERE booking_id = ?',
                [bookings[i].booking_id]
            );
            bookings[i].slots = slots;
        }

        res.json(bookings);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch bookings.' });
    }
});

// Admin: Approve/Reject
router.patch('/:id/status', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const { status } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status.' });
        }

        await db.execute(
            'UPDATE Bookings SET status = ? WHERE booking_id = ?',
            [status, req.params.id]
        );

        res.json({ message: `Booking ${status} successfully.` });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update booking status.' });
    }
});

// Admin: Stats
router.get('/stats', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const [[{ total_rooms }]] = await db.execute(
            'SELECT COUNT(*) as total_rooms FROM Rooms'
        );

        const [[{ pending }]] = await db.execute(
            "SELECT COUNT(*) as pending FROM Bookings WHERE status='pending'"
        );

        const [[{ approved }]] = await db.execute(
            "SELECT COUNT(*) as approved FROM Bookings WHERE status='approved'"
        );

        res.json({
            total_rooms,
            pending_bookings: pending,
            approved_bookings: approved
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch stats.' });
    }
});

export default router;