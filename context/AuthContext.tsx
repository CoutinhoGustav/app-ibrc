// context/AuthContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
    name: string;
    email: string;
    avatar: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    updateUser: (newData: Partial<User>) => void;
    deleteAccount: () => Promise<void>; // ✅ adiciona aqui
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadUser() {
            try {
                const storedUser = await AsyncStorage.getItem('@user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error('Erro ao carregar usuário:', error);
            } finally {
                setLoading(false);
            }
        }
        loadUser();
    }, []);

    const login = async (email: string, password: string) => {
        if (email === 'admin@ibrc.com.br' && password === '123456') {
            const userData: User = {
                name: 'Admin IBRC',
                email,
                avatar: 'https://ui-avatars.com/api/?name=Admin+IBRC',
            };
            await AsyncStorage.setItem('@user', JSON.stringify(userData));
            setUser(userData);
            return true;
        }
        return false;
    };

    const logout = async () => {
        await AsyncStorage.removeItem('@user');
        setUser(null);
        router.replace('/login');
    };

    const updateUser = (newData: Partial<User>) => {
        setUser(prev => {
            if (!prev) return null;
            const updatedUser = { ...prev, ...newData };
            AsyncStorage.setItem('@user', JSON.stringify(updatedUser));
            return updatedUser;
        });
    };

    const deleteAccount = async () => {
        // Aqui você pode adicionar lógica extra de exclusão no backend se quiser
        await AsyncStorage.removeItem('@user');
        setUser(null);
        router.replace('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser, deleteAccount, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de AuthProvider');
    }
    return context;
};
