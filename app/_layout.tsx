import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../context/AuthContext';
import { DataProvider } from '../context/DataContext';

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

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <DataProvider>
          <ThemeProvider
            value={colorScheme === 'dark' ? DarkThemeCustom : LightTheme}
          >
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

              {/* 🔥 MODAL CORRIGIDO */}
              <Stack.Screen
                name="modal"
                options={{
                  presentation: 'modal',
                  headerShown: false,  // remove completamente o header
                  gestureEnabled: true, // se quiser permitir swipe-down para fechar
                }}
              />
            </Stack>

            <StatusBar
              style={colorScheme === 'dark' ? 'light' : 'dark'}
            />
          </ThemeProvider>
        </DataProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
