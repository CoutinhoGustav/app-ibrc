import { Redirect, Tabs } from 'expo-router';
import { GraduationCap, Home, Settings } from 'lucide-react-native';
import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function TabLayout() {
  const { user, loading } = useAuth();

  // ⏳ enquanto carrega auth (AsyncStorage)
  if (loading) {
    return null;
  }

  // 🔐 se não estiver logado, manda pro login
  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#9ca3af',
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#f3f4f6',
          height: 60,
          paddingBottom: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="turmas"
        options={{
          title: 'Turmas',
          tabBarIcon: ({ color }) => <GraduationCap size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="config"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          href: null, // mantém escondido
        }}
      />
    </Tabs>
  );
}
