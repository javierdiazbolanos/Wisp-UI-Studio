import React from "react";

// Token definition for Wisp DSL Syntax Highlighting
export interface HighlightToken {
  type:
    | "screen-decl"
    | "component"
    | "layout"
    | "control"
    | "modifier"
    | "navigation"
    | "attr-name"
    | "string"
    | "number"
    | "boolean"
    | "comment"
    | "symbol"
    | "text";
  value: string;
}

const COMPONENT_KEYWORDS = new Set([
  "component", "include", "use",
  "card", "text", "button", "textfield", "textarea", "select", "option", "autocomplete", "datepicker", "timepicker", "time-picker",
  "segmentedbutton", "chip", "filterchip", "switch", "checkbox", "slider",
  "list", "listitem", "list-item", "listgroup", "avatar", "badge", "icon", "image", "progress",
  "loading", "spinner", "circularprogress", "linearprogress", "wavyprogress", "wavy-progress", "progressindicator",
  "splitbutton", "split-button", "split-btn", "buttongroup", "button-group", "connectedbuttons", "connected-buttons",
  "fabmenu", "fab-menu", "speeddial", "fabitem", "fab-item",
  "metric", "stat", "divider", "spacer", "alert", "tabs", "tab", "panel", "tabitem", "table",
  "radio", "fab", "accordion", "snackbar", "toast", "breadcrumbs", "rating", "searchbar", "search", "appbar", "topappbar", "navbar", "topbar", "bottomnav", "bottombar", "navitem",
  "navigationrail", "apprail", "navrail", "rail", "railitem", "rail-item", "destination",
  "drawer", "navigationdrawer", "appdrawer", "navdrawer", "draweritem",
  "sidesheet", "side-sheet", "bottomsheet", "bottom-sheet",
  "carousel", "iconbutton", "icon-button", "menu", "dropdown", "dropdownmenu", "menuitem", "menu-item", "section",
  "tooltip", "richtooltip", "rich-tooltip", "tag"
]);

const LAYOUT_KEYWORDS = new Set([
  "split", "left", "right", "sidebar", "container", "grid",
  "row", "column", "steps", "step", "data", "header", "footer", "content"
]);

const CONTROL_KEYWORDS = new Set(["if", "else", "for", "in"]);

const MODIFIER_KEYWORDS = new Set([
  "filled", "outlined", "elevated", "tonal", "text",
  "title", "body", "headline", "caption", "label", "display",
  "large", "medium", "small", "compact", "standard",
  "horizontal", "vertical", "center", "left", "right",
  "primary", "secondary", "tertiary", "surface", "error", "success", "warning", "info"
]);

export function highlightWispLine(line: string): React.ReactNode[] {
  // If line is empty
  if (!line || line.length === 0) {
    return [];
  }

  // Check for whole line comment (both // and #)
  const trimmed = line.trim();
  if (trimmed.startsWith("//") || trimmed.startsWith("#")) {
    return [
      <span key="comment" className="text-neutral-500 italic font-mono">
        {line}
      </span>,
    ];
  }

  const nodes: React.ReactNode[] = [];
  let index = 0;
  let keyIdx = 0;

  // Preserve leading whitespace
  const leadingWsMatch = line.match(/^(\s+)/);
  if (leadingWsMatch) {
    nodes.push(<span key={`ws-${keyIdx++}`}>{leadingWsMatch[1]}</span>);
    index += leadingWsMatch[1].length;
  }

  // Regex pattern for tokenizer:
  // Matches: Comments (// or #), Strings ("..."), Screen Decls (@Name:type), Attr Names (key=), Nav targets (@Screen), Keywords, Numbers, Symbols
  const tokenRegex =
    /(\/\/[^\n]*|#[^\n]*)|("[^"\\]*(?:\\.[^"\\]*)*")|(@[a-zA-Z0-9_-]+(?::[a-zA-Z0-9_-]+)?(?:\([^)]*\))?)|([a-zA-Z0-9_-]+(?==))|([a-zA-Z0-9_-]+)|([0-9]+(?:\.[0-9]+)?%?)|(=|:|,|\(|\)|\+|-|\/|\*)|(\s+)|([^\s\w"@=:,\(\)]+)/g;

  tokenRegex.lastIndex = index;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(line)) !== null) {
    const [
      full,
      comment,
      str,
      screenOrRef,
      attrName,
      ident,
      numberVal,
      symbol,
      ws,
      other,
    ] = match;

    if (comment) {
      nodes.push(
        <span key={`c-${keyIdx++}`} className="text-neutral-500 italic">
          {comment}
        </span>
      );
    } else if (str) {
      nodes.push(
        <span key={`s-${keyIdx++}`} className="text-emerald-400 font-medium">
          {str}
        </span>
      );
    } else if (screenOrRef) {
      if (screenOrRef.includes(":")) {
        // Screen declaration (@Login:screen, @NuevoWizard:wizard)
        const parts = screenOrRef.split(":");
        nodes.push(
          <span key={`sc-${keyIdx++}`} className="font-bold">
            <span className="text-fuchsia-400 font-bold">{parts[0]}</span>
            <span className="text-neutral-400">:</span>
            <span className="text-purple-300 font-semibold">{parts[1]}</span>
          </span>
        );
      } else {
        // Target screen navigation (@Home, @NuevoWizard(step=2))
        nodes.push(
          <span
            key={`sr-${keyIdx++}`}
            className="text-amber-300 font-bold"
          >
            {screenOrRef}
          </span>
        );
      }
    } else if (attrName) {
      nodes.push(
        <span key={`attr-${keyIdx++}`} className="text-sky-300 font-medium">
          {attrName}
        </span>
      );
    } else if (ident) {
      const lower = ident.toLowerCase();
      if (COMPONENT_KEYWORDS.has(lower)) {
        nodes.push(
          <span
            key={`cmp-${keyIdx++}`}
            className="text-cyan-300 font-bold"
          >
            {ident}
          </span>
        );
      } else if (LAYOUT_KEYWORDS.has(lower)) {
        nodes.push(
          <span
            key={`lay-${keyIdx++}`}
            className="text-indigo-300 font-bold"
          >
            {ident}
          </span>
        );
      } else if (MODIFIER_KEYWORDS.has(lower)) {
        nodes.push(
          <span
            key={`mod-${keyIdx++}`}
            className="text-teal-300 font-medium italic"
          >
            {ident}
          </span>
        );
      } else if (CONTROL_KEYWORDS.has(lower)) {
        nodes.push(
          <span
            key={`ctrl-${keyIdx++}`}
            className="text-orange-400 font-semibold"
          >
            {ident}
          </span>
        );
      } else if (ident === "true" || ident === "false") {
        nodes.push(
          <span
            key={`bool-${keyIdx++}`}
            className="text-rose-400 font-semibold"
          >
            {ident}
          </span>
        );
      } else {
        nodes.push(
          <span key={`id-${keyIdx++}`} className="text-neutral-200">
            {ident}
          </span>
        );
      }
    } else if (numberVal) {
      nodes.push(
        <span key={`num-${keyIdx++}`} className="text-pink-400 font-medium">
          {numberVal}
        </span>
      );
    } else if (symbol) {
      nodes.push(
        <span key={`sym-${keyIdx++}`} className="text-neutral-400">
          {symbol}
        </span>
      );
    } else if (ws) {
      nodes.push(<span key={`ws-${keyIdx++}`}>{ws}</span>);
    } else if (other) {
      nodes.push(
        <span key={`oth-${keyIdx++}`} className="text-neutral-300">
          {other}
        </span>
      );
    }
  }

  return nodes;
}
