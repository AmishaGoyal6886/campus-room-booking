# Database Design & Normalization

This project operates on a MySQL database specifically structured to maintain data purity and adhere to normalization guidelines (Up to BCNF).

## Entity-Relationship Breakdown

### 1. `Users`
- Stores authentication blocks safely.
- **Primary Key:** `user_id`
- **Candidate Key:** `email` implies user uniqueness.

### 2. `Rooms`
- Retains physical room capabilities.
- **Primary Key:** `room_id`
- **Constraint Checks:** `capacity > 0`. `(room_number, building)` guarantees no two buildings have duplicate room definitions, thus acting as an additional candidate key.

### 3. `Room_Facilities` (1:N)
- Multivalued composite mapping for varying room equipment.
- **Primary Key:** `(room_id, facility)`
- Separating facilities respects 1NF by eliminating comma-separated values in the `Rooms` table, creating atomic domains.

### 4. `Bookings`
- Establishes a transaction umbrella for multiple timeslots. 
- **Dependencies:** Corresponds to exactly 1 user and 1 room.
- Prevents update anomalies by preserving a `status` (pending/approved).

### 5. `Booking_Slots` (1:N)
- Subscribes to partial timeslots within the `Bookings` umbrella. 
- **Primary Key:** `(booking_id, booking_date, start_time)` ensures a booking does not request overlaps on the *same day* internally.
- `start_time < end_time` guarantees time chronology.

## Proof of Normalization (BCNF)
**1st Normal Form (1NF):** Achieved since all fields hold atomic content. Facilities are outsourced to `Room_Facilities`.
**2nd Normal Form (2NF):** Achieved. There are no partial dependencies as all non-prime elements exist because of the entire Primary Key logic map.
**3rd Normal Form (3NF):** Achieved. There are no transitive dependencies. Everything in `Users` relies squarely on `user_id`. Elements in `Rooms` rely entirely on `room_id`.
**Boyce-Codd Normal Form (BCNF):** Achieved. For every non-trivial functional dependency $X \rightarrow Y$, $X$ is a superkey. There are no overlapping candidate keys interfering with partial non-primary dependencies.

## Conflict Detection Engine
Instead of enforcing heavy application-level overlaps, we query the SQL layer using inequality mappings to actively track intersections.

```sql
SELECT b.booking_id FROM Bookings b
JOIN Booking_Slots bs ON b.booking_id = bs.booking_id
WHERE b.room_id = ? AND b.status IN ('pending', 'approved')
AND bs.booking_date = ? 
AND (
    (bs.start_time < ? AND bs.end_time > ?) OR
    (bs.start_time >= ? AND bs.start_time < ?)
)
```
This efficiently prevents Double Booking anomalies via native ACID transactions.
