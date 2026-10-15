import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  useAppTheme,
  type AppearanceMode,
} from "@/constants/ThemeContext";
import { signOut, useAuth } from "@/lib/auth";
import { getProfile, updateProfile } from "@/lib/profiles";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { colors, themeName, appearance, setAppearance } = useAppTheme();

  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!user?.id) {
      setFullName("");
      setRole("");
      setEmail("");
      setUserId("");
      setEditing(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const profile = await getProfile(user.id);

      if (profile) {
        setFullName(profile.full_name ?? "");
        setRole(profile.role ?? "student");
      } else {
        setFullName("");
        setRole("");
      }

      setEmail(user.email ?? "");
      setUserId(user.id);
    } catch (error) {
      console.error("Failed to load profile:", error);

      if (Platform.OS === "web") {
        window.alert("Could not load your profile.");
      } else {
        Alert.alert("Error", "Could not load your profile.");
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.email]);

  useFocusEffect(
    useCallback(() => {
      void loadProfile();
    }, [loadProfile])
  );

  const showMessage = (title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleSave = async () => {
    if (!user?.id) {
      showMessage("Error", "You are not signed in.");
      return;
    }

    if (!fullName.trim()) {
      showMessage("Missing Name", "Please enter your full name.");
      return;
    }

    try {
      setSaving(true);

      await updateProfile(user.id, {
        full_name: fullName.trim(),
      });

      setFullName(fullName.trim());
      setEditing(false);

      showMessage("Success", "Your profile has been updated.");
    } catch (error) {
      console.error("Failed to update profile:", error);
      showMessage("Error", "Could not update your profile.");
    } finally {
      setSaving(false);
    }
  };

  const performSignOut = async () => {
    if (signingOut) return;

    try {
      setSigningOut(true);
      await signOut();
      router.replace("/login");
    } catch (error) {
      console.error("Sign out failed:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Could not sign out. Please try again.";

      showMessage("Sign Out Failed", message);
    } finally {
      setSigningOut(false);
    }
  };

  const handleSignOut = () => {
    if (!user || signingOut) return;

    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Are you sure you want to sign out?"
      );

      if (confirmed) {
        void performSignOut();
      }

      return;
    }

    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => {
          void performSignOut();
        },
      },
    ]);
  };

  const handleAppearanceChange = async (mode: AppearanceMode) => {
    try {
      console.log("Appearance selected:", mode);
      await setAppearance(mode);
      console.log("Appearance updated:", mode);
    } catch (error) {
      console.error("Failed to change appearance:", error);
      showMessage(
        "Appearance Error",
        "Could not change your appearance. Please try again."
      );
    }
  };

  const displayRole = role
    ? role.charAt(0).toUpperCase() + role.slice(1)
    : "Student";

  const themeLabels: Record<string, string> = {
    original: "Original",
    purple: "Royal Purple",
    blue: "Ocean Blue",
    pink: "Rose Pink",
    green: "Mint Green",
    orange: "Sunset Orange",
    dark: "Midnight Dark",
  };

  const appearanceOptions: {
    value: AppearanceMode;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    description: string;
  }[] = [
    {
      value: "light",
      label: "Light",
      icon: "sunny-outline",
      description: "A bright appearance",
    },
    {
      value: "dark",
      label: "Dark",
      icon: "moon-outline",
      description: "A darker appearance",
    },
    {
      value: "system",
      label: "System",
      icon: "phone-portrait-outline",
      description: "Follow your device settings",
    },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      padding: 20,
      paddingBottom: 36,
    },
    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    loadingText: {
      marginTop: 12,
      fontSize: 14,
    },
    pageTitle: {
      fontSize: 28,
      fontWeight: "800",
    },
    pageSubtitle: {
      fontSize: 14,
      marginTop: 6,
      marginBottom: 22,
    },
    profileCard: {
      borderWidth: 1,
      borderRadius: 22,
      padding: 22,
      alignItems: "center",
      marginBottom: 26,
    },
    avatar: {
      width: 76,
      height: 76,
      borderRadius: 25,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 13,
    },
    profileName: {
      fontSize: 20,
      fontWeight: "800",
      textAlign: "center",
    },
    roleBadge: {
      paddingHorizontal: 13,
      paddingVertical: 6,
      borderRadius: 20,
      marginTop: 9,
    },
    roleText: {
      fontSize: 12,
      fontWeight: "700",
    },
    profileEmail: {
      fontSize: 13,
      marginTop: 11,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "800",
    },
    editButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      padding: 5,
    },
    editText: {
      fontSize: 13,
      fontWeight: "700",
    },
    card: {
      borderWidth: 1,
      borderRadius: 18,
      padding: 17,
      marginBottom: 26,
    },
    fieldLabel: {
      fontSize: 12,
      marginBottom: 6,
    },
    fieldValue: {
      fontSize: 15,
      fontWeight: "600",
    },
    input: {
      minHeight: 46,
      borderWidth: 1,
      borderRadius: 11,
      paddingHorizontal: 12,
      fontSize: 15,
    },
    separator: {
      height: 1,
      marginVertical: 15,
    },
    editActions: {
      flexDirection: "row",
      gap: 10,
      marginTop: 20,
    },
    actionButton: {
      flex: 1,
      minHeight: 44,
      borderRadius: 11,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 10,
    },
    cancelText: {
      fontWeight: "700",
    },
    saveText: {
      color: "#FFFFFF",
      fontWeight: "700",
    },
    preferencesTitle: {
      marginBottom: 12,
    },
    preferenceSection: {
      borderWidth: 1,
      borderRadius: 17,
      padding: 15,
      marginBottom: 12,
    },
    preferenceHeading: {
      flexDirection: "row",
      alignItems: "center",
      gap: 13,
      marginBottom: 10,
    },
    preferenceCard: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderRadius: 17,
      padding: 15,
      gap: 13,
      marginBottom: 12,
    },
    preferenceIcon: {
      width: 47,
      height: 47,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    preferenceInfo: {
      flex: 1,
      gap: 5,
    },
    preferenceTitle: {
      fontSize: 14,
      fontWeight: "700",
    },
    preferenceDescription: {
      fontSize: 12,
      lineHeight: 18,
    },
    appearanceOption: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 12,
      borderRadius: 12,
    },
    appearanceLabel: {
      fontSize: 14,
      fontWeight: "600",
    },
    accountCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      marginTop: 4,
    },
    signOutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 9,
      minHeight: 50,
      borderRadius: 14,
      borderWidth: 1,
      marginTop: 24,
      paddingHorizontal: 16,
      ...(Platform.OS === "web"
        ? ({ cursor: "pointer" } as object)
        : {}),
    },
    signOutText: {
      fontSize: 14,
      fontWeight: "700",
    },
    footer: {
      textAlign: "center",
      fontSize: 12,
      marginTop: 24,
    },
  });

  if (authLoading || loading) {
    return (
      <SafeAreaView
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text
          style={[
            styles.loadingText,
            { color: colors.secondaryText },
          ]}
        >
          Loading profile...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.pageTitle, { color: colors.text }]}>
          My Profile
        </Text>

        <Text
          style={[
            styles.pageSubtitle,
            { color: colors.secondaryText },
          ]}
        >
          Manage your account and preferences.
        </Text>

        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.avatar,
              { backgroundColor: colors.primary + "20" },
            ]}
          >
            <Ionicons
              name="person"
              size={34}
              color={colors.primary}
            />
          </View>

          <Text style={[styles.profileName, { color: colors.text }]}>
            {user ? fullName || "Your Name" : "Guest"}
          </Text>

          {user && (
            <View
              style={[
                styles.roleBadge,
                { backgroundColor: colors.primary + "18" },
              ]}
            >
              <Text
                style={[styles.roleText, { color: colors.primary }]}
              >
                {displayRole}
              </Text>
            </View>
          )}

          <Text
            style={[
              styles.profileEmail,
              { color: colors.secondaryText },
            ]}
          >
            {user ? email || "No email available" : "Sign in to view your profile"}
          </Text>
        </View>

        {user && (
          <>
            <View style={styles.sectionHeader}>
              <Text
                style={[styles.sectionTitle, { color: colors.text }]}
              >
                Personal Information
              </Text>

              {!editing && (
                <Pressable
                  onPress={() => setEditing(true)}
                  style={styles.editButton}
                >
                  <Ionicons
                    name="create-outline"
                    size={18}
                    color={colors.primary}
                  />
                  <Text
                    style={[styles.editText, { color: colors.primary }]}
                  >
                    Edit
                  </Text>
                </Pressable>
              )}
            </View>

            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.fieldLabel,
                  { color: colors.secondaryText },
                ]}
              >
                Full Name
              </Text>

              {editing ? (
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Enter your full name"
                  placeholderTextColor={colors.secondaryText}
                  autoCapitalize="words"
                  editable={!saving}
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                    },
                  ]}
                />
              ) : (
                <Text
                  style={[styles.fieldValue, { color: colors.text }]}
                >
                  {fullName || "Not provided"}
                </Text>
              )}

              <View
                style={[
                  styles.separator,
                  { backgroundColor: colors.border },
                ]}
              />

              <Text
                style={[
                  styles.fieldLabel,
                  { color: colors.secondaryText },
                ]}
              >
                Email Address
              </Text>
              <Text
                style={[styles.fieldValue, { color: colors.text }]}
              >
                {email || "Not available"}
              </Text>

              <View
                style={[
                  styles.separator,
                  { backgroundColor: colors.border },
                ]}
              />

              <Text
                style={[
                  styles.fieldLabel,
                  { color: colors.secondaryText },
                ]}
              >
                Account Role
              </Text>
              <Text
                style={[styles.fieldValue, { color: colors.text }]}
              >
                {displayRole}
              </Text>

              {editing && (
                <View style={styles.editActions}>
                  <Pressable
                    onPress={() => {
                      setEditing(false);
                      void loadProfile();
                    }}
                    disabled={saving}
                    style={[
                      styles.actionButton,
                      {
                        borderColor: colors.border,
                        backgroundColor: colors.surface,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.cancelText,
                        { color: colors.text },
                      ]}
                    >
                      Cancel
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => void handleSave()}
                    disabled={saving}
                    style={[
                      styles.actionButton,
                      { backgroundColor: colors.primary },
                    ]}
                  >
                    {saving ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.saveText}>
                        Save Changes
                      </Text>
                    )}
                  </Pressable>
                </View>
              )}
            </View>
          </>
        )}

        <Text
          style={[
            styles.sectionTitle,
            styles.preferencesTitle,
            { color: colors.text },
          ]}
        >
          Preferences
        </Text>

        {user && (
          <View
            style={[
              styles.preferenceSection,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.preferenceHeading}>
              <View
                style={[
                  styles.preferenceIcon,
                  { backgroundColor: colors.primary + "20" },
                ]}
              >
                <Ionicons
                  name="contrast-outline"
                  size={23}
                  color={colors.primary}
                />
              </View>

              <View style={styles.preferenceInfo}>
                <Text
                  style={[
                    styles.preferenceTitle,
                    { color: colors.text },
                  ]}
                >
                  Appearance
                </Text>
                <Text
                  style={[
                    styles.preferenceDescription,
                    { color: colors.secondaryText },
                  ]}
                >
                  Choose how your app looks.
                </Text>
              </View>
            </View>

            {appearanceOptions.map((option) => {
              const selected = appearance === option.value;

              return (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    void handleAppearanceChange(option.value);
                  }}
                  accessibilityRole="radio"
                  accessibilityLabel={`${option.label} appearance`}
                  accessibilityState={{ checked: selected }}
                  hitSlop={4}
                  style={({ pressed }) => [
                    styles.appearanceOption,
                    selected && {
                      backgroundColor: colors.primary + "12",
                    },
                    pressed && { opacity: 0.65 },
                  ]}
                >
                  <Ionicons
                    name={option.icon}
                    size={21}
                    color={
                      selected ? colors.primary : colors.secondaryText
                    }
                  />

                  <View style={styles.preferenceInfo}>
                    <Text
                      style={[
                        styles.appearanceLabel,
                        { color: colors.text },
                      ]}
                    >
                      {option.label}
                    </Text>
                    <Text
                      style={[
                        styles.preferenceDescription,
                        { color: colors.secondaryText },
                      ]}
                    >
                      {option.description}
                    </Text>
                  </View>

                  <Ionicons
                    name={
                      selected
                        ? "radio-button-on"
                        : "radio-button-off"
                    }
                    size={21}
                    color={
                      selected ? colors.primary : colors.secondaryText
                    }
                  />
                </Pressable>
              );
            })}
          </View>
        )}

        <Pressable
          onPress={() => {
            if (user) {
              router.push("/theme");
            } else {
              router.replace("/login");
            }
          }}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.preferenceCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
            pressed && { opacity: 0.7 },
          ]}
        >
          <View
            style={[
              styles.preferenceIcon,
              { backgroundColor: colors.primary + "20" },
            ]}
          >
            <Ionicons
              name="color-palette-outline"
              size={24}
              color={colors.primary}
            />
          </View>

          <View style={styles.preferenceInfo}>
            <Text
              style={[
                styles.preferenceTitle,
                { color: colors.text },
              ]}
            >
              {user ? "Choose Theme" : "Sign In to Customize"}
            </Text>
            <Text
              style={[
                styles.preferenceDescription,
                { color: colors.secondaryText },
              ]}
            >
              {user
                ? themeLabels[themeName] ?? "Original"
                : "Sign in to manage your personal preferences."}
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={21}
            color={colors.secondaryText}
          />
        </Pressable>

        {user && (
          <View
            style={[
              styles.accountCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={21}
              color={colors.primary}
            />

            <View style={styles.preferenceInfo}>
              <Text
                style={[
                  styles.preferenceTitle,
                  { color: colors.text },
                ]}
              >
                Account ID
              </Text>
              <Text
                selectable
                style={[
                  styles.preferenceDescription,
                  { color: colors.secondaryText },
                ]}
              >
                {userId || user.id || "Unavailable"}
              </Text>
            </View>
          </View>
        )}

        <Pressable
          onPress={() => {
            if (user) {
              handleSignOut();
            } else {
              router.replace("/login");
            }
          }}
          disabled={signingOut}
          accessibilityRole="button"
          accessibilityLabel={user ? "Sign Out" : "Sign In"}
          style={({ pressed }) => [
            styles.signOutButton,
            {
              borderColor: user ? "#EF4444" : colors.primary,
            },
            pressed && !signingOut && { opacity: 0.7 },
          ]}
        >
          {signingOut ? (
            <ActivityIndicator color="#EF4444" />
          ) : (
            <>
              <Ionicons
                name={user ? "log-out-outline" : "log-in-outline"}
                size={21}
                color={user ? "#EF4444" : colors.primary}
              />
              <Text
                style={[
                  styles.signOutText,
                  { color: user ? "#EF4444" : colors.primary },
                ]}
              >
                {user ? "Sign Out" : "Sign In"}
              </Text>
            </>
          )}
        </Pressable>

        <Text style={[styles.footer, { color: colors.secondaryText }]}>
          QR Attendance
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
