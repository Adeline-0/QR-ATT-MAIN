
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import QRCode from 'react-native-qrcode-svg';

import AppButton from '@/components/AppButton';
import { useAppTheme } from '@/constants/ThemeContext';
import { useAuth } from '@/lib/auth';
import {
  createEvent,
  deleteEvent,
  getAllEvents,
  getEventsByTeacher,
  type CloudEvent,
} from '@/lib/events';
import { getProfile, type Role } from '@/lib/profiles';
import { buildQRPayload } from '@/lib/qr';

function toLocalISO(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:00`
  );
}

function formatDateTime(value: string | null) {
  if (!value) return 'Not set';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPickerDate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');

  return `${date.toLocaleString('en-US', {
    month: 'short',
  })} ${pad(date.getDate())}, ${date.getFullYear()} at ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

const QUICK_END_OPTIONS = [
  { label: '+30 min', ms: 30 * 60 * 1000 },
  { label: '+1 hour', ms: 60 * 60 * 1000 },
  { label: '+2 hours', ms: 2 * 60 * 60 * 1000 },
];

type EditTarget = 'start' | 'end';

export default function TeacherScreen() {
  const { user } = useAuth();
  const { colors } = useAppTheme();

  const [role, setRole] = useState<Role | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [title, setTitle] = useState('');
  const [eventId, setEventId] = useState('');
  const [startDate, setStartDate] = useState(() => new Date());
  const [endDate, setEndDate] = useState(
    () => new Date(Date.now() + 60 * 60 * 1000)
  );

  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [editingPart, setEditingPart] = useState<'date' | 'time'>('date');
  const [payload, setPayload] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [events, setEvents] = useState<CloudEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<CloudEvent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CloudEvent | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [resultModal, setResultModal] = useState<{
  title: string;
  message: string;
  success: boolean;
} | null>(null);

  const isAndroid = Platform.OS === 'android';
  const isAdmin = role === 'admin';

  const styles = StyleSheet.create({

        resultModal: {
      width: '100%',
      maxWidth: 380,
      padding: 26,
      borderRadius: 24,
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      elevation: 12,
    },
    resultIcon: {
      width: 68,
      height: 68,
      borderRadius: 34,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 18,
    },
    resultModalTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    resultModalMessage: {
      fontSize: 14,
      lineHeight: 21,
      color: colors.secondaryText,
      textAlign: 'center',
      marginBottom: 22,
    },
    resultModalButton: {
      width: '100%',
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 13,
      backgroundColor: colors.primary,
    },
    resultModalButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '800',
    },

    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 40,
    },
    gateContainer: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    gateTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      marginTop: 14,
      textAlign: 'center',
    },
    gateText: {
      fontSize: 14,
      color: colors.secondaryText,
      textAlign: 'center',
      marginTop: 8,
      lineHeight: 20,
    },
    title: {
      fontSize: 25,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 6,
    },
    subtitle: {
      fontSize: 14,
      color: colors.secondaryText,
      lineHeight: 20,
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 6,
      marginTop: 10,
    },
    input: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      color: colors.text,
    },
    pickerField: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      paddingVertical: 14,
      flexDirection: 'row',
      alignItems: 'center',
    },
    pickerFieldPressed: {
      opacity: 0.75,
    },
    pickerValue: {
      flex: 1,
      fontSize: 15,
      fontWeight: '500',
      color: colors.text,
      marginHorizontal: 10,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 8,
      gap: 8,
    },
    chip: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    chipText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.primary,
    },
    hint: {
      fontSize: 12,
      color: colors.secondaryText,
      marginTop: 7,
      lineHeight: 18,
    },
    pickerContainer: {
      marginTop: 12,
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 8,
    },
    message: {
      fontSize: 14,
      color: colors.primary,
      textAlign: 'center',
      marginTop: 12,
      marginBottom: 8,
      lineHeight: 20,
    },
    errorText: {
      fontSize: 13,
      color: '#DC2626',
      marginTop: 10,
      marginBottom: 10,
      lineHeight: 19,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.text,
      marginTop: 28,
      marginBottom: 6,
    },
    sectionSubtitle: {
      fontSize: 13,
      color: colors.secondaryText,
      lineHeight: 19,
      marginBottom: 12,
    },
    toolbar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 12,
    },
    searchBox: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      paddingHorizontal: 12,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 8,
      color: colors.text,
      fontSize: 14,
    },
    refreshButton: {
      width: 46,
      height: 46,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    eventCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 15,
      marginBottom: 12,
    },
    eventCardTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.text,
      flex: 1,
    },
    eventCode: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: '700',
      marginTop: 5,
    },
    eventMeta: {
      fontSize: 12,
      color: colors.secondaryText,
      lineHeight: 18,
      marginTop: 5,
    },
    eventActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 14,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      paddingVertical: 9,
    },
    actionText: {
      color: colors.primary,
      fontWeight: '700',
      fontSize: 12,
    },
    deleteText: {
      color: '#DC2626',
      fontWeight: '700',
      fontSize: 12,
    },
    emptyCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 22,
      alignItems: 'center',
      marginTop: 4,
    },
    emptyText: {
      fontSize: 14,
      color: colors.secondaryText,
      textAlign: 'center',
      lineHeight: 21,
      marginTop: 8,
    },
    resultCard: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      marginTop: 20,
      alignItems: 'center',
      elevation: 2,
    },
    resultTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 12,
    },
    qrBox: {
      backgroundColor: '#FFFFFF',
      padding: 12,
      borderRadius: 10,
      marginVertical: 12,
    },
    payloadText: {
      fontSize: 12,
      color: colors.secondaryText,
      textAlign: 'center',
      lineHeight: 18,
    },
    detailText: {
      alignSelf: 'stretch',
      fontSize: 13,
      color: colors.secondaryText,
      lineHeight: 20,
      marginTop: 5,
    },
    closeButton: {
      alignSelf: 'stretch',
      alignItems: 'center',
      paddingVertical: 12,
      marginTop: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    closeText: {
      fontSize: 13,
      color: colors.primary,
      fontWeight: '800',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(15, 23, 42, 0.58)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    deleteModal: {
      width: '100%',
      maxWidth: 420,
      backgroundColor: colors.surface,
      borderRadius: 24,
      padding: 24,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'stretch',
      elevation: 12,
    },
    deleteIconCircle: {
      width: 62,
      height: 62,
      borderRadius: 31,
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FEE2E2',
      marginBottom: 16,
    },
    deleteModalTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    deleteModalDescription: {
      fontSize: 14,
      lineHeight: 21,
      color: colors.secondaryText,
      textAlign: 'center',
      marginBottom: 18,
    },
    deleteEventInfo: {
      backgroundColor: colors.background,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      marginBottom: 20,
    },
    deleteEventName: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 5,
    },
    deleteEventCode: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.primary,
      marginBottom: 6,
    },
    deleteWarning: {
      fontSize: 12,
      lineHeight: 18,
      color: colors.secondaryText,
    },
    deleteModalActions: {
      flexDirection: 'row',
      gap: 10,
    },
    cancelDeleteButton: {
      flex: 1,
      minHeight: 46,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: 12,
    },
    cancelDeleteText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '700',
    },
    confirmDeleteButton: {
      flex: 1,
      minHeight: 46,
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      backgroundColor: '#DC2626',
      paddingHorizontal: 12,
    },
    confirmDeleteText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
    },
  });

  const loadEvents = useCallback(
    async (showSpinner = true) => {
      if (!user || (role !== 'teacher' && role !== 'admin')) return;

      if (showSpinner) setEventsLoading(true);
      setEventsError(null);

      try {
        if (role === 'admin') {
          const result = await getAllEvents();
          setEvents(result.events);
          setEventsError(result.error);
        } else {
          const result = await getEventsByTeacher(user.id);
          setEvents(result);
        }
      } catch (error) {
        console.error('Failed to load events:', error);
        setEventsError(
          error instanceof Error
            ? error.message
            : 'Could not load events. Please try again.'
        );
      } finally {
        setEventsLoading(false);
        setRefreshing(false);
      }
    },
    [user?.id, role]
  );

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadRole() {
        setRoleLoading(true);

        if (!user) {
          if (active) {
            setRole(null);
            setRoleLoading(false);
            setEvents([]);
          }
          return;
        }

        try {
          const profile = await getProfile(user.id);

          if (active) {
            setRole(profile?.role ?? null);

            if (!profile) {
              setMessage(
                'Could not load your account role. Check your connection and try again.'
              );
            } else {
              setMessage(null);
            }
          }
        } catch (error) {
          console.error('Failed to load account role:', error);

          if (active) {
            setRole(null);
            setMessage('Could not verify your account role. Please try again.');
          }
        } finally {
          if (active) setRoleLoading(false);
        }
      }

      void loadRole();

      return () => {
        active = false;
      };
    }, [user?.id])
  );

  useFocusEffect(
    useCallback(() => {
      if (role === 'teacher' || role === 'admin') {
        void loadEvents();
      }
    }, [loadEvents, role])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    void loadEvents(false);
  };

  const openPicker = (target: EditTarget) => {
    setMessage(null);
    setEditTarget(target);
    setEditingPart('date');
  };

  const onPickerChange = (
    event: DateTimePickerEvent,
    selected?: Date
  ) => {
    if (!editTarget) return;

    if (event.type === 'dismissed' || !selected) {
      setEditTarget(null);
      setEditingPart('date');
      return;
    }

    const current = editTarget === 'start' ? startDate : endDate;
    const next = new Date(current);

    if (isAndroid && editingPart === 'date') {
      next.setFullYear(
        selected.getFullYear(),
        selected.getMonth(),
        selected.getDate()
      );
    } else {
      next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);

      if (!isAndroid) {
        next.setFullYear(
          selected.getFullYear(),
          selected.getMonth(),
          selected.getDate()
        );
      }
    }

    if (editTarget === 'start') {
      setStartDate(next);
    } else {
      setEndDate(next);
    }

    if (isAndroid && editingPart === 'date') {
      setEditingPart('time');
    } else {
      setEditTarget(null);
      setEditingPart('date');
    }
  };

  const handleQuickEnd = (ms: number) => {
    setMessage(null);
    setEndDate(new Date(startDate.getTime() + ms));
  };

  const handleCreateEvent = async () => {
    if (creating) return;

    const eventData = {
      eventId: eventId.trim(),
      title: title.trim(),
      start: toLocalISO(startDate),
      end: toLocalISO(endDate),
    };

    if (!eventData.eventId || !eventData.title) {
      setMessage('Event title and code are required.');
      return;
    }

    if (endDate.getTime() <= startDate.getTime()) {
      setMessage('End time must be after start time.');
      return;
    }

    setCreating(true);
    setMessage(null);
    setPayload(null);

    try {
      const { error } = await createEvent(eventData);

      if (error) {
        console.error('Event creation failed:', error);
        setMessage(`Could not save the event: ${error}`);
        return;
      }

      setMessage('Event saved! Scan the QR with the Scan tab to test it.');
      setPayload(buildQRPayload(eventData));

      setTitle('');
      setEventId('');

      await loadEvents(false);
    } catch (error) {
      console.error('Unexpected event creation error:', error);
      setMessage(
        error instanceof Error
          ? `Could not save the event: ${error.message}`
          : 'Could not save the event. Please try again.'
      );
    } finally {
      setCreating(false);
    }
  };

  const handleViewEvent = (event: CloudEvent) => {
    setSelectedEvent(event);

    setPayload(
      buildQRPayload({
        eventId: event.event_code,
        title: event.title,
        start: event.start_time ?? '',
        end: event.end_time ?? '',
      })
    );
  };

  
