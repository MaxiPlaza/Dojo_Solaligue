import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Sync token with localStorage
    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            // Here you might want to fetch user details if not stored or if just verifying token
            // For now, we'll decode loosely or trust the storage until api call fails 401
            const storedUser = localStorage.getItem('user');
            if (storedUser) setUser(JSON.parse(storedUser));
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
        }
        setLoading(false);
    }, [token]);

    const login = (data) => {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
    };

    const value = {
        user,
        token,
        login,
        logout,
        isAuthenticated: !!user,
        loading
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
