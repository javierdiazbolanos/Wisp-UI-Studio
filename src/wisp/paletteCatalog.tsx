import React from "react";
import {
  MousePointerClick,
  FormInput,
  Layers,
  Columns2,
  LayoutGrid,
  Milestone,
  ToggleRight,
  TrendingUp,
  ListFilter,
  Smile,
  LucideIcon,
  Tag,
  Check,
  Folder,
  DollarSign,
  Users,
  CheckCircle2,
  Mail,
  Save,
  ArrowRight,
  Search,
  ChevronDown,
  Plus,
  BellRing,
  Navigation,
  Star,
  Table as TableIcon,
  FolderKanban,
  Sliders,
  Calendar,
  Clock,
  Radio,
  CheckSquare,
  AlertCircle,
  FileText,
  UploadCloud,
  Split,
  Maximize2,
  Sparkles,
  GitCommit,
  Repeat,
  Palette,
  Activity,
  Rows,
  SquareAsterisk,
  Image as ImageIcon,
} from "lucide-react";

export type PaletteCategory =
  | "Vistas & Raíz"
  | "Layout & Superficie"
  | "Entradas & Formularios"
  | "Acciones & Controles"
  | "Datos & Tablas"
  | "Feedback & Alertas"
  | "Lógica & Flujo";

export interface ContextRules {
  rootOnly?: boolean; // Only allowed at indent 0 (Screen, Dialog, Wizard, etc.)
  containerOnly?: boolean; // Requires being inside a screen or container
  tableOnly?: boolean; // Specifically for rows/cells inside a table
  selectOnly?: boolean; // Specifically for option inside select/autocomplete
  wizardOnly?: boolean; // Specifically for step inside wizard
  tabsOnly?: boolean; // Specifically for tab inside tabs
  splitOnly?: boolean; // Specifically for left/right inside split
  disallowedIn?: string[]; // Types of parent blocks where this component makes no sense
  preferredIn?: string[]; // Types of parent blocks where this component is recommended
}

export interface PaletteComponentItem {
  id: string;
  name: string;
  label: string;
  category: PaletteCategory;
  icon: LucideIcon;
  color: string;
  snippet: string;
  description: string;
  modifiers: string[];
  contextRules: ContextRules;
  renderPreview: () => React.ReactNode;
}

export interface WispCursorContext {
  lineNum: number;
  indent: number;
  currentLineText: string;
  enclosingScreenName: string | null;
  enclosingScreenType: string | null;
  enclosingContainerType: string | null;
  enclosingContainerLabel: string | null;
  parentPath: { type: string; label: string; line: number; indent: number }[];
  isAtRoot: boolean;
  isInsideTable: boolean;
  isInsideSelect: boolean;
  isInsideWizard: boolean;
  isInsideTabs: boolean;
  isInsideSplit: boolean;
}

/**
 * Valid block elements in Wisp DSL that can act as parent hierarchical containers.
 * Leaf components like spacer, divider, text, textfield, button, etc. are NOT containers.
 */
export const CONTAINER_ELEMENT_TYPES = new Set([
  "screen",
  "form",
  "dialog",
  "wizard",
  "sheet",
  "card",
  "grid",
  "row",
  "column",
  "split",
  "left",
  "right",
  "tabs",
  "tab",
  "step",
  "accordion",
  "table",
  "datatable",
  "select",
  "autocomplete",
]);

/**
 * Analyzes the Wisp DSL code and cursor line position to detect the active hierarchical context.
 * Accurately skips leaf elements (e.g. spacer, text, button) when resolving the true parent container.
 */
