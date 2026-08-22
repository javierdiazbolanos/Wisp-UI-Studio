import {
  WispNode,
  ScreenNode,
  StepNode,
  ThemeNode,
  DataNode,
  WispDiagnostic,
  WispDocument,
  ScreenType,
} from "./types";

let nodeIdCounter = 0;
function generateId(prefix: string = "node"): string {
  return `${prefix}_${++nodeIdCounter}`;
}

interface ParsedLine {
  lineNum: number;
  indent: number;
  raw: string;
  trimmed: string;
}

/**
 * Parses raw Wisp DSL text into a structured AST and collects diagnostics.
 */
export function parseWispDSL(dslText: string): WispDocument {
  nodeIdCounter = 0;
  const diagnostics: WispDiagnostic[] = [];
  const lines = dslText.split("\n");

  const parsedLines: ParsedLine[] = [];
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();

    // Skip empty lines and comment lines (starting with // or #)
    if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("#")) {
      continue;
    }

    // Determine indentation (2 spaces or 1 tab = 1 level)
    const leadingSpaces = raw.match(/^\s*/)?.[0] || "";
    const indent = Math.floor(leadingSpaces.replace(/\t/g, "  ").length / 2);

    parsedLines.push({
      lineNum: i + 1,
      indent,
      raw,
      trimmed,
    });
  }

  const screens: ScreenNode[] = [];
  const themes: ThemeNode[] = [];
  const dataNodes: DataNode[] = [];

  let currentScreen: ScreenNode | null = null;
  let currentTheme: ThemeNode = {
    id: generateId("theme"),
    type: "theme",
    name: "material3",
    props: {},
    children: [],
  };
  themes.push(currentTheme);

  // Stack of nested container nodes [ { node: WispNode, indent: number } ]
  let stack: { node: WispNode; indent: number }[] = [];

  for (let i = 0; i < parsedLines.length; i++) {
    const { lineNum, indent, trimmed } = parsedLines[i];

    // 1. Theme declaration: @theme material3
    if (trimmed.startsWith("@theme")) {
      const themeMatch = trimmed.match(/^@theme\s+([a-zA-Z0-9_-]+)/);
      const themeName = themeMatch ? themeMatch[1] : "material3";
      currentTheme.name = themeName;
      continue;
    }

    // 2. Screen / Modal / Form / Wizard / Snackbar / Toast / Reusable Component declaration: @ScreenName:type [props...]
    if (trimmed.startsWith("@")) {
      // If indented inside a container, treat @ComponentName as a component reference
      if (indent > 0) {
        // Fall through to normal component line parser where @Name is resolved as a component
      } else {
        const screenMatch = trimmed.match(/^@([a-zA-Z0-9_-]+)(?::([a-zA-Z0-9_-]+))?/);
        if (screenMatch) {
          const screenName = screenMatch[1];
          const screenTypeRaw = (screenMatch[2] || "screen").toLowerCase();
          const validTypes: ScreenType[] = ["screen", "dialog", "form", "wizard", "sheet", "modal", "snackbar", "toast", "component", "drawer", "sidesheet"];
          const screenType: ScreenType = validTypes.includes(screenTypeRaw as ScreenType)
            ? (screenTypeRaw as ScreenType)
            : "screen";

          const screenProps: Record<string, any> = { name: screenName };

          // Parse any trailing parameters on the declaration line e.g. @FacturaToast:snackbar "Factura #1024 enviada" snackbar-action="Deshacer" snackbar-duration=400
          const declarationRemainder = trimmed.substring(screenMatch[0].length).trim();
          if (declarationRemainder) {
            const declTokens = mergeKeyValueTokens(tokenizeLine(declarationRemainder));
            let posIdx = 0;
            for (const tok of declTokens) {
              if (tok.includes("=")) {
                const eqIdx = tok.indexOf("=");
                const k = tok.substring(0, eqIdx).trim();
                const v = tok.substring(eqIdx + 1).trim();
                const parsedVal = parseValue(v);
                screenProps[k] = parsedVal;
                if (k.includes("-")) {
                  screenProps[k.replace(/-/g, "_")] = parsedVal;
                }
                if (k.includes("_")) {
                  screenProps[k.replace(/_/g, "-")] = parsedVal;
                }
              } else {
                if (posIdx === 0) {
                  screenProps.message = unquote(tok);
                  screenProps.value = unquote(tok);
                } else if (["info", "success", "warning", "error"].includes(tok.toLowerCase())) {
                  screenProps.type = tok.toLowerCase();
                }
                posIdx++;
              }
            }
          }

          currentScreen = {
            id: generateId(screenType === "component" ? "comp" : "screen"),
            type: screenType,
            name: screenName,
            props: screenProps,
            children: [],
            position: { line: lineNum, column: 1 },
            steps: screenType === "wizard" ? [] : undefined,
          };

          screens.push(currentScreen);
          stack = [{ node: currentScreen, indent: -1 }];
          continue;
        } else {
          diagnostics.push({
            line: lineNum,
            column: 1,
            message: `Declaración de pantalla inválida: "${trimmed}". Usa el formato @Nombre:tipo (ej. @Login:screen o @Countries:component)`,
            severity: "error",
          });
        }
      }
    }

    // 3. If no screen has been declared yet, create a default @Main:screen
    if (!currentScreen) {
      currentScreen = {
        id: generateId("screen"),
        type: "screen",
        name: "Main",
        props: { name: "Main" },
        children: [],
        position: { line: 1, column: 1 },
      };
      screens.push(currentScreen);
      stack = [{ node: currentScreen, indent: -1 }];
    }

    // 4. Data block: data user
    if (trimmed.startsWith("data ")) {
      const dataMatch = trimmed.match(/^data\s+([a-zA-Z0-9_-]+)/);
      const dataName = dataMatch ? dataMatch[1] : "data";
      const dataNode: DataNode = {
        id: generateId("data"),
        type: "data",
        name: dataName,
        props: {},
        values: {},
        children: [],
        position: { line: lineNum, column: 1 },
      };
      dataNodes.push(dataNode);
      // We will parse key-value lines beneath it
      while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
        stack.pop();
      }
      stack.push({ node: dataNode, indent });
      continue;
    }

    // 5. Pop stack until we find the parent with strictly lower indent
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }
    const parent = stack[stack.length - 1].node;

    // 6. Check if line is an indented property assignment (e.g. `variant: tonal` or `icon: save` or `snackbar-duration: 400`)
    if (trimmed.includes(":") && !trimmed.startsWith("step ") && !trimmed.startsWith("if ") && !trimmed.startsWith("for ") && !trimmed.startsWith("split") && !trimmed.startsWith("left") && !trimmed.startsWith("right")) {
      const propMatch = trimmed.match(/^([a-zA-Z0-9_-]+)\s*:\s*(.+)$/);
      if (propMatch) {
        const key = propMatch[1].trim();
        const value = parseValue(propMatch[2].trim());

        if (parent.type === "data") {
          (parent as DataNode).values[key] = value;
          parent.lineEnd = Math.max(parent.lineEnd || lineNum, lineNum);
          continue;
        } else if (parent.type === "wizard" && key === "steps") {
          parent.props.totalSteps = Number(value) || 3;
          parent.lineEnd = Math.max(parent.lineEnd || lineNum, lineNum);
          continue;
        } else {
          // Add property to parent node (support both kebab-case and snake_case)
          parent.props[key] = value;
          if (key.includes("-")) {
            parent.props[key.replace(/-/g, "_")] = value;
          }
          if (key.includes("_")) {
            parent.props[key.replace(/_/g, "-")] = value;
          }
          parent.lineEnd = Math.max(parent.lineEnd || lineNum, lineNum);
          continue;
        }
      }
    }

    // 7. Parse component or control line
    // Special handling for table children (rows)
    let parsedNode: WispNode | null = null;
    if (parent.type === "table" && (trimmed.startsWith("row") || trimmed.startsWith("table-row") || trimmed.startsWith("tablerow") || trimmed.startsWith("tr") || trimmed.startsWith("[") || trimmed.startsWith("|"))) {
      parsedNode = parseTableRow(trimmed, lineNum);
      if (parsedNode) {
        parent.children.push(parsedNode);
        // Do not push table row to stack, so subsequent rows stay siblings under table
        continue;
      }
    }

    parsedNode = parseComponentLine(trimmed, lineNum, diagnostics, parent);
    if (!parsedNode) continue;

    // Special handling for Step nodes inside Wizard
    if (parsedNode.type === "step") {
      if (currentScreen.type === "wizard") {
        const stepIndex = (currentScreen.steps?.length || 0) + 1;
        const stepNode: StepNode = {
          ...(parsedNode as StepNode),
          index: stepIndex,
        };
        currentScreen.steps = currentScreen.steps || [];
        currentScreen.steps.push(stepNode);
        currentScreen.children.push(stepNode);

        stack.push({ node: stepNode, indent });
        continue;
      } else {
        diagnostics.push({
          line: lineNum,
          column: 1,
          message: `'step' solo puede usarse dentro de una pantalla tipo wizard (@Nombre:wizard)`,
          severity: "warning",
        });
      }
    }

    // Special handling for split layout slots: left / right
    if (parsedNode.type === "split") {
      parent.children.push(parsedNode);
      stack.push({ node: parsedNode, indent });
      continue;
    }

    if (parsedNode.type === "left" || parsedNode.type === "right") {
      let splitParent = parent;
      if (splitParent.type !== "split") {
        for (let s = stack.length - 1; s >= 0; s--) {
          if (stack[s].node.type === "split") {
            splitParent = stack[s].node;
            break;
          }
        }
      }
      if (splitParent && splitParent.type === "split") {
        // Remove from current parent if mistakenly attached elsewhere
        if (!splitParent.children.includes(parsedNode)) {
          splitParent.children.push(parsedNode);
        }
        stack.push({ node: parsedNode, indent });
        continue;
      }
    }

    // Attach to parent children
    parent.children.push(parsedNode);

    // If node can have children (layouts, cards, etc.), push to stack
    const containerTypes = [
      "card",
      "accordion",
      "row",
      "column",
      "grid",
      "sidebar",
      "container",
      "navbar",
      "topappbar",
      "appbar",
      "bottomnav",
      "navigationrail",
      "apprail",
      "navrail",
      "rail",
      "drawer",
      "navigationdrawer",
      "appdrawer",
      "navdrawer",
      "sidesheet",
      "sheet",
      "bottomsheet",
      "form",
      "dialog",
      "modal",
      "split",
      "left",
      "right",
      "if",
      "for",
      "step",
      "tabs",
      "tab",
      "panel",
      "tabitem",
      "table",
      "select",
      "autocomplete",
      "datepicker",
      "timepicker",
      "radio",
      "carousel",
      "menu",
      "dropdown",
      "dropdownmenu",
      "list",
      "tooltip",
      "richtooltip",
      "rich-tooltip",
    ];

    if (containerTypes.includes(parsedNode.type)) {
      stack.push({ node: parsedNode, indent });
    }
  }

  // Helper to compute line spans for node and all its children
  function computeNodeLineSpans(node: WispNode): { start: number; end: number } {
    let start = node.lineStart || node.position?.line || 1;
    let end = node.lineEnd || start;

    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        const childSpan = computeNodeLineSpans(child);
        start = Math.min(start, childSpan.start);
        end = Math.max(end, childSpan.end);
      }
    }

    node.lineStart = start;
    node.lineEnd = end;
    return { start, end };
  }

  // Calculate line spans for all screens and their child trees
  for (let s = 0; s < screens.length; s++) {
    const screen = screens[s];
    computeNodeLineSpans(screen);
    const nextScreenLine = s < screens.length - 1 ? (screens[s + 1].lineStart || screens[s + 1].position?.line) : undefined;
    if (nextScreenLine && nextScreenLine > 1) {
      screen.lineEnd = Math.max(screen.lineEnd || screen.lineStart || 1, nextScreenLine - 1);
    } else if (s === screens.length - 1) {
      screen.lineEnd = Math.max(screen.lineEnd || screen.lineStart || 1, lines.length);
    }
  }

  // 8. Resolve and expand reusable component references (@Countries:component used via `component @Countries` or `@Countries`)
  const componentMap = new Map<string, ScreenNode>();
  for (const screen of screens) {
    if (screen.type === "component") {
      componentMap.set(screen.name.toLowerCase(), screen);
    }
  }

  function cloneNodeWithOverrides(node: WispNode, overrides: Record<string, any>): WispNode {
    const clonedProps = { ...node.props };
    for (const [k, v] of Object.entries(overrides)) {
      if (k !== "id" && k !== "name" && k !== "component" && k !== "type") {
        clonedProps[k] = v;
      }
    }
    return {
      ...node,
      id: generateId(node.type),
      props: clonedProps,
      children: (node.children || []).map((c) => cloneNodeWithOverrides(c, overrides)),
    };
  }

  function resolveComponentsInTree(node: WispNode, visited: Set<string>) {
    if (!node.children) return;

    for (let c = 0; c < node.children.length; c++) {
      const child = node.children[c];
      if (child.type === "component" || child.type === "include" || child.type === "use") {
        const targetName = (
          child.props.id ||
          child.props.name ||
          child.props.value ||
          child.props.component ||
          ""
        )
          .toString()
          .replace(/^@/, "")
          .toLowerCase();

        const compDef = componentMap.get(targetName);
        if (compDef && !visited.has(targetName)) {
          const nextVisited = new Set(visited);
          nextVisited.add(targetName);

          const clonedChildren = compDef.children.map((n) => cloneNodeWithOverrides(n, child.props));
          child.children = clonedChildren;

          for (const nested of clonedChildren) {
            resolveComponentsInTree(nested, nextVisited);
          }
        } else if (!compDef && targetName) {
          diagnostics.push({
            line: child.position?.line || 1,
            column: 1,
            message: `Componente @${targetName} no encontrado. Decláralo con @${targetName}:component`,
            severity: "warning",
          });
        }
      } else {
        resolveComponentsInTree(child, visited);
      }
    }
  }

  for (const screen of screens) {
    resolveComponentsInTree(screen, new Set());
  }

  // Basic document diagnostics check
  if (screens.length === 0) {
    diagnostics.push({
      line: 1,
      column: 1,
      message: "No se encontraron pantallas definidas en el documento Wisp.",
      severity: "warning",
    });
  }

  return {
    screens,
    themes,
    data: dataNodes,
    rawCode: dslText,
    diagnostics,
    ast: screens,
  };
}

