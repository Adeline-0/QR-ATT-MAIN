import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "@/constants/colors";
import { useAppTheme } from "@/constants/ThemeContext";

type Props = {
  title: string;
  logoColor?: string;
};

export default function Header({ title, logoColor }: Props) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.logoCircle,
          { backgroundColor: logoColor ?? colors.primary },
        ]}
      >
        <MaterialIcons name="qr-code" size={31} color="#FFFFFF" />
      </View>

      <Text style={[styles.title, { color: colors.text }]}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 24,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
});