export function analyzeWispCursorContext(
  code: string,
  lineNum: number
): WispCursorContext {
  const lines = code.split("\n");
  const targetLineIdx = Math.max(0, Math.min(lineNum - 1, lines.length - 1));
  const currentLineText = lines[targetLineIdx] || "";
  const currentTrimmed = currentLineText.trim();
  
  // Calculate indent of cursor line
  let currentIndent = 0;
  if (currentTrimmed.length > 0) {
    const currentLeadingSpaces = currentLineText.match(/^\s*/)?.[0] || "";
    currentIndent = Math.floor(currentLeadingSpaces.replace(/\t/g, "  ").length / 2);
  } else {
    // If empty line, deduce context indent from the previous non-empty line
    let prevNonEmptyIdx = -1;
    for (let j = targetLineIdx - 1; j >= 0; j--) {
      const lineTrim = lines[j]?.trim() || "";
      if (lineTrim.length > 0 && !lineTrim.startsWith("//") && !lineTrim.startsWith("#")) {
        prevNonEmptyIdx = j;
        break;
      }
    }

    if (prevNonEmptyIdx >= 0) {
      const prevLine = lines[prevNonEmptyIdx];
      const prevTrim = prevLine.trim();
      const prevLeading = prevLine.match(/^\s*/)?.[0] || "";
      const prevIndent = Math.floor(prevLeading.replace(/\t/g, "  ").length / 2);

      if (prevTrim.startsWith("@")) {
        currentIndent = prevIndent + 1;
      } else {
        const firstWord = prevTrim.split(/[\s(=:]/)[0].toLowerCase();
        if (CONTAINER_ELEMENT_TYPES.has(firstWord)) {
          currentIndent = prevIndent + 1;
        } else {
          currentIndent = prevIndent; // Sibling of leaf element like spacer, text, textfield, button
        }
      }
    } else {
      currentIndent = 0;
    }
  }

  // Trace back ancestors based on indentation hierarchy and valid container types ONLY
  const parentPath: { type: string; label: string; line: number; indent: number }[] = [];
  let screenName: string | null = null;
  let screenType: string | null = null;

  let currentSearchIndent = currentIndent;

  for (let i = targetLineIdx - 1; i >= 0; i--) {
    const raw = lines[i];
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("#")) {
      continue;
    }

    const leading = raw.match(/^\s*/)?.[0] || "";
    const lineIndent = Math.floor(leading.replace(/\t/g, "  ").length / 2);

    // If this line is less indented than our current search threshold, check if it's a real container
    if (lineIndent < currentSearchIndent) {
      let isContainer = false;
      let containerType = "";
      let containerLabel = trimmed;

      if (trimmed.startsWith("@")) {
        const screenMatch = trimmed.match(/^@([a-zA-Z0-9_-]+)(?::([a-zA-Z0-9_-]+))?/);
        if (screenMatch) {
          containerType = (screenMatch[2] || "screen").toLowerCase();
          containerLabel = `@${screenMatch[1]}`;
          isContainer = true;
          if (!screenName) {
            screenName = screenMatch[1];
            screenType = containerType;
          }
        }
      } else {
        const firstWord = trimmed.split(/[\s(=:]/)[0].toLowerCase();
        if (CONTAINER_ELEMENT_TYPES.has(firstWord)) {
          isContainer = true;
          containerType = firstWord;
        }
      }

      if (isContainer) {
        currentSearchIndent = lineIndent;
        parentPath.unshift({
          type: containerType,
          label: containerLabel,
          line: i + 1,
          indent: lineIndent,
        });

        if (lineIndent === 0) {
          break; // Reached root level
        }
      }
    }
  }

  // Check if current line itself is a screen declaration (at lineNum)
  if (currentTrimmed.startsWith("@")) {
    const screenMatch = currentTrimmed.match(/^@([a-zA-Z0-9_-]+)(?::([a-zA-Z0-9_-]+))?/);
    if (screenMatch && !screenName) {
      screenName = screenMatch[1];
      screenType = (screenMatch[2] || "screen").toLowerCase();
    }
  }

  const directParent = parentPath.length > 0 ? parentPath[parentPath.length - 1] : null;
  const isAtRoot = parentPath.length === 0 && (currentIndent === 0 || !screenName);

  const isInsideTable = parentPath.some((p) => ["table", "datatable"].includes(p.type));
  const isInsideSelect = parentPath.some((p) => ["select", "autocomplete"].includes(p.type));
  const isInsideWizard = parentPath.some((p) => ["wizard"].includes(p.type)) && !parentPath.some((p) => p.type === "step");
  const isInsideTabs = parentPath.some((p) => ["tabs"].includes(p.type)) && !parentPath.some((p) => p.type === "tab");
  const isInsideSplit = parentPath.some((p) => ["split"].includes(p.type)) && !parentPath.some((p) => ["left", "right"].includes(p.type));

  return {
    lineNum,
    indent: currentIndent,
    currentLineText,
    enclosingScreenName: screenName,
    enclosingScreenType: screenType,
    enclosingContainerType: directParent?.type || (isAtRoot ? "root" : screenType || "screen"),
    enclosingContainerLabel: directParent?.label || (isAtRoot ? "Nivel Raíz (Documento)" : screenName ? `@${screenName}` : "Pantalla"),
    parentPath,
    isAtRoot,
    isInsideTable,
    isInsideSelect,
    isInsideWizard,
    isInsideTabs,
    isInsideSplit,
  };
}

/**
 * Determines whether a component is recommended, allowed, or restricted in the current cursor context.
 * Only returns isRecommended: true for items that genuinely match the semantic purpose of the container.
 */
export function evaluateComponentContext(
  item: PaletteComponentItem,
  context: WispCursorContext
): {
  isRecommended: boolean;
  isAllowed: boolean;
  reason?: string;
} {
  const { isAtRoot, isInsideTable, isInsideSelect, isInsideWizard, isInsideTabs, isInsideSplit, enclosingContainerType } = context;

  // Case 1: At Root level (outside screens or at indent 0)
  if (isAtRoot) {
    if (item.contextRules.rootOnly) {
      return { isRecommended: true, isAllowed: true, reason: "Declaración raíz recomendada para el documento." };
    }
    return {
      isRecommended: false,
      isAllowed: false,
      reason: "Los componentes y widgets deben colocarse dentro de un `@Screen:screen`, `@Modal:dialog`, etc.",
    };
  }

  // If component is rootOnly but we are NOT at root:
  if (item.contextRules.rootOnly) {
    return {
      isRecommended: false,
      isAllowed: false,
      reason: "Las declaraciones de vista (@Screen, @Modal, etc.) deben colocarse en el nivel raíz sin indentación.",
    };
  }

  // Case 2: Inside Table
  if (isInsideTable) {
    if (item.contextRules.tableOnly || item.id === "table-row") {
      return { isRecommended: true, isAllowed: true, reason: "Fila de datos estructurados para la tabla activa." };
    }
    return {
      isRecommended: false,
      isAllowed: false,
      reason: "Dentro de `table` solo se deben agregar filas `row [...]`.",
    };
  }
  if (item.contextRules.tableOnly || item.id === "table-row") {
    return {
      isRecommended: false,
      isAllowed: false,
      reason: "Las filas de datos solo se permiten dentro de una `table`.",
    };
  }

  // Case 3: Inside Select or Autocomplete
  if (isInsideSelect) {
    if (item.contextRules.selectOnly || item.id === "option") {
      return { isRecommended: true, isAllowed: true, reason: "Opción recomendada para el menú desplegable." };
    }
    return {
      isRecommended: false,
      isAllowed: false,
      reason: "Dentro de `select` o `autocomplete` solo se deben agregar elementos `option \"...\"`.",
    };
  }
  if (item.contextRules.selectOnly || item.id === "option") {
    return {
      isRecommended: false,
      isAllowed: false,
      reason: "Las opciones `option` solo se permiten dentro de un `select` o `autocomplete`.",
    };
  }

  // Case 4: Inside Wizard directly (not yet inside a step)
  if (isInsideWizard || enclosingContainerType === "wizard") {
    if (item.contextRules.wizardOnly || item.id === "step") {
      return { isRecommended: true, isAllowed: true, reason: "Paso de flujo recomendado para el asistente Wizard." };
    }
    return {
      isRecommended: false,
      isAllowed: false,
      reason: "Los elementos dentro de `@Wizard` deben agruparse dentro de un bloque `step \"...\"`.",
    };
  }
  if (item.contextRules.wizardOnly || item.id === "step") {
    return {
      isRecommended: false,
      isAllowed: false,
      reason: "El elemento `step` solo se permite dentro de un `@Wizard`.",
    };
  }

  // Case 5: Inside Tabs directly (not yet inside a tab)
  if (isInsideTabs || enclosingContainerType === "tabs") {
    if (item.contextRules.tabsOnly || item.id === "tab") {
      return { isRecommended: true, isAllowed: true, reason: "Panel de pestaña recomendado para `tabs`." };
    }
    return {
      isRecommended: false,
      isAllowed: false,
      reason: "Los elementos dentro de `tabs` deben estructurarse dentro de un bloque `tab \"...\"`.",
    };
  }
  if (item.contextRules.tabsOnly || item.id === "tab") {
    return {
      isRecommended: false,
      isAllowed: false,
      reason: "El elemento `tab` solo se permite dentro de un contenedor `tabs`.",
    };
  }

  // Case 6: Inside Split directly (not yet in left or right)
  if (isInsideSplit || enclosingContainerType === "split") {
    if (item.contextRules.splitOnly || ["left-slot", "right-slot"].includes(item.id)) {
      return { isRecommended: true, isAllowed: true, reason: "Ranura de división (`left` o `right`) recomendada." };
    }
    return {
      isRecommended: false,
      isAllowed: false,
      reason: "El contenedor `split` requiere definir primero las secciones `left` y `right`.",
    };
  }
  if (item.contextRules.splitOnly || ["left-slot", "right-slot"].includes(item.id)) {
    return {
      isRecommended: false,
      isAllowed: false,
      reason: "Las secciones `left` y `right` solo se permiten dentro de un contenedor `split`.",
    };
  }

  // Case 7: Specific container recommendations
  const container = enclosingContainerType || "screen";

  // Inside Card
  if (container === "card") {
    const cardRecommendedIds = [
      "text", "textfield", "textarea", "select", "autocomplete", "datepicker",
      "row", "grid", "column", "button", "button-snackbar-goto", "chip", "switch", "checkbox",
      "slider", "rating", "divider", "spacer", "table", "alert", "accordion", "progress", "tag"
    ];
    if (cardRecommendedIds.includes(item.id)) {
      return { isRecommended: true, isAllowed: true, reason: "Elemento recomendado para el contenido de la tarjeta." };
    }
    return { isRecommended: false, isAllowed: true };
  }

  // Inside Row (Horizontal layout)
  if (container === "row") {
    const rowRecommendedIds = [
      "button", "button-snackbar-goto", "chip", "badge", "avatar", "switch",
      "checkbox", "radio", "text", "icon", "segmentedbutton", "fab", "tag"
    ];
    if (rowRecommendedIds.includes(item.id)) {
      return { isRecommended: true, isAllowed: true, reason: "Control horizontal compacto recomendado para filas `row`." };
    }
    return { isRecommended: false, isAllowed: true };
  }

  // Inside Column (Vertical layout)
  if (container === "column") {
    const colRecommendedIds = [
      "textfield", "textarea", "select", "autocomplete", "datepicker", "row",
      "grid", "card", "divider", "spacer", "button", "button-snackbar-goto",
      "text", "alert", "checkbox", "switch", "slider", "rating", "segmentedbutton"
    ];
    if (colRecommendedIds.includes(item.id)) {
      return { isRecommended: true, isAllowed: true, reason: "Elemento vertical recomendado para estructurar en `column`." };
    }
    return { isRecommended: false, isAllowed: true };
  }

  // Inside Grid
  if (container === "grid") {
    const gridRecommendedIds = [
      "metric", "card", "textfield", "autocomplete", "datepicker", "button", "image"
    ];
    if (gridRecommendedIds.includes(item.id)) {
      return { isRecommended: true, isAllowed: true, reason: "Componente recomendado para celdas del `grid`." };
    }
    return { isRecommended: false, isAllowed: true };
  }

  // Inside Screen or Form top-level
  if (["screen", "form", "sheet"].includes(container)) {
    const screenRecommendedIds = [
      "appbar", "breadcrumbs", "card", "grid", "table", "split", "tabs",
      "accordion", "row", "column", "fab", "metric", "alert"
    ];
    if (screenRecommendedIds.includes(item.id)) {
      return { isRecommended: true, isAllowed: true, reason: "Estructura principal recomendada para la pantalla." };
    }
    return { isRecommended: false, isAllowed: true };
  }

  // Inside Dialog
  if (container === "dialog") {
    const dialogRecommendedIds = [
      "text", "textfield", "textarea", "select", "row", "column",
      "button", "alert", "divider", "spacer", "checkbox", "switch"
    ];
    if (dialogRecommendedIds.includes(item.id)) {
      return { isRecommended: true, isAllowed: true, reason: "Recomendado para diálogos emergentes." };
    }
    return { isRecommended: false, isAllowed: true };
  }

  // Inside Step
  if (container === "step") {
    const stepRecommendedIds = [
      "card", "grid", "column", "row", "textfield", "textarea", "select", "datepicker", "button", "alert", "text"
    ];
    if (stepRecommendedIds.includes(item.id)) {
      return { isRecommended: true, isAllowed: true, reason: "Recomendado para el paso activo del Wizard." };
    }
    return { isRecommended: false, isAllowed: true };
  }

  // Inside Left (Sidebar of split)
  if (container === "left") {
    const leftRecommendedIds = [
      "listitem", "appbar", "tabs", "card", "button", "accordion", "text"
    ];
    if (leftRecommendedIds.includes(item.id)) {
      return { isRecommended: true, isAllowed: true, reason: "Recomendado para la barra lateral izquierda." };
    }
    return { isRecommended: false, isAllowed: true };
  }

  // Inside Right (Main content of split)
  if (container === "right") {
    const rightRecommendedIds = [
      "card", "grid", "table", "column", "row", "form", "tabs"
    ];
    if (rightRecommendedIds.includes(item.id)) {
      return { isRecommended: true, isAllowed: true, reason: "Recomendado para el panel principal derecho." };
    }
    return { isRecommended: false, isAllowed: true };
  }

  // Inside Tab (Panel of tabs)
  if (container === "tab") {
    const tabRecommendedIds = [
      "card", "grid", "table", "column", "row", "textfield", "button"
    ];
    if (tabRecommendedIds.includes(item.id)) {
      return { isRecommended: true, isAllowed: true, reason: "Recomendado para el panel de la pestaña." };
    }
    return { isRecommended: false, isAllowed: true };
  }

  // Inside Accordion
  if (container === "accordion") {
    const accordionRecommendedIds = [
      "grid", "column", "row", "textfield", "textarea", "checkbox", "switch", "radio", "text", "button", "divider", "spacer"
    ];
    if (accordionRecommendedIds.includes(item.id)) {
      return { isRecommended: true, isAllowed: true, reason: "Recomendado para el contenido desplegable." };
    }
    return { isRecommended: false, isAllowed: true };
  }

  return { isRecommended: false, isAllowed: true };
}

/**
 * Master catalog containing all Wisp DSL components with visual previews and context parameters.
 */
export const WISP_PALETTE_CATALOG: PaletteComponentItem[] = [
  // =========================================================
  // 1. VISTAS & RAÍZ
  // =========================================================
  {
    id: "screen",
    name: "@Screen:screen",
    label: "Pantalla Estándar",
    category: "Vistas & Raíz",
    icon: Milestone,
    color: "from-purple-500 to-indigo-500",
    snippet: `@NuevaPantalla:screen\n  card elevated\n    text "Título de Pantalla" title\n    text "Contenido principal..." body`,
    description: "Declara una vista o pantalla principal con soporte para transiciones y navegación.",
    modifiers: ["@Nombre:screen", "theme=material3", "padding=16"],
    contextRules: { rootOnly: true },
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/95 rounded-2xl border border-neutral-800 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-purple-300">
          <span>@Dashboard:screen</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800">Vista M3</span>
        </div>
        <div className="p-2.5 rounded-xl bg-neutral-800/80 border border-neutral-700/60 text-[10px] text-neutral-300">
          Contenido de la pantalla...
        </div>
      </div>
    ),
  },
  {
    id: "dialog",
    name: "@Modal:dialog",
    label: "Diálogo Modal",
    category: "Vistas & Raíz",
    icon: Layers,
    color: "from-fuchsia-500 to-pink-500",
    snippet: `@ConfirmarModal:dialog "Eliminar Registro"\n  text "¿Estás seguro de que deseas eliminar este elemento?" body\n  row spacing=12 justify=end\n    button "Cancelar" text goto=close\n    button "Eliminar" filled goto=close`,
    description: "Ventana modal emergente con fondo oscurecido para confirmaciones y formularios rápidos.",
    modifiers: ["@Nombre:dialog", "goto=close", "justify=end"],
    contextRules: { rootOnly: true },
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/95 rounded-2xl border border-neutral-800">
        <div className="p-3 rounded-2xl bg-neutral-800 border border-neutral-700 shadow-xl space-y-2">
          <div className="font-bold text-xs text-white">¿Confirmar Acción?</div>
          <div className="text-[10px] text-neutral-400">Esta acción no se puede deshacer.</div>
          <div className="flex justify-end gap-1.5 pt-1">
            <span className="px-2 py-0.5 rounded text-[9px] text-neutral-400">Cancelar</span>
            <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-[9px] font-semibold">Aceptar</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "wizard",
    name: "@Proceso:wizard",
    label: "Asistente Wizard",
    category: "Vistas & Raíz",
    icon: Milestone,
    color: "from-pink-500 to-rose-500",
    snippet: `@OnboardingWizard:wizard\n  steps: 3\n\n  step "1. Cuenta"\n    textfield user label="Usuario"\n    button "Siguiente" filled goto=@OnboardingWizard(step=2)\n\n  step "2. Perfil"\n    textfield bio label="Biografía"\n    button "Finalizar" filled goto=@Home`,
    description: "Flujo guiado paso a paso con indicador visual de progreso y navegación entre fases.",
    modifiers: ["steps: N", "step \"...\"", "goto=@Wizard(step=N)"],
    contextRules: { rootOnly: true },
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/95 rounded-2xl border border-neutral-800">
        <div className="flex items-center justify-between px-1 py-1 text-[10px]">
          <div className="flex items-center gap-1 text-purple-400 font-bold">
            <span className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[9px]">1</span>
            <span>Datos</span>
          </div>
          <div className="flex-1 h-0.5 bg-neutral-700 mx-2" />
          <div className="flex items-center gap-1 text-neutral-500">
            <span className="w-4 h-4 rounded-full bg-neutral-800 text-neutral-400 flex items-center justify-center text-[9px]">2</span>
            <span>Pago</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "toast-template",
    name: "@Toast:snackbar",
    label: "Plantilla Notificación",
    category: "Vistas & Raíz",
    icon: BellRing,
    color: "from-emerald-500 to-teal-500",
    snippet: `@FacturaToast:snackbar "Factura procesada con éxito" snackbar-action="Ver PDF" snackbar-type=success`,
    description: "Declara una notificación reutilizable invocable desde botones con `snackbar=@FacturaToast`.",
    modifiers: ["snackbar-action=\"...\"", "snackbar-type=success|info|warning|error", "snackbar-duration=400"],
    contextRules: { rootOnly: true },
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/95 rounded-2xl border border-neutral-800">
        <div className="p-2 rounded-xl bg-neutral-950 border border-neutral-700 flex items-center justify-between text-xs text-white">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-[10px] text-neutral-300">Guardado correctamente</span>
          </div>
          <span className="text-[10px] font-bold text-purple-400 uppercase">Ver</span>
        </div>
      </div>
    ),
  },

  // =========================================================
  // 2. LAYOUT & SUPERFICIE
  // =========================================================
  {
    id: "card",
    name: "card",
    label: "Tarjeta de Superficie",
    category: "Layout & Superficie",
    icon: Layers,
    color: "from-amber-500 to-orange-500",
    snippet: `card elevated\n  text "Título de Tarjeta" title\n  text "Descripción con estilo Material 3." body\n  button "Ver Detalles" filled icon=arrow-right`,
    description: "Contenedor de superficie M3 con elevación o bordes para agrupar contenido y acciones.",
    modifiers: ["elevated", "outlined", "filled", "padding=16"],
    contextRules: { containerOnly: true },
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/95 rounded-2xl border border-neutral-800">
        <div className="p-3 rounded-2xl bg-neutral-800 border border-neutral-700/80 shadow-lg space-y-1">
          <div className="font-bold text-xs text-white">Tarjeta de Superficie</div>
          <div className="text-[10px] text-neutral-400">Contenido estructurado M3...</div>
          <div className="pt-1 flex justify-end">
            <span className="text-[10px] font-semibold text-purple-400 flex items-center gap-1">
              Ver más <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "text",
    name: "text",
    label: "Texto / Tipografía M3",
    category: "Layout & Superficie",
    icon: FileText,
    color: "from-purple-500 to-violet-600",
    snippet: `text "Título de la Sección" title`,
    description: "Bloque de texto tipográfico Material 3 con jerarquía (display, headline, title, body, label).",
    modifiers: ["display", "headline", "title", "body", "label", "color=primary|secondary|error|muted", "align=left|center|right"],
    contextRules: { containerOnly: true },
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/95 rounded-2xl border border-neutral-800 space-y-1">
        <div className="text-xs font-bold text-white">Título de Sección</div>
        <div className="text-[10px] text-neutral-400">Texto descriptivo con cuerpo legible.</div>
      </div>
    ),
  },
  {
    id: "grid",
    name: "grid",
    label: "Matriz Grid",
    category: "Layout & Superficie",
    icon: LayoutGrid,
    color: "from-indigo-500 to-purple-500",
    snippet: `grid cols=3 gap=16\n  metric label="Ventas" value="$12,450" delta="+18%" icon=dollar-sign\n  metric label="Usuarios" value="1,200" delta="+5%" icon=users\n  metric label="Salud" value="99.9%" delta="OK" icon=check-circle`,
    description: "Matriz adaptable de columnas para tableros, indicadores KPI y catálogos.",
    modifiers: ["cols=1|2|3|4", "gap=8|16|24"],
    contextRules: { containerOnly: true },
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/95 rounded-2xl border border-neutral-800">
        <div className="grid grid-cols-3 gap-1.5 text-center">
          <div className="p-1 bg-neutral-800 rounded-lg border border-neutral-700">
            <div className="text-[9px] text-white font-bold">$12K</div>
          </div>
          <div className="p-1 bg-neutral-800 rounded-lg border border-neutral-700">
            <div className="text-[9px] text-white font-bold">1.2K</div>
          </div>
          <div className="p-1 bg-neutral-800 rounded-lg border border-neutral-700">
            <div className="text-[9px] text-white font-bold">99%</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "row",
    name: "row",
    label: "Fila Horizontal",
    category: "Layout & Superficie",
    icon: Rows,
    color: "from-blue-500 to-teal-500",
    snippet: `row spacing=12 align=center justify=between\n  text "Fila de opciones" title\n  button "Añadir" filled icon=plus`,
    description: "Contenedor horizontal flexible (Flexbox row) para alinear elementos lado a lado.",
    modifiers: ["spacing=8|12|16|24", "align=center|start|end", "justify=between|center|end"],
    contextRules: { containerOnly: true },
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/95 rounded-2xl border border-neutral-800">
        <div className="flex items-center justify-between p-2 bg-neutral-800 rounded-xl border border-neutral-700">
          <span className="text-xs text-white font-medium">Elemento Izq</span>
          <span className="px-2 py-0.5 bg-purple-600 text-white rounded-full text-[9px] font-semibold">Der</span>
        </div>
      </div>
    ),
  },
  {
    id: "column",
    name: "column",
    label: "Columna Vertical",
    category: "Layout & Superficie",
    icon: Columns2,
    color: "from-sky-500 to-indigo-500",
    snippet: `column spacing=16\n  textfield nombre label="Nombre Completo"\n  textfield email label="Correo Electrónico" icon=mail`,
    description: "Contenedor vertical flexible (Flexbox column) con espaciado constante entre elementos.",
    modifiers: ["spacing=8|12|16|24"],
    contextRules: { containerOnly: true },
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/95 rounded-2xl border border-neutral-800 space-y-1.5">
        <div className="p-1.5 bg-neutral-800 rounded-lg text-[10px] text-neutral-300">Bloque 1</div>
        <div className="p-1.5 bg-neutral-800 rounded-lg text-[10px] text-neutral-300">Bloque 2</div>
      </div>
    ),
  },
  {
    id: "spacer",
    name: "spacer",
    label: "Espaciador Flexible",
    category: "Layout & Superficie",
    icon: Maximize2,
    color: "from-neutral-500 to-stone-600",
    snippet: `spacer height=16`,
    description: "Inserta una separación espacial vertical u horizontal regulable entre elementos.",
    modifiers: ["height=8|16|24|32", "width=8|16|24", "flex=1"],
    contextRules: { containerOnly: true },
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/95 rounded-2xl border border-neutral-800 space-y-1.5">
        <div className="h-2 bg-neutral-800 rounded" />
        <div className="h-4 border border-dashed border-purple-500/40 rounded flex items-center justify-center text-[8px] text-purple-400 font-mono">
          spacer height=16
        </div>
        <div className="h-2 bg-neutral-800 rounded" />
      </div>
    ),
  },
  {
    id: "divider",
    name: "divider",
    label: "Divisor / Separador",
    category: "Layout & Superficie",
    icon: GitCommit,
    color: "from-neutral-500 to-zinc-600",
    snippet: `divider inset=true`,
    description: "Línea divisoria sutil para separar secciones o filas de contenido de forma pulida.",
    modifiers: ["inset=true|false", "vertical=true|false"],
    contextRules: { containerOnly: true },
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/95 rounded-2xl border border-neutral-800 space-y-2">
        <div className="text-[9px] text-neutral-400">Sección Superior</div>
        <div className="h-px bg-neutral-700 w-full" />
        <div className="text-[9px] text-neutral-400">Sección Inferior</div>
      </div>
    ),
  },
  {
    id: "split",
    name: "split",
    label: "Panel Dividido (Split)",
    category: "Layout & Superficie",
    icon: Split,
    color: "from-emerald-500 to-teal-500",
    snippet: `split\n  left\n    text "Navegación" title\n    listitem "Dashboard" icon=layout\n    listitem "Ajustes" icon=settings\n  right\n    card\n      text "Área Principal" title`,
    description: "Diseño dividido responsivo: barra lateral izquierda y área de trabajo principal a la derecha.",
    modifiers: ["left", "right", "gap=16"],
    contextRules: { containerOnly: true },
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/95 rounded-2xl border border-neutral-800">
        <div className="flex h-14 rounded-xl border border-neutral-700 overflow-hidden text-[9px]">
          <div className="w-1/3 bg-neutral-800 p-1.5 border-r border-neutral-700 text-purple-300 font-semibold">Sidebar</div>
          <div className="flex-1 bg-neutral-950 p-1.5 text-neutral-400 flex items-center justify-center">Principal</div>
        </div>
      </div>
    ),
  },
  {
    id: "tabs",
    name: "tabs",
    label: "Pestañas (Tabs)",
    category: "Layout & Superficie",
    icon: FolderKanban,
    color: "from-indigo-500 to-purple-600",
    snippet: `tabs items=["General", "Seguridad", "Facturación"]\n  tab "General"\n    card\n      text "Configuración General" title\n  tab "Seguridad"\n    card\n      text "Ajustes de Seguridad" title`,
    description: "Pestañas interactivas para alternar entre diferentes paneles de contenido.",
    modifiers: ["items=[\"...\", \"...\"]", "tab \"...\"", "active=0"],
    contextRules: { containerOnly: true },
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/95 rounded-2xl border border-neutral-800 space-y-1.5">
        <div className="flex border-b border-neutral-700 text-[10px] gap-2 pb-1">
          <span className="text-purple-400 font-bold border-b border-purple-400 pb-0.5">General</span>
          <span className="text-neutral-500">Seguridad</span>
        </div>
        <div className="text-[9px] text-neutral-400">Contenido pestaña...</div>
      </div>
    ),
  },
  {
    id: "accordion",
    name: "accordion",
    label: "Acordeón Plegable",
    category: "Layout & Superficie",
    icon: ChevronDown,
    color: "from-amber-500 to-yellow-500",
    snippet: `accordion "Datos Fiscales (Opcional)" expanded=false icon=file-text\n  textfield rfc label="RFC / Tax ID"\n  textfield razon label="Razón Social"`,
    description: "Contenedor colapsable con chevron animado para FAQs o secciones opcionales de formularios.",
    modifiers: ["expanded=false|true", "icon=file-text", "variant=outlined|elevated"],
    contextRules: { containerOnly: true },
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/95 rounded-2xl border border-neutral-800">
        <div className="rounded-xl border border-neutral-700 bg-neutral-800 p-2 flex items-center justify-between text-xs text-neutral-200">
          <span className="font-semibold text-[11px]">Datos Fiscales</span>
          <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
        </div>
      </div>
    ),
  },
  {
    id: "breadcrumbs",
    name: "breadcrumbs",
    label: "Migas de Pan",
    category: "Layout & Superficie",
    icon: Navigation,
    color: "from-blue-500 to-indigo-500",
    snippet: `breadcrumbs items=["Clientes", "Acme Corporation", "Facturas"] separator=chevron`,
    description: "Línea de navegación jerárquica con separadores para SaaS y tableros.",
    modifiers: ["items=[\"...\", \"...\"]", "separator=chevron|slash"],
    contextRules: { containerOnly: true },
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/95 rounded-2xl border border-neutral-800">
        <div className="flex items-center gap-1 text-[10px] text-neutral-400">
          <span>Clientes</span>
          <span className="text-neutral-600">&gt;</span>
          <span className="font-bold text-purple-300">Facturas</span>
        </div>
      </div>
    ),
  },
  {
    id: "appbar",
    name: "appbar",
    label: "Barra Superior (App Bar)",
    category: "Layout & Superficie",
    icon: LayoutGrid,
    color: "from-purple-600 to-indigo-600",
    snippet: `appbar "Panel de Control" icon=menu\n  button icon=search text\n  button icon=bell text`,
    description: "Barra superior de aplicación con título, navegación y botones de acción rápidos.",
    modifiers: ["title=\"...\"", "icon=menu|arrow-left"],
    contextRules: { containerOnly: true },
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/95 rounded-2xl border border-neutral-800">
        <div className="flex items-center justify-between p-1.5 rounded-xl bg-neutral-800 border border-neutral-700 text-xs text-white">
          <span className="font-bold text-[10px]">Panel de Control</span>
          <div className="flex gap-1">
            <span className="w-3.5 h-3.5 rounded bg-neutral-700 flex items-center justify-center text-[8px]">🔍</span>
            <span className="w-3.5 h-3.5 rounded bg-neutral-700 flex items-center justify-center text-[8px]">🔔</span>
          </div>
        </div>
      </div>
    ),
  },

  // =========================================================
  // 3. ENTRADAS & FORMULARIOS
  // =========================================================
  {
    id: "textfield",
    name: "textfield",
    label: "Campo de Texto",
    category: "Entradas & Formularios",
    icon: FormInput,
    color: "from-blue-500 to-cyan-500",
    snippet: `textfield email label="Correo Electrónico" placeholder="usuario@correo.com" icon=mail`,
    description: "Campo de texto Material 3 con etiqueta flotante, ícono integrado y validación.",
    modifiers: ["label=\"...\"", "placeholder=\"...\"", "icon=mail", "type=password", "required=true"],
    contextRules: { containerOnly: true },
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/95 rounded-2xl border border-neutral-800">
        <div className="relative border-2 border-purple-500 rounded-xl px-3 py-1.5 bg-neutral-950/80">
          <span className="text-[9px] text-purple-400 font-semibold block">Correo Electrónico</span>
          <div className="flex items-center gap-1.5 text-xs text-neutral-200">
            <Mail className="w-3 h-3 text-neutral-400" />
            <span className="text-[10px] text-neutral-400">usuario@correo.com</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "textarea",
    name: "textarea",
    label: "Área de Texto",
    category: "Entradas & Formularios",
    icon: FileText,
    color: "from-cyan-500 to-blue-600",
    snippet: `textarea comentarios label="Observaciones o Notas" rows=3 placeholder="Escribe aquí tus comentarios..."`,
    description: "Campo multilínea para descripciones, notas o retroalimentación extensa.",
    modifiers: ["label=\"...\"", "rows=3|4|5", "placeholder=\"...\""],
    contextRules: { containerOnly: true },
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/95 rounded-2xl border border-neutral-800">
        <div className="border border-neutral-700 rounded-xl p-2 bg-neutral-950 space-y-1">
          <span className="text-[9px] text-purple-400 font-semibold block">Observaciones</span>
          <div className="text-[9px] text-neutral-500 h-6">Escribe aquí...</div>
        </div>
      </div>
    ),
  },
  {
    id: "searchbar",
    name: "searchbar",
    label: "Barra de Búsqueda",
    category: "Entradas & Formularios",
    icon: Search,
    color: "from-sky-500 to-blue-600",
    snippet: `searchbar query placeholder="Buscar registros, facturas o tareas..."`,
    description: "Barra de búsqueda Material 3 interactiva con ícono integrado.",
    modifiers: ["placeholder=\"...\"", "value=\"...\""],
    contextRules: { containerOnly: true },
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/95 rounded-2xl border border-neutral-800">
        <div className="border border-neutral-700 rounded-xl px-2.5 py-1.5 bg-neutral-950 flex items-center gap-1.5 text-xs text-neutral-400">
          <Search className="w-3 h-3 text-purple-400" />
          <span className="text-[10px]">Buscar registros...</span>
        </div>
      </div>
    ),
  },
  {
    id: "select",
    name: "select",
    label: "Menú Desplegable",
    category: "Entradas & Formularios",
    icon: ListFilter,
    color: "from-sky-500 to-blue-500",
    snippet: `select categoria label="Categoría de Proyecto" value="Diseño UI"\n  option "Diseño UI"\n  option "Desarrollo Frontend"\n  option "Backend & Cloud"`,
    description: "Menú desplegable de selección única con lista de opciones anidadas.",
    modifiers: ["label=\"...\"", "value=\"...\"", "option \"...\""],
    contextRules: { containerOnly: true },
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/95 rounded-2xl border border-neutral-800">
        <div className="border border-neutral-700 rounded-xl px-2.5 py-1.5 bg-neutral-800 flex items-center justify-between text-xs text-neutral-200">
          <div>
            <div className="text-[8px] text-purple-400">Categoría</div>
            <div className="font-semibold text-[10px]">Diseño UI</div>
          </div>
          <ListFilter className="w-3.5 h-3.5 text-neutral-400" />
        </div>
      </div>
    ),
  },
  {
    id: "autocomplete",
    name: "autocomplete",
    label: "Buscador Predictivo",
    category: "Entradas & Formularios",
    icon: Search,
    color: "from-purple-500 to-pink-500",
    snippet: `autocomplete pais label="País de Residencia" placeholder="Escribe para filtrar..."\n  option "Argentina"\n  option "Chile"\n  option "Colombia"\n  option "España"\n  option "México"\n  option "Perú"`,
    description: "Menú desplegable con filtro en vivo y sugerencias dinámicas al teclear.",
    modifiers: ["label=\"...\"", "placeholder=\"...\"", "option \"...\""],
    contextRules: { containerOnly: true },
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/95 rounded-2xl border border-neutral-800 space-y-1.5">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-neutral-950 border border-purple-500/60 text-xs">
          <Search className="w-3 h-3 text-purple-400" />
          <span className="text-neutral-200 text-[10px]">Méx</span>
        </div>
        <div className="px-2 py-0.5 rounded bg-purple-900/50 text-purple-200 text-[9px] font-semibold flex justify-between">
          <span>México</span>
          <Check className="w-2.5 h-2.5 text-purple-400" />
        </div>
      </div>
    ),
  },
  {
    id: "option",
    name: "option",
    label: "Opción de Lista",
    category: "Entradas & Formularios",
    icon: CheckSquare,
    color: "from-indigo-400 to-purple-400",
    snippet: `option "Nuevo Valor"`,
    description: "Opción de selección para insertar dentro de un bloque `select` o `autocomplete`.",
    modifiers: ["option \"...\""],
    contextRules: { selectOnly: true },
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/95 rounded-2xl border border-neutral-800">
        <div className="px-2 py-1 rounded bg-purple-950 text-purple-200 text-xs font-mono">
          option "Nuevo Valor"
        </div>
      </div>
    ),
  },
  {
    id: "switch",
    name: "switch",
    label: "Interruptor Switch",
    category: "Entradas & Formularios",
    icon: ToggleRight,
    color: "from-emerald-400 to-teal-500",
    snippet: `switch notificaciones label="Habilitar alertas por correo" checked=true`,
    description: "Control interruptor on/off Material 3 con animación y etiqueta.",
    modifiers: ["label=\"...\"", "checked=true|false"],
    contextRules: { containerOnly: true },
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/95 rounded-2xl border border-neutral-800 flex items-center justify-between">
        <span className="text-[10px] text-neutral-300">Activar alertas</span>
        <div className="w-7 h-3.5 bg-purple-600 rounded-full p-0.5 flex justify-end">
          <div className="w-2.5 h-2.5 bg-white rounded-full" />
        </div>
      </div>
    ),
  },
  {
    id: "checkbox",
    name: "checkbox",
    label: "Casilla Checkbox",
    category: "Entradas & Formularios",
    icon: CheckSquare,
    color: "from-purple-400 to-indigo-500",
    snippet: `checkbox terminos label="Acepto los términos y condiciones de uso" checked=true`,
    description: "Casilla de verificación interactiva para términos y selecciones booleanas.",
    modifiers: ["label=\"...\"", "checked=true|false"],
    contextRules: { containerOnly: true },
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/95 rounded-2xl border border-neutral-800 flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-purple-600 text-white flex items-center justify-center">
          <Check className="w-3 h-3" />
        </div>
        <span className="text-[10px] text-neutral-200">Acepto términos</span>
      </div>
    ),
  },
  {
    id: "radio",
    name: "radio",
    label: "Botón de Radio",
    category: "Entradas & Formularios",
    icon: Radio,
    color: "from-indigo-400 to-purple-500",
    snippet: `radio plan label="Plan Empresarial" value="enterprise" checked=true`,
    description: "Opción de selección única circular dentro de un grupo.",
    modifiers: ["label=\"...\"", "value=\"...\"", "checked=true|false"],
    contextRules: { containerOnly: true },
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/95 rounded-2xl border border-neutral-800 flex items-center gap-2">
        <div className="w-4 h-4 rounded-full border-2 border-purple-500 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-purple-500" />
        </div>
        <span className="text-[10px] text-neutral-200">Plan Empresarial</span>
      </div>
    ),
  },
  {
    id: "slider",
    name: "slider",
    label: "Deslizador Slider",
    category: "Entradas & Formularios",
    icon: Sliders,
    color: "from-rose-500 to-pink-500",
    snippet: `slider volumen label="Nivel de Volumen" min=0 max=100 value=75`,
    description: "Control deslizante para rangos numéricos con etiqueta de valor.",
    modifiers: ["min=0", "max=100", "value=50", "step=5"],
    contextRules: { containerOnly: true },
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/95 rounded-2xl border border-neutral-800 space-y-1">
        <div className="flex justify-between text-[9px] text-neutral-400">
          <span>Volumen</span>
          <span className="text-purple-400 font-bold">75%</span>
        </div>
        <div className="h-1.5 bg-neutral-700 rounded-full overflow-hidden">
          <div className="h-full w-3/4 bg-purple-500" />
        </div>
      </div>
    ),
  },
  {
    id: "datepicker",
    name: "datepicker",
    label: "Selector de Fecha",
    category: "Entradas & Formularios",
    icon: Calendar,
    color: "from-amber-400 to-orange-500",
    snippet: `datepicker fecha_inicio label="Fecha de Inicio" value="2026-08-20"`,
    description: "Selector de fechas interactivo con calendario popup y formato estándar.",
    modifiers: ["label=\"...\"", "value=\"YYYY-MM-DD\""],
    contextRules: { containerOnly: true },
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/95 rounded-2xl border border-neutral-800">
        <div className="border border-neutral-700 rounded-xl px-2.5 py-1.5 bg-neutral-800 flex items-center justify-between text-[10px] text-neutral-200">
          <span>20 Ago 2026</span>
          <Calendar className="w-3.5 h-3.5 text-purple-400" />
        </div>
      </div>
    ),
  },
  {
    id: "rating",
    name: "rating",
    label: "Calificación Estrellas",
    category: "Entradas & Formularios",
    icon: Star,
    color: "from-amber-400 to-yellow-500",
    snippet: `rating satisfaccion label="Califica tu experiencia" value=4 max=5 readonly=false`,
    description: "Selector de 1 a 5 estrellas interactivo para evaluaciones de satisfacción CSAT.",
    modifiers: ["label=\"...\"", "value=4", "max=5", "readonly=false|true"],
    contextRules: { containerOnly: true },
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/95 rounded-2xl border border-neutral-800 flex items-center gap-1 text-amber-400">
        <Star className="w-3 h-3 fill-amber-400" />
        <Star className="w-3 h-3 fill-amber-400" />
        <Star className="w-3 h-3 fill-amber-400" />
        <Star className="w-3 h-3 fill-amber-400" />
        <Star className="w-3 h-3 text-neutral-600" />
        <span className="text-[10px] font-bold text-neutral-300 ml-1">4/5</span>
      </div>
    ),
  },

  // =========================================================
  // 4. ACCIONES & CONTROLES
  // =========================================================
  {
    id: "button",
    name: "button",
    label: "Botón Material 3",
    category: "Acciones & Controles",
    icon: MousePointerClick,
    color: "from-purple-500 to-indigo-500",
    snippet: `button "Guardar Cambios" filled icon=save goto=@Home`,
    description: "Botón Material 3 interactivo con variantes (filled, outlined, tonal, elevated, text), íconos y navegación.",
    modifiers: ["filled", "outlined", "tonal", "elevated", "text", "icon=save", "goto=@Screen"],
    contextRules: { containerOnly: true },
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/95 rounded-2xl border border-neutral-800 flex items-center gap-2">
        <span className="px-3 py-1 rounded-full bg-purple-600 text-white text-[10px] font-semibold flex items-center gap-1 shadow-md">
          <Save className="w-3 h-3" /> Guardar
        </span>
        <span className="px-2.5 py-1 rounded-full border border-purple-400/50 text-purple-300 text-[10px]">
          Cancelar
        </span>
      </div>
    ),
  },
  {
    id: "button-snackbar-goto",
    name: "button (snackbar + goto)",
    label: "Botón con Toast y Navegación",
    category: "Acciones & Controles",
    icon: Sparkles,
    color: "from-emerald-500 to-teal-500",
    snippet: `button "Facturar" filled icon=send snackbar="Factura #1024 enviada con éxito" snackbar-action="Deshacer" goto=@Home`,
    description: "Dispara una notificación emergente (Toast) y navega a otra pantalla simultáneamente.",
    modifiers: ["snackbar=\"...\"", "snackbar-action=\"...\"", "goto=@Screen"],
    contextRules: { containerOnly: true },
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/95 rounded-2xl border border-neutral-800">
        <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-semibold flex items-center gap-1 shadow-md w-fit">
          <Check className="w-3 h-3" /> Facturar &amp; Notificar
        </span>
      </div>
    ),
  },
  {
    id: "segmentedbutton",
    name: "segmentedbutton",
    label: "Botón Segmentado",
    category: "Acciones & Controles",
    icon: ToggleRight,
    color: "from-violet-500 to-purple-600",
    snippet: `segmentedbutton periodo options=["Día", "Semana", "Mes", "Año"] selected="Mes"`,
    description: "Grupo de botones segmentados para alternar vistas o filtros exclusivos.",
    modifiers: ["options=[\"...\", \"...\"]", "selected=\"...\""],
    contextRules: { containerOnly: true },
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/95 rounded-2xl border border-neutral-800">
        <div className="flex border border-neutral-700 rounded-xl overflow-hidden text-[9px]">
          <span className="px-2 py-0.5 bg-neutral-800 text-neutral-400">Día</span>
          <span className="px-2 py-0.5 bg-purple-600 text-white font-bold">Mes</span>
          <span className="px-2 py-0.5 bg-neutral-800 text-neutral-400">Año</span>
        </div>
      </div>
    ),
  },
  {
    id: "fab",
    name: "fab",
    label: "Botón Flotante (FAB)",
    category: "Acciones & Controles",
    icon: Plus,
    color: "from-purple-600 to-pink-600",
    snippet: `fab "Nuevo Elemento" icon=plus extended=true goto=@CrearModal`,
    description: "Botón de acción flotante (Floating Action Button) Material 3 para la acción primaria.",
    modifiers: ["extended=true|false", "icon=plus", "goto=@Screen", "variant=primary|surface"],
    contextRules: { containerOnly: true },
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/95 rounded-2xl border border-neutral-800 flex justify-end">
        <div className="px-3 py-1.5 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-lg">
          <Plus className="w-3 h-3" />
          <span>Nuevo</span>
        </div>
      </div>
    ),
  },
  {
    id: "chip",
    name: "chip",
    label: "Píldora / Chip",
    category: "Acciones & Controles",
    icon: Tag,
    color: "from-rose-500 to-amber-500",
    snippet: `chip "Filtro Activo" selected=true icon=check`,
    description: "Píldoras interactivas para filtros, sugerencias y selecciones rápidas.",
    modifiers: ["selected=true|false", "variant=assist|filter|input|suggestion", "icon=check"],
    contextRules: { containerOnly: true },
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/95 rounded-2xl border border-neutral-800 flex gap-1.5">
        <span className="px-2 py-0.5 rounded-lg bg-purple-600 text-white text-[9px] font-semibold flex items-center gap-1">
          <Check className="w-2.5 h-2.5" /> Activo
        </span>
        <span className="px-2 py-0.5 rounded-lg bg-neutral-800 text-neutral-300 text-[9px] border border-neutral-700">
          Pendiente
        </span>
      </div>
    ),
  },

  // =========================================================
  // 5. DATOS & TABLAS
  // =========================================================
  {
    id: "table",
    name: "table",
    label: "Tabla Interactiva M3",
    category: "Datos & Tablas",
    icon: TableIcon,
    color: "from-teal-500 to-emerald-600",
    snippet: `table title="Servicios y Responsables" columns=["ID:code", "Responsable:avatar", "Progreso:progress", "Estado:status", "Acciones:action", "Opciones:dropdown"] striped=true searchable=true\n  row ["#101", "Javier Diaz", "92%", "Activo", "Configurar", ""]\n  row ["#102", "Elena Gomez", "45%", "Pendiente", "Configurar", ""]\n  row ["#103", "Carlos Vera", "100%", "Activo", "Configurar", ""]`,
    description: "Tabla interactiva de datos con tipos de columnas enriquecidas (code, avatar, progress, status, action, dropdown, currency, date) con buscador y paginación.",
    modifiers: [
      "columns=[\"ID:code\", \"Usuario:avatar\", \"Progreso:progress\", \"Estado:status\", \"Acción:action\", \"Opciones:dropdown\"]",
      "striped=true",
      "searchable=true",
      "pageSize=5",
    ],
    contextRules: { containerOnly: true },
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/95 rounded-2xl border border-neutral-800 space-y-1">
        <div className="text-[10px] font-bold text-neutral-200">Servicios y Miembros</div>
        <div className="rounded-lg border border-neutral-700/60 overflow-hidden text-[8px]">
          <div className="bg-neutral-800 px-2 py-0.5 flex justify-between font-semibold text-neutral-300">
            <span>ID:code</span>
            <span>Usuario</span>
            <span>Estado</span>
          </div>
          <div className="px-2 py-0.5 flex justify-between text-neutral-400 bg-neutral-950/50">
            <span className="text-purple-400 font-mono">#101</span>
            <span className="text-white">Javier D.</span>
            <span className="text-emerald-400">Activo</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "table-row",
    name: "row (tabla)",
    label: "Fila de Datos (Row)",
    category: "Datos & Tablas",
    icon: Rows,
    color: "from-teal-400 to-cyan-500",
    snippet: `row ["#104", "Nueva Tarea", "10%", "Pendiente", "Configurar", ""]`,
    description: "Inserta una fila de datos estructurados dentro de una tabla activa.",
    modifiers: ["row [\"col1\", \"col2\", \"col3\"]"],
    contextRules: { tableOnly: true },
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/95 rounded-2xl border border-neutral-800">
        <div className="px-2 py-1 rounded bg-neutral-950 font-mono text-[9px] text-purple-300">
          row ["#104", "Servicio", "80%", "Activo"]
        </div>
      </div>
    ),
  },
  {
    id: "metric",
    name: "metric",
    label: "Tarjeta KPI (Metric)",
    category: "Datos & Tablas",
    icon: TrendingUp,
    color: "from-green-500 to-emerald-500",
    snippet: `metric label="Ingresos Mensuales" value="$48,250" delta="+24.5%" icon=dollar-sign`,
    description: "Tarjeta de analíticas e indicador clave KPI con número destacado, etiqueta y tasa porcentual.",
    modifiers: ["label=\"...\"", "value=\"...\"", "delta=\"+X%\"", "icon=dollar-sign"],
    contextRules: { containerOnly: true },
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/95 rounded-2xl border border-neutral-800">
        <div className="p-2 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-between">
          <div>
            <div className="text-[9px] text-neutral-400">Ingresos</div>
            <div className="text-xs font-bold text-white mt-0.5">$48,250</div>
          </div>
          <span className="px-1 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[9px] font-bold">
            +24.5%
          </span>
        </div>
      </div>
    ),
  },
  {
    id: "progress",
    name: "progress",
    label: "Barra de Progreso",
    category: "Datos & Tablas",
    icon: Activity,
    color: "from-teal-500 to-emerald-500",
    snippet: `progress valor=65 label="65% Completado"`,
    description: "Barra de progreso lineal para estados de avance y finalización.",
    modifiers: ["valor=0-100", "label=\"...\""],
    contextRules: { containerOnly: true },
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/95 rounded-2xl border border-neutral-800 space-y-1">
        <div className="flex justify-between text-[9px] text-neutral-300">
          <span>Progreso</span>
          <span className="text-emerald-400 font-bold">65%</span>
        </div>
        <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
          <div className="h-full w-[65%] bg-emerald-500 rounded-full" />
        </div>
      </div>
    ),
  },
  {
    id: "avatar",
    name: "avatar",
    label: "Avatar de Usuario",
    category: "Datos & Tablas",
    icon: Users,
    color: "from-fuchsia-500 to-pink-500",
    snippet: `avatar "Javier Díaz" initials="JD" status=online`,
    description: "Avatar circular con iniciales o foto e indicador de presencia online/offline.",
    modifiers: ["initials=\"...\"", "status=online|offline|busy", "size=sm|md|lg"],
    contextRules: { containerOnly: true },
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/95 rounded-2xl border border-neutral-800 flex items-center gap-2">
        <div className="relative">
          <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold">
            JD
          </div>
          <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-neutral-900" />
        </div>
        <span className="text-[10px] text-neutral-200">Javier Díaz</span>
      </div>
    ),
  },
  {
    id: "badge",
    name: "badge",
    label: "Insignia (Badge)",
    category: "Datos & Tablas",
    icon: Tag,
    color: "from-pink-500 to-rose-500",
    snippet: `badge "En Proceso" color=tertiary`,
    description: "Insignia o etiqueta de estado de tamaño compacto.",
    modifiers: ["color=primary|secondary|tertiary|error"],
    contextRules: { containerOnly: true },
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/95 rounded-2xl border border-neutral-800 flex gap-2">
        <span className="px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 text-[9px] font-semibold">
          Proceso
        </span>
        <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[9px] font-semibold">
          Completado
        </span>
      </div>
    ),
  },
  {
    id: "tag",
    name: "tag",
    label: "Etiqueta Tag",
    category: "Datos & Tablas",
    icon: Tag,
    color: "from-cyan-500 to-blue-500",
    snippet: `tag "Producción" color=success`,
    description: "Etiqueta compacta con color semántico para clasificaciones.",
    modifiers: ["color=primary|secondary|success|warning|error"],
    contextRules: { containerOnly: true },
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/95 rounded-2xl border border-neutral-800 flex gap-1.5">
        <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/80 text-[8px] font-mono font-bold">
          PROD
        </span>
        <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/80 text-[8px] font-mono font-bold">
          QAS
        </span>
      </div>
    ),
  },
  {
    id: "listitem",
    name: "listitem",
    label: "Elemento de Lista",
    category: "Datos & Tablas",
    icon: ListFilter,
    color: "from-indigo-500 to-blue-500",
    snippet: `listitem "Notificaciones Push" subtitle="Alertas en tiempo real" icon=bell goto=@Ajustes`,
    description: "Fila interactiva de lista con ícono, subtítulo, flecha de navegación o interruptor.",
    modifiers: ["subtitle=\"...\"", "icon=bell", "goto=@Screen"],
    contextRules: { containerOnly: true },
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/95 rounded-2xl border border-neutral-800">
        <div className="flex items-center justify-between p-1.5 bg-neutral-800 rounded-xl">
          <div className="flex items-center gap-1.5">
            <BellRing className="w-3 h-3 text-purple-400" />
            <div>
              <div className="text-[10px] text-white font-medium">Alertas</div>
              <div className="text-[8px] text-neutral-400">En tiempo real</div>
            </div>
          </div>
          <ArrowRight className="w-3 h-3 text-neutral-500" />
        </div>
      </div>
    ),
  },

  // =========================================================
  // 6. FEEDBACK & ALERTAS
  // =========================================================
  {
    id: "snackbar",
    name: "snackbar",
    label: "Mensaje Snackbar",
    category: "Feedback & Alertas",
    icon: BellRing,
    color: "from-emerald-500 to-teal-500",
    snippet: `snackbar "Factura #1024 enviada por correo" action="Deshacer" icon=check-circle-2 type=success`,
    description: "Mensaje flotante temporal de retroalimentación con botón de acción opcional.",
    modifiers: ["action=\"...\"", "type=success|info|warning|error", "icon=check-circle-2"],
    contextRules: { containerOnly: true },
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/95 rounded-2xl border border-neutral-800">
        <div className="p-2 rounded-xl bg-neutral-950 border border-neutral-700 flex items-center justify-between text-xs text-white">
          <span className="text-[9px] text-neutral-300">Mensaje enviado</span>
          <span className="text-[9px] font-bold text-purple-400 uppercase">Deshacer</span>
        </div>
      </div>
    ),
  },
  {
    id: "alert",
    name: "alert",
    label: "Banner de Alerta",
    category: "Feedback & Alertas",
    icon: AlertCircle,
    color: "from-amber-500 to-rose-500",
    snippet: `alert "Tu suscripción vence en 3 días. Renueva para mantener el acceso." type=warning icon=alert-triangle`,
    description: "Banner destacado de notificación o advertencia con ícono temático.",
    modifiers: ["type=info|warning|error|success", "icon=alert-triangle"],
    contextRules: { containerOnly: true },
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/95 rounded-2xl border border-neutral-800">
        <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-800/80 text-amber-200 text-[9px] flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Renovación de suscripción pendiente</span>
        </div>
      </div>
    ),
  },

  // =========================================================
  // 7. LÓGICA & FLUJO
  // =========================================================
  {
    id: "step",
    name: "step",
    label: "Paso de Wizard",
    category: "Lógica & Flujo",
    icon: Milestone,
    color: "from-pink-500 to-rose-500",
    snippet: `step "Paso 2: Confirmación de Datos"\n  text "Revisa la información antes de continuar" title\n  button "Finalizar" filled goto=@Home`,
    description: "Declara un paso específico dentro de un bloque `@Wizard:wizard`.",
    modifiers: ["step \"...\""],
    contextRules: { wizardOnly: true },
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/95 rounded-2xl border border-neutral-800 font-mono text-[9px] text-purple-300">
        step "Paso 2: Datos"
      </div>
    ),
  },
  {
    id: "tab",
    name: "tab",
    label: "Panel de Tab",
    category: "Lógica & Flujo",
    icon: FolderKanban,
    color: "from-indigo-500 to-purple-600",
    snippet: `tab "Nueva Pestaña"\n  card elevated\n    text "Contenido de pestaña" title`,
    description: "Declara el contenido de un panel dentro de un contenedor `tabs`.",
    modifiers: ["tab \"...\""],
    contextRules: { tabsOnly: true },
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/95 rounded-2xl border border-neutral-800 font-mono text-[9px] text-purple-300">
        tab "Seguridad"
      </div>
    ),
  },
  {
    id: "left-slot",
    name: "left",
    label: "Ranura Izquierda (Split)",
    category: "Lógica & Flujo",
    icon: Split,
    color: "from-emerald-400 to-teal-500",
    snippet: `left\n  text "Barra Lateral" title\n  listitem "Inicio" icon=home`,
    description: "Ranura izquierda de contenido para el contenedor `split`.",
    modifiers: ["left"],
    contextRules: { splitOnly: true },
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/95 rounded-2xl border border-neutral-800 font-mono text-[9px] text-emerald-300">
        left
      </div>
    ),
  },
  {
    id: "right-slot",
    name: "right",
    label: "Ranura Derecha (Split)",
    category: "Lógica & Flujo",
    icon: Split,
    color: "from-teal-400 to-cyan-500",
    snippet: `right\n  card elevated\n    text "Panel Principal" title`,
    description: "Ranura derecha de contenido para el contenedor `split`.",
    modifiers: ["right"],
    contextRules: { splitOnly: true },
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/95 rounded-2xl border border-neutral-800 font-mono text-[9px] text-cyan-300">
        right
      </div>
    ),
  },
];
