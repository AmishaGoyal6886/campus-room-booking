import React, { useState } from 'react';
import { fetchWithAuth } from '../api';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await fetchWithAuth('/auth/register', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            navigate('/login');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="auth-container fade-in">
            <div className="auth-card">
                <h2 className="auth-title">Create Account</h2>
                {error && <div style={{color:'var(--danger)', marginBottom:'1rem', textAlign:'center'}}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input className="form-input" type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input className="form-input" type="email" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input className="form-input" type="password" value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Role</label>
                        <select className="form-select" value={formData.role} onChange={e=>setFormData({...formData, role: e.target.value})}>
                            <option value="student">Student</option>
                            <option value="faculty">Faculty</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary">Register</button>
                </form>
                <div style={{marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)'}}>
                    Already have an account? <Link to="/login" style={{color: 'var(--primary)'}}>Login</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
