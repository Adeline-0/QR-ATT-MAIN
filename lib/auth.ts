
import { useSyncExternalStore } from "react";
import { supabase } from "./supabase";
import type { Session, User } from "@supabase/supabase-js";

type AuthState = {
  session: Session | null;
  user: User | null;
  loading: boolean;
};

export type SignUpProfile = {
  full_name: string;
  role: "student" | "teacher";
};

let authState: AuthState = {
  session: null,
  user: null,
  loading: true,
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): AuthState {
  return authState;
}

export function setAuth(session: Session | null) {
  authState = {
    session,
    user: session?.user ?? null,
    loading: false,
  };

  notify();
}

let authListenerInitialized = false;

function initializeAuthListener() {
  if (authListenerInitialized) return;

  authListenerInitialized = true;

  supabase.auth.onAuthStateChange((_event, session) => {
    authState = {
      session,
      user: session?.user ?? null,
      loading: false,
    };

    notify();
  });
}

initializeAuthListener();

export function useAuth(): AuthState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export async function signUp(
  email: string,
  password: string,
  profile?: SignUpProfile
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: profile
        ? {
            full_name: profile.full_name.trim(),
            role: profile.role,
          }
        : {},
    },
  });

  if (error) {
    return { data, error };
  }

  if (data.session) {
    setAuth(data.session);
  }

  return { data, error: null };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { data, error };
  }

  if (data.session) {
    setAuth(data.session);
  }

  return { data, error: null };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }

  setAuth(null);
  return { error: null };
}