/**
 * Finds the most specific WispNode in an AST hierarchy whose line span [lineStart, lineEnd] covers lineNum.
 */
export function findNodeByLine(root: WispNode, lineNum: number): WispNode | null {
  const start = root.lineStart ?? root.position?.line ?? 0;
  const end = root.lineEnd ?? root.position?.line ?? 0;

  if (lineNum < start || lineNum > end) {
    return null;
  }

  // Look inside children for a more specific match
  if (root.children && root.children.length > 0) {
    for (const child of root.children) {
      const match = findNodeByLine(child, lineNum);
      if (match) return match;
    }

    // If lineNum matches exactly this container node's definition line, return it
    if (root.position?.line === lineNum) {
      return root;
    }

    // Top-level containers (screen, wizard, step, split) shouldn't be returned for empty lines between children
    const topLevelContainers = ["screen", "wizard", "step", "split"];
    if (topLevelContainers.includes(root.type)) {
      return null;
    }
  }

  return root;
}

/**
 * Finds which ScreenNode in the document contains the given line number.
 */
export function findScreenByLine(screens: ScreenNode[], lineNum: number): ScreenNode | null {
  for (const screen of screens) {
    const start = screen.lineStart ?? screen.position?.line ?? 1;
    const end = screen.lineEnd ?? 999999;
    if (lineNum >= start && lineNum <= end) {
      return screen;
    }
  }
  return null;
}

