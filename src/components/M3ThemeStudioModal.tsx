import React from "react";
import {
  M3ColorScheme,
  M3Preset,
  M3SchemeVariant,
  M3_PRESETS,
  generateM3Scheme,
} from "../theme/material3";
import {
  X,
  Palette,
  Sparkles,
  Sun,
  Moon,
  Check,
  RotateCcw,
  Sliders,
  Layers,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface M3ThemeStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPresetId: string;
  onSelectPreset: (presetId: string) => void;
  seedHex: string;
  onChangeSeedHex: (hex: string) => void;
  schemeVariant: M3SchemeVariant;
  onChangeSchemeVariant: (variant: M3SchemeVariant) => void;
  contrastLevel: number;
  onChangeContrastLevel: (contrast: number) => void;
  isDark: boolean;
  onToggleDarkMode: () => void;
  activeColorScheme: M3ColorScheme;
}

const SCHEME_VARIANTS: {
  id: M3SchemeVariant;
  label: string;
  description: string;
  tag: string;
}[] = [
  {
    id: "expressive",
    label: "Expressive (M3 Expressive)",
    description: "Dynamic decoupling of complementary accents and maximum playful visual warmth.",
    tag: "M3 Recommended",
  },
  {
    id: "vibrant",
    label: "Vibrant (M3 Vibrant)",
    description: "Amplified saturation and visual punch for bold interfaces.",
    tag: "High Chroma",
  },
  {
    id: "fruit_salad",
    label: "Fruit Salad",
    description: "Botanical and fruity harmony with organic dual-tone balance.",
    tag: "Organic",
  },
  {
    id: "rainbow",
    label: "Rainbow",
    description: "Extended chromatic distribution across the hue spectrum.",
    tag: "Spectrum",
  },
  {
    id: "tonal_spot",
    label: "Tonal Spot (M3 Standard)",
    description: "Classic balanced Material Design 3 model.",
    tag: "Standard",
  },
  {
    id: "fidelity",
    label: "Fidelity",
    description: "Preserves exact brand seed hue with maximum fidelity.",
    tag: "Fidelity",
  },
  {
    id: "content",
    label: "Content-driven",
    description: "Optimized for automated extraction from images and content.",
    tag: "Content",
  },
  {
    id: "neutral",
    label: "Neutral",
    description: "Reduced chroma and muted tones for calm, sober workflows.",
    tag: "Neutral",
  },
  {
    id: "monochrome",
    label: "Monochrome",
    description: "Pure luminance-based grayscale without hue saturation.",
    tag: "Monochrome",
  },
];

