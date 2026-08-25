/**
 * Wisp DSL Core AST and Diagnostic Types
 * Designed for Material 3 Expressive prototyping and extensible to other design systems.
 */

export type ScreenType = "screen" | "dialog" | "form" | "wizard" | "sheet" | "modal" | "snackbar" | "toast" | "component" | "drawer" | "sidesheet" | "bottomsheet";

export interface NodePosition {
  line: number;
  column: number;
}

export interface WispNode {
  id: string;
  type: string;
  props: Record<string, any>;
  children: WispNode[];
  rawText?: string;
  position?: NodePosition;
  lineStart?: number;
  lineEnd?: number;
}

export interface StepNode extends WispNode {
  type: "step";
  title: string;
  index: number;
}

export interface TableRowNode extends WispNode {
  type: "row" | "tablerow" | "tr";
  values: (string | number | boolean)[];
}

export interface TabPanelNode extends WispNode {
  type: "tab" | "panel" | "tabitem";
  title: string;
  index?: number;
}

export interface ScreenNode extends WispNode {
  type: ScreenType;
  name: string;
  theme?: string;
  steps?: StepNode[];
}

export interface ThemeNode extends WispNode {
  type: "theme";
  name: "material3" | "ios" | "fluent" | "kiro" | string;
  tokens?: Record<string, any>;
}

export interface DataNode extends WispNode {
  type: "data";
  name: string;
  values: Record<string, any>;
}

export interface NavigationAction {
  type: "goto" | "modal" | "sheet" | "close" | "back";
  target?: string;
  params?: Record<string, any>;
}

export interface WispDiagnostic {
  line: number;
  column: number;
  message: string;
  severity: "error" | "warning" | "info";
  rule?: string;
}

export interface WispDocument {
  screens: ScreenNode[];
  themes: ThemeNode[];
  data: DataNode[];
  rawCode: string;
  diagnostics: WispDiagnostic[];
  ast: WispNode[];
}
