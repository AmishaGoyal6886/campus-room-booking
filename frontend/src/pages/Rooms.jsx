import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { fetchWithAuth } from '../api';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

const Rooms = () => {
    const { user } = useAuth();
    const [rooms, setRooms] = useState([]);
    
    // Add Room Form State
    const [showAddForm, setShowAddForm] = useState(false);
    const [newRoom, setNewRoom] = useState({ room_number: '', building: '', capacity: 30, facilities: '' });

    useEffect(() => {
        loadRooms();
    }, []);

    const loadRooms = async () => {
        try {
            const data = await fetchWithAuth('/rooms');
            setRooms(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddRoom = async (e) => {
        e.preventDefault();
        try {
            const facilitiesArray = newRoom.facilities.split(',').map(f => f.trim()).filter(f => f);
            await fetchWithAuth('/rooms', {
                method: 'POST',
                body: JSON.stringify({ ...newRoom, capacity: parseInt(newRoom.capacity), facilities: facilitiesArray })
            });
            setShowAddForm(false);
            setNewRoom({ room_number: '', building: '', capacity: 30, facilities: '' });
            loadRooms();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await fetchWithAuth(`/rooms/${id}`, { method: 'DELETE' });
            loadRooms();
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <>
            <Navbar />
            <div className="container fade-in">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
                    <h1 className="page-title" style={{margin: 0}}>Campus Rooms</h1>
                    {user.role === 'admin' && (
                        <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary" style={{width: 'auto'}}>
                            {showAddForm ? 'Cancel' : '+ Add Room'}
                        </button>
                    )}
                </div>

                {showAddForm && user.role === 'admin' && (
                    <div className="card fade-in" style={{marginBottom: '2rem'}}>
                        <h3 className="card-title">Add New Room</h3>
                        <form onSubmit={handleAddRoom} style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                            <input className="form-input" placeholder="Room Number (e.g. 101)" value={newRoom.room_number} onChange={e=>setNewRoom({...newRoom, room_number: e.target.value})} required/>
                            <input className="form-input" placeholder="Building (e.g. Science Block)" value={newRoom.building} onChange={e=>setNewRoom({...newRoom, building: e.target.value})} required/>
                            <input className="form-input" type="number" placeholder="Capacity" value={newRoom.capacity} onChange={e=>setNewRoom({...newRoom, capacity: e.target.value})} required/>
                            <input className="form-input" placeholder="Facilities (comma separated)" value={newRoom.facilities} onChange={e=>setNewRoom({...newRoom, facilities: e.target.value})}/>
                            <div style={{gridColumn: '1 / -1'}}>
                                <button type="submit" className="btn btn-primary">Save Room</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="grid">
                    {rooms.map(r => (
                        <div key={r.room_id} className="card">
                            <h3 className="card-title">{r.room_number}</h3>
                            <p style={{color: 'var(--text-muted)', margin: '0.25rem 0'}}>📍 {r.building}</p>
                            <p style={{color: 'var(--text-muted)', margin: '0.25rem 0'}}>👥 Capacity: {r.capacity}</p>
                            <p style={{color: 'var(--text-muted)', margin: '0.25rem 0', minHeight: '20px'}}>
                                🛠️ {r.facilities || 'None'}
                            </p>
                            <div style={{marginTop: '1.5rem', display: 'flex', gap: '1rem'}}>
                                {user.role !== 'admin' && (
                                    <Link to={`/book/${r.room_id}`} className="btn btn-primary" style={{textAlign: 'center', textDecoration: 'none', display: 'block'}}>Book Room</Link>
                                )}
                                {user.role === 'admin' && (
                                    <button onClick={() => handleDelete(r.room_id)} className="btn btn-outline" style={{color: 'var(--danger)', borderColor: 'var(--danger)'}}>Delete</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default Rooms;
