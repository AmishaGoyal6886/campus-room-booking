import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();

    if (!user) return null;

    return (
        <nav className="navbar fade-in">
            <Link to="/" className="nav-brand">Campus Booking</Link>
            <div className="nav-links">
                <Link to="/" className="nav-link">Dashboard</Link>
                <Link to="/rooms" className="nav-link">Rooms</Link>
                <button onClick={logout} className="btn btn-outline" style={{padding: '0.5rem 1rem'}}>Logout</button>
            </div>
        </nav>
    );
};

export default Navbar;