/**
 * Parses a table row line beneath a `table` container.
 * Supports:
 * - row ["#101", "Auth Service", "Activo", "Configurar"]
 * - table-row ["#101", "Auth Service", "Activo"]
 * - tablerow ["#101", "Auth Service", "Activo"]
 * - tr ["#101", "Auth Service", "Activo"]
 * - row "#101", "Auth Service", "Activo"
 * - ["#101", "Auth Service", "Activo"]
 * - | #101 | Auth Service | Activo |
 */
function parseTableRow(line: string, lineNum: number): WispNode {
  const node: WispNode = {
    id: generateId("row"),
    type: "row",
    props: { values: [], cells: [] },
    children: [],
    position: { line: lineNum, column: 1 },
    rawText: line,
  };

  // Case 1: Markdown pipe syntax | cell1 | cell2 | cell3 |
  if (line.startsWith("|") && line.endsWith("|")) {
    const rawCells = line
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim())
      .filter((c) => !/^:?-+:?$/.test(c)); // Ignore divider line like |---|---|
    node.props.values = rawCells;
    node.props.cells = rawCells;
    return node;
  }

  // Case 2: Array notation inside the line e.g. row ["A", "B", "C"] or ["A", "B", "C"]
  const arrayMatch = line.match(/\[\s*([\s\S]*?)\s*\]/);
  if (arrayMatch) {
    try {
      const parsedArr = parseValue(arrayMatch[0]);
      if (Array.isArray(parsedArr)) {
        node.props.values = parsedArr;
        node.props.cells = parsedArr;
        return node;
      }
    } catch (_) {}
  }

  // Case 3: Tokenized line with quoted or comma-separated strings
  const tokens = mergeKeyValueTokens(tokenizeLine(line));
  const values: any[] = [];
  const startIndex = ["row", "tablerow", "tr", "table-row"].includes(tokens[0]?.toLowerCase()) ? 1 : 0;

  for (let i = startIndex; i < tokens.length; i++) {
    const tok = tokens[i];
    if (tok.includes("=")) {
      const eqIdx = tok.indexOf("=");
      const k = tok.substring(0, eqIdx).trim();
      const v = parseValue(tok.substring(eqIdx + 1).trim());
      node.props[k] = v;
    } else {
      let cleanTok = tok.trim();
      if (cleanTok.endsWith(",")) cleanTok = cleanTok.slice(0, -1).trim();
      values.push(unquote(cleanTok));
    }
  }

  if (values.length > 0) {
    node.props.values = values;
    node.props.cells = values;
  }

  return node;
}

