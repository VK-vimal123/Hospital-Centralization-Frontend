import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password, picture = null) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });
            
            if (data.success) {
                const userData = { ...data.user, ...(picture && { picture }) };
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                localStorage.setItem('token', userData.token);
                return { success: true, user: userData };
            }
            return { success: false, message: 'Invalid response format from server' };
        } catch (error) {
            console.error('Backend login failed:', error);
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const googleLogin = async (token) => {
        try {
            const { data } = await api.post('/auth/google', { token });
            if (data.success) {
                setUser(data.user);
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('token', data.user.token);
                return { success: true, user: data.user };
            }
            return { success: false, message: 'Invalid response format from server' };
        } catch (error) {
            console.error('Google login failed:', error);
            return { success: false, message: error.response?.data?.message || 'Google Login failed' };
        }
    };

    const register = async (userData) => {
        try {
            const { data } = await api.post('/auth/register', userData);
            if (data.success) {
                setUser(data.user);
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('token', data.user.token);
                return { success: true, user: data.user };
            }
            return { success: false, message: 'Invalid response from server' };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Registration failed' };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, login, googleLogin, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
