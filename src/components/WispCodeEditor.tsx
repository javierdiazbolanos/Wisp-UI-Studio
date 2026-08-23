import React, { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { WispDiagnostic } from "../wisp/types";
import { highlightWispLine } from "../wisp/highlighter";
import { IconPickerModal } from "./IconPickerModal";
import { MonacoWispEditor, MonacoTheme } from "./MonacoWispEditor";
import { WispComponentPalette } from "./WispComponentPalette";
import { analyzeWispCursorContext } from "../wisp/paletteCatalog";
import {
  Sparkles,
  Smile,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Type,
  HelpCircle,
  Edit3,
  Terminal,
  Code2,
  Palette,
  Sun,
  Moon,
  LayoutGrid,
  PanelRightOpen,
  PanelRightClose,
} from "lucide-react";

export interface WispCodeEditorProps {
  code: string;
  onChange: (newCode: string) => void;
  diagnostics: WispDiagnostic[];
  highlightLine?: number | null;
  highlightBlock?: { start: number; end: number } | null;
  onCursorLineChange?: (lineNum: number) => void;
  inspectMode?: boolean;
  onSelectSnippet?: (snippet: string) => void;
  onOpenDocs?: () => void;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
  previewIsDark?: boolean;
}

// Helper to dedent raw snippet to 0-based relative indent
function normalizeSnippet(rawSnippet: string): string[] {
  const rawLines = rawSnippet.split("\n");
  let minIndent = Infinity;
  for (const line of rawLines) {
    if (line.trim().length === 0) continue;
    const match = line.match(/^(\s*)/);
    const count = match ? match[1].length : 0;
    if (count < minIndent) {
      minIndent = count;
    }
  }
  if (minIndent === Infinity) minIndent = 0;

  return rawLines.map((line) => {
    if (line.trim().length === 0) return "";
    return line.slice(minIndent);
  });
}

// Deduce context indentation when line is empty
function deduceContextIndent(allLines: string[], currentLineIndex: number): string {
  for (let i = currentLineIndex - 1; i >= 0; i--) {
    const line = allLines[i];
    if (!line) continue;
    const trimmed = line.trim();
    if (trimmed.length === 0) continue;

    const leading = line.match(/^(\s*)/)?.[1] ?? "";

    if (trimmed.startsWith("@") && trimmed.includes(":")) {
      return leading + "  ";
    }

    const isBlockContainer = /^(card|accordion|split|left|right|column|row|grid|step|select|autocomplete|table|tabs|bottomnav|container)\b/i.test(
      trimmed
    );
    if (isBlockContainer) {
      return leading + "  ";
    }

    return leading || "  ";
  }

  return "  ";
}

export const WispCodeEditor: React.FC<WispCodeEditorProps> = ({
  code,
  onChange,
  diagnostics,
  highlightLine = null,
  highlightBlock = null,
  onCursorLineChange,
  onOpenDocs,
  isMaximized = false,
  onToggleMaximize,
  previewIsDark = false,
}) => {
  const monacoEditorRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [copied, setCopied] = useState(false);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [fontSize, setFontSize] = useState<number>(13); // 12, 13, 14, 16
  const [cursorPos, setCursorPos] = useState<{ line: number; column: number }>({ line: 1, column: 1 });
  const [editorViewMode, setEditorViewMode] = useState<"monaco" | "plain" | "readonly">("monaco");

  // Monokai Dark as default, with option to switch to Light or Material Dark
  const [monacoTheme, setMonacoTheme] = useState<MonacoTheme>(() => {
    const saved = localStorage.getItem("wisp_monaco_theme");
    if (saved === "monokai-dark" || saved === "wisp-light" || saved === "wisp-dark") {
      return saved as MonacoTheme;
    }
    return "monokai-dark";
  });

  useEffect(() => {
    localStorage.setItem("wisp_monaco_theme", monacoTheme);
  }, [monacoTheme]);

  const lines = code.split("\n");

  // Dynamic context analysis based on active cursor position (line + column for accurate indent level)
  const cursorContext = useMemo(
    () => analyzeWispCursorContext(code, cursorPos.line, cursorPos.column),
    [code, cursorPos.line, cursorPos.column]
  );

  const handleCursorChange = useCallback((lineNum: number, column: number = 1) => {
    setCursorPos({ line: lineNum, column });
    onCursorLineChange?.(lineNum);
  }, [onCursorLineChange]);

  // Insert snippet or text respecting current cursor line indentation
  const insertSnippet = useCallback(
    (snippetText: string) => {
      const isInlineModifier =
        snippetText.startsWith("icon=") ||
        (!snippetText.includes("\n") && !snippetText.includes(" ") && snippetText.includes("="));

      if (editorViewMode === "monaco" && monacoEditorRef.current) {
        const editor = monacoEditorRef.current;
        const model = editor.getModel();
        if (!model) return;

        const selection = editor.getSelection();
        const position = editor.getPosition() || { lineNumber: 1, column: 1 };
        const lineNumber = position.lineNumber;
        const lineContent = model.getLineContent(lineNumber) || "";
        const isLineEmptyOrWhitespace = lineContent.trim().length === 0;
        const lineLeadingSpaces = lineContent.match(/^(\s*)/)?.[1] ?? "";

        if (isInlineModifier) {
          // Direct inline insertion at selection or cursor
          const targetRange = selection || {
            startLineNumber: lineNumber,
            startColumn: position.column,
            endLineNumber: lineNumber,
            endColumn: position.column,
          };
          editor.executeEdits("snippet-insert", [
            {
              range: targetRange,
              text: snippetText,
              forceMoveMarkers: true,
            },
          ]);
          editor.focus();
          return;
        }

        // Root screen check (@Screen:screen, @theme, @Wizard:wizard, @Toast:snackbar)
        const isRootSnippet = snippetText.trim().startsWith("@");

        // Calculate target indentation
        let targetIndent = "";
        if (!isRootSnippet) {
          if (isLineEmptyOrWhitespace) {
            if (lineLeadingSpaces.length > 0) {
              targetIndent = lineLeadingSpaces;
            } else {
              const allLines = model.getLinesContent();
              targetIndent = deduceContextIndent(allLines, lineNumber - 1);
            }
          } else {
            // Line has non-whitespace content
            const currentTrimmed = lineContent.trim();
            const isContainer =
              currentTrimmed.startsWith("@") ||
              /^(card|accordion|split|left|right|column|row|grid|step|select|autocomplete|table|tabs|bottomnav|container)\b/i.test(
                currentTrimmed
              );
            targetIndent = isContainer
              ? (currentTrimmed.startsWith("@") ? "  " : lineLeadingSpaces + "  ")
              : (lineLeadingSpaces || "  ");
          }
        }

        // Normalize & format snippet with target indentation
        const normalizedLines = normalizeSnippet(snippetText);
        const indentedSnippet = normalizedLines
          .map((line) => (line.length === 0 ? "" : targetIndent + line))
          .join("\n");

        if (selection && !selection.isEmpty()) {
          // If replacing a selection
          const startCol = selection.startColumn;
          let replacementText = indentedSnippet;
          if (startCol > 1) {
            const prefix = lineContent.slice(0, startCol - 1);
            if (prefix.trim().length === 0) {
              const firstLineIndent = targetIndent.slice(prefix.length);
              replacementText = normalizedLines
                .map((line, idx) => (idx === 0 ? (line ? firstLineIndent + line : "") : (line ? targetIndent + line : "")))
                .join("\n");
            }
          }

          editor.executeEdits("snippet-insert", [
            {
              range: selection,
              text: replacementText,
              forceMoveMarkers: true,
            },
          ]);
        } else if (isLineEmptyOrWhitespace) {
          // Replace the entire whitespace-only line so indentation is exact
          const range = {
            startLineNumber: lineNumber,
            startColumn: 1,
            endLineNumber: lineNumber,
            endColumn: lineContent.length + 1,
          };
          editor.executeEdits("snippet-insert", [
            {
              range,
              text: indentedSnippet,
              forceMoveMarkers: true,
            },
          ]);
        } else {
          // Line has content and no active selection
          // Insert on a clean new line below with proper target indentation
          const range = {
            startLineNumber: lineNumber,
            startColumn: lineContent.length + 1,
            endLineNumber: lineNumber,
            endColumn: lineContent.length + 1,
          };
          editor.executeEdits("snippet-insert", [
            {
              range,
              text: "\n" + indentedSnippet,
              forceMoveMarkers: true,
            },
          ]);
        }

        editor.focus();
      } else if (textareaRef.current) {
        // Plain textarea mode support
        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const fullText = textarea.value;

        if (isInlineModifier) {
          const newCode = fullText.substring(0, start) + snippetText + fullText.substring(end);
          onChange(newCode);
          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + snippetText.length, start + snippetText.length);
          }, 10);
          return;
        }

        // Find current line bounds
        const lineStart = fullText.lastIndexOf("\n", start - 1) + 1;
        let lineEnd = fullText.indexOf("\n", start);
        if (lineEnd === -1) lineEnd = fullText.length;

        const currentLine = fullText.substring(lineStart, lineEnd);
        const isLineEmptyOrWhitespace = currentLine.trim().length === 0;
        const lineLeadingSpaces = currentLine.match(/^(\s*)/)?.[1] ?? "";

        const isRootSnippet = snippetText.trim().startsWith("@");
        let targetIndent = "";
        if (!isRootSnippet) {
          if (isLineEmptyOrWhitespace) {
            if (lineLeadingSpaces.length > 0) {
              targetIndent = lineLeadingSpaces;
            } else {
              const allLines = fullText.split("\n");
              const currentLineIndex = fullText.substring(0, start).split("\n").length - 1;
              targetIndent = deduceContextIndent(allLines, currentLineIndex);
            }
          } else {
            const currentTrimmed = currentLine.trim();
            const isContainer =
              currentTrimmed.startsWith("@") ||
              /^(card|accordion|split|left|right|column|row|grid|step|select|autocomplete|table|tabs|bottomnav|container)\b/i.test(
                currentTrimmed
              );
            targetIndent = isContainer
              ? (currentTrimmed.startsWith("@") ? "  " : lineLeadingSpaces + "  ")
              : (lineLeadingSpaces || "  ");
          }
        }

        const normalizedLines = normalizeSnippet(snippetText);
        const indentedSnippet = normalizedLines
          .map((line) => (line.length === 0 ? "" : targetIndent + line))
          .join("\n");

        let newCode = "";
        let newCursorPos = start;

        if (start !== end) {
          newCode = fullText.substring(0, start) + indentedSnippet + fullText.substring(end);
          newCursorPos = start + indentedSnippet.length;
        } else if (isLineEmptyOrWhitespace) {
          newCode = fullText.substring(0, lineStart) + indentedSnippet + fullText.substring(lineEnd);
          newCursorPos = lineStart + indentedSnippet.length;
        } else {
          newCode = fullText.substring(0, lineEnd) + "\n" + indentedSnippet + fullText.substring(lineEnd);
          newCursorPos = lineEnd + 1 + indentedSnippet.length;
        }

        onChange(newCode);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 10);
      } else {
        onChange(code + "\n  " + snippetText.trim());
      }
    },
    [code, editorViewMode, onChange]
  );

  // Trigger Autocomplete manually (Ctrl+Space)
  const triggerAutocomplete = useCallback(() => {
    if (editorViewMode === "monaco" && monacoEditorRef.current) {
      monacoEditorRef.current.focus();
      monacoEditorRef.current.trigger("keyboard", "editor.action.triggerSuggest", {});
    }
  }, [editorViewMode]);

  // Copy code to clipboard
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback copy
      const el = document.createElement("textarea");
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const errorCount = diagnostics.filter((d) => d.severity === "error").length;
  const warningCount = diagnostics.filter((d) => d.severity === "warning").length;

  const isLight = monacoTheme === "wisp-light";
  const editorBg =
    monacoTheme === "monokai-dark"
      ? "#272822"
      : monacoTheme === "wisp-light"
      ? "#FAFAFD"
      : "#14121A";

  return (
    <div
      className={`flex flex-col h-full rounded-3xl overflow-hidden border shadow-2xl transition-colors duration-200 ${
        isLight
          ? "bg-[#FAFAFD] text-neutral-800 border-neutral-300"
          : "bg-[#1B1A1E] text-[#E6E0E9] border-neutral-800"
      }`}
    >
      {/* Header Bar */}
      <div
        className={`flex items-center justify-between px-4 py-2.5 border-b text-xs shrink-0 select-none ${
          isLight
            ? "bg-neutral-100 border-neutral-200 text-neutral-700"
            : "bg-[#18171C] border-neutral-800 text-neutral-200"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-mono font-bold text-xs sm:text-sm tracking-tight">
            WDL Editor
          </span>
          <span
            className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
              isLight
                ? "bg-purple-100 text-purple-800 border-purple-300"
                : "bg-purple-950/80 text-purple-300 border-purple-800/60"
            }`}
          >
            Monaco
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Selector: Monokai Dark (Default), Light, Material Dark */}
          <div
            className={`flex items-center p-0.5 rounded-xl border text-[11px] ${
              isLight ? "bg-white border-neutral-300" : "bg-neutral-900 border-neutral-800"
            }`}
          >
            <button
              type="button"
              onClick={() => setMonacoTheme("monokai-dark")}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                monacoTheme === "monokai-dark"
                  ? "bg-amber-600 text-white shadow-xs font-semibold"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
              title="Monokai Dark Theme (Classic VS Code / Sublime style)"
            >
              <Palette className="w-3 h-3 text-amber-300" />
              <span>Monokai</span>
            </button>

            <button
              type="button"
              onClick={() => setMonacoTheme("wisp-light")}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                monacoTheme === "wisp-light"
                  ? "bg-purple-600 text-white shadow-xs font-semibold"
                  : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              }`}
              title="Light Theme (High-contrast clean theme)"
            >
              <Sun className="w-3 h-3 text-amber-500" />
              <span>Light</span>
            </button>

            <button
              type="button"
              onClick={() => setMonacoTheme("wisp-dark")}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                monacoTheme === "wisp-dark"
                  ? "bg-purple-600 text-white shadow-xs font-semibold"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
              title="Material 3 Dark Theme"
            >
              <Moon className="w-3 h-3 text-purple-300" />
              <span>Material</span>
            </button>
          </div>

          {/* Mode switch */}
          <div
            className={`flex items-center p-0.5 rounded-xl border text-[11px] ${
              isLight ? "bg-white border-neutral-300" : "bg-neutral-900 border-neutral-800"
            }`}
          >
            <button
              type="button"
              onClick={() => setEditorViewMode("monaco")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                editorViewMode === "monaco"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              }`}
              title="Monaco Editor (VS Code engine): Accurate syntax highlighting, completions, and diagnostics"
            >
              <Edit3 className="w-3 h-3" />
              <span>Monaco</span>
            </button>

            <button
              type="button"
              onClick={() => setEditorViewMode("plain")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                editorViewMode === "plain"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              }`}
              title="Plain Text: Simple text editor"
            >
              <Terminal className="w-3 h-3" />
              <span>Text</span>
            </button>

            <button
              type="button"
              onClick={() => setEditorViewMode("readonly")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                editorViewMode === "readonly"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              }`}
              title="Read-only View"
            >
              <Code2 className="w-3 h-3" />
              <span>Readonly</span>
            </button>
          </div>

          {/* Font size picker */}
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-xl border ${
              isLight ? "bg-white border-neutral-300" : "bg-neutral-900 border-neutral-800"
            }`}
          >
            <Type className="w-3.5 h-3.5 text-neutral-400 mr-1" />
            {[12, 13, 14, 16].map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setFontSize(sz)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold transition-all cursor-pointer ${
                  fontSize === sz
                    ? "bg-purple-600 text-white shadow-xs"
                    : isLight
                    ? "text-neutral-500 hover:text-neutral-900"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {sz}
              </button>
            ))}
          </div>

          {/* Palette Modal / Floating Drawer Toggle */}
          <button
            type="button"
            onClick={() => setIsPaletteOpen(!isPaletteOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer shadow-xs ${
              isPaletteOpen
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-500 shadow-purple-600/30"
                : isLight
                ? "bg-purple-100 hover:bg-purple-200 text-purple-900 border-purple-300"
                : "bg-purple-950/70 hover:bg-purple-900 text-purple-200 border-purple-700/60"
            }`}
            title="Open floating component palette with categories and contextual suggestions"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Palette (+35)</span>
            <span className="sm:hidden">Palette</span>
            {isPaletteOpen ? (
              <PanelRightClose className="w-3 h-3 opacity-80 ml-0.5" />
            ) : (
              <PanelRightOpen className="w-3 h-3 opacity-80 ml-0.5" />
            )}
          </button>

          {/* Icon Picker Trigger */}
          <button
            type="button"
            onClick={() => setIsIconPickerOpen(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer font-medium ${
              isLight
                ? "bg-purple-50 hover:bg-purple-100 text-purple-900 border-purple-300"
                : "bg-purple-950/60 hover:bg-purple-900 text-purple-200 border-purple-800/60"
            }`}
            title="Open Lucide icon catalog with search"
          >
            <Smile className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden md:inline">Icons</span>
          </button>

          {/* Autocomplete IntelliSense manual trigger */}
          <button
            type="button"
            onClick={triggerAutocomplete}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-950/60 hover:bg-purple-900 text-purple-200 border border-purple-800/60 transition-all cursor-pointer font-medium"
            title="Open IntelliSense autocomplete and documentation (Ctrl+Space)"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[11px] hidden md:inline">Autocomplete</span>
            <span className="text-[9px] px-1 bg-purple-900/80 rounded border border-purple-700/60 font-mono text-purple-300">
              Ctrl+Space
            </span>
          </button>

          {/* Docs / Spec Help button */}
          {onOpenDocs && (
            <button
              type="button"
              onClick={onOpenDocs}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border transition-all cursor-pointer font-medium ${
                isLight
                  ? "bg-purple-100 hover:bg-purple-200 text-purple-800 border-purple-300"
                  : "bg-purple-950/60 hover:bg-purple-900 text-purple-200 border-purple-800/60"
              }`}
              title="View Wisp DSL Specification & AI Prompting Guide"
            >
              <HelpCircle className="w-3.5 h-3.5 text-purple-500" />
              <span className="text-[11px]">Guide</span>
            </button>
          )}

          {/* Maximize / Normal toggle */}
          {onToggleMaximize && (
            <button
              type="button"
              onClick={onToggleMaximize}
              className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                isLight
                  ? "bg-white hover:bg-neutral-200 text-neutral-700 border-neutral-300"
                  : "bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border-neutral-800"
              }`}
              title={isMaximized ? "Restore split view" : "Maximize editor"}
            >
              {isMaximized ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
          )}

          {/* Copy code */}
          <button
            type="button"
            onClick={handleCopyCode}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border transition-all cursor-pointer font-medium ${
              isLight
                ? "bg-white hover:bg-neutral-200 text-neutral-700 border-neutral-300"
                : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border-neutral-700"
            }`}
            title="Copy Wisp DSL code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[11px] text-emerald-500">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="text-[11px]">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Editor Body */}
      <div
        className="relative flex-1 min-h-0 w-full overflow-hidden"
        style={{ backgroundColor: editorBg }}
      >
        {editorViewMode === "monaco" && (
          <MonacoWispEditor
            code={code}
            onChange={onChange}
            diagnostics={diagnostics}
            fontSize={fontSize}
            theme={monacoTheme}
            highlightLine={highlightLine}
            highlightBlock={highlightBlock}
            onCursorChange={handleCursorChange}
            onEditorReady={(editor) => {
              monacoEditorRef.current = editor;
            }}
          />
        )}

        {editorViewMode === "plain" && (
          <div className="w-full h-full p-4 font-mono" style={{ backgroundColor: editorBg }}>
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => {
                onChange(e.target.value);
                const pos = e.target.selectionStart;
                const textBefore = e.target.value.substring(0, pos);
                const line = textBefore.split("\n").length;
                const lastNewline = textBefore.lastIndexOf("\n");
                const col = lastNewline === -1 ? pos + 1 : pos - lastNewline;
                handleCursorChange(line, col);
              }}
              onKeyUp={(e) => {
                const target = e.currentTarget;
                const pos = target.selectionStart;
                const textBefore = target.value.substring(0, pos);
                const line = textBefore.split("\n").length;
                const lastNewline = textBefore.lastIndexOf("\n");
                const col = lastNewline === -1 ? pos + 1 : pos - lastNewline;
                handleCursorChange(line, col);
              }}
              onClick={(e) => {
                const target = e.currentTarget;
                const pos = target.selectionStart;
                const textBefore = target.value.substring(0, pos);
                const line = textBefore.split("\n").length;
                const lastNewline = textBefore.lastIndexOf("\n");
                const col = lastNewline === -1 ? pos + 1 : pos - lastNewline;
                handleCursorChange(line, col);
              }}
              className={`w-full h-full font-mono outline-none resize-none selection:bg-purple-600/40 ${
                isLight ? "text-neutral-900" : "text-[#F8F8F2]"
              }`}
              style={{
                fontSize: `${fontSize}px`,
                lineHeight: `${Math.round(fontSize * 1.6)}px`,
                backgroundColor: editorBg,
              }}
              placeholder="Write your interface in Wisp DSL..."
              spellCheck={false}
            />
          </div>
        )}

        {editorViewMode === "readonly" && (
          <div
            className={`w-full h-full p-4 overflow-auto font-mono whitespace-pre select-text ${
              isLight ? "text-neutral-900 bg-white" : "text-neutral-100 bg-[#1E1F1C]"
            }`}
            style={{ fontSize: `${fontSize}px`, lineHeight: `${Math.round(fontSize * 1.6)}px` }}
          >
            {lines.map((line, idx) => (
              <div key={idx} className="hover:bg-purple-500/10 px-2 rounded">
                {line.length === 0 ? "\u00A0" : highlightWispLine(line)}
              </div>
            ))}
          </div>
        )}

        {/* Right-Side Floating Contextual Component Palette Drawer */}
        <WispComponentPalette
          isOpen={isPaletteOpen}
          onClose={() => setIsPaletteOpen(false)}
          cursorContext={cursorContext}
          onInsert={(snippet) => {
            insertSnippet(snippet);
          }}
          isLight={isLight}
          previewIsDark={previewIsDark}
        />

        {/* Floating Quick Tab on right edge when palette is closed */}
        {!isPaletteOpen && (
          <button
            type="button"
            onClick={() => setIsPaletteOpen(true)}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-30 flex items-center py-3 px-1.5 rounded-l-2xl border-y border-l shadow-2xl transition-all cursor-pointer group ${
              isLight
                ? "bg-white/95 hover:bg-purple-50 text-purple-900 border-neutral-300 hover:border-purple-400"
                : "bg-[#1B1A24]/95 hover:bg-[#262338] text-purple-300 border-neutral-700/80 hover:border-purple-500"
            }`}
            title="Abrir paleta contextual de componentes Wisp"
          >
            <div className="flex flex-col items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold uppercase tracking-wider [writing-mode:vertical-lr] rotate-180">
                Componentes
              </span>
              <PanelRightOpen className="w-3 h-3 text-neutral-400" />
            </div>
          </button>
        )}
      </div>

      {/* Diagnostics / Status Footer Bar */}
      <div
        className={`px-4 py-2 border-t flex items-center justify-between text-xs shrink-0 select-none ${
          isLight
            ? "bg-neutral-100 border-neutral-200 text-neutral-600"
            : "bg-[#18171C] border-neutral-800 text-neutral-400"
        }`}
      >
        <div className="flex items-center gap-4">
          {errorCount === 0 && warningCount === 0 ? (
            <div className="flex items-center gap-1.5 text-emerald-500 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Sintaxis Wisp 100% válida</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {errorCount > 0 && (
                <div className="flex items-center gap-1 text-red-400 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errorCount} error(es)</span>
                </div>
              )}
              {warningCount > 0 && (
                <div className="flex items-center gap-1 text-amber-400 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{warningCount} advertencia(s)</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5 text-[11px] font-mono">
          <span>Ln {cursorPos.line}, Col {cursorPos.column} (Indent {cursorContext.indent})</span>
          <span>•</span>
          <span className="text-purple-400 font-medium truncate max-w-[220px]" title={cursorContext.enclosingContainerLabel || "Contexto activo"}>
            {cursorContext.enclosingContainerLabel || "Nivel Raíz"}
          </span>
          <span>•</span>
          <span className="hidden sm:inline text-neutral-400">Ctrl+Espacio</span>
          <span>•</span>
          <span className="capitalize">{monacoTheme.replace("-", " ")}</span>
          <span>•</span>
          <span>UTF-8</span>
        </div>
      </div>

      {/* Icon Picker Modal */}
      <IconPickerModal
        isOpen={isIconPickerOpen}
        onClose={() => setIsIconPickerOpen(false)}
        onSelectIcon={(iconName) => {
          insertSnippet(`icon=${iconName}`);
        }}
      />
    </div>
  );
};
