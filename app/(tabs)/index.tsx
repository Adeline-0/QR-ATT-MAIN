import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Header from '@/components/Header';
import { useAppTheme } from '@/constants/ThemeContext';
import { useAuth } from '@/lib/auth';
import { getProfile, type Role } from '@/lib/profiles';

export default function Index() {
  const { colors } = useAppTheme();
  const { user } = useAuth();
  const [role, setRole] = useState<Role | null>(null);
  const [loadingRole, setLoadingRole] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadRole() {
        if (!user) {
          if (active) {
            setRole(null);
            setLoadingRole(false);
          }
          return;
        }

        setLoadingRole(true);

        try {
          const profile = await getProfile(user.id);

          if (active) {
            setRole(profile?.role ?? 'student');
          }
        } catch {
          if (active) {
            setRole('student');
          }
        } finally {
          if (active) {
            setLoadingRole(false);
          }
        }
      }

      void loadRole();

      return () => {
        active = false;
      };
    }, [user])
  );

  const isAdmin = role === 'admin';
  const isTeacher = role === 'teacher';

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 28,
    },
    header: {
      paddingTop: 8,
      paddingBottom: 20,
    },
    welcomeSection: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    welcomeText: {
      flex: 1,
      paddingRight: 10,
    },
    greeting: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1.5,
      color: colors.primary,
      marginBottom: 7,
    },
    title: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 7,
    },
    subtitle: {
      fontSize: 13,
      lineHeight: 20,
      color: colors.secondaryText,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scanCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: 24,
      padding: 20,
      marginBottom: 30,
      overflow: 'hidden',
      elevation: 4,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.16,
      shadowRadius: 10,
    },
    scanTextContainer: {
      flex: 1,
      zIndex: 1,
    },
    scanLabel: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 13,
    },
    scanLabelText: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1,
      color: '#FFFFFF',
      opacity: 0.85,
    },
    scanTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: '#FFFFFF',
      marginBottom: 8,
    },
    scanSubtitle: {
      fontSize: 12,
      lineHeight: 19,
      color: '#FFFFFF',
      opacity: 0.88,
      marginBottom: 17,
      maxWidth: 220,
    },
    scanButton: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: 13,
      paddingVertical: 11,
    },
    scanButtonText: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.primary,
    },
    qrIconContainer: {
      marginLeft: 8,
      opacity: 0.95,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 15,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
    },
    sectionCaption: {
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 1,
      color: colors.secondaryText,
    },
    actionRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 22,
    },
    actionCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 15,
      borderWidth: 1,
      borderColor: colors.border,
    },
    actionIcon: {
      width: 46,
      height: 46,
      borderRadius: 14,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 15,
    },
    actionTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 7,
    },
    actionDescription: {
      fontSize: 11,
      lineHeight: 17,
      color: colors.secondaryText,
      minHeight: 35,
      marginBottom: 15,
    },
    actionFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 11,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    actionLink: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.primary,
    },
    tipCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 17,
      padding: 16,
      gap: 12,
    },
    tipIcon: {
      paddingTop: 1,
    },
    tipContent: {
      flex: 1,
    },
    tipTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 5,
    },
    tipText: {
      fontSize: 12,
      lineHeight: 19,
      color: colors.secondaryText,
    },
    footerText: {
      fontSize: 10,
      color: colors.secondaryText,
      textAlign: 'center',
      marginTop: 23,
    },
    pressed: {
      opacity: 0.82,
      transform: [{ scale: 0.99 }],
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
      gap: 12,
    },
    adminBanner: {
      backgroundColor: colors.primary,
      borderRadius: 24,
      padding: 22,
      marginBottom: 25,
    },
    adminBannerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 18,
      gap: 12,
    },
    adminBadge: {
      width: 49,
      height: 49,
      borderRadius: 16,
      backgroundColor: '#FFFFFF25',
      alignItems: 'center',
      justifyContent: 'center',
    },
    adminBadgeText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1.2,
      marginBottom: 5,
    },
    adminTitle: {
      color: '#FFFFFF',
      fontSize: 23,
      fontWeight: '800',
    },
    adminDescription: {
      color: '#FFFFFF',
      opacity: 0.9,
      fontSize: 13,
      lineHeight: 20,
      marginBottom: 18,
    },
    adminBannerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      paddingVertical: 13,
      borderRadius: 13,
      gap: 8,
    },
    adminBannerButtonText: {
      color: colors.primary,
      fontSize: 13,
      fontWeight: '800',
    },
    adminGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 25,
    },
    adminCard: {
      width: '48%',
      flexGrow: 1,
      flexBasis: '40%',
      backgroundColor: colors.surface,
      borderRadius: 19,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 165,
    },
    adminCardIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
    },
    adminCardTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 6,
    },
    adminCardDescription: {
      fontSize: 11,
      lineHeight: 17,
      color: colors.secondaryText,
      marginBottom: 12,
    },
    adminCardFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      marginTop: 'auto',
    },
    adminCardLink: {
      color: colors.primary,
      fontSize: 11,
      fontWeight: '800',
    },
    roleNotice: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 11,
      padding: 15,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      backgroundColor: colors.surface,
    },
  });

  if (loadingRole) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.subtitle}>Loading your dashboard...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Header title="QR Attendance" />
        </View>

        {isAdmin ? (
          <>
            <View style={styles.welcomeSection}>
              <View style={styles.welcomeText}>
                <Text style={styles.greeting}>ADMINISTRATION</Text>
                <Text style={styles.title}>Admin Dashboard</Text>
                <Text style={styles.subtitle}>
                  Manage event attendance and access your administration tools.
                </Text>
              </View>

              <View style={styles.avatar}>
                <Ionicons
                  name="shield-checkmark"
                  size={27}
                  color={colors.primary}
                />
              </View>
            </View>

            <View style={styles.adminBanner}>
              <View style={styles.adminBannerTop}>
                <View style={styles.adminBadge}>
                  <Ionicons
                    name="grid-outline"
                    size={27}
                    color="#FFFFFF"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.adminBadgeText}>ADMIN ACCESS</Text>
                  <Text style={styles.adminTitle}>Welcome back!</Text>
                </View>
              </View>

              <Text style={styles.adminDescription}>
                Create event QR codes and review attendance records using the
                tools below.
              </Text>

              <Pressable
                style={({ pressed }) => [
                  styles.adminBannerButton,
                  pressed && styles.pressed,
                ]}
                onPress={() => router.push('/teacher')}
              >
                <Ionicons
                  name="qr-code-outline"
                  size={19}
                  color={colors.primary}
                />
                <Text style={styles.adminBannerButtonText}>
                  Create Event QR
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={17}
                  color={colors.primary}
                />
              </Pressable>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Administration Tools</Text>
              <Text style={styles.sectionCaption}>QUICK ACCESS</Text>
            </View>

            <View style={styles.adminGrid}>
              <Pressable
                style={({ pressed }) => [
                  styles.adminCard,
                  pressed && styles.pressed,
                ]}
                onPress={() => router.push('/teacher')}
              >
                <View style={styles.adminCardIcon}>
                  <Ionicons
                    name="calendar-outline"
                    size={25}
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.adminCardTitle}>Manage Events</Text>
                <Text style={styles.adminCardDescription}>
                  Open the event creation screen and generate QR codes.
                </Text>
                <View style={styles.adminCardFooter}>
                  <Text style={styles.adminCardLink}>Open events</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={15}
                    color={colors.primary}
                  />
                </View>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.adminCard,
                  pressed && styles.pressed,
                ]}
                onPress={() => router.push('/history')}
              >
                <View style={styles.adminCardIcon}>
                  <Ionicons
                    name="people-outline"
                    size={25}
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.adminCardTitle}>Attendance</Text>
                <Text style={styles.adminCardDescription}>
                  Review available event attendance and attendee records.
                </Text>
                <View style={styles.adminCardFooter}>
                  <Text style={styles.adminCardLink}>View records</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={15}
                    color={colors.primary}
                  />
                </View>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.adminCard,
                  pressed && styles.pressed,
                ]}
                onPress={() => router.push('/profile')}
              >
                <View style={styles.adminCardIcon}>
                  <Ionicons
                    name="settings-outline"
                    size={25}
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.adminCardTitle}>Account Settings</Text>
                <Text style={styles.adminCardDescription}>
                  Update your profile and manage your app preferences.
                </Text>
                <View style={styles.adminCardFooter}>
                  <Text style={styles.adminCardLink}>Open settings</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={15}
                    color={colors.primary}
                  />
                </View>
              </Pressable>
            </View>

            <View style={styles.roleNotice}>
              <Ionicons
                name="information-circle-outline"
                size={23}
                color={colors.primary}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.tipTitle}>Administrator access</Text>
                <Text style={styles.tipText}>
                  The records available to you depend on your Supabase
                  permissions. User management is not included in this screen
                  yet.
                </Text>
              </View>
            </View>
          </>
        ) : (
          <>
            <View style={styles.welcomeSection}>
              <View style={styles.welcomeText}>
                <Text style={styles.greeting}>
                  {isTeacher ? 'TEACHER PORTAL' : 'WELCOME BACK!'}
                </Text>
                <Text style={styles.title}>
                  {isTeacher ? 'Welcome, Teacher!' : 'Ready to check in?'}
                </Text>
                <Text style={styles.subtitle}>
                  {isTeacher
                    ? 'Create event QR codes and review attendance.'
                    : 'Keep track of the school events you attend.'}
                </Text>
              </View>

              <View style={styles.avatar}>
                <Ionicons
                  name={isTeacher ? 'school-outline' : 'person'}
                  size={27}
                  color={colors.primary}
                />
              </View>
            </View>

            {isTeacher ? (
              <Pressable
                style={({ pressed }) => [
                  styles.scanCard,
                  pressed && styles.pressed,
                ]}
                onPress={() => router.push('/teacher')}
              >
                <View style={styles.scanTextContainer}>
                  <View style={styles.scanLabel}>
                    <Ionicons
                      name="qr-code-outline"
                      size={17}
                      color="#FFFFFF"
                    />
                    <Text style={styles.scanLabelText}>EVENT MANAGEMENT</Text>
                  </View>

                  <Text style={styles.scanTitle}>Create Event QR</Text>
                  <Text style={styles.scanSubtitle}>
                    Set up a school event and generate its attendance QR code.
                  </Text>

                  <View style={styles.scanButton}>
                    <Text style={styles.scanButtonText}>Manage Events</Text>
                    <Ionicons
                      name="arrow-forward"
                      size={18}
                      color={colors.primary}
                    />
                  </View>
                </View>

                <View style={styles.qrIconContainer}>
                  <Ionicons name="qr-code" size={68} color="#FFFFFF" />
                </View>
              </Pressable>
            ) : (
              <Pressable
                style={({ pressed }) => [
                  styles.scanCard,
                  pressed && styles.pressed,
                ]}
                onPress={() => router.push('/scan')}
              >
                <View style={styles.scanTextContainer}>
                  <View style={styles.scanLabel}>
                    <Ionicons
                      name="qr-code-outline"
                      size={17}
                      color="#FFFFFF"
                    />
                    <Text style={styles.scanLabelText}>QUICK CHECK-IN</Text>
                  </View>

                  <Text style={styles.scanTitle}>Scan Event QR</Text>
                  <Text style={styles.scanSubtitle}>
                    Scan an event's QR code to record your attendance.
                  </Text>

                  <View style={styles.scanButton}>
                    <Text style={styles.scanButtonText}>Open Scanner</Text>
                    <Ionicons
                      name="arrow-forward"
                      size={18}
                      color={colors.primary}
                    />
                  </View>
                </View>

                <View style={styles.qrIconContainer}>
                  <Ionicons name="qr-code" size={68} color="#FFFFFF" />
                </View>
              </Pressable>
            )}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {isTeacher ? 'Your Events' : 'Your Attendance'}
              </Text>
              <Text style={styles.sectionCaption}>QUICK ACCESS</Text>
            </View>

            <View style={styles.actionRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.actionCard,
                  pressed && styles.pressed,
                ]}
                onPress={() => router.push('/history')}
              >
                <View style={styles.actionIcon}>
                  <Ionicons
                    name={isTeacher ? 'calendar-outline' : 'time-outline'}
                    size={25}
                    color={colors.primary}
                  />
                </View>

                <Text style={styles.actionTitle}>
                  {isTeacher ? 'My Events' : 'History'}
                </Text>
                <Text style={styles.actionDescription}>
                  {isTeacher
                    ? 'View your events and attendance records.'
                    : 'View your past event check-ins.'}
                </Text>

                <View style={styles.actionFooter}>
                  <Text style={styles.actionLink}>View records</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={colors.primary}
                  />
                </View>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.actionCard,
                  pressed && styles.pressed,
                ]}
                onPress={() => router.push('/profile')}
              >
                <View style={styles.actionIcon}>
                  <Ionicons
                    name="person-outline"
                    size={25}
                    color={colors.primary}
                  />
                </View>

                <Text style={styles.actionTitle}>My Profile</Text>
                <Text style={styles.actionDescription}>
                  Manage your account information.
                </Text>

                <View style={styles.actionFooter}>
                  <Text style={styles.actionLink}>View profile</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={colors.primary}
                  />
                </View>
              </Pressable>
            </View>

            <View style={styles.tipCard}>
              <View style={styles.tipIcon}>
                <Ionicons
                  name="information-circle-outline"
                  size={23}
                  color={colors.primary}
                />
              </View>

              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>
                  {isTeacher ? 'Event tip' : 'Attendance tip'}
                </Text>
                <Text style={styles.tipText}>
                  {isTeacher
                    ? 'Check your event details before sharing the QR code with students.'
                    : 'Make sure the event QR code is clear and visible before scanning.'}
                </Text>
              </View>
            </View>
          </>
        )}

        <Text style={styles.footerText}>
          QR Attendance · School Event Check-in
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}