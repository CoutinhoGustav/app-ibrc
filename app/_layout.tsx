import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavThemeProvider,
} from '@react-navigation/native';
import { Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme as useNativeWind } from 'nativewind';
import React, { useEffect } from 'react';
import 'react-native-reanimated';
import '../global.css';

import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../context/AuthContext';
import { DataProvider } from '../context/DataContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

/* ================== TEMAS CUSTOM ================== */

const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2563EB',
    background: '#F9FAFB',
    card: '#FFFFFF',
    text: '#111827',
    border: '#E5E7EB',
    notification: '#DC2626',
  },
};

const DarkThemeCustom = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#3B82F6',
    background: '#020617',
    card: '#020617',
    text: '#F9FAFB',
    border: '#1E293B',
    notification: '#EF4444',
  },
};

function RootLayoutContent() {
  const { userTheme } = useTheme();
  const { colorScheme, setColorScheme } = useNativeWind();
  const segments = useSegments();

  // Sincroniza o tema do NativeWind com a rota e a preferência do usuário
  useEffect(() => {
    const isInTabs = segments[0] === '(tabs)';

    if (isInTabs) {
      // Nas abas, respeitamos a escolha do usuário
      if (colorScheme !== userTheme) {
        setColorScheme(userTheme);
      }
    } else {
      // Fora das abas (Login, Cadastro), forçamos Light Mode
      if (colorScheme !== 'light') {
        setColorScheme('light');
      }
    }
  }, [segments, userTheme, colorScheme]);

  // Para o ThemeProvider do React Navigation e para o StatusBar, 
  // usamos uma lógica similar para evitar flashes ou inconsistências
  const isInTabs = segments[0] === '(tabs)';
  const activeTheme = isInTabs && userTheme === 'dark' ? DarkThemeCustom : LightTheme;
  const statusBarStyle = isInTabs && userTheme === 'dark' ? 'light' : 'dark';

  return (
    <NavThemeProvider value={activeTheme}>
      <Stack>
        <Stack.Screen
          name="login"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="cadastro"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="modal"
          options={{
            presentation: 'modal',
            headerShown: false,
            gestureEnabled: true,
          }}
        />
      </Stack>

      <StatusBar style={statusBarStyle} />
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <RootLayoutContent />
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
