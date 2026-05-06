-- Run this script to setup the database schema
CREATE DATABASE IF NOT EXISTS campus_booking;
USE campus_booking;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('student','faculty','admin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Rooms Table
CREATE TABLE IF NOT EXISTS Rooms (
    room_id INT PRIMARY KEY AUTO_INCREMENT,
    room_number VARCHAR(20) NOT NULL,
    building VARCHAR(100) NOT NULL,
    capacity INT NOT NULL,
    UNIQUE(room_number, building),
    CONSTRAINT chk_capacity CHECK (capacity > 0)
);

-- 3. Room_Facilities Table
CREATE TABLE IF NOT EXISTS Room_Facilities (
    room_id INT NOT NULL,
    facility VARCHAR(50) NOT NULL,
    PRIMARY KEY (room_id, facility),
    FOREIGN KEY (room_id) REFERENCES Rooms(room_id) ON DELETE CASCADE
);

-- 4. Bookings Table
CREATE TABLE IF NOT EXISTS Bookings (
    booking_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    room_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('pending','approved','rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES Rooms(room_id) ON DELETE CASCADE,
    CONSTRAINT chk_dates CHECK (start_date <= end_date)
);

-- 5. Booking_Slots Table
CREATE TABLE IF NOT EXISTS Booking_Slots (
    booking_id INT NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    PRIMARY KEY (booking_id, booking_date, start_time),
    FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id) ON DELETE CASCADE,
    CONSTRAINT chk_times CHECK (start_time < end_time)
);

-- Note: The column is named 'booking_date' instead of 'date' since 'date' is a reserved keyword in some DB engines.

-- Insert Admin User (Password: admin123)
-- bcrypt hash for 'admin123'
INSERT IGNORE INTO Users (name, email, password, role) VALUES 
('Admin', 'admin@campus.edu', '$2a$10$wErcI8/1T2.J2G4zH4.vE.aW8C0u9nCjYh1wQnLzj3Zq./TjGf2Oq', 'admin');

-- 6. Triggers (PL/SQL equivalent for MySQL)
DELIMITER //

CREATE TRIGGER before_booking_slot_insert
BEFORE INSERT ON Booking_Slots
FOR EACH ROW
BEGIN
    DECLARE overlap_count INT;
    
    SELECT COUNT(*) INTO overlap_count
    FROM Booking_Slots bs
    JOIN Bookings b ON bs.booking_id = b.booking_id
    WHERE b.room_id = (SELECT room_id FROM Bookings WHERE booking_id = NEW.booking_id)
      AND b.status IN ('approved', 'pending')
      AND bs.booking_date = NEW.booking_date
      AND (NEW.start_time < bs.end_time AND NEW.end_time > bs.start_time);
      
    IF overlap_count > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Room is already booked or pending for this time slot';
    END IF;
END //

DELIMITER ;

-- 7. Stored Procedures (PL/SQL equivalent for MySQL)
DELIMITER //

CREATE PROCEDURE ApproveBooking(IN p_booking_id INT)
BEGIN
    UPDATE Bookings 
    SET status = 'approved' 
    WHERE booking_id = p_booking_id;
END //

CREATE PROCEDURE RejectBooking(IN p_booking_id INT)
BEGIN
    UPDATE Bookings 
    SET status = 'rejected' 
    WHERE booking_id = p_booking_id;
END //

CREATE PROCEDURE GetUserBookings(IN p_user_id INT)
BEGIN
    SELECT b.booking_id, r.room_number, r.building, b.start_date, b.end_date, b.status
    FROM Bookings b
    JOIN Rooms r ON b.room_id = r.room_id
    WHERE b.user_id = p_user_id
    ORDER BY b.start_date DESC;
END //

DELIMITER ;
