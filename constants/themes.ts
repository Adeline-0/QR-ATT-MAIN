
export const THEMES = {
  original: {
    name: "Original",
    primary: "#611414",
    background: "#F5F9FF",
    surface: "#FFFFFF",
    text: "#0D1B2A",
    secondaryText: "#546E7A",
    border: "#E0E8F0",
    tabBar: "#FFFFFF",
  },

  purple: {
    name: "Royal Purple",
    primary: "#8B5CF6",
    background: "#F8F7FC",
    surface: "#FFFFFF",
    text: "#1F1B2D",
    secondaryText: "#777184",
    border: "#E8E3F0",
    tabBar: "#FFFFFF",
  },

  blue: {
    name: "Midnight Blue",
    primary: "#2563EB",
    background: "#EAF2FF",
    surface: "#FFFFFF",
    text: "#172554",
    secondaryText: "#64748B",
    border: "#BFDBFE",
    tabBar: "#FFFFFF",
  },

  pink: {
    name: "Rose Pink",
    primary: "#EC4899",
    background: "#FFF5F9",
    surface: "#FFFFFF",
    text: "#831843",
    secondaryText: "#9D7287",
    border: "#FBCFE8",
    tabBar: "#FFFFFF",
  },

  green: {
    name: "Mint Green",
    primary: "#10B981",
    background: "#F0FDF8",
    surface: "#FFFFFF",
    text: "#064E3B",
    secondaryText: "#64877A",
    border: "#A7F3D0",
    tabBar: "#FFFFFF",
  },

  orange: {
    name: "Sunset Orange",
    primary: "#F97316",
    background: "#FFF7ED",
    surface: "#FFFFFF",
    text: "#7C2D12",
    secondaryText: "#9A7967",
    border: "#FED7AA",
    tabBar: "#FFFFFF",
  },

  dark: {
    name: "Midnight Dark",
    primary: "#818CF8",
    background: "#111827",
    surface: "#1F2937",
    text: "#F9FAFB",
    secondaryText: "#9CA3AF",
    border: "#374151",
    tabBar: "#1F2937",
  },
} as const;

export type ThemeName = keyof typeof THEMES;