/**
 * Parses a single component line like:
 * button "Guardar" tonal icon=save goto=@Home
 * textfield correo label="Correo electrónico"
 * grid cols=3 gap=16
 */
function parseComponentLine(
  line: string,
  lineNum: number,
  diagnostics: WispDiagnostic[],
  parent?: WispNode
): WispNode | null {
  // Tokenize line respecting quotes and merging split key-value pairs (e.g. snackbar-duration = 400)
  const tokens = mergeKeyValueTokens(tokenizeLine(line));
  if (tokens.length === 0) return null;

  const rawType = tokens[0].toLowerCase();
  const node: WispNode = {
    id: generateId(rawType),
    type: rawType,
    props: {},
    children: [],
    position: { line: lineNum, column: 1 },
    rawText: line,
  };

  // Step definition: step "Nombre del paso"
  if (rawType === "step") {
    const title = tokens[1] ? unquote(tokens[1]) : "Paso";
    node.props.title = title;
    return node;
  }

  // Tab / Panel definition: tab "Nombre" | panel "Nombre" | tabitem "Nombre"
  if (rawType === "tab" || rawType === "panel" || rawType === "tabitem" || rawType === "tab-item") {
    node.type = rawType === "panel" ? "panel" : "tab";
    const title = tokens[1] ? unquote(tokens[1]) : "Pestaña";
    node.props.title = title;
    node.props.label = title;
    node.props.value = title;
    // Don't return early so properties like icon=home badge="3" active are parsed
  }

  // Control: if condition
  if (rawType === "if") {
    const condition = tokens.slice(1).join(" ");
    node.props.condition = condition;
    return node;
  }

  // Control: for item in items
  if (rawType === "for") {
    const item = tokens[1] || "item";
    const source = tokens[3] || tokens[2] || "items";
    node.props.item = item;
    node.props.source = source;
    return node;
  }

  // Component reference: component @Countries, component id=@Countries, include @Countries, use @Countries, or @Countries
  if (rawType === "component" || rawType === "include" || rawType === "use" || rawType.startsWith("@")) {
    node.type = "component";
    let target = "";
    if (rawType.startsWith("@")) {
      target = rawType;
    } else if (tokens[1] && !tokens[1].includes("=")) {
      target = unquote(tokens[1]);
    }
    if (target) {
      node.props.id = target;
      node.props.name = target.replace(/^@/, "");
      node.props.component = target.replace(/^@/, "");
    }
  }

  // Process remaining tokens
  let positionalIndex = 0;

  for (let i = 1; i < tokens.length; i++) {
    const token = tokens[i];

    // Key=Value token e.g. icon=save, cols=3, goto=@Home, label="Email", snackbar-duration=400
    if (token.includes("=")) {
      const eqIdx = token.indexOf("=");
      const key = token.substring(0, eqIdx).trim();
      const valStr = token.substring(eqIdx + 1).trim();
      const parsedVal = parseValue(valStr);
      node.props[key] = parsedVal;
      if (key.includes("-")) {
        node.props[key.replace(/-/g, "_")] = parsedVal;
      }
      if (key.includes("_")) {
        node.props[key.replace(/_/g, "-")] = parsedVal;
      }
      continue;
    }

    // Positional tokens depending on component type
    if (rawType === "text" || rawType === "alert") {
      if (positionalIndex === 0) {
        node.props.value = unquote(token);
      } else if (["display", "headline", "title", "body", "label", "caption"].includes(token.toLowerCase())) {
        node.props.variant = token.toLowerCase();
      } else if (["primary", "secondary", "tertiary", "error", "onSurface", "outline"].includes(token)) {
        node.props.color = token;
      }
      positionalIndex++;
    } else if (rawType === "button") {
      if (positionalIndex === 0) {
        node.props.label = unquote(token);
      } else if (["filled", "tonal", "outlined", "text", "elevated", "fab"].includes(token.toLowerCase())) {
        node.props.variant = token.toLowerCase();
      }
      positionalIndex++;
    } else if (rawType === "textfield" || rawType === "textarea" || rawType === "switch" || rawType === "checkbox" || rawType === "slider" || rawType === "select" || rawType === "autocomplete" || rawType === "datepicker" || rawType === "searchbar" || rawType === "radio") {
      if (positionalIndex === 0) {
        node.props.name = unquote(token);
        if (!node.props.label) {
          node.props.label = capitalize(unquote(token).replace(/[_-]/g, " "));
        }
      }
      positionalIndex++;
    } else if (rawType === "option") {
      if (positionalIndex === 0) {
        const val = unquote(token);
        node.props.value = val;
        node.props.label = val;
      }
      positionalIndex++;
    } else if (rawType === "chip") {
      if (positionalIndex === 0) {
        node.props.label = unquote(token);
      } else if (["assist", "filter", "input", "suggestion"].includes(token.toLowerCase())) {
        node.props.variant = token.toLowerCase();
      }
      positionalIndex++;
    } else if (rawType === "listitem") {
      if (positionalIndex === 0) {
        node.props.label = unquote(token);
      }
      positionalIndex++;
    } else if (rawType === "icon") {
      if (positionalIndex === 0) {
        node.props.name = unquote(token);
      }
      positionalIndex++;
    } else if (rawType === "badge") {
      if (positionalIndex === 0) {
        node.props.text = unquote(token);
      }
      positionalIndex++;
    } else if (rawType === "card") {
      if (["elevated", "filled", "outlined"].includes(token.toLowerCase())) {
        node.props.variant = token.toLowerCase();
      }
    } else if (rawType === "accordion") {
      if (positionalIndex === 0) {
        node.props.title = unquote(token);
        node.props.label = unquote(token);
      }
      positionalIndex++;
    } else if (rawType === "fab") {
      if (positionalIndex === 0) {
        node.props.label = unquote(token);
      } else if (["primary", "secondary", "tertiary", "surface"].includes(token.toLowerCase())) {
        node.props.variant = token.toLowerCase();
      }
      positionalIndex++;
    } else if (rawType === "snackbar") {
      if (positionalIndex === 0) {
        node.props.message = unquote(token);
        node.props.value = unquote(token);
      } else if (["info", "success", "warning", "error"].includes(token.toLowerCase())) {
        node.props.type = token.toLowerCase();
      }
      positionalIndex++;
    } else if (rawType === "breadcrumbs") {
      if (positionalIndex === 0) {
        node.props.value = unquote(token);
      }
      positionalIndex++;
    } else if (rawType === "rating") {
      if (positionalIndex === 0) {
        node.props.name = unquote(token);
        if (!node.props.label) {
          node.props.label = capitalize(unquote(token).replace(/[_-]/g, " "));
        }
      }
      positionalIndex++;
    } else if (rawType === "loading" || rawType === "spinner" || rawType === "circularprogress" || rawType === "linearprogress") {
      if (positionalIndex === 0) {
        if (!isNaN(Number(unquote(token)))) {
          node.props.value = Number(unquote(token));
        } else {
          node.props.message = unquote(token);
          node.props.label = unquote(token);
        }
      } else if (["circular", "linear", "spinner"].includes(token.toLowerCase())) {
        node.props.variant = token.toLowerCase();
      } else if (["sm", "md", "lg"].includes(token.toLowerCase())) {
        node.props.size = token.toLowerCase();
      }
      positionalIndex++;
    } else if (rawType === "navigationrail" || rawType === "apprail" || rawType === "navrail" || rawType === "rail") {
      if (positionalIndex === 0) {
        node.props.title = unquote(token);
      }
      positionalIndex++;
    } else if (rawType === "drawer" || rawType === "navigationdrawer" || rawType === "appdrawer" || rawType === "navdrawer") {
      if (positionalIndex === 0) {
        node.props.title = unquote(token);
      } else if (["standard", "modal", "dismissible"].includes(token.toLowerCase())) {
        node.props.variant = token.toLowerCase();
      }
      positionalIndex++;
    } else if (rawType === "sidesheet" || rawType === "side-sheet") {
      if (positionalIndex === 0) {
        node.props.title = unquote(token);
      } else if (["standard", "modal"].includes(token.toLowerCase())) {
        node.props.variant = token.toLowerCase();
      }
      positionalIndex++;
    } else if (rawType === "bottomsheet" || rawType === "sheet") {
      if (positionalIndex === 0) {
        node.props.title = unquote(token);
      }
      positionalIndex++;
    } else if (rawType === "iconbutton" || rawType === "icon-button") {
      if (positionalIndex === 0) {
        node.props.icon = unquote(token);
        node.props.name = unquote(token);
      } else if (["standard", "filled", "tonal", "outlined"].includes(token.toLowerCase())) {
        node.props.variant = token.toLowerCase();
      }
      positionalIndex++;
    } else if (rawType === "timepicker" || rawType === "time-picker") {
      if (positionalIndex === 0) {
        node.props.name = unquote(token);
        if (!node.props.label) {
          node.props.label = capitalize(unquote(token).replace(/[_-]/g, " "));
        }
      }
      positionalIndex++;
    } else if (rawType === "carousel") {
      if (["multi-browse", "hero", "uncontained", "multibrowse"].includes(token.toLowerCase())) {
        node.props.variant = token.toLowerCase();
      }
    } else if (rawType === "tooltip" || rawType === "richtooltip" || rawType === "rich-tooltip") {
      if (positionalIndex === 0) {
        node.props.text = unquote(token);
        node.props.message = unquote(token);
      }
      positionalIndex++;
    } else if (rawType === "menu" || rawType === "dropdown" || rawType === "dropdownmenu") {
      if (positionalIndex === 0) {
        node.props.label = unquote(token);
      }
      positionalIndex++;
    } else if (rawType === "section") {
      if (positionalIndex === 0) {
        node.props.title = unquote(token);
      }
      positionalIndex++;
    } else if (
      rawType === "draweritem" ||
      rawType === "menuitem" ||
      rawType === "navitem" ||
      rawType === "railitem" ||
      rawType === "destination" ||
      rawType === "rail-item" ||
      rawType === "nav-item" ||
      rawType === "panel" ||
      rawType === "tab" ||
      rawType === "tabitem" ||
      rawType === "tab-item"
    ) {
      if (positionalIndex === 0) {
        node.props.label = unquote(token);
        node.props.title = unquote(token);
        node.props.value = unquote(token);
      } else if (token.toLowerCase() === "active" || token.toLowerCase() === "selected") {
        node.props.active = true;
      }
      positionalIndex++;
    } else {
      // General positional flag or string
      if (token.toLowerCase() === "active" || token.toLowerCase() === "selected") {
        node.props.active = true;
      } else if (token.toLowerCase() === "expanded") {
        node.props.expanded = true;
      } else if (positionalIndex === 0 && !token.includes("=")) {
        node.props.value = unquote(token);
      }
      positionalIndex++;
    }
  }

  // Apply default props for Material 3 standard behavior
  applyDefaults(node);

  return node;
}

