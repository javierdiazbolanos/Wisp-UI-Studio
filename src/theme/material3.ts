/**
 * Google Material 3 Expressive Design System Tokens & Dynamic Color Engine
 * Powered by official @material/material-color-utilities
 */

import {
  argbFromHex,
  hexFromArgb,
  Hct,
  MaterialDynamicColors,
  SchemeExpressive,
  SchemeVibrant,
  SchemeFruitSalad,
  SchemeRainbow,
  SchemeTonalSpot,
  SchemeFidelity,
  SchemeContent,
  SchemeNeutral,
  SchemeMonochrome,
  DynamicScheme,
} from "@material/material-color-utilities";

export type M3SchemeVariant =
  | "expressive"
  | "vibrant"
  | "fruit_salad"
  | "rainbow"
  | "tonal_spot"
  | "fidelity"
  | "content"
  | "neutral"
  | "monochrome";

export interface M3ColorScheme {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;

  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;

  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;

  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;

  background: string;
  onBackground: string;

  surface: string;
  surfaceDim: string;
  surfaceBright: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  onSurface: string;
  onSurfaceVariant: string;

  outline: string;
  outlineVariant: string;
  shadow: string;
  scrim: string;
  surfaceTint: string;
  inverseSurface: string;
  inverseOnSurface: string;
  inversePrimary: string;

  // Fixed & Expressive Accent Tokens
  primaryFixed: string;
  primaryFixedDim: string;
  onPrimaryFixed: string;
  secondaryFixed: string;
  secondaryFixedDim: string;
  onSecondaryFixed: string;
  tertiaryFixed: string;
  tertiaryFixedDim: string;
  onTertiaryFixed: string;
}

export interface M3Preset {
  id: string;
  name: string;
  seedHex: string;
  variant: M3SchemeVariant;
  description: string;
  light: M3ColorScheme;
  dark: M3ColorScheme;
}

/**
 * Material 3 Expressive Motion & Animation Tokens
 */
export const M3_MOTION = {
  // Spring Transitions
  emphasized: {
    type: "spring",
    stiffness: 300,
    damping: 24,
    mass: 0.8,
  },
  expressiveBounce: {
    type: "spring",
    stiffness: 280,
    damping: 16,
    mass: 0.9,
  },
  spatial: {
    type: "spring",
    stiffness: 260,
    damping: 22,
  },
  smooth: {
    type: "spring",
    stiffness: 220,
    damping: 28,
  },
  gentle: {
    type: "spring",
    stiffness: 180,
    damping: 22,
  },

  // Easing Curves (CSS standard & expressive)
  easingEmphasized: "cubic-bezier(0.2, 0.0, 0, 1.0)",
  easingExpressive: "cubic-bezier(0.3, 0.0, 0.1, 1.0)",
  easingStandardDecelerate: "cubic-bezier(0.0, 0.0, 0.2, 1.0)",
  easingStandardAccelerate: "cubic-bezier(0.3, 0.0, 1.0, 1.0)",

  // Standard Durations (ms)
  durationShort: 0.15,
  durationMedium: 0.28,
  durationLong: 0.45,
  durationExtraLong: 0.6,
};

/**
 * Material 3 Expressive Shape Tokens
 */
export const M3_SHAPES = {
  none: "0px",
  extraSmall: "4px", // rounded
  small: "8px", // rounded-lg
  medium: "12px", // rounded-xl
  large: "16px", // rounded-2xl
  extraLarge: "28px", // rounded-3xl / custom
  extraLargePlus: "32px",
  full: "9999px", // rounded-full (Pill)
};

/**
 * Instantiates the dynamic scheme using Google's official @material/material-color-utilities
 */
function createDynamicScheme(
  sourceHct: Hct,
  isDark: boolean,
  variant: M3SchemeVariant,
  contrastLevel: number = 0.0
): DynamicScheme {
  switch (variant) {
    case "expressive":
      return new SchemeExpressive(sourceHct, isDark, contrastLevel);
    case "vibrant":
      return new SchemeVibrant(sourceHct, isDark, contrastLevel);
    case "fruit_salad":
      return new SchemeFruitSalad(sourceHct, isDark, contrastLevel);
    case "rainbow":
      return new SchemeRainbow(sourceHct, isDark, contrastLevel);
    case "fidelity":
      return new SchemeFidelity(sourceHct, isDark, contrastLevel);
    case "content":
      return new SchemeContent(sourceHct, isDark, contrastLevel);
    case "neutral":
      return new SchemeNeutral(sourceHct, isDark, contrastLevel);
    case "monochrome":
      return new SchemeMonochrome(sourceHct, isDark, contrastLevel);
    case "tonal_spot":
    default:
      return new SchemeTonalSpot(sourceHct, isDark, contrastLevel);
  }
}

