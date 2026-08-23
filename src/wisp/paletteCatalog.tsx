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
  PanelLeft,
  PanelRight,
  Loader2,
  Menu as MenuIcon,
  MoreHorizontal,
  HelpCircle,
  Compass,
} from "lucide-react";

export type PaletteCategory =
  | "Views & Root"
  | "Layout & Surfaces"
  | "Inputs & Forms"
  | "Actions & Controls"
  | "Data & Tables"
  | "Feedback & Alerts"
  | "Logic & Flow"
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
  renderPreview: (isLight?: boolean) => React.ReactNode;
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
  "component",
  "form",
  "dialog",
  "wizard",
  "sheet",
  "drawer",
  "navigationdrawer",
  "appdrawer",
  "navdrawer",
  "sidesheet",
  "side-sheet",
  "bottomsheet",
  "navigationrail",
  "apprail",
  "navrail",
  "rail",
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
  "carousel",
  "menu",
  "dropdown",
  "dropdownmenu",
  "list",
  "fabmenu",
  "fab-menu",
  "speeddial",
  "splitbutton",
  "split-button",
  "buttongroup",
  "button-group",
  "connectedbuttons",
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
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border space-y-2 transition-colors ${
          isLight ? "bg-neutral-100/90 border-neutral-200" : "bg-neutral-900/95 border-neutral-800"
        }`}
      >
        <div
          className={`flex items-center justify-between text-[11px] font-bold ${
            isLight ? "text-purple-700" : "text-purple-300"
          }`}
        >
          <span>@Dashboard:screen</span>
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded border ${
              isLight
                ? "bg-purple-100 text-purple-700 border-purple-200"
                : "bg-purple-950 text-purple-400 border-purple-800"
            }`}
          >
            Vista M3
          </span>
        </div>
        <div
          className={`p-2.5 rounded-xl border text-[10px] ${
            isLight
              ? "bg-white border-neutral-200 text-neutral-700 shadow-xs"
              : "bg-neutral-800/80 border-neutral-700/60 text-neutral-300"
          }`}
        >
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
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border transition-colors ${
          isLight ? "bg-neutral-100/90 border-neutral-200" : "bg-neutral-900/95 border-neutral-800"
        }`}
      >
        <div
          className={`p-3 rounded-2xl border shadow-xl space-y-2 ${
            isLight ? "bg-white border-neutral-200" : "bg-neutral-800 border-neutral-700"
          }`}
        >
          <div className={`font-bold text-xs ${isLight ? "text-neutral-900" : "text-white"}`}>
            ¿Confirmar Acción?
          </div>
          <div className={`text-[10px] ${isLight ? "text-neutral-500" : "text-neutral-400"}`}>
            Esta acción no se puede deshacer.
          </div>
          <div className="flex justify-end gap-1.5 pt-1">
            <span
              className={`px-2 py-0.5 rounded text-[9px] ${
                isLight ? "text-neutral-600" : "text-neutral-400"
              }`}
            >
              Cancelar
            </span>
            <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-[9px] font-semibold">
              Aceptar
            </span>
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
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border transition-colors ${
          isLight ? "bg-neutral-100/90 border-neutral-200" : "bg-neutral-900/95 border-neutral-800"
        }`}
      >
        <div className="flex items-center justify-between px-1 py-1 text-[10px]">
          <div
            className={`flex items-center gap-1 font-bold ${
              isLight ? "text-purple-700" : "text-purple-400"
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[9px]">
              1
            </span>
            <span>Datos</span>
          </div>
          <div
            className={`flex-1 h-0.5 mx-2 ${
              isLight ? "bg-neutral-300" : "bg-neutral-700"
            }`}
          />
          <div className="flex items-center gap-1 text-neutral-500">
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                isLight
                  ? "bg-neutral-200 text-neutral-600"
                  : "bg-neutral-800 text-neutral-400"
              }`}
            >
              2
            </span>
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
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border transition-colors ${
          isLight ? "bg-neutral-100/90 border-neutral-200" : "bg-neutral-900/95 border-neutral-800"
        }`}
      >
        <div
          className={`p-2 rounded-xl border flex items-center justify-between text-xs ${
            isLight
              ? "bg-white border-neutral-200 text-neutral-800 shadow-sm"
              : "bg-neutral-950 border-neutral-700 text-white"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <CheckCircle2
              className={`w-3.5 h-3.5 shrink-0 ${
                isLight ? "text-emerald-600" : "text-emerald-400"
              }`}
            />
            <span
              className={`text-[10px] ${
                isLight ? "text-neutral-700" : "text-neutral-300"
              }`}
            >
              Guardado correctamente
            </span>
          </div>
          <span
            className={`text-[10px] font-bold uppercase ${
              isLight ? "text-purple-700" : "text-purple-400"
            }`}
          >
            Ver
          </span>
        </div>
      </div>
    ),
  },
  {
    id: "component-def",
    name: "@Componente:component",
    label: "Componente Modular",
    category: "Vistas & Raíz",
    icon: Sparkles,
    color: "from-cyan-500 to-blue-600",
    snippet: `@DireccionFiscal:component\n  grid cols=2 gap=12\n    textfield calle label="Calle y Número" placeholder="Av. Insurgentes 100"\n    textfield cp label="Código Postal" placeholder="03940"\n    autocomplete pais label="País"\n      option "México"\n      option "España"`,
    description: "Declara un bloque reutilizable modular en el nivel raíz que puede ser incrustado en múltiples pantallas.",
    modifiers: ["@Nombre:component"],
    contextRules: { rootOnly: true },
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border space-y-2 transition-colors ${
          isLight ? "bg-neutral-100/90 border-neutral-200" : "bg-neutral-900/95 border-neutral-800"
        }`}
      >
        <div
          className={`flex items-center justify-between text-[11px] font-bold ${
            isLight ? "text-blue-700" : "text-cyan-300"
          }`}
        >
          <span>@MiBloque:component</span>
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded border ${
              isLight
                ? "bg-blue-100 text-blue-700 border-blue-200"
                : "bg-cyan-950 text-cyan-400 border-cyan-800"
            }`}
          >
            Reutilizable
          </span>
        </div>
        <div
          className={`p-2 rounded-xl border border-dashed text-[10px] ${
            isLight
              ? "bg-white/80 border-blue-300 text-neutral-700"
              : "bg-neutral-800/80 border-cyan-700/60 text-neutral-300"
          }`}
        >
          Campos o elementos compartidos...
        </div>
      </div>
    ),
  },

  // =========================================================
  // 2. LAYOUT & SUPERFICIE
  // =========================================================
  {
    id: "component-use",
    name: "component @Nombre",
    label: "Incrustar Componente",
    category: "Layout & Superficie",
    icon: Sparkles,
    color: "from-cyan-500 to-blue-500",
    snippet: `component @DireccionFiscal`,
    description: "Incrusta e inserta un componente reutilizable (@Nombre:component) dentro de la vista actual.",
    modifiers: ["component @Nombre", "include @Nombre", "@Nombre"],
    contextRules: { containerOnly: true },
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border transition-colors ${
          isLight ? "bg-neutral-100/90 border-neutral-200" : "bg-neutral-900/95 border-neutral-800"
        }`}
      >
        <div
          className={`p-2.5 rounded-xl border border-dashed flex items-center justify-between text-[11px] font-semibold ${
            isLight ? "bg-cyan-50 border-cyan-300 text-cyan-800" : "bg-cyan-950/40 border-cyan-700 text-cyan-300"
          }`}
        >
          <span>component @DireccionFiscal</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-600 text-white font-mono">Incrustar</span>
        </div>
      </div>
    ),
  },
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
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border transition-colors ${
          isLight ? "bg-neutral-100/90 border-neutral-200" : "bg-neutral-900/95 border-neutral-800"
        }`}
      >
        <div
          className={`p-3 rounded-2xl border shadow-md space-y-1 ${
            isLight ? "bg-white border-neutral-200" : "bg-neutral-800 border-neutral-700/80"
          }`}
        >
          <div className={`font-bold text-xs ${isLight ? "text-neutral-900" : "text-white"}`}>
            Tarjeta de Superficie
          </div>
          <div className={`text-[10px] ${isLight ? "text-neutral-600" : "text-neutral-400"}`}>
            Contenido estructurado M3...
          </div>
          <div className="pt-1 flex justify-end">
            <span
              className={`text-[10px] font-semibold flex items-center gap-1 ${
                isLight ? "text-purple-600" : "text-purple-400"
              }`}
            >
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
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border space-y-1 transition-colors ${
          isLight ? "bg-neutral-100/90 border-neutral-200" : "bg-neutral-900/95 border-neutral-800"
        }`}
      >
        <div className={`text-xs font-bold ${isLight ? "text-neutral-900" : "text-white"}`}>
          Título de Sección
        </div>
        <div className={`text-[10px] ${isLight ? "text-neutral-600" : "text-neutral-400"}`}>
          Texto descriptivo con cuerpo legible.
        </div>
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
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border transition-colors ${
          isLight ? "bg-neutral-100/90 border-neutral-200" : "bg-neutral-900/95 border-neutral-800"
        }`}
      >
        <div className="grid grid-cols-3 gap-1.5 text-center">
          <div
            className={`p-1 rounded-lg border shadow-2xs ${
              isLight ? "bg-white border-neutral-200" : "bg-neutral-800 border-neutral-700"
            }`}
          >
            <div className={`text-[9px] font-bold ${isLight ? "text-neutral-900" : "text-white"}`}>
              $12K
            </div>
          </div>
          <div
            className={`p-1 rounded-lg border shadow-2xs ${
              isLight ? "bg-white border-neutral-200" : "bg-neutral-800 border-neutral-700"
            }`}
          >
            <div className={`text-[9px] font-bold ${isLight ? "text-neutral-900" : "text-white"}`}>
              1.2K
            </div>
          </div>
          <div
            className={`p-1 rounded-lg border shadow-2xs ${
              isLight ? "bg-white border-neutral-200" : "bg-neutral-800 border-neutral-700"
            }`}
          >
            <div className={`text-[9px] font-bold ${isLight ? "text-neutral-900" : "text-white"}`}>
              99%
            </div>
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
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border transition-colors ${
          isLight ? "bg-neutral-100/90 border-neutral-200" : "bg-neutral-900/95 border-neutral-800"
        }`}
      >
        <div
          className={`flex items-center justify-between p-2 rounded-xl border ${
            isLight ? "bg-white border-neutral-200 shadow-2xs" : "bg-neutral-800 border-neutral-700"
          }`}
        >
          <span className={`text-xs font-medium ${isLight ? "text-neutral-900" : "text-white"}`}>
            Elemento Izq
          </span>
          <span className="px-2 py-0.5 bg-purple-600 text-white rounded-full text-[9px] font-semibold">
            Der
          </span>
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
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border space-y-1.5 transition-colors ${
          isLight ? "bg-neutral-100/90 border-neutral-200" : "bg-neutral-900/95 border-neutral-800"
        }`}
      >
        <div
          className={`p-1.5 rounded-lg border text-[10px] ${
            isLight
              ? "bg-white border-neutral-200 text-neutral-700"
              : "bg-neutral-800 border-neutral-700 text-neutral-300"
          }`}
        >
          Bloque 1
        </div>
        <div
          className={`p-1.5 rounded-lg border text-[10px] ${
            isLight
              ? "bg-white border-neutral-200 text-neutral-700"
              : "bg-neutral-800 border-neutral-700 text-neutral-300"
          }`}
        >
          Bloque 2
        </div>
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
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border space-y-1.5 transition-colors ${
          isLight ? "bg-neutral-100/90 border-neutral-200" : "bg-neutral-900/95 border-neutral-800"
        }`}
      >
        <div className={`h-2 rounded ${isLight ? "bg-neutral-200" : "bg-neutral-800"}`} />
        <div
          className={`h-4 border border-dashed rounded flex items-center justify-center text-[8px] font-mono ${
            isLight
              ? "border-purple-400 text-purple-700 bg-purple-50/50"
              : "border-purple-500/40 text-purple-400"
          }`}
        >
          spacer height=16
        </div>
        <div className={`h-2 rounded ${isLight ? "bg-neutral-200" : "bg-neutral-800"}`} />
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
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border space-y-2 transition-colors ${
          isLight ? "bg-neutral-100/90 border-neutral-200" : "bg-neutral-900/95 border-neutral-800"
        }`}
      >
        <div className={`text-[9px] ${isLight ? "text-neutral-600" : "text-neutral-400"}`}>
          Sección Superior
        </div>
        <div className={`h-px w-full ${isLight ? "bg-neutral-300" : "bg-neutral-700"}`} />
        <div className={`text-[9px] ${isLight ? "text-neutral-600" : "text-neutral-400"}`}>
          Sección Inferior
        </div>
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
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border transition-colors ${
          isLight ? "bg-neutral-100/90 border-neutral-200" : "bg-neutral-900/95 border-neutral-800"
        }`}
      >
        <div
          className={`flex h-14 rounded-xl border overflow-hidden text-[9px] ${
            isLight ? "border-neutral-200 shadow-2xs" : "border-neutral-700"
          }`}
        >
          <div
            className={`w-1/3 p-1.5 border-r font-semibold ${
              isLight
                ? "bg-purple-50 border-neutral-200 text-purple-800"
                : "bg-neutral-800 border-neutral-700 text-purple-300"
            }`}
          >
            Sidebar
          </div>
          <div
            className={`flex-1 p-1.5 flex items-center justify-center ${
              isLight ? "bg-white text-neutral-600" : "bg-neutral-950 text-neutral-400"
            }`}
          >
            Principal
          </div>
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
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border space-y-1.5 transition-colors ${
          isLight ? "bg-neutral-100/90 border-neutral-200" : "bg-neutral-900/95 border-neutral-800"
        }`}
      >
        <div
          className={`flex border-b text-[10px] gap-2 pb-1 ${
            isLight ? "border-neutral-200" : "border-neutral-700"
          }`}
        >
          <span
            className={`font-bold border-b pb-0.5 ${
              isLight ? "text-purple-700 border-purple-600" : "text-purple-400 border-purple-400"
            }`}
          >
            General
          </span>
          <span className={isLight ? "text-neutral-500" : "text-neutral-500"}>Seguridad</span>
        </div>
        <div className={`text-[9px] ${isLight ? "text-neutral-600" : "text-neutral-400"}`}>
          Contenido pestaña...
        </div>
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
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border transition-colors ${
          isLight ? "bg-neutral-100/90 border-neutral-200" : "bg-neutral-900/95 border-neutral-800"
        }`}
      >
        <div
          className={`rounded-xl border p-2 flex items-center justify-between text-xs ${
            isLight
              ? "border-neutral-200 bg-white text-neutral-800 shadow-2xs"
              : "border-neutral-700 bg-neutral-800 text-neutral-200"
          }`}
        >
          <span className="font-semibold text-[11px]">Datos Fiscales</span>
          <ChevronDown className={`w-3.5 h-3.5 ${isLight ? "text-neutral-500" : "text-neutral-400"}`} />
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
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border transition-colors ${
          isLight ? "bg-neutral-100/90 border-neutral-200" : "bg-neutral-900/95 border-neutral-800"
        }`}
      >
        <div className={`flex items-center gap-1 text-[10px] ${isLight ? "text-neutral-600" : "text-neutral-400"}`}>
          <span>Clientes</span>
          <span className={isLight ? "text-neutral-400" : "text-neutral-600"}>&gt;</span>
          <span className={`font-bold ${isLight ? "text-purple-700" : "text-purple-300"}`}>Facturas</span>
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
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border transition-colors ${
          isLight ? "bg-neutral-100/90 border-neutral-200" : "bg-neutral-900/95 border-neutral-800"
        }`}
      >
        <div
          className={`flex items-center justify-between p-1.5 rounded-xl border text-xs ${
            isLight
              ? "bg-white border-neutral-200 text-neutral-900 shadow-2xs"
              : "bg-neutral-800 border-neutral-700 text-white"
          }`}
        >
          <span className="font-bold text-[10px]">Panel de Control</span>
          <div className="flex gap-1">
            <span
              className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[8px] ${
                isLight ? "bg-neutral-100 text-neutral-700" : "bg-neutral-700 text-white"
              }`}
            >
              🔍
            </span>
            <span
              className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[8px] ${
                isLight ? "bg-neutral-100 text-neutral-700" : "bg-neutral-700 text-white"
              }`}
            >
              🔔
            </span>
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
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border transition-colors ${
          isLight ? "bg-neutral-100/90 border-neutral-200" : "bg-neutral-900/95 border-neutral-800"
        }`}
      >
        <div
          className={`relative border-2 rounded-xl px-3 py-1.5 ${
            isLight
              ? "border-purple-600 bg-white shadow-2xs"
              : "border-purple-500 bg-neutral-950/80"
          }`}
        >
          <span
            className={`text-[9px] font-semibold block ${
              isLight ? "text-purple-700" : "text-purple-400"
            }`}
          >
            Correo Electrónico
          </span>
          <div className="flex items-center gap-1.5 text-xs">
            <Mail className={`w-3 h-3 ${isLight ? "text-neutral-400" : "text-neutral-400"}`} />
            <span className={`text-[10px] ${isLight ? "text-neutral-700" : "text-neutral-400"}`}>
              usuario@correo.com
            </span>
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
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border transition-colors ${
          isLight ? "bg-neutral-100/90 border-neutral-200" : "bg-neutral-900/95 border-neutral-800"
        }`}
      >
        <div
          className={`border rounded-xl p-2 space-y-1 ${
            isLight ? "border-neutral-300 bg-white" : "border-neutral-700 bg-neutral-950"
          }`}
        >
          <span
            className={`text-[9px] font-semibold block ${
              isLight ? "text-purple-700" : "text-purple-400"
            }`}
          >
            Observaciones
          </span>
          <div className={`text-[9px] h-6 ${isLight ? "text-neutral-400" : "text-neutral-500"}`}>
            Escribe aquí...
          </div>
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
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border transition-colors ${
          isLight ? "bg-neutral-100/90 border-neutral-200" : "bg-neutral-900/95 border-neutral-800"
        }`}
      >
        <div
          className={`border rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 text-xs ${
            isLight
              ? "border-neutral-300 bg-white text-neutral-600 shadow-2xs"
              : "border-neutral-700 bg-neutral-950 text-neutral-400"
          }`}
        >
          <Search className={`w-3 h-3 ${isLight ? "text-purple-600" : "text-purple-400"}`} />
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
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border transition-colors ${
          isLight ? "bg-neutral-100/90 border-neutral-200" : "bg-neutral-900/95 border-neutral-800"
        }`}
      >
        <div
          className={`border rounded-xl px-2.5 py-1.5 flex items-center justify-between text-xs ${
            isLight
              ? "border-neutral-300 bg-white text-neutral-900 shadow-2xs"
              : "border-neutral-700 bg-neutral-800 text-neutral-200"
          }`}
        >
          <div>
            <div className={`text-[8px] ${isLight ? "text-purple-700 font-semibold" : "text-purple-400"}`}>
              Categoría
            </div>
            <div className="font-semibold text-[10px]">Diseño UI</div>
          </div>
          <ListFilter className={`w-3.5 h-3.5 ${isLight ? "text-neutral-500" : "text-neutral-400"}`} />
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
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border space-y-1.5 transition-colors ${
          isLight ? "bg-neutral-100/90 border-neutral-200" : "bg-neutral-900/95 border-neutral-800"
        }`}
      >
        <div
          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs ${
            isLight
              ? "bg-white border-purple-400 text-neutral-900"
              : "bg-neutral-950 border-purple-500/60 text-neutral-200"
          }`}
        >
          <Search className={`w-3 h-3 ${isLight ? "text-purple-600" : "text-purple-400"}`} />
          <span className="text-[10px]">Méx</span>
        </div>
        <div
          className={`px-2 py-0.5 rounded text-[9px] font-semibold flex justify-between ${
            isLight
              ? "bg-purple-100 text-purple-800 border border-purple-200"
              : "bg-purple-900/50 text-purple-200"
          }`}
        >
          <span>México</span>
          <Check className={`w-2.5 h-2.5 ${isLight ? "text-purple-700" : "text-purple-400"}`} />
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
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border transition-colors ${
          isLight ? "bg-neutral-100/90 border-neutral-200" : "bg-neutral-900/95 border-neutral-800"
        }`}
      >
        <div
          className={`px-2 py-1 rounded text-xs font-mono border ${
            isLight
              ? "bg-purple-50 text-purple-800 border-purple-200"
              : "bg-purple-950 text-purple-200 border-purple-800/60"
          }`}
        >
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
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border flex items-center justify-between transition-colors ${
          isLight ? "bg-neutral-100/90 border-neutral-200" : "bg-neutral-900/95 border-neutral-800"
        }`}
      >
        <span className={`text-[10px] ${isLight ? "text-neutral-800" : "text-neutral-300"}`}>
          Activar alertas
        </span>
        <div className="w-7 h-3.5 bg-purple-600 rounded-full p-0.5 flex justify-end shadow-xs">
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
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border flex items-center gap-2 transition-colors ${
          isLight ? "bg-neutral-100/90 border-neutral-200" : "bg-neutral-900/95 border-neutral-800"
        }`}
      >
        <div className="w-4 h-4 rounded bg-purple-600 text-white flex items-center justify-center shadow-xs">
          <Check className="w-3 h-3" />
        </div>
        <span className={`text-[10px] ${isLight ? "text-neutral-800" : "text-neutral-200"}`}>
          Acepto términos
        </span>
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
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border flex items-center gap-2 transition-colors ${
          isLight ? "bg-neutral-100/90 border-neutral-200" : "bg-neutral-900/95 border-neutral-800"
        }`}
      >
        <div className="w-4 h-4 rounded-full border-2 border-purple-600 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-purple-600" />
        </div>
        <span className={`text-[10px] ${isLight ? "text-neutral-800" : "text-neutral-200"}`}>
          Plan Empresarial
        </span>
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
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border space-y-1 transition-colors ${
          isLight ? "bg-neutral-100/90 border-neutral-200" : "bg-neutral-900/95 border-neutral-800"
        }`}
      >
        <div className={`flex justify-between text-[9px] ${isLight ? "text-neutral-600" : "text-neutral-400"}`}>
          <span>Volumen</span>
          <span className={`font-bold ${isLight ? "text-purple-700" : "text-purple-400"}`}>75%</span>
        </div>
        <div className={`h-1.5 rounded-full overflow-hidden ${isLight ? "bg-neutral-300" : "bg-neutral-700"}`}>
          <div className="h-full w-3/4 bg-purple-600" />
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
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border transition-colors ${
          isLight ? "bg-neutral-100/90 border-neutral-200" : "bg-neutral-900/95 border-neutral-800"
        }`}
      >
        <div
          className={`border rounded-xl px-2.5 py-1.5 flex items-center justify-between text-[10px] ${
            isLight
              ? "border-neutral-300 bg-white text-neutral-900 shadow-2xs"
              : "border-neutral-700 bg-neutral-800 text-neutral-200"
          }`}
        >
          <span>20 Ago 2026</span>
          <Calendar className={`w-3.5 h-3.5 ${isLight ? "text-purple-600" : "text-purple-400"}`} />
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
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border flex items-center gap-1 text-amber-500 transition-colors ${
          isLight ? "bg-neutral-100/90 border-neutral-200" : "bg-neutral-900/95 border-neutral-800"
        }`}
      >
        <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
        <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
        <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
        <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
        <Star className={`w-3 h-3 ${isLight ? "text-neutral-300" : "text-neutral-600"}`} />
        <span className={`text-[10px] font-bold ml-1 ${isLight ? "text-neutral-700" : "text-neutral-300"}`}>
          4/5
        </span>
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
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border flex items-center gap-2 transition-colors ${
          isLight ? "bg-neutral-100/90 border-neutral-200" : "bg-neutral-900/95 border-neutral-800"
        }`}
      >
        <span className="px-3 py-1 rounded-full bg-purple-600 text-white text-[10px] font-semibold flex items-center gap-1 shadow-md">
          <Save className="w-3 h-3" /> Guardar
        </span>
        <span
          className={`px-2.5 py-1 rounded-full border text-[10px] ${
            isLight
              ? "border-purple-300 text-purple-700 bg-purple-50/50"
              : "border-purple-400/50 text-purple-300"
          }`}
        >
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
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border transition-colors ${
          isLight ? "bg-neutral-100/90 border-neutral-200" : "bg-neutral-900/95 border-neutral-800"
        }`}
      >
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
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border transition-colors ${
          isLight ? "bg-neutral-100/90 border-neutral-200" : "bg-neutral-900/95 border-neutral-800"
        }`}
      >
        <div
          className={`flex border rounded-xl overflow-hidden text-[9px] ${
            isLight ? "border-neutral-300 shadow-2xs" : "border-neutral-700"
          }`}
        >
          <span
            className={`px-2 py-0.5 ${
              isLight ? "bg-white text-neutral-600" : "bg-neutral-800 text-neutral-400"
            }`}
          >
            Día
          </span>
          <span className="px-2 py-0.5 bg-purple-600 text-white font-bold">Mes</span>
          <span
            className={`px-2 py-0.5 ${
              isLight ? "bg-white text-neutral-600" : "bg-neutral-800 text-neutral-400"
            }`}
          >
            Año
          </span>
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
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border flex justify-end transition-colors ${
          isLight ? "bg-neutral-100/90 border-neutral-200" : "bg-neutral-900/95 border-neutral-800"
        }`}
      >
        <div className="px-3 py-1.5 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-lg">
          <Plus className="w-3 h-3" />
          <span>Nuevo</span>
        </div>
      </div>
    ),
  },
  {
    id: "splitbutton",
    name: "splitbutton",
    label: "Split Button (M3E)",
    category: "Actions & Controls",
    icon: Split,
    color: "from-purple-600 to-indigo-600",
    snippet: `splitbutton "Quick Export" icon=download goto=@ExportModal\n  menuitem "Export as PDF" icon=file-text goto=@ExportPDF\n  menuitem "Export as CSV" icon=table goto=@ExportCSV`,
    description: "Material 3 Expressive split button pairing a primary trigger action with a dropdown submenu.",
    modifiers: ["label=\"...\"", "icon=download", "goto=@Screen", "menuitem \"...\""],
    contextRules: { containerOnly: true },
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border flex items-center gap-2 transition-colors ${
          isLight ? "bg-neutral-100/90 border-neutral-200" : "bg-neutral-900/95 border-neutral-800"
        }`}
      >
        <div className="inline-flex rounded-full bg-purple-600 text-white text-[10px] font-semibold overflow-hidden divide-x divide-purple-700 shadow-md">
          <span className="px-2.5 py-1">Quick Action</span>
          <span className="px-1.5 py-1 flex items-center"><ChevronDown className="w-3 h-3" /></span>
        </div>
      </div>
    ),
  },
  {
    id: "buttongroup",
    name: "buttongroup",
    label: "Connected Buttons (M3E)",
    category: "Actions & Controls",
    icon: Layers,
    color: "from-blue-600 to-indigo-600",
    snippet: `buttongroup\n  button "Overview" active=true\n  button "Analytics"\n  button "Settings"`,
    description: "Material 3 Expressive grouped connected buttons with unified borders and segment states.",
    modifiers: ["variant=outlined|filled", "button \"...\""],
    contextRules: { containerOnly: true },
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border flex items-center gap-2 transition-colors ${
          isLight ? "bg-neutral-100/90 border-neutral-200" : "bg-neutral-900/95 border-neutral-800"
        }`}
      >
        <div className="inline-flex rounded-xl border border-neutral-300 dark:border-neutral-700 overflow-hidden divide-x divide-neutral-200 dark:divide-neutral-700 text-[9px] font-semibold">
          <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-200 font-bold">First</span>
          <span className="px-2 py-0.5 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">Second</span>
        </div>
      </div>
    ),
  },
  {
    id: "fabmenu",
    name: "fabmenu",
    label: "FAB Speed Dial Menu (M3E)",
    category: "Actions & Controls",
    icon: Sparkles,
    color: "from-fuchsia-600 to-purple-600",
    snippet: `fabmenu "Actions" icon=plus\n  fabitem "New User" icon=user-plus goto=@CreateUser\n  fabitem "Send Report" icon=send goto=@SendReport`,
    description: "Material 3 Expressive floating speed-dial action menu with animated expansion triggers.",
    modifiers: ["label=\"...\"", "icon=plus", "fabitem \"...\""],
    contextRules: { containerOnly: true },
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border flex flex-col items-end gap-1 transition-colors ${
          isLight ? "bg-neutral-100/90 border-neutral-200" : "bg-neutral-900/95 border-neutral-800"
        }`}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] bg-neutral-900 text-white px-1.5 py-0.5 rounded-full font-bold">New Item</span>
          <span className="w-5 h-5 rounded-full bg-white dark:bg-neutral-800 border flex items-center justify-center text-purple-600 text-[9px] shadow-xs"><Sparkles className="w-2.5 h-2.5" /></span>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-purple-600 text-white text-[9px] font-bold flex items-center gap-1 shadow-md">
          <Plus className="w-2.5 h-2.5" /> <span>Actions</span>
        </div>
      </div>
    ),
  },
  {
    id: "wavyprogress",
    name: "wavyprogress",
    label: "Expressive Progress Indicator (M3E)",
    category: "Feedback & Alerts",
    icon: Activity,
    color: "from-purple-500 to-pink-500",
    snippet: `wavyprogress label="Syncing Cloud Data..." value=65 variant=linear`,
    description: "Material 3 Expressive organic linear and circular rosette progress indicators.",
    modifiers: ["value=65", "label=\"...\"", "variant=linear|circular"],
    contextRules: { containerOnly: true },
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border space-y-1.5 transition-colors ${
          isLight ? "bg-neutral-100/90 border-neutral-200" : "bg-neutral-900/95 border-neutral-800"
        }`}
      >
        <div className="flex justify-between text-[9px] font-semibold text-purple-900 dark:text-purple-300">
          <span>Processing</span>
          <span>72%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden bg-purple-100 dark:bg-purple-950 p-0.5">
          <div className="h-full bg-purple-600 rounded-full w-[72%]" />
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
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border flex gap-1.5 transition-colors ${
          isLight ? "bg-neutral-100/90 border-neutral-200" : "bg-neutral-900/95 border-neutral-800"
        }`}
      >
        <span className="px-2 py-0.5 rounded-lg bg-purple-600 text-white text-[9px] font-semibold flex items-center gap-1 shadow-xs">
          <Check className="w-2.5 h-2.5" /> Activo
        </span>
        <span
          className={`px-2 py-0.5 rounded-lg text-[9px] border ${
            isLight
              ? "bg-white text-neutral-700 border-neutral-300"
              : "bg-neutral-800 text-neutral-300 border-neutral-700"
          }`}
        >
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
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border space-y-1 transition-colors ${
          isLight ? "bg-neutral-100/90 border-neutral-200" : "bg-neutral-900/95 border-neutral-800"
        }`}
      >
        <div className={`text-[10px] font-bold ${isLight ? "text-neutral-900" : "text-neutral-200"}`}>
          Servicios y Miembros
        </div>
        <div
          className={`rounded-lg border overflow-hidden text-[8px] ${
            isLight ? "border-neutral-300 bg-white" : "border-neutral-700/60 bg-neutral-950/50"
          }`}
        >
          <div
            className={`px-2 py-0.5 flex justify-between font-semibold ${
              isLight
                ? "bg-neutral-100 text-neutral-700 border-b border-neutral-200"
                : "bg-neutral-800 text-neutral-300"
            }`}
          >
            <span>ID:code</span>
            <span>Usuario</span>
            <span>Estado</span>
          </div>
          <div
            className={`px-2 py-0.5 flex justify-between ${
              isLight ? "text-neutral-600 bg-white" : "text-neutral-400 bg-neutral-950/50"
            }`}
          >
            <span className={`font-mono ${isLight ? "text-purple-700 font-semibold" : "text-purple-400"}`}>
              #101
            </span>
            <span className={isLight ? "text-neutral-900 font-medium" : "text-white"}>Javier D.</span>
            <span className={isLight ? "text-emerald-700 font-semibold" : "text-emerald-400"}>Activo</span>
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
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border transition-colors ${
          isLight ? "bg-neutral-100/90 border-neutral-200" : "bg-neutral-900/95 border-neutral-800"
        }`}
      >
        <div
          className={`px-2 py-1 rounded font-mono text-[9px] border ${
            isLight
              ? "bg-white border-neutral-300 text-purple-700 shadow-2xs"
              : "bg-neutral-950 border-neutral-800 text-purple-300"
          }`}
        >
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
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border transition-colors ${
          isLight ? "bg-neutral-100/90 border-neutral-200" : "bg-neutral-900/95 border-neutral-800"
        }`}
      >
        <div
          className={`p-2 rounded-xl border flex items-center justify-between ${
            isLight ? "bg-white border-neutral-200 shadow-2xs" : "bg-neutral-800 border-neutral-700"
          }`}
        >
          <div>
            <div className={`text-[9px] ${isLight ? "text-neutral-500" : "text-neutral-400"}`}>Ingresos</div>
            <div className={`text-xs font-bold mt-0.5 ${isLight ? "text-neutral-900" : "text-white"}`}>
              $48,250
            </div>
          </div>
          <span
            className={`px-1 py-0.5 rounded text-[9px] font-bold ${
              isLight
                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                : "bg-emerald-950 text-emerald-300"
            }`}
          >
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
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border space-y-1 transition-colors ${
          isLight ? "bg-neutral-100/90 border-neutral-200" : "bg-neutral-900/95 border-neutral-800"
        }`}
      >
        <div className={`flex justify-between text-[9px] ${isLight ? "text-neutral-700" : "text-neutral-300"}`}>
          <span>Progreso</span>
          <span className={`font-bold ${isLight ? "text-emerald-700" : "text-emerald-400"}`}>65%</span>
        </div>
        <div className={`h-1.5 rounded-full overflow-hidden ${isLight ? "bg-neutral-300" : "bg-neutral-800"}`}>
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
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border flex items-center gap-2 transition-colors ${
          isLight ? "bg-neutral-100/90 border-neutral-200" : "bg-neutral-900/95 border-neutral-800"
        }`}
      >
        <div className="relative">
          <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold">
            JD
          </div>
          <div
            className={`absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border ${
              isLight ? "border-white" : "border-neutral-900"
            }`}
          />
        </div>
        <span className={`text-[10px] ${isLight ? "text-neutral-800 font-medium" : "text-neutral-200"}`}>
          Javier Díaz
        </span>
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
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border flex gap-2 transition-colors ${
          isLight ? "bg-neutral-100/90 border-neutral-200" : "bg-neutral-900/95 border-neutral-800"
        }`}
      >
        <span
          className={`px-2 py-0.5 rounded-full text-[9px] font-semibold border ${
            isLight
              ? "bg-purple-100 text-purple-800 border-purple-200"
              : "bg-purple-950 text-purple-300 border-purple-800"
          }`}
        >
          Proceso
        </span>
        <span
          className={`px-2 py-0.5 rounded-full text-[9px] font-semibold border ${
            isLight
              ? "bg-emerald-100 text-emerald-800 border-emerald-200"
              : "bg-emerald-950 text-emerald-300 border-emerald-800"
          }`}
        >
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
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border flex gap-1.5 transition-colors ${
          isLight ? "bg-neutral-100/90 border-neutral-200" : "bg-neutral-900/95 border-neutral-800"
        }`}
      >
        <span
          className={`px-1.5 py-0.5 rounded border text-[8px] font-mono font-bold ${
            isLight
              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
              : "bg-emerald-950 text-emerald-400 border-emerald-800/80"
          }`}
        >
          PROD
        </span>
        <span
          className={`px-1.5 py-0.5 rounded border text-[8px] font-mono font-bold ${
            isLight
              ? "bg-amber-100 text-amber-800 border-amber-300"
              : "bg-amber-950 text-amber-400 border-amber-800/80"
          }`}
        >
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
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border transition-colors ${
          isLight ? "bg-neutral-100/90 border-neutral-200" : "bg-neutral-900/95 border-neutral-800"
        }`}
      >
        <div
          className={`flex items-center justify-between p-1.5 rounded-xl border ${
            isLight
              ? "bg-white border-neutral-200 shadow-2xs"
              : "bg-neutral-800 border-neutral-700"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <BellRing className={`w-3 h-3 ${isLight ? "text-purple-600" : "text-purple-400"}`} />
            <div>
              <div className={`text-[10px] font-medium ${isLight ? "text-neutral-900" : "text-white"}`}>
                Alertas
              </div>
              <div className={`text-[8px] ${isLight ? "text-neutral-500" : "text-neutral-400"}`}>
                En tiempo real
              </div>
            </div>
          </div>
          <ArrowRight className={`w-3 h-3 ${isLight ? "text-neutral-400" : "text-neutral-500"}`} />
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
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border transition-colors ${
          isLight ? "bg-neutral-100/90 border-neutral-200" : "bg-neutral-900/95 border-neutral-800"
        }`}
      >
        <div
          className={`p-2 rounded-xl border flex items-center justify-between text-xs ${
            isLight
              ? "bg-white border-neutral-200 text-neutral-800 shadow-sm"
              : "bg-neutral-950 border-neutral-700 text-white"
          }`}
        >
          <span className={`text-[9px] ${isLight ? "text-neutral-700" : "text-neutral-300"}`}>
            Mensaje enviado
          </span>
          <span
            className={`text-[9px] font-bold uppercase ${
              isLight ? "text-purple-700" : "text-purple-400"
            }`}
          >
            Deshacer
          </span>
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
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border transition-colors ${
          isLight ? "bg-neutral-100/90 border-neutral-200" : "bg-neutral-900/95 border-neutral-800"
        }`}
      >
        <div
          className={`p-2 rounded-xl text-[9px] flex items-center gap-1.5 border ${
            isLight
              ? "bg-amber-50 border-amber-200 text-amber-900"
              : "bg-amber-950/60 border-amber-800/80 text-amber-200"
          }`}
        >
          <AlertCircle
            className={`w-3.5 h-3.5 shrink-0 ${
              isLight ? "text-amber-600" : "text-amber-400"
            }`}
          />
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
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border font-mono text-[9px] transition-colors ${
          isLight
            ? "bg-neutral-100/90 border-neutral-200 text-purple-700"
            : "bg-neutral-900/95 border-neutral-800 text-purple-300"
        }`}
      >
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
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border font-mono text-[9px] transition-colors ${
          isLight
            ? "bg-neutral-100/90 border-neutral-200 text-purple-700"
            : "bg-neutral-900/95 border-neutral-800 text-purple-300"
        }`}
      >
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
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border font-mono text-[9px] transition-colors ${
          isLight
            ? "bg-neutral-100/90 border-neutral-200 text-emerald-700"
            : "bg-neutral-900/95 border-neutral-800 text-emerald-300"
        }`}
      >
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
    renderPreview: (isLight = false) => (
      <div
        className={`p-3 rounded-2xl border font-mono text-[9px] transition-colors ${
          isLight
            ? "bg-neutral-100/90 border-neutral-200 text-cyan-700"
            : "bg-neutral-900/95 border-neutral-800 text-cyan-300"
        }`}
      >
        right
      </div>
    ),
  },

  // =========================================================
  // MATERIAL 3 EXPANDED SUITE (Rails, Drawers, Sheets, Loading, Tooltips, Menus)
  // =========================================================
  {
    id: "navigationrail",
    name: "navigationrail",
    label: "Barra de Navegación Vertical (Rail)",
    category: "Layout & Superficie",
    icon: Compass,
    color: "from-purple-600 to-indigo-600",
    snippet: `navigationrail title="Espacio" subtitle="v2.0" fab=plus fabLabel="Nuevo" user="Admin" role="Editor"\n  railitem "Inicio" icon=home active\n    appbar "Panel Principal" icon=home\n    card elevated\n      text "Bienvenido al Espacio" title\n      text "Selecciona elementos en la barra lateral para cambiar de panel fluidamente." body\n  railitem "Analíticas" icon=bar-chart-2 badge="8"\n    appbar "Métricas y Rendimiento" icon=bar-chart-2\n    grid cols=2 gap=12\n      metric label="Sesiones" value="1,240" delta="+12%"\n      metric label="Retención" value="94%" delta="+3.2%"\n  railitem "Ajustes" icon=settings\n    appbar "Configuración" icon=settings\n    switch dark label="Modo Oscuro" checked=true`,
    description: "Barra de navegación vertical Material 3 (Rail) con soporte completo de cambio de paneles anidados, modo expandible, FAB de acción, badges e indicador de perfil.",
    modifiers: ["title=...", "subtitle=...", "fab=...", "fabLabel=...", "fabGoto=...", "expanded=true|false", "user=...", "role=..."],
    contextRules: {},
    renderPreview: (isLight = false) => (
      <div className={`p-2 rounded-2xl border flex flex-col items-center gap-1.5 w-16 ${isLight ? "bg-white border-neutral-200" : "bg-neutral-900 border-neutral-800"}`}>
        <div className="w-7 h-7 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center text-[10px] font-bold">+</div>
        <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[8px]">●</div>
        <div className="w-4 h-4 rounded-full bg-neutral-200 dark:bg-neutral-700" />
      </div>
    ),
  },
  {
    id: "drawer",
    name: "drawer",
    label: "Panel Lateral / Drawer",
    category: "Layout & Superficie",
    icon: PanelLeft,
    color: "from-blue-600 to-indigo-600",
    snippet: `drawer title="Mi Aplicación" subtitle="usuario@empresa.com"\n  draweritem "Panel Principal" icon=layout active\n  draweritem "Clientes" icon=users badge="12"\n  section "Configuración"\n  draweritem "Ajustes" icon=settings`,
    description: "Panel de navegación lateral / Navigation Drawer Material 3 con perfil y secciones.",
    modifiers: ["title=...", "subtitle=...", "avatar=..."],
    contextRules: {},
    renderPreview: (isLight = false) => (
      <div className={`p-2.5 rounded-2xl border w-full space-y-1.5 ${isLight ? "bg-white border-neutral-200" : "bg-neutral-900 border-neutral-800"}`}>
        <div className="text-[10px] font-bold text-purple-700">Menú Drawer</div>
        <div className="px-2 py-1 rounded-full bg-purple-100 text-purple-900 text-[9px] font-semibold flex items-center gap-1">● Inicio</div>
        <div className="px-2 py-1 text-[9px] text-neutral-500 flex items-center gap-1">○ Ajustes</div>
      </div>
    ),
  },
  {
    id: "sidesheet",
    name: "sidesheet",
    label: "Hoja Lateral (Side Sheet)",
    category: "Layout & Superficie",
    icon: PanelRight,
    color: "from-teal-600 to-cyan-600",
    snippet: `sidesheet title="Filtros Avanzados"\n  select categoria label="Categoría" options=["Todas", "Eventos", "Bodas"]\n  slider precio label="Presupuesto Máximo" min=500 max=20000 value=5000\n  button "Aplicar Filtros" filled`,
    description: "Panel lateral emergente o embebido de Material 3 para filtros secundarios o detalles.",
    modifiers: ["title=...", "variant=standard|modal", "position=right|left"],
    contextRules: {},
    renderPreview: (isLight = false) => (
      <div className={`p-2.5 rounded-2xl border w-full space-y-1.5 ${isLight ? "bg-white border-neutral-200" : "bg-neutral-900 border-neutral-800"}`}>
        <div className="text-[10px] font-bold text-teal-700 border-b pb-1">Side Sheet</div>
        <div className="h-2 rounded bg-neutral-100" />
        <div className="h-2 rounded bg-neutral-100 w-3/4" />
      </div>
    ),
  },
  {
    id: "bottomsheet",
    name: "bottomsheet",
    label: "Hoja Inferior (Bottom Sheet)",
    category: "Layout & Superficie",
    icon: Rows,
    color: "from-amber-600 to-orange-600",
    snippet: `bottomsheet title="Acciones Rápidas"\n  button "Exportar a PDF" filled icon=download\n  button "Enviar por Correo" tonal icon=mail`,
    description: "Hoja inferior emergente con tirador y contenedor de acciones o menús contextuales.",
    modifiers: ["title=...", "variant=standard|modal"],
    contextRules: {},
    renderPreview: (isLight = false) => (
      <div className={`p-2.5 rounded-t-2xl border-t border-x w-full space-y-1.5 ${isLight ? "bg-white border-neutral-200" : "bg-neutral-900 border-neutral-800"}`}>
        <div className="w-8 h-1 rounded-full bg-neutral-300 mx-auto mb-1" />
        <div className="text-[10px] font-bold text-amber-700">Bottom Sheet</div>
      </div>
    ),
  },
  {
    id: "loading",
    name: "loading",
    label: "Carga / Progreso (Loading)",
    category: "Feedback & Alertas",
    icon: Loader2,
    color: "from-indigo-500 to-purple-600",
    snippet: `loading "Cargando datos del sistema..."`,
    description: "Indicador de progreso circular o lineal Material 3.",
    modifiers: ["variant=circular|linear", "value=...", "message=..."],
    contextRules: {},
    renderPreview: (isLight = false) => (
      <div className={`p-2 rounded-2xl border flex items-center justify-center gap-2 ${isLight ? "bg-white border-neutral-200" : "bg-neutral-900 border-neutral-800"}`}>
        <div className="w-4 h-4 rounded-full border-2 border-purple-200 border-t-purple-600 animate-spin" />
        <span className="text-[9px] text-neutral-500">Cargando...</span>
      </div>
    ),
  },
  {
    id: "linearprogress",
    name: "linearprogress",
    label: "Barra Lineal de Progreso",
    category: "Feedback & Alertas",
    icon: Sliders,
    color: "from-blue-500 to-indigo-600",
    snippet: `linearprogress value=65 message="Subiendo archivo..."`,
    description: "Barra de progreso lineal continua o con porcentaje determinado.",
    modifiers: ["value=...", "message=..."],
    contextRules: {},
    renderPreview: (isLight = false) => (
      <div className={`p-2.5 rounded-2xl border space-y-1 w-full ${isLight ? "bg-white border-neutral-200" : "bg-neutral-900 border-neutral-800"}`}>
        <div className="w-full h-1.5 rounded-full bg-neutral-100 overflow-hidden">
          <div className="w-3/4 h-full bg-purple-600 rounded-full" />
        </div>
        <div className="text-[8px] text-neutral-500 text-right">75%</div>
      </div>
    ),
  },
  {
    id: "tooltip",
    name: "tooltip",
    label: "Tooltip / Ayuda Flotante",
    category: "Feedback & Alertas",
    icon: HelpCircle,
    color: "from-slate-600 to-zinc-700",
    snippet: `tooltip "Copiar identificador al portapapeles"`,
    description: "Píldora flotante con mensaje contextual rápido.",
    modifiers: ["text=..."],
    contextRules: {},
    renderPreview: () => (
      <div className="px-2 py-1 rounded-md bg-neutral-900 text-white text-[9px] shadow-sm inline-block">
        Texto de ayuda
      </div>
    ),
  },
  {
    id: "richtooltip",
    name: "richtooltip",
    label: "Rich Tooltip Enriquecido",
    category: "Feedback & Alertas",
    icon: Sparkles,
    color: "from-purple-600 to-pink-600",
    snippet: `richtooltip title="Permisos de Edición" text="Los administradores pueden modificar precios directamente." action="Saber más"`,
    description: "Tarjeta flotante enriquecida con título, descripción y botón de acción.",
    modifiers: ["title=...", "text=...", "action=...", "action_goto=..."],
    contextRules: {},
    renderPreview: (isLight = false) => (
      <div className={`p-2 rounded-xl border text-[9px] space-y-1 ${isLight ? "bg-white border-neutral-200" : "bg-neutral-900 border-neutral-800"}`}>
        <div className="font-bold text-purple-700">Rich Tooltip</div>
        <div className="text-neutral-500 text-[8px]">Explicación detallada...</div>
      </div>
    ),
  },
  {
    id: "carousel",
    name: "carousel",
    label: "Carrusel de Contenido",
    category: "Layout & Superficie",
    icon: Columns2,
    color: "from-fuchsia-600 to-rose-600",
    snippet: `carousel\n  card elevated\n    text "Tarjeta A" title\n  card elevated\n    text "Tarjeta B" title`,
    description: "Carrusel deslizable horizontal con controles previa/siguiente y puntos de navegación.",
    modifiers: ["carousel"],
    contextRules: {},
    renderPreview: (isLight = false) => (
      <div className={`p-2 rounded-2xl border flex items-center justify-between gap-1 ${isLight ? "bg-white border-neutral-200" : "bg-neutral-900 border-neutral-800"}`}>
        <span className="text-[8px] text-neutral-400">‹</span>
        <div className="px-3 py-1 rounded-lg bg-purple-50 text-purple-800 text-[9px] font-bold">Slide 1</div>
        <span className="text-[8px] text-neutral-400">›</span>
      </div>
    ),
  },
  {
    id: "iconbutton",
    name: "iconbutton",
    label: "Botón de Ícono (IconButton)",
    category: "Acciones & Controles",
    icon: MousePointerClick,
    color: "from-violet-600 to-purple-600",
    snippet: `iconbutton icon=heart variant=tonal tooltip="Marcar como favorito"`,
    description: "Botón circular compacto con ícono Material 3, variantes y badge.",
    modifiers: ["icon=...", "variant=filled|tonal|outlined|standard", "tooltip=...", "badge=..."],
    contextRules: {},
    renderPreview: () => (
      <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold shadow-xs">
        ★
      </div>
    ),
  },
  {
    id: "timepicker",
    name: "timepicker",
    label: "Selector de Hora (TimePicker)",
    category: "Entradas & Formularios",
    icon: Clock,
    color: "from-cyan-600 to-blue-600",
    snippet: `timepicker hora label="Hora del Evento" value="18:30"`,
    description: "Control de selección horaria interactivo con selector de horas/minutos.",
    modifiers: ["label=...", "value=...", "format=12h|24h"],
    contextRules: {},
    renderPreview: (isLight = false) => (
      <div className={`p-2 rounded-xl border flex items-center justify-between ${isLight ? "bg-white border-neutral-200" : "bg-neutral-900 border-neutral-800"}`}>
        <span className="text-[9px] font-bold text-neutral-700">18:30 PM</span>
        <Clock className="w-3 h-3 text-neutral-400" />
      </div>
    ),
  },
  {
    id: "menu",
    name: "menu",
    label: "Menú Desplegable (Menu)",
    category: "Acciones & Controles",
    icon: MoreHorizontal,
    color: "from-zinc-600 to-neutral-700",
    snippet: `menu "Acciones" icon=more-vertical\n  menuitem "Editar" icon=edit\n  menuitem "Duplicar" icon=copy\n  menuitem "Eliminar" icon=trash`,
    description: "Menú desplegable flotante Material 3 con lista de acciones y atajos.",
    modifiers: ["label=...", "icon=..."],
    contextRules: {},
    renderPreview: (isLight = false) => (
      <div className={`p-2 rounded-xl border text-[9px] space-y-1 ${isLight ? "bg-white border-neutral-200" : "bg-neutral-900 border-neutral-800"}`}>
        <div className="font-semibold text-neutral-700 flex items-center justify-between">Opciones ▾</div>
      </div>
    ),
  },
  {
    id: "appbar",
    name: "appbar",
    label: "Barra Superior (Top App Bar)",
    category: "Layout & Superficie",
    icon: PanelLeft,
    color: "from-purple-600 to-indigo-600",
    snippet: `appbar "Título de Aplicación" icon=menu variant=center\n  button icon=bell text badge="3"\n  button icon=more-vertical text`,
    description: "Barra de navegación superior Material 3 Expressive (Center-aligned, Small, Medium, Large, Bottom).",
    modifiers: ["variant=center|small|medium|large|bottom", "icon=...", "title=..."],
    contextRules: {},
    renderPreview: (isLight = false) => (
      <div className={`p-2 rounded-xl border flex items-center justify-between gap-2 w-full ${isLight ? "bg-white border-neutral-200" : "bg-neutral-900 border-neutral-800"}`}>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-purple-100 text-purple-700 flex items-center justify-center text-[8px]">☰</div>
          <span className="text-[10px] font-bold text-purple-700">App Bar</span>
        </div>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-full bg-neutral-200" />
          <div className="w-3 h-3 rounded-full bg-neutral-200" />
        </div>
      </div>
    ),
  },
  {
    id: "circularprogress",
    name: "circularprogress",
    label: "Progreso Circular",
    category: "Feedback & Alertas",
    icon: Loader2,
    color: "from-blue-600 to-teal-600",
    snippet: `circularprogress value=80 message="Optimizando recursos..."`,
    description: "Indicador de progreso circular con soporte para porcentaje o animación continua.",
    modifiers: ["value=...", "message=...", "size=sm|md|lg"],
    contextRules: {},
    renderPreview: (isLight = false) => (
      <div className={`p-2 rounded-xl border flex items-center gap-2 ${isLight ? "bg-white border-neutral-200" : "bg-neutral-900 border-neutral-800"}`}>
        <div className="w-4 h-4 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
        <span className="text-[9px] text-neutral-500 font-bold">80%</span>
      </div>
    ),
  },
];
