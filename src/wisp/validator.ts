import { WispDocument, WispDiagnostic, WispNode, ScreenNode } from "./types";

const KNOWN_COMPONENTS = new Set([
  "screen",
  "dialog",
  "form",
  "wizard",
  "sheet",
  "modal",
  "step",
  "card",
  "text",
  "textfield",
  "textarea",
  "button",
  "chip",
  "switch",
  "checkbox",
  "slider",
  "select",
  "autocomplete",
  "datepicker",
  "radio",
  "option",
  "segmentedbutton",
  "listitem",
  "avatar",
  "badge",
  "icon",
  "image",
  "progress",
  "metric",
  "stat",
  "divider",
  "spacer",
  "alert",
  "tabs",
  "tab",
  "panel",
  "tabitem",
  "table",
  "row",
  "tablerow",
  "table-row",
  "tr",
  "column",
  "grid",
  "sidebar",
  "split",
  "left",
  "right",
  "container",
  "navbar",
  "topappbar",
  "bottomnav",
  "accordion",
  "fab",
  "snackbar",
  "toast",
  "breadcrumbs",
  "rating",
  "if",
  "for",
  "data",
]);

const COMPONENT_SUGGESTIONS: Record<string, string> = {
  btn: "button",
  input: "textfield",
  textbox: "textfield",
  toggle: "switch",
  check: "checkbox",
  dropdown: "select",
  img: "image",
  picture: "image",
  label: "text",
  heading: "text",
  title: "text",
  item: "listitem",
  list: "column",
  box: "card",
  surface: "card",
  panel: "card",
  stepper: "wizard",
  expansion: "accordion",
  collapse: "accordion",
  toast: "snackbar",
  star: "rating",
  stars: "rating",
  breadcrumb: "breadcrumbs",
};

export function validateWispDocument(doc: WispDocument): WispDiagnostic[] {
  const diagnostics: WispDiagnostic[] = [...doc.diagnostics];
  const screenNames = new Set<string>();

  // 1. Collect screen names & check duplicates
  for (const screen of doc.screens) {
    if (screenNames.has(screen.name)) {
      diagnostics.push({
        line: screen.position?.line || 1,
        column: screen.position?.column || 1,
        message: `Pantalla duplicada: "@${screen.name}". Cada pantalla debe tener un identificador único.`,
        severity: "error",
      });
    }
    screenNames.add(screen.name);

    if (screen.type === "wizard") {
      const stepCount = screen.steps?.length || 0;
      if (stepCount === 0) {
        diagnostics.push({
          line: screen.position?.line || 1,
          column: 1,
          message: `El wizard "@${screen.name}" no contiene ningún bloque 'step'. Agrega 'step "Paso 1"' para definir el flujo.`,
          severity: "warning",
        });
      }
    }
  }

  // 2. Traverse all nodes and validate properties, component types, and navigation targets
  function traverse(node: WispNode) {
    // Check known component
    if (!KNOWN_COMPONENTS.has(node.type) && !node.type.startsWith("@")) {
      const suggestion = COMPONENT_SUGGESTIONS[node.type];
      diagnostics.push({
        line: node.position?.line || 1,
        column: node.position?.column || 1,
        message: `Componente desconocido: "${node.type}". ${
          suggestion ? `¿Quisiste escribir '${suggestion}'?` : "Revisa la sintaxis de Wisp DSL."
        }`,
        severity: "warning",
      });
    }

    // Validate navigation targets
    const gotoProp = node.props.goto;
    if (gotoProp && typeof gotoProp === "string") {
      // goto=@Detail or goto=@Wizard(step=2) or goto=back or goto=close
      if (gotoProp.startsWith("@")) {
        const targetScreen = gotoProp.split("(")[0].substring(1);
        if (!screenNames.has(targetScreen)) {
          diagnostics.push({
            line: node.position?.line || 1,
            column: 1,
            message: `Destino de navegación "@${targetScreen}" no existe en el documento. Pantallas disponibles: ${Array.from(screenNames).map(s => "@" + s).join(", ")}`,
            severity: "warning",
          });
        }
      }
    }

    // Validate snackbar/toast @target references
    const toastRef = node.props.snackbar || node.props.toast;
    if (toastRef && typeof toastRef === "string" && toastRef.startsWith("@")) {
      const targetToast = toastRef.substring(1);
      if (!screenNames.has(targetToast)) {
        diagnostics.push({
          line: node.position?.line || 1,
          column: 1,
          message: `Referencia de snackbar "@${targetToast}" no existe en el documento. Notificaciones declaradas: ${Array.from(screenNames).map(s => "@" + s).join(", ")}`,
          severity: "warning",
        });
      }
    }

    // Validate split node contains left or right
    if (node.type === "split") {
      const hasLeft = node.children.some(c => c.type === "left");
      const hasRight = node.children.some(c => c.type === "right");
      if (!hasLeft || !hasRight) {
        diagnostics.push({
          line: node.position?.line || 1,
          column: 1,
          message: `El layout 'split' debe contener los slots 'left' y 'right' indentados.`,
          severity: "info",
        });
      }
    }

    // Traverse children
    for (const child of node.children) {
      traverse(child);
    }
  }

  for (const screen of doc.screens) {
    traverse(screen);
  }

  return diagnostics;
}
