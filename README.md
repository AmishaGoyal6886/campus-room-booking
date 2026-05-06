# Campus Room Booking System

A complete full-stack web application designed for booking campus rooms. This project demonstrates strong database management concepts including normalization, constraint management, role-based access control, and intuitive UI/UX design.

## Features
- **User Roles:** Student, Faculty, and Admin.
- **Role-based Authentication:** JWT access tokens and password hashing via bcrypt.
- **Room Management:** Admins can create, delete, and view rooms alongside facility capabilities.
- **Booking Engine:** Users can select multi-day windows with varying daily slot requests. The system actively detects time overlap anomalies at the SQL level.
- **Admin Dashboard:** Approve/reject bookings from users and view system statistics.

## Tech Stack
- **Frontend:** React + Vite, Vanilla CSS.
- **Backend:** Node.js, Express.
- **Database:** MySQL.
- **Styles:** Custom Hand-built dark theme aesthetic interface.

## Quick Start Guide

### 1. Database Setup
1. Install MySQL and make sure it is running on your machine.
2. Open `backend/.env` and update the DB configuration details (`DB_USER`, `DB_PASSWORD`, `DB_NAME`). By default it points to `root` without a password.
3. Open your MySQL client and run the text inside `backend/schema.sql` to generate the normalized tables and the initial Admin account.
This command works inside standard SQL Shells:
```sql
source path/to/backend/schema.sql
```

### 2. Backend Setup
```bash
cd backend
npm install
npm start
```
The express app will automatically launch on `http://localhost:5000`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The React frontend will be available at `http://localhost:5173`. 

### Built-In Accounts
* **Admin Login:** `admin@campus.edu` | Password: `admin123`

---
Check the `DB_DESIGN.md` for in-depth insights into the relations and logical architecture implemented in this application.
