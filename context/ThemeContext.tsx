import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
    userTheme: ThemeMode;
    setUserTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@user_theme_preference';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [userTheme, setUserThemeState] = useState<ThemeMode>('light');

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
            if (savedTheme === 'light' || savedTheme === 'dark') {
                setUserThemeState(savedTheme);
            }
        } catch (e) {
            console.error('Failed to load theme preference', e);
        }
    };

    const setUserTheme = async (theme: ThemeMode) => {
        try {
            setUserThemeState(theme);
            await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
        } catch (e) {
            console.error('Failed to save theme preference', e);
        }
    };

    return (
        <ThemeContext.Provider value={{ userTheme, setUserTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
