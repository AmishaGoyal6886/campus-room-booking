import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import BookRoom from './pages/BookRoom';
import './index.css';

const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;
    return children;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <div className="app">
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/" element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="/rooms" element={
                            <ProtectedRoute>
                                <Rooms />
                            </ProtectedRoute>
                        } />
                        <Route path="/book/:id" element={
                            <ProtectedRoute>
                                <BookRoom />
                            </ProtectedRoute>
                        } />
                    </Routes>
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;
