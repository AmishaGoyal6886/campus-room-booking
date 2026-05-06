import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { fetchWithAuth } from '../api';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await fetchWithAuth('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            login(data);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="auth-container fade-in">
            <div className="auth-card">
                <h2 className="auth-title">Welcome Back</h2>
                {error && <div style={{color:'var(--danger)', marginBottom:'1rem', textAlign:'center'}}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input className="form-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input className="form-input" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn btn-primary">Login</button>
                </form>
                <div style={{marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)'}}>
                    Don't have an account? <Link to="/register" style={{color: 'var(--primary)'}}>Register</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