/**
 * Extracts a complete M3ColorScheme from a DynamicScheme instance
 */
function extractSchemeTokens(scheme: DynamicScheme): M3ColorScheme {
  const getHex = (dynamicColor: any, fallback: string = "#000000"): string => {
    try {
      if (!dynamicColor) return fallback;
      const argb = dynamicColor.getArgb(scheme);
      return hexFromArgb(argb);
    } catch {
      return fallback;
    }
  };

  return {
    primary: getHex(MaterialDynamicColors.primary, "#6750A4"),
    onPrimary: getHex(MaterialDynamicColors.onPrimary, "#FFFFFF"),
    primaryContainer: getHex(MaterialDynamicColors.primaryContainer, "#EADDFF"),
    onPrimaryContainer: getHex(MaterialDynamicColors.onPrimaryContainer, "#21005D"),

    secondary: getHex(MaterialDynamicColors.secondary, "#625B71"),
    onSecondary: getHex(MaterialDynamicColors.onSecondary, "#FFFFFF"),
    secondaryContainer: getHex(MaterialDynamicColors.secondaryContainer, "#E8DEF8"),
    onSecondaryContainer: getHex(MaterialDynamicColors.onSecondaryContainer, "#1D192B"),

    tertiary: getHex(MaterialDynamicColors.tertiary, "#7D5260"),
    onTertiary: getHex(MaterialDynamicColors.onTertiary, "#FFFFFF"),
    tertiaryContainer: getHex(MaterialDynamicColors.tertiaryContainer, "#FFD8E4"),
    onTertiaryContainer: getHex(MaterialDynamicColors.onTertiaryContainer, "#31111D"),

    error: getHex(MaterialDynamicColors.error, "#BA1A1A"),
    onError: getHex(MaterialDynamicColors.onError, "#FFFFFF"),
    errorContainer: getHex(MaterialDynamicColors.errorContainer, "#FFDAD6"),
    onErrorContainer: getHex(MaterialDynamicColors.onErrorContainer, "#410002"),

    background: getHex(MaterialDynamicColors.background, "#FEF7FF"),
    onBackground: getHex(MaterialDynamicColors.onBackground, "#1D1B20"),

    surface: getHex(MaterialDynamicColors.surface, "#FEF7FF"),
    surfaceDim: getHex(MaterialDynamicColors.surfaceDim, "#DED8E1"),
    surfaceBright: getHex(MaterialDynamicColors.surfaceBright, "#FEF7FF"),
    surfaceContainerLowest: getHex(MaterialDynamicColors.surfaceContainerLowest, "#FFFFFF"),
    surfaceContainerLow: getHex(MaterialDynamicColors.surfaceContainerLow, "#F7F2FA"),
    surfaceContainer: getHex(MaterialDynamicColors.surfaceContainer, "#F3EDF7"),
    surfaceContainerHigh: getHex(MaterialDynamicColors.surfaceContainerHigh, "#ECE6F0"),
    surfaceContainerHighest: getHex(MaterialDynamicColors.surfaceContainerHighest, "#E6E0E9"),
    onSurface: getHex(MaterialDynamicColors.onSurface, "#1D1B20"),
    onSurfaceVariant: getHex(MaterialDynamicColors.onSurfaceVariant, "#49454F"),

    outline: getHex(MaterialDynamicColors.outline, "#79747E"),
    outlineVariant: getHex(MaterialDynamicColors.outlineVariant, "#CAC4D0"),
    shadow: getHex(MaterialDynamicColors.shadow, "#000000"),
    scrim: getHex(MaterialDynamicColors.scrim, "#000000"),
    surfaceTint: getHex(MaterialDynamicColors.surfaceTint, "#6750A4"),
    inverseSurface: getHex(MaterialDynamicColors.inverseSurface, "#313033"),
    inverseOnSurface: getHex(MaterialDynamicColors.inverseOnSurface, "#F4EFF4"),
    inversePrimary: getHex(MaterialDynamicColors.inversePrimary, "#D0BCFF"),

    primaryFixed: getHex(MaterialDynamicColors.primaryFixed, "#EADDFF"),
    primaryFixedDim: getHex(MaterialDynamicColors.primaryFixedDim, "#D0BCFF"),
    onPrimaryFixed: getHex(MaterialDynamicColors.onPrimaryFixed, "#21005D"),
    secondaryFixed: getHex(MaterialDynamicColors.secondaryFixed, "#E8DEF8"),
    secondaryFixedDim: getHex(MaterialDynamicColors.secondaryFixedDim, "#CCC2DC"),
    onSecondaryFixed: getHex(MaterialDynamicColors.onSecondaryFixed, "#1D192B"),
    tertiaryFixed: getHex(MaterialDynamicColors.tertiaryFixed, "#FFD8E4"),
    tertiaryFixedDim: getHex(MaterialDynamicColors.tertiaryFixedDim, "#EFB8C8"),
    onTertiaryFixed: getHex(MaterialDynamicColors.onTertiaryFixed, "#31111D"),
  };
}

