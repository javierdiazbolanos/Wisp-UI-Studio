import React, { useRef, useEffect } from "react";
import Editor, { OnMount, Monaco } from "@monaco-editor/react";
import { registerWispLanguage, WISP_LANGUAGE_ID } from "../wisp/monacoConfig";
import { WispDiagnostic } from "../wisp/types";

export type MonacoTheme = "monokai-dark" | "wisp-light" | "wisp-dark";

export interface MonacoEditorProps {
  code: string;
  onChange: (value: string) => void;
  diagnostics: WispDiagnostic[];
  fontSize?: number;
  theme?: MonacoTheme;
  highlightLine?: number | null;
  highlightBlock?: { start: number; end: number } | null;
  onCursorLineChange?: (lineNum: number) => void;
  onEditorReady?: (editor: any) => void;
}

export const MonacoWispEditor: React.FC<MonacoEditorProps> = ({
  code,
  onChange,
  diagnostics,
  fontSize = 13,
  theme = "monokai-dark",
  highlightLine = null,
  highlightBlock = null,
  onCursorLineChange,
  onEditorReady,
}) => {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const decorationsRef = useRef<string[]>([]);
  const onCursorLineChangeRef = useRef(onCursorLineChange);

  // Keep callback reference up to date to prevent stale closures
  useEffect(() => {
    onCursorLineChangeRef.current = onCursorLineChange;
  }, [onCursorLineChange]);

  const handleEditorDidMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor;
    monacoRef.current = monacoInstance;

    // Register Wisp DSL language, monarch tokens, and themes
    registerWispLanguage(monacoInstance);

    // Ensure initial theme is applied
    monacoInstance.editor.setTheme(theme);

    // Track cursor position changes (arrow keys, jumps)
    editor.onDidChangeCursorPosition((e: any) => {
      onCursorLineChangeRef.current?.(e.position.lineNumber);
    });

    // Track mouse clicks / line clicks for instant bidirectional inspect
    editor.onMouseDown((e: any) => {
      if (e.target && e.target.position) {
        onCursorLineChangeRef.current?.(e.target.position.lineNumber);
      }
    });

    onEditorReady?.(editor);
  };

  // Sync theme changes dynamically
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(theme);
    }
  }, [theme]);

  // Sync Diagnostics / Errors as Monaco Markers (Squiggly underlines)
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;
    const model = editorRef.current.getModel();
    if (!model) return;

    const markers = diagnostics.map((diag) => {
      const severity =
        diag.severity === "error"
          ? monacoRef.current!.MarkerSeverity.Error
          : diag.severity === "warning"
          ? monacoRef.current!.MarkerSeverity.Warning
          : monacoRef.current!.MarkerSeverity.Info;

      const lineContent = model.getLineContent(diag.line) || "";

      return {
        severity,
        startLineNumber: diag.line,
        startColumn: 1,
        endLineNumber: diag.line,
        endColumn: Math.max(lineContent.length + 1, 2),
        message: diag.message,
      };
    });

    monacoRef.current.editor.setModelMarkers(model, "wisp", markers);
  }, [diagnostics]);

  // Sync Line / Block Highlight with smooth revealing
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;

    const newDecorations: any[] = [];

    if (highlightBlock) {
      newDecorations.push({
        range: new monacoRef.current.Range(
          highlightBlock.start,
          1,
          highlightBlock.end,
          1
        ),
        options: {
          isWholeLine: true,
          className: "monaco-highlight-block-line",
          overviewRuler: {
            color: "#A855F7",
            position: monacoRef.current.editor.OverviewRulerLane.Full,
          },
        },
      });

      // Reveal block in editor viewport
      editorRef.current.revealLineInCenterIfOutsideViewport(highlightBlock.start);
    } else if (highlightLine) {
      newDecorations.push({
        range: new monacoRef.current.Range(highlightLine, 1, highlightLine, 1),
        options: {
          isWholeLine: true,
          className: "monaco-highlight-line",
          overviewRuler: {
            color: "#A855F7",
            position: monacoRef.current.editor.OverviewRulerLane.Full,
          },
        },
      });

      // Reveal line in editor viewport
      editorRef.current.revealLineInCenterIfOutsideViewport(highlightLine);
    }

    decorationsRef.current = editorRef.current.deltaDecorations(
      decorationsRef.current,
      newDecorations
    );
  }, [highlightLine, highlightBlock]);

  return (
    <div className="w-full h-full relative">
      <Editor
        height="100%"
        defaultLanguage={WISP_LANGUAGE_ID}
        language={WISP_LANGUAGE_ID}
        theme={theme}
        value={code}
        onChange={(val) => onChange(val || "")}
        onMount={handleEditorDidMount}
        loading={
          <div className="w-full h-full flex items-center justify-center bg-[#272822] text-[#F8F8F2] font-mono text-xs">
            Iniciando Monaco Editor (Monokai Dark)...
          </div>
        }
        options={{
          fontSize,
          lineHeight: Math.round(fontSize * 1.6),
          fontFamily:
            "'JetBrains Mono', 'Fira Code', 'Roboto Mono', 'Cascadia Code', Menlo, Monaco, Consolas, monospace",
          fontLigatures: false,
          tabSize: 2,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: "off",
          renderLineHighlight: "all",
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          smoothScrolling: true,
          suggest: {
            showKeywords: true,
            showSnippets: true,
            showClasses: true,
            showProperties: true,
            showWords: false,
            preview: true,
            showIcons: true,
          },
          quickSuggestions: {
            other: true,
            comments: false,
            strings: true,
          },
          contextmenu: true,
          padding: { top: 12, bottom: 60 },
          lineNumbersMinChars: 3,
          folding: true,
          bracketPairColorization: { enabled: true },
          hover: {
            enabled: true,
            delay: 300,
            sticky: true,
          },
        }}
      />
    </div>
  );
};
