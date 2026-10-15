import { useCallback, useState } from 'react';
import { Tabs, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/constants/ThemeContext';
import { useAuth } from '@/lib/auth';
import { getProfile, type Role } from '@/lib/profiles';

export default function TabsLayout() {
  const { colors } = useAppTheme();
  const { user } = useAuth();
  const [role, setRole] = useState<Role | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadRole() {
        if (!user) {
          if (active) {
            setRole(null);
            setProfileLoaded(true);
          }
          return;
        }

        setProfileLoaded(false);

        const profile = await getProfile(user.id);

        if (active) {
          setRole(profile?.role ?? null);
          setProfileLoaded(true);
        }
      }

      loadRole();

      return () => {
        active = false;
      };
    }, [user?.id])
  );

  const isStudent = role === 'student';
  const isTeacher = role === 'teacher';
  const isAdmin = role === 'admin';

  const showScan = !profileLoaded || isStudent;
  const showTeacher = !profileLoaded || isTeacher || isAdmin;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondaryText,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          href: showScan ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="qr-code-outline" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: isAdmin ? 'Attendance' : 'History',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="time-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="teacher"
        options={{
          title: isAdmin ? 'Events' : 'Create Event',
          href: showTeacher ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="briefcase-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="person-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen name="login" options={{ href: null }} />
      <Tabs.Screen name="register" options={{ href: null }} />
    </Tabs>
  );
}
