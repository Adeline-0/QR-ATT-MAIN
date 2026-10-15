import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAppTheme } from "@/constants/ThemeContext";
import { THEMES, ThemeName } from "@/constants/themes";

const THEME_OPTIONS: ThemeName[] = [
  "original",
  "purple",
  "blue",
  "pink",
  "green",
  "orange",
  "dark",
];

const THEME_DESCRIPTIONS: Record<ThemeName, string> = {
  original: "Classic white and burgundy",
  purple: "Modern and stylish",
  blue: "Cool midnight blue",
  pink: "Soft and playful",
  green: "Fresh and calm",
  orange: "Warm and energetic",
  dark: "Deep black and purple",
};

export default function ThemeScreen() {
  const router = useRouter();
  const { themeName, colors, setTheme } = useAppTheme();

  const selectedTheme = THEMES[themeName];

  const handleThemePress = async (key: ThemeName) => {
    console.log("THEME CARD PRESSED:", key);

    try {
      await setTheme(key);
      console.log("THEME UPDATED:", key);
    } catch (error) {
      console.error("FAILED TO UPDATE THEME:", error);
      Alert.alert("Theme error", "Could not update the selected theme.");
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={[
            styles.backButton,
            { borderColor: colors.border },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={colors.text}
          />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={[styles.title, { color: colors.text }]}>
            Choose Theme
          </Text>

          <Text
            style={[
              styles.subtitle,
              { color: colors.secondaryText },
            ]}
          >
            Make the app feel like yours.
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
      >
        <View
          style={[
            styles.preview,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.previewHeader}>
            <View
              style={[
                styles.logo,
                {
                  backgroundColor: `${selectedTheme.primary}20`,
                },
              ]}
            >
              <Ionicons
                name="qr-code"
                size={27}
                color={selectedTheme.primary}
              />
            </View>

            <View style={styles.previewText}>
              <Text
                style={[
                  styles.previewTitle,
                  { color: colors.text },
                ]}
              >
                QR Attendance
              </Text>

              <Text
                style={[
                  styles.previewSubtitle,
                  { color: colors.secondaryText },
                ]}
              >
                School Event Attendance
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.previewButton,
              { backgroundColor: selectedTheme.primary },
            ]}
          >
            <Ionicons name="scan" size={19} color="#FFFFFF" />

            <Text style={styles.previewButtonText}>
              Scan QR Code
            </Text>
          </View>

          <Text
            style={[
              styles.previewNote,
              { color: colors.secondaryText },
            ]}
          >
            Preview of {selectedTheme.name}
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Available Colors
        </Text>

        <Text
          style={[
            styles.sectionSubtitle,
            { color: colors.secondaryText },
          ]}
        >
          Select a theme to apply it to the app.
        </Text>

        <View style={styles.grid}>
          {THEME_OPTIONS.map((key) => {
            const theme = THEMES[key];
            const selected = themeName === key;

            return (
              <Pressable
                key={key}
                onPress={() => {
                  void handleThemePress(key);
                }}
                accessibilityRole="radio"
                accessibilityLabel={`${theme.name} theme`}
                accessibilityState={{ checked: selected }}
                hitSlop={4}
                style={({ pressed }) => [
                  styles.themeCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: selected
                      ? theme.primary
                      : colors.border,
                    borderWidth: selected ? 2 : 1,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <View style={styles.colorRow}>
                  <View
                    style={[
                      styles.colorCircle,
                      { backgroundColor: theme.primary },
                    ]}
                  >
                    {selected && (
                      <Ionicons
                        name="checkmark"
                        size={22}
                        color="#FFFFFF"
                      />
                    )}
                  </View>

                  {selected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={21}
                      color={theme.primary}
                    />
                  )}
                </View>

                <Text
                  style={[
                    styles.themeName,
                    { color: colors.text },
                  ]}
                >
                  {theme.name}
                </Text>

                <Text
                  style={[
                    styles.themeDescription,
                    { color: colors.secondaryText },
                  ]}
                >
                  {THEME_DESCRIPTIONS[key]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View
          style={[
            styles.info,
            { borderColor: colors.border },
          ]}
        >
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={colors.primary}
          />

          <Text
            style={[
              styles.infoText,
              { color: colors.secondaryText },
            ]}
          >
            Your selection is saved automatically on this device.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 24,
    gap: 14,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  preview: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 28,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  previewText: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 17,
    fontWeight: "800",
  },
  previewSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  previewButton: {
    minHeight: 48,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  previewButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  previewNote: {
    fontSize: 11,
    marginTop: 12,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
  },
  sectionSubtitle: {
    fontSize: 13,
    marginTop: 5,
    marginBottom: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },
  themeCard: {
    width: "48%",
    minHeight: 125,
    padding: 14,
    borderRadius: 17,
  },
  colorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  themeName: {
    fontSize: 14,
    fontWeight: "700",
  },
  themeDescription: {
    fontSize: 11,
    marginTop: 4,
  },
  info: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 22,
    marginBottom: 30,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
});