import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/constants/ThemeContext';

type Props = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  theme?: 'primary';
  onPress: () => void;
};

export default function AppButton({ title, icon, theme, onPress }: Props) {
  const { colors } = useAppTheme();
  const isPrimary = theme === 'primary';

  return (
    <View
      style={[
        styles.buttonOuter,
        isPrimary && {
          borderWidth: 1,
          borderColor: colors.primary,
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.buttonInner,
          {
            backgroundColor: isPrimary ? colors.primary : colors.surface,
            borderColor: colors.border,
            shadowColor: colors.primary,
          },
          !isPrimary && styles.secondaryBorder,
          pressed && styles.buttonPressed,
        ]}
      >
        <Ionicons
          name={icon}
          size={21}
          color={isPrimary ? '#FFFFFF' : colors.secondaryText}
          style={styles.icon}
        />

        <Text
          style={[
            styles.label,
            {
              color: isPrimary ? '#FFFFFF' : colors.text,
            },
          ]}
        >
          {title}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonOuter: {
    width: '100%',
    marginBottom: 14,
    borderRadius: 17,
  },
  buttonInner: {
    minHeight: 54,
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  secondaryBorder: {
    borderWidth: 1,
  },
  buttonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  icon: {
    marginRight: 9,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
});