/**
 * Generates an official Material 3 color scheme dynamically from any seed hex color
 */
export function generateM3Scheme(
  seedHex: string,
  isDark: boolean,
  variant: M3SchemeVariant = "expressive",
  contrastLevel: number = 0.0
): M3ColorScheme {
  try {
    const cleanHex = seedHex.startsWith("#") ? seedHex : `#${seedHex}`;
    const argb = argbFromHex(cleanHex);
    const sourceHct = Hct.fromInt(argb);
    const dynamicScheme = createDynamicScheme(sourceHct, isDark, variant, contrastLevel);
    return extractSchemeTokens(dynamicScheme);
  } catch (err) {
    console.error("Error generating M3 scheme with @material/material-color-utilities:", err);
    // Return baseline fallback
    return M3_PRESETS.indigo[isDark ? "dark" : "light"];
  }
}

/**
 * Pre-configured curated presets demonstrating M3 Expressive color harmonies
 */
export function createPreset(
  id: string,
  name: string,
  seedHex: string,
  variant: M3SchemeVariant,
  description: string
): M3Preset {
  return {
    id,
    name,
    seedHex,
    variant,
    description,
    light: generateM3Scheme(seedHex, false, variant, 0.0),
    dark: generateM3Scheme(seedHex, true, variant, 0.0),
  };
}

export const M3_PRESETS: Record<string, M3Preset> = {
  indigo: createPreset(
    "indigo",
    "Material Baseline (Tonal Spot)",
    "#6750A4",
    "tonal_spot",
    "Official Google Material 3 Baseline palette based on the Tonal Spot color model with Primary #6750A4 and Primary Container #EADDFF."
  ),
  expressive_iris: createPreset(
    "expressive_iris",
    "Expressive Iris (M3 Expressive)",
    "#6750A4",
    "expressive",
    "Playful and vibrant design with chromatic decoupling of complementary hues following the official M3 Expressive algorithm."
  ),
  vibrant_sunset: createPreset(
    "vibrant_sunset",
    "Vibrant Sunset (M3 Vibrant)",
    "#F4511E",
    "vibrant",
    "Maximized chroma and saturation engineered for energetic, high-impact visual interfaces."
  ),
  fruit_botanical: createPreset(
    "fruit_botanical",
    "Fruit Salad Botanical",
    "#006C4C",
    "fruit_salad",
    "Fresh, organic palette inspired by botanical tones and lush fruit hues with rich tonal harmonies."
  ),
  ocean_azure: createPreset(
    "ocean_azure",
    "Ocean Azure (M3 Rainbow)",
    "#00639B",
    "rainbow",
    "Fluid spectrum of oceanic hues with superior contrast ratios and accessibility compliance."
  ),
  warm_amber: createPreset(
    "warm_amber",
    "Warm Amber Expressive",
    "#8B5000",
    "expressive",
    "Warm and welcoming honey and amber tones paired with expressive secondary and tertiary accents."
  ),
  radiant_coral: createPreset(
    "radiant_coral",
    "Radiant Coral (M3 Expressive)",
    "#A33E3E",
    "expressive",
    "Energetic, striking accents tailored for event platforms, entertainment, and e-commerce."
  ),
  monochrome: createPreset(
    "monochrome",
    "Monochrome Minimal",
    "#49454F",
    "monochrome",
    "Pure minimalist tonal scale designed for maximum clarity and luminance-driven readability."
  ),
};
