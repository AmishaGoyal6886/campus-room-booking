import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../api';
import Navbar from '../components/Navbar';

const BookRoom = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState({
        start_date: '',
        end_date: '',
        slots: [{ date: '', start_time: '', end_time: '' }]
    });

    const addSlot = () => {
        setBooking({ ...booking, slots: [...booking.slots, { date: '', start_time: '', end_time: '' }] });
    };

    const updateSlot = (index, field, value) => {
        const newSlots = [...booking.slots];
        newSlots[index][field] = value;
        setBooking({ ...booking, slots: newSlots });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await fetchWithAuth('/bookings', {
                method: 'POST',
                body: JSON.stringify({ room_id: parseInt(id), ...booking })
            });
            alert('Booking requested successfully!');
            navigate('/');
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <>
            <Navbar />
            <div className="container fade-in">
                <div className="card" style={{maxWidth: '600px', margin: '0 auto'}}>
                    <h2 className="page-title" style={{fontSize: '2rem'}}>Book Room</h2>
                    <form onSubmit={handleSubmit}>
                        <div style={{display: 'flex', gap: '1rem', marginBottom: '1.5rem'}}>
                            <div className="form-group" style={{flex: 1}}>
                                <label className="form-label">Start Date</label>
                                <input className="form-input" type="date" value={booking.start_date} onChange={e=>setBooking({...booking, start_date: e.target.value})} required />
                            </div>
                            <div className="form-group" style={{flex: 1}}>
                                <label className="form-label">End Date</label>
                                <input className="form-input" type="date" value={booking.end_date} onChange={e=>setBooking({...booking, end_date: e.target.value})} required />
                            </div>
                        </div>

                        <h3 className="card-title" style={{marginBottom: '1rem'}}>Time Slots</h3>
                        {booking.slots.map((slot, i) => (
                            <div key={i} style={{display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'end'}}>
                                <div className="form-group" style={{flex: 1, marginBottom: 0}}>
                                    <label className="form-label">Date</label>
                                    <input className="form-input" type="date" value={slot.date} onChange={e=>updateSlot(i, 'date', e.target.value)} required />
                                </div>
                                <div className="form-group" style={{flex: 1, marginBottom: 0}}>
                                    <label className="form-label">Start Time</label>
                                    <input className="form-input" type="time" value={slot.start_time} onChange={e=>updateSlot(i, 'start_time', e.target.value)} required />
                                </div>
                                <div className="form-group" style={{flex: 1, marginBottom: 0}}>
                                    <label className="form-label">End Time</label>
                                    <input className="form-input" type="time" value={slot.end_time} onChange={e=>updateSlot(i, 'end_time', e.target.value)} required />
                                </div>
                            </div>
                        ))}

                        <button type="button" onClick={addSlot} className="btn btn-outline" style={{marginBottom: '2rem'}}>+ Add Another Slot</button>

                        <button type="submit" className="btn btn-primary">Submit Booking</button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default BookRoom;