const performDelete = async () => {
  if (!deleteTarget || deleting) return;

  const event = deleteTarget;
  setDeleting(true);

  try {
    const result = await deleteEvent(event.id);

    if (result.error) {
      setDeleteTarget(null);
      setResultModal({
        title: 'Deletion Failed',
        message: result.error,
        success: false,
      });
      return;
    }

    setEvents((current) =>
      current.filter((item) => item.id !== event.id)
    );

    if (selectedEvent?.id === event.id) {
      setSelectedEvent(null);
      setPayload(null);
    }

    setDeleteTarget(null);
    await loadEvents(false);

    setResultModal({
      title: 'Event Deleted!',
      message: `"${event.title}" has been successfully deleted.`,
      success: true,
    });
  } catch (error) {
    setDeleteTarget(null);
    setResultModal({
      title: 'Something Went Wrong',
      message:
        error instanceof Error ? error.message : 'Please try again.',
      success: false,
    });
  } finally {
    setDeleting(false);
  }
};


  const handleDeleteEvent = (event: CloudEvent) => {
    setDeleteTarget(event);
  };

  const filteredEvents = events.filter((event) => {
    const query = search.trim().toLowerCase();

    return (
      !query ||
      event.title.toLowerCase().includes(query) ||
      event.event_code.toLowerCase().includes(query)
    );
  });

  if (roleLoading) {
    return (
      <View style={styles.gateContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.gateTitle}>Checking your account...</Text>
      </View>
    );
  }

  if (!user || (role !== 'teacher' && role !== 'admin')) {
    return (
      <View style={styles.gateContainer}>
        <Ionicons
          name="lock-closed-outline"
          size={48}
          color={colors.primary}
        />
        <Text style={styles.gateTitle}>
          {user ? 'Restricted Access' : 'Please Sign In'}
        </Text>
        <Text style={styles.gateText}>
          {message ??
            (user
              ? 'Only teacher and admin accounts can access this screen.'
              : 'Sign in with your account to continue.')}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <Text style={styles.title}>
        {isAdmin ? 'Manage Events' : 'Create Event QR'}
      </Text>

      <Text style={styles.subtitle}>
        {isAdmin
          ? 'View and manage events created by all teachers and admins.'
          : 'Create your event, generate its QR code, and review your events below.'}
      </Text>

      <Text style={styles.sectionTitle}>
        {isAdmin ? 'Create an Event' : 'New Event'}
      </Text>

      <Text style={styles.label}>Event Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Founders Day Assembly"
        placeholderTextColor={colors.secondaryText}
      />

      <Text style={styles.label}>Event Code</Text>
      <TextInput
        style={styles.input}
        value={eventId}
        onChangeText={setEventId}
        placeholder="e.g. EVT-2026-0002"
        placeholderTextColor={colors.secondaryText}
        autoCapitalize="characters"
      />

      <Text style={styles.label}>Starts</Text>
      <PickerField
        value={formatPickerDate(startDate)}
        icon="sunny-outline"
        onPress={() => openPicker('start')}
        styles={styles}
        colors={colors}
      />

      <Text style={styles.label}>Ends</Text>
      <PickerField
        value={formatPickerDate(endDate)}
        icon="moon-outline"
        onPress={() => openPicker('end')}
        styles={styles}
        colors={colors}
      />

      <View style={styles.chipRow}>
        {QUICK_END_OPTIONS.map((option) => (
          <Pressable
            key={option.label}
            style={styles.chip}
            onPress={() => handleQuickEnd(option.ms)}
          >
            <Text style={styles.chipText}>{option.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.hint}>
        Tap a chip to set the end time from start.
      </Text>

      {message && <Text style={styles.message}>{message}</Text>}

      <AppButton
        theme="primary"
        title={creating ? 'Creating Event...' : 'Create Event'}
        icon="add-circle-outline"
        onPress={handleCreateEvent}
      />

      {editTarget && (
        <View style={styles.pickerContainer}>
          <DateTimePicker
            value={editTarget === 'start' ? startDate : endDate}
            mode={isAndroid ? editingPart : 'datetime'}
            display={isAndroid ? 'default' : 'spinner'}
            onChange={onPickerChange}
          />
        </View>
      )}

      {payload && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>
            {selectedEvent
              ? selectedEvent.title
              : 'Your Event QR Code'}
          </Text>

          {selectedEvent && (
            <>
              <Text style={styles.detailText}>
                Code: {selectedEvent.event_code}
              </Text>
              <Text style={styles.detailText}>
                Starts: {formatDateTime(selectedEvent.start_time)}
              </Text>
              <Text style={styles.detailText}>
                Ends: {formatDateTime(selectedEvent.end_time)}
              </Text>
            </>
          )}

          <View style={styles.qrBox}>
            <QRCode value={payload} size={200} />
          </View>

          <Text style={styles.payloadText}>{payload}</Text>

          {selectedEvent && (
            <Pressable
              style={styles.closeButton}
              onPress={() => {
                setSelectedEvent(null);
                setPayload(null);
              }}
            >
              <Text style={styles.closeText}>Close QR Details</Text>
            </Pressable>
          )}
        </View>
      )}

      <Text style={styles.sectionTitle}>
        {isAdmin ? 'All Events' : 'My Events'}
      </Text>

      <Text style={styles.sectionSubtitle}>
        {isAdmin
          ? 'Events from every teacher and admin account.'
          : 'Events you created using this account.'}
      </Text>

      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <Ionicons
            name="search-outline"
            size={19}
            color={colors.secondaryText}
          />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search title or event code"
            placeholderTextColor={colors.secondaryText}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <Ionicons
                name="close-circle"
                size={19}
                color={colors.secondaryText}
              />
            </Pressable>
          )}
        </View>

        <Pressable
          style={styles.refreshButton}
          onPress={handleRefresh}
          accessibilityLabel="Refresh events"
        >
          <Ionicons
            name="refresh-outline"
            size={22}
            color={colors.primary}
          />
        </Pressable>
      </View>

      {eventsLoading && events.length === 0 ? (
        <View style={styles.emptyCard}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.emptyText}>Loading events...</Text>
        </View>
      ) : eventsError ? (
        <View style={styles.emptyCard}>
          <Ionicons
            name="alert-circle-outline"
            size={30}
            color="#DC2626"
          />
          <Text style={styles.errorText}>{eventsError}</Text>
          <Pressable
            style={styles.actionButton}
            onPress={() => void loadEvents()}
          >
            <Ionicons
              name="refresh-outline"
              size={17}
              color={colors.primary}
            />
            <Text style={styles.actionText}>Try Again</Text>
          </Pressable>
        </View>
      ) : filteredEvents.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons
            name="calendar-outline"
            size={34}
            color={colors.secondaryText}
          />
          <Text style={styles.emptyText}>
            {events.length === 0
              ? 'No events found yet. Create an event using the form above.'
              : 'No events match your search.'}
          </Text>
        </View>
      ) : (
        filteredEvents.map((event) => (
          <View key={event.id} style={styles.eventCard}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <Text style={styles.eventCardTitle}>{event.title}</Text>
              <Ionicons
                name="calendar-outline"
                size={21}
                color={colors.primary}
              />
            </View>

            <Text style={styles.eventCode}>{event.event_code}</Text>

            <Text style={styles.eventMeta}>
              Starts: {formatDateTime(event.start_time)}
            </Text>
            <Text style={styles.eventMeta}>
              Ends: {formatDateTime(event.end_time)}
            </Text>

            {isAdmin && (
              <Text style={styles.eventMeta}>
                Created: {formatDateTime(event.created_at)}
              </Text>
            )}

            <View style={styles.eventActions}>
              <Pressable
                style={styles.actionButton}
                onPress={() => handleViewEvent(event)}
              >
                <Ionicons
                  name="qr-code-outline"
                  size={17}
                  color={colors.primary}
                />
                <Text style={styles.actionText}>View Details & QR</Text>
              </Pressable>

              {isAdmin && (
                <Pressable
                  style={styles.actionButton}
                  onPress={() => handleDeleteEvent(event)}
                >
                  <Ionicons
                    name="trash-outline"
                    size={17}
                    color="#DC2626"
                  />
                  <Text style={styles.deleteText}>Delete</Text>
                </Pressable>
              )}
            </View>
          </View>
        ))
      )}

      <Text style={styles.hint}>
        Showing {filteredEvents.length} of {events.length} event
        {events.length === 1 ? '' : 's'}.
      </Text>

      <Modal
        visible={deleteTarget !== null}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => {
          if (!deleting) setDeleteTarget(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModal}>
            <View style={styles.deleteIconCircle}>
              <Ionicons name="trash-outline" size={30} color="#DC2626" />
            </View>

            <Text style={styles.deleteModalTitle}>Delete Event?</Text>
            <Text style={styles.deleteModalDescription}>
              Are you sure you want to delete this event?
            </Text>

            {deleteTarget && (
              <View style={styles.deleteEventInfo}>
                <Text style={styles.deleteEventName}>
                  {deleteTarget.title}
                </Text>
                <Text style={styles.deleteEventCode}>
                  {deleteTarget.event_code}
                </Text>
                <Text style={styles.deleteWarning}>
                  This action cannot be undone.
                </Text>
              </View>
            )}

            <View style={styles.deleteModalActions}>
              <Pressable
                style={styles.cancelDeleteButton}
                disabled={deleting}
                onPress={() => setDeleteTarget(null)}
              >
                <Text style={styles.cancelDeleteText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={styles.confirmDeleteButton}
                disabled={deleting}
                onPress={() => void performDelete()}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="trash-outline" size={17} color="#FFFFFF" />
                )}
                <Text style={styles.confirmDeleteText}>
                  {deleting ? 'Deleting...' : 'Delete Event'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
  visible={resultModal !== null}
  transparent
  animationType="fade"
  statusBarTranslucent
  onRequestClose={() => setResultModal(null)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.resultModal}>
      <View
        style={[
          styles.resultIcon,
          {
            backgroundColor: resultModal?.success
              ? '#DCFCE7'
              : '#FEE2E2',
          },
        ]}
      >
        <Ionicons
          name={
            resultModal?.success
              ? 'checkmark-circle'
              : 'alert-circle'
          }
          size={38}
          color={resultModal?.success ? '#16A34A' : '#DC2626'}
        />
      </View>

      <Text style={styles.resultModalTitle}>
        {resultModal?.title}
      </Text>

      <Text style={styles.resultModalMessage}>
        {resultModal?.message}
      </Text>

      <Pressable
        style={styles.resultModalButton}
        onPress={() => setResultModal(null)}
      >
        <Text style={styles.resultModalButtonText}>OK</Text>
      </Pressable>
    </View>
  </View>
</Modal>
    </ScrollView>
  );
}

type PickerFieldProps = {
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  colors: {
    primary: string;
    secondaryText: string;
  };
  styles: ReturnType<typeof StyleSheet.create>;
};

function PickerField({
  value,
  icon,
  onPress,
  colors,
  styles,
}: PickerFieldProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.pickerField,
        pressed && styles.pickerFieldPressed,
      ]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={styles.pickerValue}>{value}</Text>
      <Ionicons
        name="calendar-outline"
        size={18}
        color={colors.secondaryText}
      />
    </Pressable>
  );
}
