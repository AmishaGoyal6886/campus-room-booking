



import mysql from "mysql2/promise";

const pool = mysql.createPool({
    host: "localhost",
    user: "amisha",
    password: "1234",
    database: "campus_booking",
});

export default pool;