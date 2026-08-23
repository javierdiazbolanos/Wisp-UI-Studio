import type { Monaco } from "@monaco-editor/react";
import { getWispCompletions } from "./completions";
import { getWispHoverDoc } from "./docs";

export const WISP_LANGUAGE_ID = "wisp";

export function registerWispLanguage(monacoInstance: Monaco) {
  // Check if already registered
  const languages = monacoInstance.languages.getLanguages();
  if (languages.some((lang: { id: string }) => lang.id === WISP_LANGUAGE_ID)) {
    return;
  }

  // Register Wisp language
  monacoInstance.languages.register({
    id: WISP_LANGUAGE_ID,
    extensions: [".wdsl", ".wdl", ".wisp", ".dsl"],
    aliases: ["WDSL", "wdsl", "WDL", "wdl", "Wisp", "wisp", "WispDSL"],
    mimetypes: ["text/x-wisp", "text/x-wdsl"],
  });

  // Register Monarch Tokenizer for Highlighting
  monacoInstance.languages.setMonarchTokensProvider(WISP_LANGUAGE_ID, {
    defaultToken: "",
    tokenPostfix: ".wisp",

    keywords: [
      "screen", "wizard", "dialog", "sheet", "modal", "toast", "component", "include", "use",
      "drawer", "navigationdrawer", "appdrawer", "navdrawer", "draweritem",
      "sidesheet", "bottomsheet", "navigationrail", "apprail", "navrail", "rail", "railitem", "rail-item", "destination",
      "loading", "spinner", "circularprogress", "linearprogress", "wavyprogress", "wavy-progress", "progressindicator",
      "splitbutton", "split-button", "split-btn", "buttongroup", "button-group", "connectedbuttons", "connected-buttons",
      "fabmenu", "fab-menu", "speeddial", "fabitem", "fab-item",
      "tooltip", "richtooltip", "carousel",
      "iconbutton", "timepicker", "menu", "dropdown", "dropdownmenu", "menuitem", "section", "list",
      "button", "textfield", "textarea", "searchbar", "search", "card", "text",
      "select", "option", "autocomplete", "datepicker", "radio",
      "switch", "checkbox", "slider",
      "chip", "filterchip", "segmentedbutton", "listitem", "avatar", "badge",
      "icon", "image", "progress", "metric", "stat", "alert",
      "divider", "spacer", "row", "column", "grid", "split", "sidebar", "container",
      "tabs", "tab", "panel", "table", "appbar", "bottomnav", "navitem", "fab",
      "accordion", "snackbar", "breadcrumbs", "rating",
      "step", "data", "left", "right"
    ],

    modifiers: [
      "filled", "outlined", "tonal", "elevated", "text",
      "title", "headline", "display", "body", "label", "caption",
      "active", "checked", "selected", "striped", "hover", "dismissible",
      "indeterminate", "interactive", "bold", "expressive", "rosette", "harmonic", "continuous"
    ],

    typeKeywords: [
      "primary", "secondary", "tertiary", "surface", "error", "success", "warning", "info", "muted",
      "center", "left", "right", "between", "around", "evenly",
      "linear", "circular", "material3", "ios", "compact", "standard", "modal"
    ],

    tokenizer: {
      root: [
        // Comments
        [/#.*$/, "comment"],
        [/\/\/.*$/, "comment"],

        // Screen / Container declarations (@Name:type)
        [/(@[a-zA-Z0-9_-]+)(:)([a-zA-Z0-9_-]+)/, ["type.identifier", "delimiter", "keyword.type"]],

        // Navigation links (@Name or @Name(step=N))
        [/@[a-zA-Z0-9_-]+/, "type.identifier"],

        // Strings
        [/"([^"\\]|\\.)*"/, "string"],
        [/'([^'\\]|\\.)*'/, "string"],

        // Property assignments (key=val or key = val or key="val")
        [/([a-zA-Z0-9_-]+)(\s*)(=)/, ["attribute.name", "white", "delimiter"]],

        // Numbers & Ratios (e.g. 16/9, 100, 3.14)
        [/\b\d+(?:\/\d+)?\b/, "number"],

        // Keywords & Identifiers
        [
          /[a-zA-Z_][\w-]*/,
          {
            cases: {
              "@keywords": "keyword",
              "@modifiers": "keyword.modifier",
              "@typeKeywords": "type",
              "@default": "identifier",
            },
          },
        ],

        // Delimiters and brackets
        [/[{}[\]()]/, "@brackets"],
        [/[:,]/, "delimiter"],

        // Whitespace
        { include: "@whitespace" },
      ],

      whitespace: [
        [/[ \t\r\n]+/, "white"],
      ],
    },
  });

  // Language configuration (comments, brackets, auto-closing quotes)
  monacoInstance.languages.setLanguageConfiguration(WISP_LANGUAGE_ID, {
    comments: {
      lineComment: "#",
    },
    brackets: [
      ["{", "}"],
      ["[", "]"],
      ["(", ")"],
    ],
    autoClosingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: '"', close: '"', notIn: ["string"] },
      { open: "'", close: "'", notIn: ["string", "comment"] },
    ],
    surroundingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
    ],
    folding: {
      markers: {
        start: new RegExp("^\\s*(@[a-zA-Z0-9_-]+:|card|accordion|wizard|dialog|sheet|split|bottomnav)"),
        end: new RegExp("^\\s*$"),
      },
    },
  });

  // Intelligent Contextual Completion Provider
  monacoInstance.languages.registerCompletionItemProvider(WISP_LANGUAGE_ID, {
    triggerCharacters: ["@", " ", "=", ":", '"', "-"],
    provideCompletionItems: (model: any, position: any) => {
      const lineContent = model.getLineContent(position.lineNumber);
      const textUntilPosition = lineContent.substring(0, position.column - 1);
      const fullCode = model.getValue();

      // Extract all declared screen names from the document
      const screenMatches: string[] = fullCode.match(/@([a-zA-Z0-9_-]+):/g) || [];
      const screenNames: string[] = Array.from<string>(
        new Set(screenMatches.map((m: string) => m.replace("@", "").replace(":", "")))
      );

      const result = getWispCompletions(textUntilPosition, screenNames);

      // Calculate the exact replacement range from getWispCompletions
      // so that multi-character triggers like `goto=@`, `icon=`, `snackbar-duration=`
      // replace the exact token rather than inserting after Monaco's default word boundary!
      const textAfterPosition = lineContent.substring(position.column - 1);
      const afterMatch = textAfterPosition.match(/^([@#\w\-:=]+)/);
      const afterLength = afterMatch ? afterMatch[1].length : 0;

      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: result.replaceRange.start + 1,
        endColumn: position.column + afterLength,
      };

      const suggestions = result.items.map((item, index) => {
        let kind = monacoInstance.languages.CompletionItemKind.Keyword;
        if (item.kind === "screen") {
          kind = monacoInstance.languages.CompletionItemKind.Class;
        } else if (item.kind === "parameter") {
          kind = monacoInstance.languages.CompletionItemKind.Property;
        } else if (item.kind === "modifier") {
          kind = monacoInstance.languages.CompletionItemKind.EnumMember;
        } else if (item.kind === "icon") {
          kind = monacoInstance.languages.CompletionItemKind.Value;
        } else if (item.kind === "snippet") {
          kind = monacoInstance.languages.CompletionItemKind.Snippet;
        }

        const docMarkdown = [
          `**${item.detail}**`,
          "",
          item.documentation,
          item.example ? `\n\`\`\`wisp\n${item.example}\n\`\`\`` : "",
        ]
          .filter(Boolean)
          .join("\n");

        return {
          label: item.label,
          kind,
          detail: item.detail,
          documentation: {
            value: docMarkdown,
          },
          insertText: item.insertText,
          insertTextRules:
            item.insertText.includes("$") || item.kind === "snippet"
              ? monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet
              : undefined,
          sortText: String(index).padStart(4, "0"),
          range,
        };
      });

      return {
        suggestions,
      };
    },
  });

  // VS Code-style Hover Provider for Wisp DSL elements, modifiers, and parameters
  monacoInstance.languages.registerHoverProvider(WISP_LANGUAGE_ID, {
    provideHover: (model: any, position: any) => {
      const lineContent = model.getLineContent(position.lineNumber);
      if (!lineContent || lineContent.trim().length === 0) return null;

      // Ignore comment lines
      const trimmed = lineContent.trim();
      if (trimmed.startsWith("#") || trimmed.startsWith("//")) return null;

      // Extract the word / token at current mouse position
      const wordAtPosition = model.getWordAtPosition(position);

      // Check if mouse is hovering an @Screen declaration or reference
      let hoverTarget = wordAtPosition ? wordAtPosition.word : "";
      const col = position.column;

      // Expand to include leading '@' if right before word
      if (col > 1 && lineContent.charAt(col - 2) === "@") {
        hoverTarget = "@" + hoverTarget;
      } else if (col <= lineContent.length && lineContent.charAt(col - 1) === "@") {
        hoverTarget = "@" + (wordAtPosition ? wordAtPosition.word : "");
      }

      // Check if hovering a parameter key right before '=' (e.g. `spacing=`, `label=`, `cols=`)
      const textAroundCursor = lineContent.substring(Math.max(0, col - 25), Math.min(lineContent.length, col + 25));
      const paramMatch = textAroundCursor.match(/([a-zA-Z0-9_-]+)=/);
      if (paramMatch && (hoverTarget === paramMatch[1] || hoverTarget.startsWith(paramMatch[1]))) {
        hoverTarget = paramMatch[1];
      }

      // Check if hovering a column type in table (e.g. `ID:code`, `Usuario:avatar`, `:progress`)
      if (lineContent.includes("columns=") || lineContent.includes("table")) {
        const typeMatch = textAroundCursor.match(/:([a-zA-Z]+)/);
        if (typeMatch && (hoverTarget === typeMatch[1] || hoverTarget.endsWith(typeMatch[1]))) {
          hoverTarget = typeMatch[1];
        }
      }

      if (!hoverTarget) return null;

      const doc = getWispHoverDoc(hoverTarget, lineContent);
      if (!doc) return null;

      let range = undefined;
      if (wordAtPosition) {
        range = new monacoInstance.Range(
          position.lineNumber,
          wordAtPosition.startColumn,
          position.lineNumber,
          wordAtPosition.endColumn
        );
      }

      return {
        range,
        contents: [
          {
            value: doc.markdown,
            isTrusted: true,
          },
        ],
      };
    },
  });

  // 1. Monokai Dark Theme (Default)
  monacoInstance.editor.defineTheme("monokai-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "", background: "272822", foreground: "F8F8F2" },
      { token: "comment", foreground: "75715E", fontStyle: "italic" },
      { token: "type.identifier", foreground: "66D9EF", fontStyle: "bold" },
      { token: "keyword.type", foreground: "F92672", fontStyle: "bold" },
      { token: "keyword", foreground: "F92672", fontStyle: "bold" },
      { token: "keyword.modifier", foreground: "A6E22E" },
      { token: "attribute.name", foreground: "FD971F" },
      { token: "string", foreground: "E6DB74" },
      { token: "number", foreground: "AE81FF" },
      { token: "type", foreground: "66D9EF" },
      { token: "delimiter", foreground: "F8F8F2" },
    ],
    colors: {
      "editor.background": "#272822",
      "editor.foreground": "#F8F8F2",
      "editor.lineHighlightBackground": "#3E3D3288",
      "editor.lineHighlightBorder": "#49483E",
      "editorCursor.foreground": "#F8F8F0",
      "editorWhitespace.foreground": "#464741",
      "editorIndentGuide.background": "#3B3A32",
      "editorIndentGuide.activeBackground": "#75715E",
      "editor.selectionBackground": "#49483E",
      "editor.inactiveSelectionBackground": "#37383188",
      "editorLineNumber.foreground": "#75715E",
      "editorLineNumber.activeForeground": "#C2C1B8",
      "editorGutter.background": "#272822",
      "editorWidget.background": "#1E1F1C",
      "editorWidget.border": "#49483E",
      "editorSuggestWidget.background": "#1E1F1C",
      "editorSuggestWidget.border": "#49483E",
      "editorSuggestWidget.foreground": "#F8F8F2",
      "editorSuggestWidget.selectedBackground": "#3E3D32",
      "editorSuggestWidget.highlightForeground": "#66D9EF",
    },
  });

  // 2. Wisp Light Theme (Claro / Visual Studio Light)
  monacoInstance.editor.defineTheme("wisp-light", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "", background: "FAFAFD", foreground: "1E293B" },
      { token: "comment", foreground: "64748B", fontStyle: "italic" },
      { token: "type.identifier", foreground: "0284C7", fontStyle: "bold" },
      { token: "keyword.type", foreground: "7C3AED", fontStyle: "bold" },
      { token: "keyword", foreground: "7C3AED", fontStyle: "bold" },
      { token: "keyword.modifier", foreground: "0D9488" },
      { token: "attribute.name", foreground: "D97706" },
      { token: "string", foreground: "16A34A" },
      { token: "number", foreground: "E11D48" },
      { token: "type", foreground: "2563EB" },
      { token: "delimiter", foreground: "64748B" },
    ],
    colors: {
      "editor.background": "#FAFAFD",
      "editor.foreground": "#1E293B",
      "editor.lineHighlightBackground": "#F1F5F9",
      "editor.lineHighlightBorder": "#E2E8F0",
      "editorCursor.foreground": "#7C3AED",
      "editorWhitespace.foreground": "#CBD5E1",
      "editorIndentGuide.background": "#E2E8F0",
      "editorIndentGuide.activeBackground": "#94A3B8",
      "editor.selectionBackground": "#E9D5FF",
      "editor.inactiveSelectionBackground": "#F3E8FF",
      "editorLineNumber.foreground": "#94A3B8",
      "editorLineNumber.activeForeground": "#334155",
      "editorGutter.background": "#FAFAFD",
      "editorWidget.background": "#FFFFFF",
      "editorWidget.border": "#CBD5E1",
      "editorSuggestWidget.background": "#FFFFFF",
      "editorSuggestWidget.border": "#CBD5E1",
      "editorSuggestWidget.foreground": "#1E293B",
      "editorSuggestWidget.selectedBackground": "#F1F5F9",
      "editorSuggestWidget.highlightForeground": "#7C3AED",
    },
  });

  // 3. Wisp Dark Theme (Material 3 Dark)
  monacoInstance.editor.defineTheme("wisp-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "", background: "14121A", foreground: "E6E0E9" },
      { token: "comment", foreground: "79747E", fontStyle: "italic" },
      { token: "type.identifier", foreground: "E8DEF8", fontStyle: "bold" },
      { token: "keyword.type", foreground: "D0BCFF", fontStyle: "bold" },
      { token: "keyword", foreground: "D0BCFF", fontStyle: "bold" },
      { token: "keyword.modifier", foreground: "80D8FF" },
      { token: "attribute.name", foreground: "FFD8E4" },
      { token: "string", foreground: "A8DAB5" },
      { token: "number", foreground: "FFB4AB" },
      { token: "type", foreground: "CCC2DC" },
      { token: "delimiter", foreground: "938F99" },
    ],
    colors: {
      "editor.background": "#14121A",
      "editor.foreground": "#E6E0E9",
      "editor.lineHighlightBackground": "#211F26",
      "editor.lineHighlightBorder": "#2B2930",
      "editorCursor.foreground": "#D0BCFF",
      "editorWhitespace.foreground": "#332D41",
      "editorIndentGuide.background": "#2B2930",
      "editorIndentGuide.activeBackground": "#49454F",
      "editor.selectionBackground": "#4F378B88",
      "editor.inactiveSelectionBackground": "#4F378B44",
      "editorLineNumber.foreground": "#49454F",
      "editorLineNumber.activeForeground": "#CAC4D0",
      "editorGutter.background": "#14121A",
      "editorWidget.background": "#1D1B20",
      "editorWidget.border": "#49454F",
      "editorSuggestWidget.background": "#1D1B20",
      "editorSuggestWidget.border": "#49454F",
      "editorSuggestWidget.foreground": "#E6E0E9",
      "editorSuggestWidget.selectedBackground": "#332D41",
      "editorSuggestWidget.highlightForeground": "#D0BCFF",
    },
  });
}
