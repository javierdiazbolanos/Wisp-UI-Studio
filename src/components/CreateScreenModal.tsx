import React, { useState, useMemo } from "react";
import { ScreenType } from "../wisp/types";
import { motion, AnimatePresence } from "motion/react";
import {
  Smartphone,
  AppWindow,
  PanelBottom,
  Layers,
  FileText,
  Sidebar,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  Plus,
  Check,
  Code2,
  ChevronRight,
  Sliders,
} from "lucide-react";

export interface CreateScreenModalProps {
  isOpen: boolean;
  targetScreenName: string;
  fromScreenName?: string;
  onClose: () => void;
  onCreate: (screenName: string, screenType: ScreenType, snippet: string) => void;
  isDark?: boolean;
}

export interface ScreenTypeOption {
  type: ScreenType;
  label: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  badge: string;
}

export function computeNextScreenName(currentName: string): string {
  const clean = currentName.replace(/^@/, "").trim();
  const match = clean.match(/^(.*?)(\d+)$/);
  if (match) {
    const prefix = match[1] || "Screen";
    const num = parseInt(match[2], 10);
    return `${prefix}${num + 1}`;
  }
  if (clean.toLowerCase() === "home") {
    return "Screen1";
  }
  return `${clean}2`;
}

export function generateScreenSnippet(
  screenName: string,
  screenType: ScreenType,
  fromScreenName: string = "Home",
  nextScreenName?: string
): string {
  const cleanName = screenName.replace(/^@/, "").trim() || "Screen1";
  const returnTarget = fromScreenName.replace(/^@/, "").trim() || "Home";
  const nextTarget = (nextScreenName || computeNextScreenName(cleanName)).replace(/^@/, "").trim();

  switch (screenType) {
    case "dialog":
    case "modal":
      return `\n\n@${cleanName}:dialog
  card elevated
    text "${cleanName}" title
    text "Contenido del diálogo emergente @${cleanName}." body
    spacer height=8
    textfield nota_${cleanName.toLowerCase()} label="Comentario o nota" placeholder="Escribe un mensaje..."
    spacer height=12
    split
      left
        button "Cerrar" text goto=close
      right
        button "Continuar a @${nextTarget}" filled icon=arrow-right goto=@${nextTarget}
`;

    case "bottomsheet":
    case "sheet":
      return `\n\n@${cleanName}:bottomsheet
  card elevated
    text "${cleanName}" title
    text "Opciones y acciones rápidas desde la parte inferior." body
    spacer height=8
    listitem "Opción principal" icon=star badge="Destacado"
    listitem "Configuración adicional" icon=settings
    spacer height=12
    split
      left
        button "Cerrar" text goto=close
      right
        button "Avanzar a @${nextTarget}" filled icon=arrow-right goto=@${nextTarget}
`;

    case "sidesheet":
      return `\n\n@${cleanName}:sidesheet
  sidesheet title="${cleanName}"
    text "Panel lateral con información contextual y acciones rápidas." body
    spacer height=8
    listitem "Panel principal" icon=home
    listitem "Historial y reportes" icon=clock
    spacer height=12
    row spacing=12 justify=between
      button "Cerrar" text goto=close
      button "Ir a @${nextTarget}" filled icon=arrow-right goto=@${nextTarget}
`;

    case "wizard":
      return `\n\n@${cleanName}:wizard
  step "Paso 1: Inicio"
    card elevated
      text "Paso 1 de ${cleanName}" title
      text "Completa el primer paso antes de avanzar en el flujo." body
      spacer height=8
      textfield dato_${cleanName.toLowerCase()} label="Información requerida" placeholder="Ingresa datos aquí..."
      spacer height=12
      button "Continuar a @${nextTarget}" filled icon=arrow-right goto=@${nextTarget}
  step "Paso 2: Confirmación"
    card elevated
      text "Confirmación de ${cleanName}" title
      text "Revisa y confirma la información antes de guardar." body
      spacer height=12
      button "Finalizar y Volver" filled icon=check goto=@${returnTarget}
`;

    case "form":
      return `\n\n@${cleanName}:form
  card elevated
    text "Formulario ${cleanName}" title
    text "Completa los campos del formulario para continuar." body
    spacer height=8
    textfield nombre_${cleanName.toLowerCase()} label="Nombre completo" placeholder="Ingresa tu nombre..." icon=user
    textfield email_${cleanName.toLowerCase()} label="Correo electrónico" placeholder="correo@ejemplo.com" icon=mail
    spacer height=12
    split
      left
        button "Cancelar" outlined goto=@${returnTarget}
      right
        button "Guardar y Continuar" filled icon=arrow-right goto=@${nextTarget}
`;

    case "screen":
    default:
      return `\n\n@${cleanName}:screen
  card elevated
    text "${cleanName}" title
    text "Esta es la vista @${cleanName}. Diseña sus componentes e interactividad." body
    spacer height=8
    textfield campo_${cleanName.toLowerCase()} label="Dato de entrada" placeholder="Ingresa un valor..." icon=edit
    spacer height=12
    split
      left
        button "Volver a @${returnTarget}" outlined icon=arrow-left goto=@${returnTarget}
      right
        button "Continuar a @${nextTarget}" filled icon=arrow-right goto=@${nextTarget}
`;
  }
}

