import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import {
  ActivityIndicator,
  Platform,
  Pressable,
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
import { createEvent } from '@/lib/events';
import { getProfile, type Role } from '@/lib/profiles';
import { buildQRPayload } from '@/lib/qr';

function toLocalISO(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:00`
  );
}

function formatDateTime(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'short' });

  return `${month} ${pad(date.getDate())}, ${date.getFullYear()} at ${pad(
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

  const styles = StyleSheet.create({
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
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 12,
    },
    qrBox: {
      backgroundColor: '#FFFFFF',
      padding: 12,
      borderRadius: 10,
      marginBottom: 12,
    },
    payloadText: {
      fontSize: 12,
      color: colors.secondaryText,
      textAlign: 'center',
      lineHeight: 16,
    },
  });

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadRole() {
        setRoleLoading(true);

        if (!user) {
          if (active) {
            setRole(null);
            setRoleLoading(false);
          }
          return;
        }

        try {
          const profile = await getProfile(user.id);

          if (active) {
            setRole(profile?.role ?? null);

            if (!profile) {
              setMessage(
                'Could not load your account role. Please check your connection and try again.'
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
          if (active) {
            setRoleLoading(false);
          }
        }
      }

      void loadRole();

      return () => {
        active = false;
      };
    }, [user?.id])
  );

  const isAndroid = Platform.OS === 'android';
  const isAdmin = role === 'admin';

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
              ? 'Only teacher and admin accounts can create events.'
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
    >
      <Text style={styles.title}>
        {isAdmin ? 'Manage Events' : 'Create Event QR'}
      </Text>

      <Text style={styles.subtitle}>
        Fill in the event details, then scan the generated QR with the Scan tab.
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
        value={formatDateTime(startDate)}
        icon="sunny-outline"
        onPress={() => openPicker('start')}
        styles={styles}
        colors={colors}
      />

      <Text style={styles.label}>Ends</Text>
      <PickerField
        value={formatDateTime(endDate)}
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
            Scan this QR code with the Scan tab:
          </Text>

          <View style={styles.qrBox}>
            <QRCode value={payload} size={200} />
          </View>

          <Text style={styles.payloadText}>{payload}</Text>
        </View>
      )}
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
