import { supabase } from './supabase';
import { getEventByCode } from './events';
import { parseQRPayload } from './qr';

export type AttendanceRecord = {
  id: string;
  eventId: string;
  eventTitle: string;
  scannedAt: string;
};

export type RegisterResult = {
  success: boolean;
  message: string;
  eventTitle?: string;
};

export type TeacherEventAttendance = {
  eventId: string;
  eventCode: string;
  title: string;
  startTime: string | null;
  endTime: string | null;
  attendeeCount: number;
  attendees: {
    studentId: string;
    scannedAt: string;
  }[];
};

export type TeacherEventSummary = {
  eventId: string;
  eventCode: string;
  title: string;
  attendeeCount: number;
};

type EventPayload = {
  v: 1;
  event: string;
  title?: string;
  start?: string;
  end?: string;
};

export async function registerAttendance(
  rawPayload: string,
  studentId: string
): Promise<RegisterResult> {
  const parsed = parseQRPayload(rawPayload);

  if (!parsed.ok) {
    return {
      success: false,
      message: parsed.message,
    };
  }

  const payload: EventPayload = parsed.payload;
  const now = Date.now();

  const start = payload.start
    ? new Date(payload.start).getTime()
    : null;

  const end = payload.end
    ? new Date(payload.end).getTime()
    : null;

  if (start !== null && now < start) {
    return {
      success: false,
      message: 'Event has not started yet.',
    };
  }

  if (end !== null && now > end) {
    return {
      success: false,
      message: 'Event has already ended.',
    };
  }

  const foundEvent = await getEventByCode(payload.event);

  if (!foundEvent) {
    return {
      success: false,
      message: 'Event not found.',
    };
  }

  const { error: attError } = await supabase
    .from('attendance')
    .insert([
      {
        student_id: studentId,
        event_id: foundEvent.id,
      },
    ]);

  if (attError) {
    if (attError.code === '23505') {
      return {
        success: false,
        message: 'Already registered for this event.',
        eventTitle: foundEvent.title,
      };
    }

    return {
      success: false,
      message: attError.message,
    };
  }

  return {
    success: true,
    message: 'Attendance recorded!',
    eventTitle: foundEvent.title,
  };
}

export async function getAttendanceHistory(
  studentId: string
): Promise<AttendanceRecord[]> {
  const { data, error } = await supabase
    .from('attendance')
    .select('id, scanned_at, events ( event_code, title )')
    .eq('student_id', studentId)
    .order('scanned_at', { ascending: false });

  if (error || !data) {
    console.error('Failed to load attendance history:', error?.message);
    return [];
  }

  return data.map((row: any) => ({
    id: row.id,
    eventId: row.events?.event_code ?? '',
    eventTitle: row.events?.title ?? '',
    scannedAt: row.scanned_at,
  }));
}

/**
 * Fetches events created by a specific teacher.
 */
export async function getTeacherEventAttendance(
  teacherId: string
): Promise<TeacherEventAttendance[]> {
  const { data: events, error: eventError } = await supabase
    .from('events')
    .select('id, event_code, title, start_time, end_time')
    .eq('created_by', teacherId)
    .order('created_at', { ascending: false });

  if (eventError || !events) {
    console.error('Failed to load teacher events:', eventError?.message);
    return [];
  }

  return getAttendanceForEvents(events);
}

/**
 * Fetches all events visible to the current admin under Supabase RLS.
 * The caller must first verify that the current profile role is admin.
 */
export async function getAdminEventAttendance(): Promise<
  TeacherEventAttendance[]
> {
  const { data: events, error: eventError } = await supabase
    .from('events')
    .select('id, event_code, title, start_time, end_time')
    .order('created_at', { ascending: false });

  if (eventError || !events) {
    console.error('Failed to load admin events:', eventError?.message);
    return [];
  }

  return getAttendanceForEvents(events);
}

async function getAttendanceForEvents(
  events: any[]
): Promise<TeacherEventAttendance[]> {
  if (events.length === 0) return [];

  const eventIds = events.map((event) => event.id);

  const { data: attendance, error: attendanceError } = await supabase
    .from('attendance')
    .select('student_id, scanned_at, event_id')
    .in('event_id', eventIds)
    .order('scanned_at', { ascending: false });

  if (attendanceError || !attendance) {
    console.error(
      'Failed to load event attendance:',
      attendanceError?.message
    );
    return [];
  }

  return events.map((event) => {
    const rows = attendance.filter(
      (record: any) => record.event_id === event.id
    );

    return {
      eventId: event.id,
      eventCode: event.event_code,
      title: event.title,
      startTime: event.start_time,
      endTime: event.end_time,
      attendeeCount: rows.length,
      attendees: rows.map((record: any) => ({
        studentId: record.student_id,
        scannedAt: record.scanned_at,
      })),
    };
  });
}

export async function getTeacherEventSummary(
  teacherId: string
): Promise<TeacherEventSummary[]> {
  const { data: events, error: eventError } = await supabase
    .from('events')
    .select('id, event_code, title')
    .eq('created_by', teacherId)
    .order('created_at', { ascending: false });

  if (eventError || !events) {
    console.error('Failed to load teacher event summary:', eventError?.message);
    return [];
  }

  const eventIds = events.map((event: any) => event.id);

  if (eventIds.length === 0) return [];

  const { data: attRows, error: attError } = await supabase
    .from('attendance')
    .select('event_id')
    .in('event_id', eventIds);

  if (attError || !attRows) {
    console.error('Failed to load attendance counts:', attError?.message);
    return [];
  }

  const counts: Record<string, number> = {};

  attRows.forEach((row: any) => {
    counts[row.event_id] = (counts[row.event_id] ?? 0) + 1;
  });

  return events.map((event: any) => ({
    eventId: event.id,
    eventCode: event.event_code,
    title: event.title,
    attendeeCount: counts[event.id] ?? 0,
  }));
}