export const M3ThemeStudioModal: React.FC<M3ThemeStudioModalProps> = ({
  isOpen,
  onClose,
  currentPresetId,
  onSelectPreset,
  seedHex,
  onChangeSeedHex,
  schemeVariant,
  onChangeSchemeVariant,
  contrastLevel,
  onChangeContrastLevel,
  isDark,
  onToggleDarkMode,
  activeColorScheme,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-[#14121A] text-neutral-900 dark:text-neutral-100 rounded-[28px] shadow-2xl border border-neutral-200/80 dark:border-neutral-800 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800/80 flex items-center justify-between bg-neutral-50/70 dark:bg-[#191622]/70 shrink-0">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs"
                style={{
                  backgroundColor: activeColorScheme.primaryContainer,
                  color: activeColorScheme.onPrimaryContainer,
                }}
              >
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-base sm:text-lg tracking-tight">
                    Material 3 Expressive Color Studio
                  </h2>
                  <span
                    className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: activeColorScheme.tertiaryContainer,
                      color: activeColorScheme.onTertiaryContainer,
                    }}
                  >
                    @material/material-color-utilities
                  </span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Official Google dynamic algorithmic tonal generation engine
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onToggleDarkMode}
                className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700/80 transition-all cursor-pointer shadow-xs"
                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-neutral-600" />
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full hover:bg-neutral-200/80 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {/* Section 1: Curated M3 Expressive Presets */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                  Curated M3 Expressive Palettes
                </span>
                <span className="text-[11px] text-neutral-400">
                  Select a preconfigured harmony
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                {Object.values(M3_PRESETS).map((preset) => {
                  const isSelected = currentPresetId === preset.id;
                  const scheme = isDark ? preset.dark : preset.light;

                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => onSelectPreset(preset.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                        isSelected
                          ? "ring-2 ring-purple-500 border-transparent shadow-md"
                          : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/40"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          {/* Mini Swatches */}
                          <div
                            className="w-4 h-4 rounded-full border border-white/30 shadow-xs"
                            style={{ backgroundColor: scheme.primary }}
                          />
                          <div
                            className="w-3.5 h-3.5 rounded-full border border-white/30 shadow-xs"
                            style={{ backgroundColor: scheme.secondary }}
                          />
                          <div
                            className="w-3 h-3 rounded-full border border-white/30 shadow-xs"
                            style={{ backgroundColor: scheme.tertiary }}
                          />
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <p className="font-bold text-xs text-neutral-900 dark:text-neutral-100 truncate">
                        {preset.name.split("(")[0].trim()}
                      </p>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400 capitalize mt-0.5">
                        {preset.variant.replace("_", " ")}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Custom Seed Color & M3 Scheme Algorithm */}
            <div className="p-4 sm:p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/30 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-purple-500" />
                  <div>
                    <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                      Custom Seed Color & M3 Algorithm
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Modify the Hex value and observe real-time tonal recalibration
                    </p>
                  </div>
                </div>

                {/* Seed Hex Input + Native Picker */}
                <div className="flex items-center gap-2 bg-white dark:bg-neutral-800 p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-xs">
                  <div className="relative flex items-center">
                    <input
                      type="color"
                      value={seedHex}
                      onChange={(e) => onChangeSeedHex(e.target.value)}
                      className="w-7 h-7 rounded-lg border-0 cursor-pointer overflow-hidden opacity-0 absolute inset-0 z-10"
                    />
                    <div
                      className="w-7 h-7 rounded-lg border border-neutral-300 dark:border-neutral-600 shadow-inner"
                      style={{ backgroundColor: seedHex }}
                    />
                  </div>
                  <input
                    type="text"
                    value={seedHex.toUpperCase()}
                    onChange={(e) => onChangeSeedHex(e.target.value)}
                    placeholder="#6750A4"
                    className="w-20 font-mono text-xs font-bold text-neutral-800 dark:text-neutral-200 bg-transparent focus:outline-none uppercase"
                    maxLength={7}
                  />
                </div>
              </div>

              {/* Variant Selector */}
              <div className="space-y-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">
                  Scheme Harmony Algorithm (@material/material-color-utilities)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {SCHEME_VARIANTS.map((v) => {
                    const isSelected = schemeVariant === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => onChangeSchemeVariant(v.id)}
                        className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-purple-50 dark:bg-purple-950/50 border-purple-400 dark:border-purple-600 ring-1 ring-purple-400"
                            : "border-neutral-200 dark:border-neutral-700/80 bg-white dark:bg-neutral-800/80 hover:bg-neutral-100 dark:hover:bg-neutral-700/60"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-neutral-900 dark:text-white">
                            {v.label.split("(")[0]}
                          </span>
                          <span
                            className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md"
                            style={
                              isSelected
                                ? {
                                    backgroundColor: activeColorScheme.primary,
                                    color: activeColorScheme.onPrimary,
                                  }
                                : {
                                    backgroundColor: "rgba(128,128,128,0.15)",
                                    color: "inherit",
                                  }
                            }
                          >
                            {v.tag}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                          {v.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Contrast Level Slider */}
              <div className="space-y-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 text-[11px]">
                    Dynamic Contrast Level
                  </span>
                  <span className="font-bold font-mono text-purple-600 dark:text-purple-400">
                    {contrastLevel === 0
                      ? "Standard (0.0)"
                      : contrastLevel === 0.5
                      ? "Medium (+0.5)"
                      : "High (+1.0)"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 0.0, label: "Standard (0.0)" },
                    { val: 0.5, label: "Medium (+0.5)" },
                    { val: 1.0, label: "High (+1.0)" },
                  ].map((lvl) => (
                    <button
                      key={lvl.val}
                      type="button"
                      onClick={() => onChangeContrastLevel(lvl.val)}
                      className={`py-1.5 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        contrastLevel === lvl.val
                          ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                          : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700"
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 3: Live Material 3 Expressive Dynamic Tokens Swatch */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-500" />
                  M3 Color Role Hierarchy (Official Spec)
                </span>
                <span className="text-[11px] font-mono text-neutral-400">
                  {isDark ? "Dark Scheme" : "Light Scheme"}
                </span>
              </div>

              {/* M3 Official Role Blocks Stack (Primary, Secondary, Tertiary) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Primary Role Stack - Exact replication of M3 spec & image.png */}
                <div className="rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-700 shadow-sm flex flex-col">
                  {/* 1. Primary */}
                  <div
                    className="px-4 py-3 font-semibold text-xs transition-colors flex items-center justify-between"
                    style={{
                      backgroundColor: activeColorScheme.primary,
                      color: activeColorScheme.onPrimary,
                    }}
                  >
                    <span>Primary</span>
                    <span className="text-[10px] font-mono opacity-80 uppercase">{activeColorScheme.primary}</span>
                  </div>
                  {/* 2. On Primary */}
                  <div
                    className="px-4 py-3 font-semibold text-xs transition-colors flex items-center justify-between border-t border-b border-black/5 dark:border-white/5"
                    style={{
                      backgroundColor: activeColorScheme.surface,
                      color: activeColorScheme.primary,
                    }}
                  >
                    <span>On Primary</span>
                    <span className="text-[10px] font-mono opacity-80 uppercase">{activeColorScheme.onPrimary}</span>
                  </div>
                  {/* 3. Primary Container */}
                  <div
                    className="px-4 py-3 font-semibold text-xs transition-colors flex items-center justify-between"
                    style={{
                      backgroundColor: activeColorScheme.primaryContainer,
                      color: activeColorScheme.onPrimaryContainer,
                    }}
                  >
                    <span>Primary Container</span>
                    <span className="text-[10px] font-mono opacity-80 uppercase">{activeColorScheme.primaryContainer}</span>
                  </div>
                  {/* 4. On Primary Container */}
                  <div
                    className="px-4 py-3 font-semibold text-xs transition-colors flex items-center justify-between"
                    style={{
                      backgroundColor: activeColorScheme.onPrimaryContainer,
                      color: activeColorScheme.primaryContainer,
                    }}
                  >
                    <span>On Primary Container</span>
                    <span className="text-[10px] font-mono opacity-80 uppercase">{activeColorScheme.onPrimaryContainer}</span>
                  </div>
                </div>

                {/* Secondary Role Stack */}
                <div className="rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-700 shadow-sm flex flex-col">
                  {/* 1. Secondary */}
                  <div
                    className="px-4 py-3 font-semibold text-xs transition-colors flex items-center justify-between"
                    style={{
                      backgroundColor: activeColorScheme.secondary,
                      color: activeColorScheme.onSecondary,
                    }}
                  >
                    <span>Secondary</span>
                    <span className="text-[10px] font-mono opacity-80 uppercase">{activeColorScheme.secondary}</span>
                  </div>
                  {/* 2. On Secondary */}
                  <div
                    className="px-4 py-3 font-semibold text-xs transition-colors flex items-center justify-between border-t border-b border-black/5 dark:border-white/5"
                    style={{
                      backgroundColor: activeColorScheme.surface,
                      color: activeColorScheme.secondary,
                    }}
                  >
                    <span>On Secondary</span>
                    <span className="text-[10px] font-mono opacity-80 uppercase">{activeColorScheme.onSecondary}</span>
                  </div>
                  {/* 3. Secondary Container */}
                  <div
                    className="px-4 py-3 font-semibold text-xs transition-colors flex items-center justify-between"
                    style={{
                      backgroundColor: activeColorScheme.secondaryContainer,
                      color: activeColorScheme.onSecondaryContainer,
                    }}
                  >
                    <span>Secondary Container</span>
                    <span className="text-[10px] font-mono opacity-80 uppercase">{activeColorScheme.secondaryContainer}</span>
                  </div>
                  {/* 4. On Secondary Container */}
                  <div
                    className="px-4 py-3 font-semibold text-xs transition-colors flex items-center justify-between"
                    style={{
                      backgroundColor: activeColorScheme.onSecondaryContainer,
                      color: activeColorScheme.secondaryContainer,
                    }}
                  >
                    <span>On Secondary Container</span>
                    <span className="text-[10px] font-mono opacity-80 uppercase">{activeColorScheme.onSecondaryContainer}</span>
                  </div>
                </div>

                {/* Tertiary Role Stack */}
                <div className="rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-700 shadow-sm flex flex-col">
                  {/* 1. Tertiary */}
                  <div
                    className="px-4 py-3 font-semibold text-xs transition-colors flex items-center justify-between"
                    style={{
                      backgroundColor: activeColorScheme.tertiary,
                      color: activeColorScheme.onTertiary,
                    }}
                  >
                    <span>Tertiary</span>
                    <span className="text-[10px] font-mono opacity-80 uppercase">{activeColorScheme.tertiary}</span>
                  </div>
                  {/* 2. On Tertiary */}
                  <div
                    className="px-4 py-3 font-semibold text-xs transition-colors flex items-center justify-between border-t border-b border-black/5 dark:border-white/5"
                    style={{
                      backgroundColor: activeColorScheme.surface,
                      color: activeColorScheme.tertiary,
                    }}
                  >
                    <span>On Tertiary</span>
                    <span className="text-[10px] font-mono opacity-80 uppercase">{activeColorScheme.onTertiary}</span>
                  </div>
                  {/* 3. Tertiary Container */}
                  <div
                    className="px-4 py-3 font-semibold text-xs transition-colors flex items-center justify-between"
                    style={{
                      backgroundColor: activeColorScheme.tertiaryContainer,
                      color: activeColorScheme.onTertiaryContainer,
                    }}
                  >
                    <span>Tertiary Container</span>
                    <span className="text-[10px] font-mono opacity-80 uppercase">{activeColorScheme.tertiaryContainer}</span>
                  </div>
                  {/* 4. On Tertiary Container */}
                  <div
                    className="px-4 py-3 font-semibold text-xs transition-colors flex items-center justify-between"
                    style={{
                      backgroundColor: activeColorScheme.onTertiaryContainer,
                      color: activeColorScheme.tertiaryContainer,
                    }}
                  >
                    <span>On Tertiary Container</span>
                    <span className="text-[10px] font-mono opacity-80 uppercase">{activeColorScheme.onTertiaryContainer}</span>
                  </div>
                </div>
              </div>

              {/* Surface Container Steps */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                {[
                  {
                    label: "Surface Lowest",
                    bg: activeColorScheme.surfaceContainerLowest,
                  },
                  {
                    label: "Surface Low",
                    bg: activeColorScheme.surfaceContainerLow,
                  },
                  {
                    label: "Surface",
                    bg: activeColorScheme.surfaceContainer,
                  },
                  {
                    label: "Surface High",
                    bg: activeColorScheme.surfaceContainerHigh,
                  },
                  {
                    label: "Surface Highest",
                    bg: activeColorScheme.surfaceContainerHighest,
                  },
                ].map((s, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700/80 flex flex-col justify-between h-14"
                    style={{
                      backgroundColor: s.bg,
                      color: activeColorScheme.onSurface,
                    }}
                  >
                    <span className="text-[9px] font-bold uppercase tracking-wider opacity-75 truncate">
                      {s.label}
                    </span>
                    <span className="text-[11px] font-mono font-semibold uppercase">
                      {s.bg}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800/80 bg-neutral-50/70 dark:bg-[#191622]/70 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={() => {
                onSelectPreset("indigo");
                onChangeSeedHex("#6750A4");
                onChangeSchemeVariant("tonal_spot");
                onChangeContrastLevel(0.0);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/70 dark:hover:bg-neutral-800 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Material Baseline</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-full font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
              style={{
                backgroundColor: activeColorScheme.primary,
                color: activeColorScheme.onPrimary,
              }}
            >
              Apply M3 Palette
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
