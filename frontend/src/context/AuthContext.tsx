import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'APPLICANT' | 'EMPLOYER' | 'ADMIN';
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (token: string, userData: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = Cookies.get('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                if (decoded && (decoded as any).exp * 1000 > Date.now()) {
                    // Fetch user details from API
                    api.get('/auth/me')
                        .then(res => setUser(res.data))
                        .catch(() => {
                            Cookies.remove('token');
                            setUser(null);
                        })
                        .finally(() => setLoading(false));
                } else {
                    Cookies.remove('token');
                    setLoading(false);
                }
            } catch (error) {
                Cookies.remove('token');
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, []);

    const login = (token: string, userData: User) => {
        Cookies.set('token', token, { expires: 1 }); // 1 day expiration
        setUser(userData);
    };

    const logout = () => {
        Cookies.remove('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
