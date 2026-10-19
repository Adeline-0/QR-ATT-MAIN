
import { supabase } from './supabase';

export type Event = {
  eventId: string;
  title: string;
  start: string;
  end: string;
};

export type CloudEvent = {
  id: string;
  event_code: string;
  title: string;
  start_time: string | null;
  end_time: string | null;
  created_by: string | null;
  created_at: string;
};

export async function createEvent(
  event: Event
): Promise<{ error: string | null }> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'Please sign in before creating an event.' };
  }

  const { error } = await supabase.from('events').upsert(
    {
      event_code: event.eventId,
      title: event.title,
      start_time: event.start || null,
      end_time: event.end || null,
      created_by: user.id,
    },
    { onConflict: 'event_code' }
  );

  return { error: error?.message ?? null };
}

// Fetch events created by a specific teacher.
export async function getEventsByTeacher(
  teacherId: string
): Promise<CloudEvent[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('created_by', teacherId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to load teacher events:', error.message);
    return [];
  }

  return (data ?? []) as CloudEvent[];
}

// Fetch all events. Intended for admins with suitable database permissions.
export async function getAllEvents(): Promise<{
  events: CloudEvent[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to load all events:', error.message);
    return { events: [], error: error.message };
  }

  return {
    events: (data ?? []) as CloudEvent[],
    error: null,
  };
}

// Find an event using its event code.
export async function getEventByCode(
  code: string
): Promise<CloudEvent | null> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('event_code', code)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as CloudEvent;
}

// Delete an event by its database ID.
// Database RLS must restrict this operation to authorized users.
export async function deleteEvent(
  eventId: string
): Promise<{ error: string | null }> {
  const { data, error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId)
    .select('id');

  if (error) {
    return { error: error.message };
  }

  if (!data || data.length === 0) {
    return {
      error:
        'No event was deleted. Check your admin role and Supabase DELETE policy.',
    };
  }

  return { error: null };
}
