import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { fetchWithAuth } from '../api';
import Navbar from '../components/Navbar';

const Dashboard = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const b = await fetchWithAuth('/bookings');
                setBookings(b);
                if (user.role === 'admin') {
                    const s = await fetchWithAuth('/bookings/stats');
                    setStats(s);
                }
            } catch (err) {
                console.error(err);
            }
        };
        loadData();
    }, [user.role]);

    const handleStatus = async (id, status) => {
        try {
            await fetchWithAuth(`/bookings/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status })
            });
            setBookings(bookings.map(b => b.booking_id === id ? { ...b, status } : b));
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <>
            <Navbar />
            <div className="container fade-in">
                <h1 className="page-title">Welcome, {user.name}</h1>
                
                {stats && (
                    <div className="grid" style={{marginBottom: '2rem'}}>
                        <div className="card">
                            <h3 className="card-title">Total Rooms</h3>
                            <div style={{fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)'}}>{stats.total_rooms}</div>
                        </div>
                        <div className="card">
                            <h3 className="card-title">Pending Approvals</h3>
                            <div style={{fontSize: '2.5rem', fontWeight: 800, color: '#fcd34d'}}>{stats.pending_bookings}</div>
                        </div>
                        <div className="card">
                            <h3 className="card-title">Approved Bookings</h3>
                            <div style={{fontSize: '2.5rem', fontWeight: 800, color: '#6ee7b7'}}>{stats.approved_bookings}</div>
                        </div>
                    </div>
                )}

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                {user.role === 'admin' && <th>User</th>}
                                <th>Room</th>
                                <th>Dates</th>
                                <th>Status</th>
                                {user.role === 'admin' && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map(b => (
                                <tr key={b.booking_id}>
                                    <td>#{b.booking_id}</td>
                                    {user.role === 'admin' && <td>{b.user_name}</td>}
                                    <td>{b.room_number} ({b.building})</td>
                                    <td>
                                        {new Date(b.start_date).toLocaleDateString()} - {new Date(b.end_date).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <span className={`badge badge-${b.status}`}>{b.status}</span>
                                    </td>
                                    {user.role === 'admin' && (
                                        <td>
                                            {b.status === 'pending' && (
                                                <div style={{display: 'flex', gap: '0.5rem'}}>
                                                    <button onClick={() => handleStatus(b.booking_id, 'approved')} className="btn btn-primary" style={{padding: '0.25rem 0.5rem', fontSize: '0.75rem'}}>Approve</button>
                                                    <button onClick={() => handleStatus(b.booking_id, 'rejected')} className="btn btn-outline" style={{padding: '0.25rem 0.5rem', fontSize: '0.75rem'}}>Reject</button>
                                                </div>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {bookings.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{textAlign: 'center', color: 'var(--text-muted)'}}>No bookings found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
