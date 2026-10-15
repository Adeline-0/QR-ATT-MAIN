import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/lib/auth';
import {
  getAttendanceHistory,
  getTeacherEventAttendance,
  getAdminEventAttendance,
  type AttendanceRecord,
  type TeacherEventAttendance,
} from '@/lib/attendance';
import { getProfile, type Role } from '@/lib/profiles';
import { useAppTheme } from '@/constants/ThemeContext';

export default function HistoryScreen() {
  const { user } = useAuth();
  const { colors } = useAppTheme();

  const [role, setRole] = useState<Role | null>(null);
  const [studentRecords, setStudentRecords] = useState<AttendanceRecord[]>([]);
  const [teacherEvents, setTeacherEvents] = useState<TeacherEventAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 20,
      paddingTop: 18,
    },
    topSection: { marginBottom: 20 },
    eyebrow: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1.5,
      color: colors.primary,
      marginBottom: 7,
    },
    title: {
      fontSize: 25,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 7,
    },
    subtitle: {
      fontSize: 13,
      lineHeight: 20,
      color: colors.secondaryText,
    },
    summaryCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 17,
      marginBottom: 20,
      overflow: 'hidden',
    },
    summaryIcon: {
      width: 49,
      height: 49,
      borderRadius: 15,
      backgroundColor: colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
    },
    summaryText: { flex: 1 },
    summaryLabel: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1,
      color: colors.secondaryText,
      marginBottom: 5,
    },
    summaryValue: {
      fontSize: 26,
      fontWeight: '800',
      color: colors.text,
    },
    summaryDecoration: { paddingRight: 5 },
    list: { paddingBottom: 28 },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 19,
      padding: 16,
      marginBottom: 13,
      borderWidth: 1,
      borderColor: colors.border,
    },
    eventHeading: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    eventIcon: {
      width: 45,
      height: 45,
      borderRadius: 14,
      backgroundColor: colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    eventHeadingText: { flex: 1, minWidth: 0 },
    eventTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 5,
    },
    eventCode: {
      fontSize: 10,
      color: colors.secondaryText,
    },
    statusIcon: { marginLeft: 8 },
    countBadge: {
      alignItems: 'center',
      backgroundColor: '#21865320',
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 7,
      marginLeft: 6,
    },
    countNumber: {
      fontSize: 16,
      fontWeight: '800',
      color: '#218653',
    },
    countLabel: { fontSize: 9, color: '#218653' },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      marginTop: 12,
    },
    eventMeta: {
      flex: 1,
      fontSize: 11,
      lineHeight: 17,
      color: colors.secondaryText,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 14,
    },
    attendeeHeading: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1,
      color: colors.secondaryText,
      marginBottom: 8,
    },
    attendeeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 9,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: 10,
    },
    studentIcon: {
      width: 35,
      height: 35,
      borderRadius: 11,
      backgroundColor: colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
    },
    attendeeInfo: { flex: 1 },
    attendeeId: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 3,
    },
    noAttendees: {
      fontSize: 12,
      lineHeight: 19,
      color: colors.secondaryText,
    },
    recordFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 14,
      backgroundColor: '#21865320',
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 10,
      alignSelf: 'flex-start',
    },
    recordFooterText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#218653',
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 18,
      paddingBottom: 45,
    },
    emptyIcon: {
      width: 75,
      height: 75,
      borderRadius: 24,
      backgroundColor: colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 18,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 13,
      lineHeight: 21,
      color: colors.secondaryText,
      textAlign: 'center',
      maxWidth: 280,
    },
    loadingScreen: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
    },
    loadingInline: {
      paddingTop: 30,
      alignItems: 'center',
      gap: 10,
    },
    loadingText: {
      fontSize: 13,
      color: colors.secondaryText,
    },
    retryButton: {
      marginTop: 16,
      backgroundColor: colors.primary,
      paddingHorizontal: 22,
      paddingVertical: 11,
      borderRadius: 12,
    },
    retryText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#FFFFFF',
    },
  });

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setRole(null);
      setStudentRecords([]);
      setTeacherEvents([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const profile = await getProfile(user.id);

      if (!profile) {
        setError('Unable to load your profile. Please try again.');
        return;
      }

      const currentRole = profile.role;
      setRole(currentRole);

      if (currentRole === 'admin') {
        const events = await getAdminEventAttendance();
        setTeacherEvents(events);
        setStudentRecords([]);
      } else if (currentRole === 'teacher') {
        const events = await getTeacherEventAttendance(user.id);
        setTeacherEvents(events);
        setStudentRecords([]);
      } else {
        const records = await getAttendanceHistory(user.id);
        setStudentRecords(records);
        setTeacherEvents([]);
      }
    } catch (err) {
      console.error('Failed to load attendance records:', err);
      setError('Unable to load your records. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const isTeacher = role === 'teacher';
  const isAdmin = role === 'admin';
  const isEventManager = isTeacher || isAdmin;

  if (loading && role === null) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading attendance...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Text style={styles.eyebrow}>
          {isAdmin
            ? 'ADMINISTRATION'
            : isTeacher
              ? 'EVENT MANAGEMENT'
              : 'YOUR ACTIVITY'}
        </Text>

        <Text style={styles.title}>
          {isAdmin
            ? 'Event Attendance'
            : isTeacher
              ? 'My Events'
              : 'Attendance History'}
        </Text>

        <Text style={styles.subtitle}>
          {isAdmin
            ? 'Review event attendance records available to your account.'
            : isTeacher
              ? 'Review your events and their attendance records.'
              : 'Keep track of the school events you have attended.'}
        </Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryIcon}>
          <Ionicons
            name={isEventManager ? 'calendar-outline' : 'checkmark-done-outline'}
            size={25}
            color={colors.primary}
          />
        </View>

        <View style={styles.summaryText}>
          <Text style={styles.summaryLabel}>
            {isEventManager ? 'EVENTS' : 'TOTAL CHECK-INS'}
          </Text>
          <Text style={styles.summaryValue}>
            {isEventManager ? teacherEvents.length : studentRecords.length}
          </Text>
        </View>

        <View style={styles.summaryDecoration}>
          <Ionicons
            name={isEventManager ? 'documents-outline' : 'qr-code-outline'}
            size={36}
            color={colors.primary + '45'}
          />
        </View>
      </View>

      {error ? (
        <View style={styles.emptyState}>
          <Ionicons
            name="cloud-offline-outline"
            size={38}
            color={colors.secondaryText}
          />
          <Text style={styles.emptyTitle}>Couldn't load records</Text>
          <Text style={styles.emptyText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={() => void load()}>
            <Text style={styles.retryText}>Try Again</Text>
          </Pressable>
        </View>
      ) : loading ? (
        <View style={styles.loadingInline}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>Refreshing records...</Text>
        </View>
      ) : isEventManager ? (
        teacherEvents.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title={isAdmin ? 'No events available' : 'No events yet'}
            description={
              isAdmin
                ? 'No event attendance records are available to your account yet.'
                : 'Events you create will appear here, along with their attendance records.'
            }
            colors={colors}
            styles={styles}
          />
        ) : (
          <FlatList
            data={teacherEvents}
            keyExtractor={(item) => item.eventId}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.eventHeading}>
                  <View style={styles.eventIcon}>
                    <Ionicons name="calendar" size={21} color={colors.primary} />
                  </View>

                  <View style={styles.eventHeadingText}>
                    <Text style={styles.eventTitle}>{item.title}</Text>
                    <Text style={styles.eventCode}>Code: {item.eventCode}</Text>
                  </View>

                  <View style={styles.countBadge}>
                    <Text style={styles.countNumber}>{item.attendeeCount}</Text>
                    <Text style={styles.countLabel}>attendees</Text>
                  </View>
                </View>

                {item.startTime && (
                  <View style={styles.metaRow}>
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color={colors.secondaryText}
                    />
                    <Text style={styles.eventMeta}>
                      Starts {formatDate(item.startTime)}
                    </Text>
                  </View>
                )}

                <View style={styles.divider} />
                <Text style={styles.attendeeHeading}>ATTENDANCE RECORDS</Text>

                {item.attendees.length > 0 ? (
                  item.attendees.map((attendee) => (
                    <View
                      key={`${attendee.studentId}-${attendee.scannedAt}`}
                      style={styles.attendeeRow}
                    >
                      <View style={styles.studentIcon}>
                        <Ionicons
                          name="person-outline"
                          size={17}
                          color={colors.primary}
                        />
                      </View>

                      <View style={styles.attendeeInfo}>
                        <Text style={styles.attendeeId}>
                          Student {shortId(attendee.studentId)}
                        </Text>
                        <Text style={styles.eventMeta}>
                          {formatDate(attendee.scannedAt)}
                        </Text>
                      </View>

                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#218653"
                      />
                    </View>
                  ))
                ) : (
                  <Text style={styles.noAttendees}>
                    No students have checked in yet.
                  </Text>
                )}
              </View>
            )}
          />
        )
      ) : studentRecords.length === 0 ? (
        <EmptyState
          icon="qr-code-outline"
          title="No attendance yet"
          description="Scan an event QR code to register your attendance. Your records will appear here."
          colors={colors}
          styles={styles}
        />
      ) : (
        <FlatList
          data={studentRecords}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.eventHeading}>
                <View style={styles.eventIcon}>
                  <Ionicons
                    name="ticket-outline"
                    size={22}
                    color={colors.primary}
                  />
                </View>

                <View style={styles.eventHeadingText}>
                  <Text style={styles.eventTitle}>{item.eventTitle}</Text>
                  <Text style={styles.eventCode}>Event ID: {item.eventId}</Text>
                </View>

                <View style={styles.statusIcon}>
                  <Ionicons
                    name="checkmark-circle"
                    size={22}
                    color="#218653"
                  />
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.metaRow}>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={colors.secondaryText}
                />
                <Text style={styles.eventMeta}>
                  {formatDate(item.scannedAt)}
                </Text>
              </View>

              <View style={styles.recordFooter}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={15}
                  color="#218653"
                />
                <Text style={styles.recordFooterText}>
                  Attendance recorded
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

function EmptyState({
  icon,
  title,
  description,
  colors,
  styles,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  description: string;
  colors: {
    primary: string;
    text: string;
    secondaryText: string;
  };
  styles: ReturnType<typeof StyleSheet.create>;
}) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={35} color={colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{description}</Text>
    </View>
  );
}

function shortId(id: string) {
  return id ? `…${id.slice(-8)}` : 'unknown';
}

function formatDate(iso: string) {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}