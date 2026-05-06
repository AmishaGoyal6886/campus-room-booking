export const API_URL = 'http://localhost:5000/api';

export const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${url}`, {
        ...options,
        headers,
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
    }
    return data;
};
