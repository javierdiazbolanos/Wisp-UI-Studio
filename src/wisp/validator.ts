import { WispDocument, WispDiagnostic, WispNode, ScreenNode } from "./types";

const KNOWN_COMPONENTS = new Set([
  "screen",
  "dialog",
  "form",
  "wizard",
  "sheet",
  "modal",
  "step",
  "component",
  "include",
  "use",
  "searchbar",
  "search",
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
  "timepicker",
  "time-picker",
  "radio",
  "option",
  "segmentedbutton",
  "list",
  "listitem",
  "list-item",
  "listgroup",
  "listcontainer",
  "avatar",
  "badge",
  "icon",
  "image",
  "progress",
  "loading",
  "spinner",
  "circularprogress",
  "linearprogress",
  "metric",
  "stat",
  "divider",
  "spacer",
  "alert",
  "tabs",
  "tab",
  "panel",
  "tabitem",
  "tab-item",
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
  "appbar",
  "topappbar",
  "navbar",
  "topbar",
  "header",
  "bottomnav",
  "bottombar",
  "navigationbar",
  "navitem",
  "navigationrail",
  "apprail",
  "navrail",
  "rail",
  "railitem",
  "rail-item",
  "destination",
  "drawer",
  "navigationdrawer",
  "appdrawer",
  "navdrawer",
  "draweritem",
  "drawer-item",
  "sidesheet",
  "side-sheet",
  "bottomsheet",
  "bottom-sheet",
  "carousel",
  "iconbutton",
  "icon-button",
  "menu",
  "dropdown",
  "dropdownmenu",
  "menuitem",
  "menu-item",
  "section",
  "tooltip",
  "richtooltip",
  "rich-tooltip",
  "accordion",
  "fab",
  "fabmenu",
  "fab-menu",
  "speeddial",
  "fabitem",
  "fab-item",
  "splitbutton",
  "split-button",
  "split-btn",
  "buttongroup",
  "button-group",
  "connectedbuttons",
  "connected-buttons",
  "wavyprogress",
  "wavy-progress",
  "progressindicator",
  "progress-indicator",
  "snackbar",
  "toast",
  "breadcrumbs",
  "rating",
  "if",
  "for",
  "data",
  "tag",
]);

const COMPONENT_SUGGESTIONS: Record<string, string> = {
  comp: "component",
  widget: "component",
  template: "component",
  block: "component",
  searchbox: "searchbar",
  buscar: "searchbar",
  busqueda: "searchbar",
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
  topbar: "appbar",
  header: "appbar",
  menubar: "appbar",
  toolbar: "appbar",
  nav: "navbar",
  bottombar: "bottomnav",
  navigationbar: "bottomnav",
  speeddial: "fabmenu",
  fab_menu: "fabmenu",
  split_button: "splitbutton",
  button_group: "buttongroup",
  wavy_progress: "wavyprogress",
  progress_indicator: "progressindicator",
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
        message: `Duplicate screen: "@${screen.name}". Each screen must have a unique identifier.`,
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
          message: `The wizard "@${screen.name}" contains no 'step' blocks. Add 'step "Step 1"' to define the flow.`,
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
        message: `Unknown component: "${node.type}". ${
          suggestion ? `Did you mean '${suggestion}'?` : "Check Wisp DSL syntax."
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
            message: `Navigation target "@${targetScreen}" does not exist in the document. Available screens: ${Array.from(screenNames).map(s => "@" + s).join(", ")}`,
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
          message: `Snackbar reference "@${targetToast}" does not exist in the document. Declared notifications: ${Array.from(screenNames).map(s => "@" + s).join(", ")}`,
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
          message: `The 'split' layout must contain indented 'left' and 'right' child blocks.`,
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
