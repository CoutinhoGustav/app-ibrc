import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from 'react';

/* =========================
   TIPOS
========================= */

export interface User {
    name: string;
    email: string;
    avatar?: string;
}

export interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    updateUser: (newData: Partial<User>) => Promise<void>;
    updateAvatar: (uri: string) => Promise<void>; // 👈 PARA FOTO
    deleteAccount: () => Promise<void>;
    loading: boolean;
}

/* =========================
   CONTEXT
========================= */

const AuthContext = createContext<AuthContextType | undefined>(
    undefined
);

/* =========================
   PROVIDER
========================= */

export const AuthProvider: React.FC<{
    children: React.ReactNode;
}> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    /* =========================
       LOAD USER
    ========================= */

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

    /* =========================
       LOGIN
    ========================= */

    const login = async (email: string, password: string) => {
        // 🔒 EXEMPLO MOCK
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

    /* =========================
       LOGOUT
    ========================= */

    const logout = async () => {
        await AsyncStorage.removeItem('@user');
        setUser(null);
        router.replace('/login');
    };

    /* =========================
       UPDATE USER (GENÉRICO)
    ========================= */

    const updateUser = async (newData: Partial<User>) => {
        setUser(prev => {
            if (!prev) return null;

            const updatedUser = { ...prev, ...newData };
            AsyncStorage.setItem('@user', JSON.stringify(updatedUser));

            return updatedUser;
        });
    };

    /* =========================
       UPDATE AVATAR (ATALHO)
    ========================= */

    const updateAvatar = async (uri: string) => {
        await updateUser({ avatar: uri });
    };

    /* =========================
       DELETE ACCOUNT
    ========================= */

    const deleteAccount = async () => {
        await AsyncStorage.removeItem('@user');
        setUser(null);
        router.replace('/login');
    };

    /* =========================
       PROVIDER
    ========================= */

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                updateUser,
                updateAvatar,
                deleteAccount,
                loading,
            }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
};

/* =========================
   HOOK
========================= */

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de AuthProvider');
    }
    return context;
};
