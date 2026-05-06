import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from "./db.js";

dotenv.config();

// DB check
(async () => {
  try {
    const connection = await db.getConnection();
    console.log("✅ MySQL Connected Successfully!");
    connection.release();
  } catch (err) {
    console.error("❌ DB CONNECTION ERROR:", err);
  }
})();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ IMPORT routes (not require)
import authRoutes from './routes/auth.js';
import roomRoutes from './routes/rooms.js';
import bookingRoutes from './routes/bookings.js';

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);

app.get('/', (req, res) => {
  res.send('Campus Room Booking API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});