function applyDefaults(node: WispNode) {
  switch (node.type) {
    case "loading":
    case "spinner":
    case "circularprogress":
    case "linearprogress":
      node.props.variant = node.props.variant || (node.type === "linearprogress" ? "linear" : "circular");
      node.props.size = node.props.size || "md";
      break;
    case "navigationrail":
    case "apprail":
    case "navrail":
    case "rail":
      node.props.variant = node.props.variant || "standard";
      break;
    case "drawer":
    case "navigationdrawer":
    case "appdrawer":
    case "navdrawer":
      node.props.variant = node.props.variant || "standard";
      break;
    case "sidesheet":
    case "side-sheet":
      node.props.variant = node.props.variant || "standard";
      node.props.position = node.props.position || "right";
      break;
    case "carousel":
      node.props.variant = node.props.variant || "multi-browse";
      break;
    case "iconbutton":
    case "icon-button":
      node.props.variant = node.props.variant || "standard";
      break;
    case "table": {
      const cols = node.props.columns || node.props.headers || node.props.cols;
      let rawColArr: string[] = [];
      if (cols) {
        if (Array.isArray(cols)) {
          rawColArr = cols.map(String);
        } else if (typeof cols === "string") {
          rawColArr = cols.split(",").map((s: string) => s.trim().replace(/^["']|["']$/g, ""));
        }
      } else {
        rawColArr = ["ID:code", "Nombre", "Estado:status", "Acciones:action"];
      }

      // Check for explicit types array prop: types=["code", "avatar", "status", "action"]
      const explicitTypes: string[] = Array.isArray(node.props.types)
        ? node.props.types.map(String)
        : typeof node.props.types === "string"
        ? node.props.types.split(",").map((s: string) => s.trim().replace(/^["']|["']$/g, ""))
        : [];

      const cleanHeaders: string[] = [];
      const columnDefs: { name: string; type: string }[] = [];

      rawColArr.forEach((rawCol, idx) => {
        let colName = rawCol;
        let colType = explicitTypes[idx] || "text";

        // Parse colon syntax: "Nombre:tipo" e.g. "Usuario:avatar", "ID:code", "Estado:status", "Acciones:dropdown"
        if (rawCol.includes(":")) {
          const colonIdx = rawCol.lastIndexOf(":");
          const namePart = rawCol.substring(0, colonIdx).trim();
          const typePart = rawCol.substring(colonIdx + 1).trim().toLowerCase();
          
          if (namePart.length > 0 && typePart.length > 0) {
            colName = namePart;
            colType = typePart;
          }
        }

        cleanHeaders.push(colName);
        columnDefs.push({ name: colName, type: colType });
      });

      node.props.columns = cleanHeaders;
      node.props.headers = cleanHeaders;
      node.props.columnDefs = columnDefs;

      if (node.props.rows || node.props.data) {
        const rows = node.props.rows || node.props.data;
        node.props.rows = rows;
        node.props.data = rows;
      }
      break;
    }
    case "tabs": {
      const tabItems = node.props.tabs || node.props.items || node.props.options;
      if (tabItems) {
        let itemArr: string[] = [];
        if (Array.isArray(tabItems)) {
          itemArr = tabItems.map(String);
        } else if (typeof tabItems === "string") {
          itemArr = tabItems.split(",").map((s: string) => s.trim().replace(/^["']|["']$/g, ""));
        }
        node.props.tabs = itemArr;
        node.props.items = itemArr;
      }
      break;
    }
    case "button":
      node.props.variant = node.props.variant || "filled";
      break;
    case "card":
      node.props.variant = node.props.variant || "elevated";
      break;
    case "accordion":
      node.props.title = node.props.title || node.props.label || node.props.value || "Sección";
      node.props.expanded = node.props.expanded === true || node.props.expanded === "true";
      break;
    case "fab":
      node.props.variant = node.props.variant || "primary";
      node.props.icon = node.props.icon || "plus";
      node.props.extended =
        node.props.extended !== undefined
          ? node.props.extended === true || node.props.extended === "true"
          : Boolean(node.props.label);
      break;
    case "snackbar":
    case "toast":
      node.props.message = node.props.message || node.props.value || "Notificación de acción";
      node.props.type = node.props.type || "info";
      break;
    case "breadcrumbs":
      if (!node.props.items) {
        node.props.items = ["Inicio", "Sección", "Detalle"];
      } else if (typeof node.props.items === "string") {
        node.props.items = node.props.items.split(",").map((s: string) => s.trim());
      }
      break;
    case "rating":
      node.props.max = Number(node.props.max) || 5;
      node.props.value = Number(node.props.value) || 0;
      node.props.readonly = node.props.readonly === true || node.props.readonly === "true";
      break;
    case "textfield":
      node.props.variant = node.props.variant || "outlined";
      break;
    case "text":
      node.props.variant = node.props.variant || "body";
      break;
    case "chip":
      node.props.variant = node.props.variant || "assist";
      break;
    case "grid":
      node.props.cols = Number(node.props.cols) || 2;
      node.props.gap = Number(node.props.gap) || 16;
      break;
    case "row":
      node.props.spacing = Number(node.props.spacing) || 12;
      node.props.align = node.props.align || "center";
      break;
    case "column":
      node.props.spacing = Number(node.props.spacing) || 16;
      break;
    case "slider":
      node.props.min = Number(node.props.min) || 0;
      node.props.max = Number(node.props.max) || 100;
      node.props.value = Number(node.props.value) || 50;
      break;
  }
}

/**
 * Tokenizes a line into arguments, keeping quoted strings together.
 */
function tokenizeLine(line: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let inQuotes = false;
  let quoteChar = "";
  let bracketDepth = 0;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if ((char === '"' || char === "'") && (!inQuotes || char === quoteChar)) {
      if (inQuotes) {
        inQuotes = false;
        quoteChar = "";
        current += char;
      } else {
        inQuotes = true;
        quoteChar = char;
        current += char;
      }
      continue;
    }

    if (inQuotes) {
      current += char;
      continue;
    }

    if (char === "[" || char === "{" || char === "(") {
      bracketDepth++;
      current += char;
      continue;
    }

    if (char === "]" || char === "}" || char === ")") {
      bracketDepth = Math.max(0, bracketDepth - 1);
      current += char;
      continue;
    }

    if (/\s/.test(char) && bracketDepth === 0) {
      if (current.length > 0) {
        tokens.push(current);
        current = "";
      }
    } else {
      current += char;
    }
  }

  if (current.length > 0) {
    tokens.push(current);
  }

  return tokens;
}

/**
 * Merges split key-value tokens like ["snackbar-duration", "=", "400"] into ["snackbar-duration=400"],
 * tolerating arbitrary spaces around '=' outside quotes.
 */
function mergeKeyValueTokens(rawTokens: string[]): string[] {
  const merged: string[] = [];
  for (let i = 0; i < rawTokens.length; i++) {
    const tok = rawTokens[i];
    if (tok === "=" && merged.length > 0 && i + 1 < rawTokens.length) {
      const prev = merged.pop()!;
      const next = rawTokens[++i];
      merged.push(`${prev}=${next}`);
    } else if (tok.endsWith("=") && tok.length > 1 && i + 1 < rawTokens.length) {
      const next = rawTokens[++i];
      merged.push(`${tok}${next}`);
    } else if (tok.startsWith("=") && tok.length > 1 && merged.length > 0) {
      const prev = merged.pop()!;
      merged.push(`${prev}${tok}`);
    } else {
      merged.push(tok);
    }
  }
  return merged;
}

function unquote(str: string): string {
  if (
    (str.startsWith('"') && str.endsWith('"')) ||
    (str.startsWith("'") && str.endsWith("'"))
  ) {
    return str.slice(1, -1);
  }
  return str;
}

function parseValue(val: string): any {
  val = unquote(val.trim());

  if (val === "true") return true;
  if (val === "false") return false;
  if (val === "null") return null;

  // JSON Array parsing e.g. ["A", "B"]
  if (val.startsWith("[") && val.endsWith("]")) {
    try {
      // Replace single quotes with double quotes for valid JSON
      const jsonValid = val.replace(/'/g, '"');
      return JSON.parse(jsonValid);
    } catch {
      return val;
    }
  }

  // Numeric check
  if (/^-?\d+(\.\d+)?$/.test(val)) {
    return Number(val);
  }

  return val;
}

function capitalize(s: string): string {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}
