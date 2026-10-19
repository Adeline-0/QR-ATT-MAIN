import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useColorScheme } from "react-native";

import { THEMES, ThemeName } from "./themes";
import { useAuth } from "@/lib/auth";

export type AppearanceMode = "light" | "dark" | "system";

type ThemeColors = {
  name: string;
  primary: string;
  background: string;
  surface: string;
  text: string;
  secondaryText: string;
  border: string;
  tabBar: string;
};

type ThemeContextType = {
  themeName: ThemeName;
  appearance: AppearanceMode;
  colors: ThemeColors;
  setTheme: (name: ThemeName) => Promise<void>;
  setAppearance: (mode: AppearanceMode) => Promise<void>;
  isThemeLoaded: boolean;
};

const DEFAULT_THEME: ThemeName = "original";
const DEFAULT_APPEARANCE: AppearanceMode = "light";

const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const systemScheme = useColorScheme();
  const { user, loading: authLoading } = useAuth();

  const [themeName, setThemeName] =
    useState<ThemeName>(DEFAULT_THEME);

  const [appearance, setAppearanceState] =
    useState<AppearanceMode>(DEFAULT_APPEARANCE);

  const [isThemeLoaded, setIsThemeLoaded] = useState(false);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);

  const userId = user?.id ?? null;

  useEffect(() => {
    let cancelled = false;

    async function loadPreferences() {
      if (authLoading) {
        setIsThemeLoaded(false);
        return;
      }

      setIsThemeLoaded(false);
      setLoadedUserId(null);
      setThemeName(DEFAULT_THEME);
      setAppearanceState(DEFAULT_APPEARANCE);

      if (!userId) {
        if (!cancelled) {
          setLoadedUserId(null);
          setIsThemeLoaded(true);
        }
        return;
      }

      console.log("LOADING PREFERENCES FOR USER:", userId);

      try {
        const themeKey = `@qr_attendance_theme_${userId}`;
        const appearanceKey = `@qr_attendance_appearance_${userId}`;

        const [savedTheme, savedAppearance] = await Promise.all([
          AsyncStorage.getItem(themeKey),
          AsyncStorage.getItem(appearanceKey),
        ]);

        console.log("LOADED THEME KEY:", themeKey);
        console.log("LOADED THEME VALUE:", savedTheme);
        console.log("LOADED APPEARANCE VALUE:", savedAppearance);

        if (cancelled) return;

        const nextTheme: ThemeName =
          savedTheme &&
          Object.prototype.hasOwnProperty.call(THEMES, savedTheme)
            ? (savedTheme as ThemeName)
            : DEFAULT_THEME;

        const nextAppearance: AppearanceMode =
          savedAppearance === "light" ||
          savedAppearance === "dark" ||
          savedAppearance === "system"
            ? savedAppearance
            : DEFAULT_APPEARANCE;

        setThemeName(nextTheme);
        setAppearanceState(nextAppearance);
        setLoadedUserId(userId);
        setIsThemeLoaded(true);
      } catch (error) {
        if (cancelled) return;

        console.warn("Could not load theme preferences:", error);
        setThemeName(DEFAULT_THEME);
        setAppearanceState(DEFAULT_APPEARANCE);
        setLoadedUserId(userId);
        setIsThemeLoaded(true);
      }
    }

    void loadPreferences();

    return () => {
      cancelled = true;
    };
  }, [userId, authLoading]);

  async function setTheme(name: ThemeName): Promise<void> {
    if (!Object.prototype.hasOwnProperty.call(THEMES, name)) {
      console.warn("Invalid theme selected:", name);
      return;
    }

    if (
      !userId ||
      !isThemeLoaded ||
      loadedUserId !== userId
    ) {
      console.warn(
        "Theme change ignored: account preferences are loading.",
        { userId, loadedUserId, isThemeLoaded }
      );
      return;
    }

    const accountId = userId;
    const storageKey = `@qr_attendance_theme_${accountId}`;

    console.log("SAVING FOR USER:", accountId);
    console.log("STORAGE KEY:", storageKey);
    console.log("SELECTED THEME:", name);

    try {
      await AsyncStorage.setItem(storageKey, name);

      console.log("SAVED THEME:", name);
      console.log("SAVED ACCOUNT:", accountId);

      const savedValue = await AsyncStorage.getItem(storageKey);

      console.log("READ BACK THEME:", savedValue);
      console.log("READ BACK KEY:", storageKey);

      // Only update the screen if the same account is still active.
      if (user?.id === accountId) {
        setThemeName(name);
      }
    } catch (error) {
      console.warn("Could not save theme:", error);
    }
  }

  async function setAppearance(
    mode: AppearanceMode
  ): Promise<void> {
    if (
      !userId ||
      !isThemeLoaded ||
      loadedUserId !== userId
    ) {
      console.warn(
        "Appearance change ignored: account preferences are loading."
      );
      return;
    }

    const accountId = userId;
    const storageKey = `@qr_attendance_appearance_${accountId}`;

    try {
      await AsyncStorage.setItem(storageKey, mode);

      console.log("SAVED APPEARANCE:", mode);
      console.log("APPEARANCE ACCOUNT:", accountId);

      if (user?.id === accountId) {
        setAppearanceState(mode);
      }
    } catch (error) {
      console.warn("Could not save appearance:", error);
    }
  }

  const preferencesBelongToCurrentUser =
    !authLoading &&
    isThemeLoaded &&
    loadedUserId === userId;

  const activeThemeName = preferencesBelongToCurrentUser
    ? themeName
    : DEFAULT_THEME;

  const activeAppearance = preferencesBelongToCurrentUser
    ? appearance
    : DEFAULT_APPEARANCE;

  const selectedTheme =
    THEMES[activeThemeName] ?? THEMES[DEFAULT_THEME];

  const isDark =
    activeAppearance === "system"
      ? systemScheme === "dark"
      : activeAppearance === "dark";

  const colors: ThemeColors = isDark
    ? {
        ...selectedTheme,
        background: "#050509",
        surface: "#101018",
        text: "#FFFFFF",
        secondaryText: "#A1A1B5",
        border: "#292938",
        tabBar: "#08080D",
      }
    : {
        ...selectedTheme,
      };

  return (
    <ThemeContext.Provider
      value={{
        themeName: activeThemeName,
        appearance: activeAppearance,
        colors,
        setTheme,
        setAppearance,
        isThemeLoaded: preferencesBelongToCurrentUser,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useAppTheme must be used inside ThemeProvider"
    );
  }

  return context;
}