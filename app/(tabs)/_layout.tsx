import { Redirect, Tabs } from 'expo-router';
import { GraduationCap, Home, Settings } from 'lucide-react-native';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBarContainer, { bottom: Math.max(insets.bottom, 15) }]}>
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          if (route.name === 'explore') return null;

          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={index}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              {isFocused && <View style={styles.activeCircle} />}
              <View style={styles.iconContainer}>
                {options.tabBarIcon && options.tabBarIcon({
                  color: isFocused ? '#fff' : '#9ca3af',
                  focused: isFocused,
                  size: 24
                })}
                <Text style={[styles.label, { color: isFocused ? '#fff' : '#4b5563' }]}>
                  {label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

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
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => <Home size={22} color={color} strokeWidth={2.5} />,
        }}
      />

      <Tabs.Screen
        name="turmas"
        options={{
          title: 'Turmas',
          tabBarIcon: ({ color }) => <GraduationCap size={22} color={color} strokeWidth={2.5} />,
        }}
      />

      <Tabs.Screen
        name="config"
        options={{
          title: 'Config',
          tabBarIcon: ({ color }) => <Settings size={22} color={color} strokeWidth={2.5} />,
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

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 1000,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 40,
    height: 75,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  activeCircle: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2563eb', // azul vibrante da imagem
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  label: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '700',
  },
});