export const CreateScreenModal: React.FC<CreateScreenModalProps> = ({
  isOpen,
  targetScreenName,
  fromScreenName = "Home",
  onClose,
  onCreate,
  isDark = false,
}) => {
  const cleanTarget = targetScreenName.replace(/^@/, "").trim() || "Screen1";
  const defaultNext = useMemo(() => computeNextScreenName(cleanTarget), [cleanTarget]);

  const [selectedType, setSelectedType] = useState<ScreenType>("screen");
  const [customNextScreen, setCustomNextScreen] = useState<string>("");
  const [showCodePreview, setShowCodePreview] = useState<boolean>(true);

  // Sync custom next screen when target changes
  React.useEffect(() => {
    setCustomNextScreen(computeNextScreenName(cleanTarget));
    setSelectedType("screen");
  }, [cleanTarget]);

  const effectiveNextScreen = customNextScreen.trim() || defaultNext;

  const options: ScreenTypeOption[] = [
    {
      type: "screen",
      label: "Pantalla Estándar",
      title: "screen",
      description: "Vista completa con tarjeta, contenido interactivo y botones de navegación.",
      icon: <Smartphone className="w-5 h-5 text-purple-500" />,
      badge: "Recomendado",
    },
    {
      type: "dialog",
      label: "Diálogo Modal",
      title: "dialog",
      description: "Ventana emergente centrada con foco modal y botones de confirmar/cancelar.",
      icon: <AppWindow className="w-5 h-5 text-amber-500" />,
      badge: "Modal",
    },
    {
      type: "bottomsheet",
      label: "Bottom Sheet",
      title: "bottomsheet",
      description: "Hoja deslizante desde la parte inferior de la pantalla para móviles y web.",
      icon: <PanelBottom className="w-5 h-5 text-teal-500" />,
      badge: "Hoja Inferior",
    },
    {
      type: "sidesheet",
      label: "Panel Lateral",
      title: "sidesheet",
      description: "Panel o cajón lateral contextual con filtros, opciones o información detallada.",
      icon: <Sidebar className="w-5 h-5 text-indigo-500" />,
      badge: "Lateral",
    },
    {
      type: "wizard",
      label: "Asistente por Pasos",
      title: "wizard",
      description: "Flujo guiado secuencial (Step 1, Step 2) con progreso paso a paso.",
      icon: <Layers className="w-5 h-5 text-blue-500" />,
      badge: "Multi-paso",
    },
    {
      type: "form",
      label: "Formulario",
      title: "form",
      description: "Estructura optimizada para recolección de datos, campos y validaciones.",
      icon: <FileText className="w-5 h-5 text-emerald-500" />,
      badge: "Formulario",
    },
  ];

  const generatedCode = useMemo(() => {
    return generateScreenSnippet(cleanTarget, selectedType, fromScreenName, effectiveNextScreen);
  }, [cleanTarget, selectedType, fromScreenName, effectiveNextScreen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onCreate(cleanTarget, selectedType, generatedCode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-fade-in select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="w-full max-w-2xl bg-white dark:bg-[#181622] rounded-3xl p-5 sm:p-7 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-5 max-h-[92vh] flex flex-col overflow-hidden text-neutral-900 dark:text-neutral-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between shrink-0 border-b border-neutral-100 dark:border-neutral-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-100 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800/80 flex items-center justify-center text-purple-600 dark:text-purple-300 shadow-sm shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                  Crear nueva vista
                </h3>
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
                  @{cleanTarget}
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                La pantalla destino no existe aún. Elige el tipo de vista que deseas crear e insertar.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors cursor-pointer"
            aria-label="Cerrar diálogo"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-0">
          {/* Screen Type Grid */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider block">
              1. Selecciona el Tipo de Contenedor:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {options.map((opt) => {
                const isSelected = selectedType === opt.type;
                return (
                  <div
                    key={opt.type}
                    onClick={() => setSelectedType(opt.type)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 text-left ${
                      isSelected
                        ? "bg-purple-50/90 dark:bg-purple-950/60 border-purple-500 ring-2 ring-purple-400/40 shadow-sm"
                        : "bg-neutral-50/70 dark:bg-neutral-900/60 border-neutral-200/80 dark:border-neutral-800 hover:border-purple-300 dark:hover:border-purple-700"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl border shrink-0 ${
                        isSelected
                          ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                          : "bg-white dark:bg-neutral-800 border-neutral-200/80 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300"
                      }`}
                    >
                      {opt.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span
                          className={`text-xs font-bold font-mono ${
                            isSelected
                              ? "text-purple-700 dark:text-purple-300"
                              : "text-neutral-800 dark:text-neutral-200"
                          }`}
                        >
                          @{cleanTarget}:{opt.title}
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-neutral-200/60 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 uppercase">
                          {opt.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-snug">
                        {opt.description}
                      </p>
                    </div>

                    {isSelected && (
                      <div className="p-0.5 rounded-full bg-purple-600 text-white shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Flow Chain Preview */}
          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-purple-500" />
                <span>2. Configuración de Flujo y Siguiente Botón:</span>
              </span>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                Auto-secuencial
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <label className="text-[11px] text-neutral-500 dark:text-neutral-400 block mb-1">
                  Botón Volver apunta a:
                </label>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-mono">
                  <ArrowLeft className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="font-bold text-neutral-700 dark:text-neutral-300">
                    @{fromScreenName || "Home"}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-neutral-500 dark:text-neutral-400 block mb-1">
                  Botón Continuar apunta a:
                </label>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-mono focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-400">
                  <ArrowRight className="w-3.5 h-3.5 text-purple-500" />
                  <span className="text-purple-600 dark:text-purple-400 font-bold">@</span>
                  <input
                    type="text"
                    value={customNextScreen}
                    onChange={(e) => setCustomNextScreen(e.target.value.replace(/^@/, ""))}
                    placeholder={defaultNext}
                    className="w-full bg-transparent outline-none font-bold text-neutral-800 dark:text-neutral-200 text-xs"
                  />
                </div>
              </div>
            </div>

            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-tight">
              💡 Al hacer clic en el botón de la nueva pantalla que apunta a{" "}
              <strong className="text-purple-600 dark:text-purple-400 font-mono">
                @{effectiveNextScreen}
              </strong>
              , Wisp te permitirá crear secuencialmente{" "}
              <strong className="text-purple-600 dark:text-purple-400 font-mono">
                @{effectiveNextScreen}
              </strong>{" "}
              con el siguiente enlace automático.
            </p>
          </div>

          {/* Generated Code Preview Accordion */}
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => setShowCodePreview(!showCodePreview)}
              className="flex items-center justify-between w-full text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:text-purple-600 cursor-pointer py-1"
            >
              <div className="flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-purple-500" />
                <span>Vista Previa del Código Wisp DSL a Insertar:</span>
              </div>
              <span className="text-[10px] text-purple-600 dark:text-purple-400">
                {showCodePreview ? "Ocultar" : "Mostrar"}
              </span>
            </button>

            {showCodePreview && (
              <div className="p-3 rounded-2xl bg-neutral-900 text-purple-200 border border-neutral-800 font-mono text-[11px] leading-relaxed overflow-x-auto shadow-inner max-h-36">
                <pre className="text-emerald-400">{generatedCode.trim()}</pre>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-3 border-t border-neutral-100 dark:border-neutral-800 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-all cursor-pointer text-center"
          >
            Cancelar
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 sm:flex-initial px-5 py-2.5 text-xs font-bold bg-purple-600 hover:bg-purple-700 active:scale-97 text-white rounded-xl shadow-md shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Crear e Insertar @{cleanTarget}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
