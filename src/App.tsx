import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { parseWispDSL, findNodeByLine, findScreenByLine } from "./wisp/parser";
import { validateWispDocument } from "./wisp/validator";
import { ScreenNode, WispNode } from "./wisp/types";
import {
  M3_PRESETS,
  M3Preset,
  M3ColorScheme,
  M3SchemeVariant,
  generateM3Scheme,
} from "./theme/material3";
import { MaterialRenderer, ActiveToastData } from "./renderer/MaterialRenderer";
import { WispCodeEditor } from "./components/WispCodeEditor";
import { AICopilotModal } from "./components/AICopilotModal";
import { ExportModal } from "./components/ExportModal";
import { WispDocsModal } from "./components/WispDocsModal";
import { UnsavedChangesModal } from "./components/UnsavedChangesModal";
import { M3ThemeStudioModal } from "./components/M3ThemeStudioModal";
import { WispLogo } from "./components/WispLogo";
import { ScreenNavigatorDropdown } from "./components/ScreenNavigatorDropdown";
import { WISP_TEMPLATES, WispTemplate, BASIC_HOME_TEMPLATE } from "./data/templates";
import { DynamicIcon } from "./components/DynamicIcon";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Layers,
  Smartphone,
  Tablet,
  Monitor,
  Maximize2,
  Minimize2,
  Download,
  Share2,
  BookOpen,
  Palette,
  Sun,
  Moon,
  Eye,
  Play,
  RotateCcw,
  ArrowLeft,
  ChevronDown,
  FileCode,
  Layout,
  Check,
  Zap,
  Columns,
  Bot,
  HelpCircle,
  GripVertical,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  X,
  Plus,
} from "lucide-react";

export default function App() {
  // 1. Core State
  const defaultTemplate = WISP_TEMPLATES[0].code;
  const [wispCode, setWispCode] = useState<string>(() => {
    const saved = localStorage.getItem("wisp_studio_code");
    return saved || defaultTemplate;
  });
  const [lastLoadedTemplateCode, setLastLoadedTemplateCode] = useState<string>(() => {
    const saved = localStorage.getItem("wisp_studio_code");
    return saved || defaultTemplate;
  });
  const [pendingTemplate, setPendingTemplate] = useState<WispTemplate | null>(null);
  const [isUnsavedWarningOpen, setIsUnsavedWarningOpen] = useState<boolean>(false);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("wisp_studio_code", wispCode);
  }, [wispCode]);

  // 2. Parse and Validate AST
  const wispDocument = useMemo(() => {
    const doc = parseWispDSL(wispCode);
    doc.diagnostics = validateWispDocument(doc);
    return doc;
  }, [wispCode]);

  // 3. Navigation & Screen State
  const [activeScreenName, setActiveScreenName] = useState<string>("");
  const [activeWizardStep, setActiveWizardStep] = useState<number>(1);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [activeToast, setActiveToast] = useState<ActiveToastData | null>(null);

  // Auto-dismiss active snackbar after its duration at app level
  useEffect(() => {
    if (activeToast) {
      const timeout = activeToast.duration || 4500;
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, timeout);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  // Keep active screen in sync if screens change
  useEffect(() => {
    if (wispDocument.screens.length > 0) {
      const exists = wispDocument.screens.some((s) => s.name === activeScreenName);
      if (!exists) {
        // Prioritize interactive views over standalone snackbar templates
        const defaultScreen =
          wispDocument.screens.find((s) => s.type !== "snackbar" && s.type !== "toast") ||
          wispDocument.screens[0];
        setActiveScreenName(defaultScreen.name);
        setActiveWizardStep(1);
      }
    }
  }, [wispDocument.screens, activeScreenName]);

  const currentScreen: ScreenNode | undefined =
    wispDocument.screens.find((s) => s.name === activeScreenName) ||
    wispDocument.screens.find((s) => s.type !== "snackbar" && s.type !== "toast") ||
    wispDocument.screens[0];

  const handleNavigate = (target: string) => {
    if (target === "back") {
      if (navigationHistory.length > 0) {
        const prev = navigationHistory[navigationHistory.length - 1];
        setNavigationHistory((h) => h.slice(0, -1));
        setActiveScreenName(prev);
      }
      return;
    }

    if (target.startsWith("@")) {
      const match = target.match(/^@([a-zA-Z0-9_-]+)(?:\(step=(\d+)\))?/);
      if (match) {
        const screenName = match[1];
        const stepNum = match[2] ? parseInt(match[2], 10) : 1;

        if (screenName !== activeScreenName) {
          setNavigationHistory((h) => [...h, activeScreenName]);
          setActiveScreenName(screenName);
        }
        if (stepNum) {
          setActiveWizardStep(stepNum);
        }
      }
    }
  };

  // 4. Material 3 Expressive Dynamic Theme Engine (Material Baseline default)
  const [currentPresetId, setCurrentPresetId] = useState<string>("indigo");
  const [seedHex, setSeedHex] = useState<string>("#6750A4");
  const [schemeVariant, setSchemeVariant] = useState<M3SchemeVariant>("tonal_spot");
  const [contrastLevel, setContrastLevel] = useState<number>(0.0);
  const [isDark, setIsDark] = useState<boolean>(false);
  const [isM3ThemeStudioOpen, setIsM3ThemeStudioOpen] = useState<boolean>(false);

  // Dynamically compute the full official Material 3 color tokens
  const activeColorScheme: M3ColorScheme = useMemo(() => {
    return generateM3Scheme(seedHex, isDark, schemeVariant, contrastLevel);
  }, [seedHex, isDark, schemeVariant, contrastLevel]);

  const handleSelectPreset = (presetId: string) => {
    const preset = M3_PRESETS[presetId];
    if (preset) {
      setCurrentPresetId(presetId);
      setSeedHex(preset.seedHex);
      setSchemeVariant(preset.variant);
    }
  };

  // 5. Workspace Controls & Resizable Layout
  const [editorWidthPercent, setEditorWidthPercent] = useState<number>(45); // 25 to 80
  const [isEditorMaximized, setIsEditorMaximized] = useState<boolean>(false);
  const [isDraggingSplitter, setIsDraggingSplitter] = useState<boolean>(false);
  const splitContainerRef = useRef<HTMLDivElement>(null);

  // Responsive Layout breakpoint (< 1320px switches to Tabbed View)
  const [isCompactScreen, setIsCompactScreen] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.innerWidth < 1320 : false
  );
  const [compactActiveTab, setCompactActiveTab] = useState<"code" | "preview">("code");

  useEffect(() => {
    const handleResize = () => {
      setIsCompactScreen(window.innerWidth < 1320);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [viewportMode, setViewportMode] = useState<"desktop" | "tablet" | "mobile" | "free">("desktop");
  const [inspectMode, setInspectMode] = useState<boolean>(false);
  const [highlightLine, setHighlightLine] = useState<number | null>(null);
  const [highlightBlock, setHighlightBlock] = useState<{ start: number; end: number } | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);

  // Real-time flash & live cursor indicator state
  const [flashNodeId, setFlashNodeId] = useState<string | null>(null);
  const [flashTimestamp, setFlashTimestamp] = useState<number>(0);
  const [activeCursorLineNumber, setActiveCursorLineNumber] = useState<number>(1);
  const flashTimerRef = useRef<any>(null);

  // 6. Modals & AI Copilot Pre-fill
  const [isAICopilotOpen, setIsAICopilotOpen] = useState<boolean>(false);
  const [initialAIPrompt, setInitialAIPrompt] = useState<string>("");
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isDocsOpen, setIsDocsOpen] = useState<boolean>(false);
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState<boolean>(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState<boolean>(false);

  // Splitter Dragging handlers
  const handleMouseDown = useCallback(() => {
    setIsDraggingSplitter(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingSplitter || !splitContainerRef.current) return;
      const containerRect = splitContainerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      if (newWidth >= 20 && newWidth <= 85) {
        setEditorWidthPercent(newWidth);
      }
    };

    const handleMouseUp = () => {
      if (isDraggingSplitter) {
        setIsDraggingSplitter(false);
      }
    };

    if (isDraggingSplitter) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingSplitter]);

  // Inspect mode node selection callback (Canvas -> Editor)
  const handleInspectSelect = (node: WispNode) => {
    setSelectedNodeId(node.id);
    const start = node.lineStart ?? node.position?.line ?? 1;
    const end = node.lineEnd ?? start;
    setHighlightLine(start);
    setHighlightBlock({ start, end });
  };

  // Cursor line change callback from Editor (Editor -> Canvas)
  // Automatically switches screen to wherever the user is editing, and tracks active node
  const handleCursorLineChange = useCallback(
    (lineNum: number) => {
      setActiveCursorLineNumber(lineNum);

      // 1. Check which screen contains this line
      const matchedScreen = findScreenByLine(wispDocument.screens, lineNum);
      if (matchedScreen && matchedScreen.name !== activeScreenName) {
        setActiveScreenName(matchedScreen.name);
      }

      const targetScreen = matchedScreen || currentScreen;
      if (targetScreen) {
        // Automatically switch wizard step if cursor moves inside a specific step
        if (targetScreen.type === "wizard" && targetScreen.steps && targetScreen.steps.length > 0) {
          for (let idx = 0; idx < targetScreen.steps.length; idx++) {
            const step = targetScreen.steps[idx];
            const start = step.lineStart ?? step.position?.line ?? 1;
            const end = step.lineEnd ?? start;
            if (lineNum >= start && lineNum <= end) {
              const stepIndex = step.index || idx + 1;
              setActiveWizardStep(stepIndex);
              break;
            }
          }
        }

        // 2. Find the most specific node in the screen covering this line
        const matchedNode = findNodeByLine(targetScreen, lineNum);
        if (matchedNode) {
          setSelectedNodeId(matchedNode.id);
          const start = matchedNode.lineStart ?? matchedNode.position?.line ?? lineNum;
          const end = matchedNode.lineEnd ?? start;
          setHighlightLine(start);
          setHighlightBlock({ start, end });
        } else {
          setSelectedNodeId(null);
          setHighlightLine(null);
          setHighlightBlock(null);
        }
      }
    },
    [wispDocument.screens, activeScreenName, currentScreen]
  );

  // Trigger flash on current node when user writes / edits code
  const handleCodeChange = useCallback(
    (newCode: string) => {
      setWispCode(newCode);

      // Parse quickly to find edited element at cursor line
      try {
        const nextDoc = parseWispDSL(newCode);
        const line = activeCursorLineNumber || 1;
        const matchedScreen = findScreenByLine(nextDoc.screens, line);
        if (matchedScreen) {
          if (matchedScreen.name !== activeScreenName) {
            setActiveScreenName(matchedScreen.name);
          }
          const matchedNode = findNodeByLine(matchedScreen, line);
          if (matchedNode) {
            setFlashNodeId(matchedNode.id);
            setFlashTimestamp(Date.now());

            if (flashTimerRef.current) {
              clearTimeout(flashTimerRef.current);
            }
            flashTimerRef.current = setTimeout(() => {
              setFlashNodeId(null);
            }, 1900);
          }
        }
      } catch {
        // Continue if parsing intermediate syntax
      }
    },
    [activeCursorLineNumber, activeScreenName]
  );

  // Apply code from AI Copilot
  const handleApplyAICode = (newCode: string, mode: "replace" | "append") => {
    if (mode === "replace") {
      setWispCode(newCode);
    } else {
      setWispCode((prev) => prev + "\n\n" + newCode);
    }
    setIsAICopilotOpen(false);
  };

  // Helper to download .wdsl files safely
  const downloadWdslFile = (code: string, fileName = "codigo.wdsl") => {
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Apply template with unsaved changes safety
  const handleSelectTemplate = (tmpl: WispTemplate) => {
    setIsTemplateMenuOpen(false);

    // If current code has not changed from baseline or matches the new template
    const isClean =
      wispCode.trim() === lastLoadedTemplateCode.trim() ||
      wispCode.trim() === tmpl.code.trim();

    // Check if current code matches any template exactly (i.e. user just loaded a template without editing)
    const matchesAnyTemplate = WISP_TEMPLATES.some(
      (t) => t.code.trim() === wispCode.trim()
    );

    if (isClean || matchesAnyTemplate) {
      setWispCode(tmpl.code);
      setLastLoadedTemplateCode(tmpl.code);
    } else {
      // User has custom uncommitted edits: show warning modal & suggest download
      setPendingTemplate(tmpl);
      setIsUnsavedWarningOpen(true);
    }
  };

  // Start fresh with basic @Home template
  const handleNewProject = () => {
    const newTmpl: WispTemplate = {
      id: "basic-home",
      title: "Nuevo Documento • @Home",
      category: "Form",
      description: "Pantalla inicial limpia",
      code: BASIC_HOME_TEMPLATE,
    };
    handleSelectTemplate(newTmpl);
  };

  const handleConfirmDiscardTemplate = () => {
    if (pendingTemplate) {
      setWispCode(pendingTemplate.code);
      setLastLoadedTemplateCode(pendingTemplate.code);
    }
    setPendingTemplate(null);
    setIsUnsavedWarningOpen(false);
  };

  const handleConfirmDownloadAndApplyTemplate = () => {
    if (pendingTemplate) {
      downloadWdslFile(wispCode, "codigo.wdsl");
      setWispCode(pendingTemplate.code);
      setLastLoadedTemplateCode(pendingTemplate.code);
    }
    setPendingTemplate(null);
    setIsUnsavedWarningOpen(false);
  };

  const handleCancelTemplateSwitch = () => {
    setPendingTemplate(null);
    setIsUnsavedWarningOpen(false);
  };

  // Handle prompt from Builder directly to AI Copilot
  const handleSendPromptToAI = (promptText: string) => {
    setInitialAIPrompt(promptText);
    setIsAICopilotOpen(true);
  };

  return (
    <div
      className={`h-screen w-full flex flex-col font-sans transition-colors overflow-hidden ${
        isDark ? "bg-[#141218] text-[#E6E0E9]" : "bg-[#F8F9FA] text-[#1D1B20]"
      }`}
    >
      {/* Presentation Fullscreen Banner */}
      {isPresentationMode && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-neutral-900/90 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-2xl border border-neutral-700">
          <span className="text-xs font-semibold">Client Presentation Mode</span>
          <button
            type="button"
            onClick={() => setIsPresentationMode(false)}
            className="p-1 rounded-full hover:bg-neutral-800 text-neutral-300 hover:text-white cursor-pointer"
            title="Exit presentation (ESC)"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Studio Header */}
      {!isPresentationMode && (
        <header className="h-16 border-b border-neutral-200/90 dark:border-neutral-800/90 bg-white/95 dark:bg-[#121019]/95 backdrop-blur-md px-3.5 sm:px-5 flex items-center justify-between z-40 shrink-0 select-none">
          {/* Brand & Mascot Logo Section */}
          <div className="flex items-center gap-3">
            <div className="relative group flex items-center">
              <div className="w-10 h-10 rounded-2xl bg-[#0B0914] border border-purple-800/50 shadow-md shadow-purple-950/40 ring-1 ring-purple-500/20 flex items-center justify-center p-1 transition-transform group-hover:scale-105">
                <WispLogo size={30} />
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-1.5">
                  Wisp UI Studio
                </span>
                <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
                  WDL
                </span>
                <span className="hidden sm:inline-flex text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                  Material 3
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-tight hidden sm:block">
                Vibe Coding Architecture • Declarative Screen Modeling
              </p>
            </div>
          </div>

          {/* Center Screen Navigator Dropdown */}
          <div className="hidden sm:flex items-center">
            {wispDocument.screens.length > 0 && (
              <ScreenNavigatorDropdown
                screens={wispDocument.screens}
                activeScreenName={activeScreenName}
                onSelectScreen={(screenName) => {
                  setActiveScreenName(screenName);
                  setActiveWizardStep(1);
                }}
                onJumpToLine={(line) => {
                  setHighlightLine(line);
                  setHighlightBlock({ start: line, end: line });
                }}
                onInsertSnippet={(snippet) => {
                  setWispCode((prev) => prev + snippet);
                }}
              />
            )}
          </div>

          {/* Right Action Tools Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* New Document Button */}
            <button
              type="button"
              onClick={handleNewProject}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition-all cursor-pointer hover:shadow-purple-500/20"
              title="Crear nuevo documento (@Home:screen)"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="font-bold">Nuevo</span>
            </button>

            {/* Template Library Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsTemplateMenuOpen(!isTemplateMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-neutral-100 hover:bg-neutral-200/80 dark:bg-neutral-800/90 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition-all cursor-pointer border border-neutral-200/80 dark:border-neutral-700/70"
                title="Load prebuilt WDL templates"
              >
                <Layout className="w-3.5 h-3.5 text-purple-500" />
                <span className="hidden sm:inline">Templates</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {isTemplateMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#181622] rounded-2xl p-2 shadow-2xl border border-neutral-200 dark:border-neutral-800 z-50 space-y-1">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                    Standard WDL Examples
                  </div>
                  {WISP_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => handleSelectTemplate(tmpl)}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-all group cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">
                          {tmpl.title}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 font-medium">
                          {tmpl.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
                        {tmpl.description}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Specification, Architecture & GitHub README Button */}
            <button
              type="button"
              onClick={() => setIsDocsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-purple-50 hover:bg-purple-100/90 dark:bg-purple-950/70 dark:hover:bg-purple-900 text-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-800/70 transition-all cursor-pointer shadow-xs"
              title="Complete WDL Syntax Specification and GitHub Documentation"
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span className="hidden md:inline">Docs & Spec WDL</span>
              <span className="md:hidden">Docs</span>
            </button>

            <div className="h-5 w-px bg-neutral-200 dark:bg-neutral-800 mx-1 hidden sm:block" />

            {/* Material 3 Expressive Color Studio Button */}
            <button
              type="button"
              onClick={() => setIsM3ThemeStudioOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-neutral-100 hover:bg-neutral-200/80 dark:bg-neutral-800/90 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition-all cursor-pointer border border-neutral-200/80 dark:border-neutral-700/70 shadow-xs"
              title="Open Material 3 Expressive Color Studio"
            >
              <span
                className="w-3 h-3 rounded-full shadow-xs border border-white/50"
                style={{ backgroundColor: activeColorScheme.primary }}
              />
              <Palette className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span className="hidden sm:inline">Color M3</span>
            </button>

            {/* Light / Dark Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200/80 dark:bg-neutral-800/90 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition-all cursor-pointer border border-neutral-200/80 dark:border-neutral-700/70"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-600" />}
            </button>

            {/* Export Code Modal Button */}
            <button
              type="button"
              onClick={() => setIsExportOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-white text-white dark:text-neutral-900 transition-all cursor-pointer shadow-sm"
              title="Export to React/TypeScript, Flutter, JSON AST or Wisp"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </header>
      )}

      {/* Compact Screen (<1320px) Segmented Tabs Bar */}
      {!isPresentationMode && isCompactScreen && (
        <div className="px-3 sm:px-4 pt-2.5 pb-0 shrink-0 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-neutral-100/90 dark:bg-neutral-900/90 backdrop-blur-md rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs max-w-sm sm:max-w-md w-full">
            <button
              type="button"
              onClick={() => setCompactActiveTab("code")}
              className={`flex-1 py-1.5 px-3 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                compactActiveTab === "code"
                  ? "bg-white dark:bg-neutral-800 text-purple-700 dark:text-purple-300 shadow-xs font-bold border border-purple-200/40 dark:border-purple-800/40"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-purple-500" />
              <span>WDL Code</span>
              {wispDocument.diagnostics.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300/40">
                  {wispDocument.diagnostics.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setCompactActiveTab("preview")}
              className={`flex-1 py-1.5 px-3 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                compactActiveTab === "preview"
                  ? "bg-white dark:bg-neutral-800 text-purple-700 dark:text-purple-300 shadow-xs font-bold border border-purple-200/40 dark:border-purple-800/40"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              <span>Live Preview</span>
              {currentScreen && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-md font-mono bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40 truncate max-w-[100px]">
                  @{currentScreen.name}
                </span>
              )}
            </button>
          </div>

          <div className="hidden sm:flex items-center text-[11px] text-neutral-400 dark:text-neutral-500 font-mono">
            <span>Compact Mode (&lt;1320px)</span>
          </div>
        </div>
      )}

      {/* Main Studio Body with Resizable Splitter (>=1320px) or Full-Width Pane (<1320px) */}
      <div
        ref={splitContainerRef}
        className="flex-1 min-h-0 flex overflow-hidden p-3 md:p-4 gap-0 relative"
      >
        {/* Left Pane: Wisp Code Editor */}
        {!isPresentationMode && (!isCompactScreen || compactActiveTab === "code") && (
          <div
            className="flex flex-col h-full min-h-0 shrink-0 transition-all duration-75"
            style={{
              width: isCompactScreen || isEditorMaximized ? "100%" : `${editorWidthPercent}%`,
              display: "flex",
            }}
          >
            <WispCodeEditor
              code={wispCode}
              onChange={handleCodeChange}
              diagnostics={wispDocument.diagnostics}
              highlightLine={highlightLine}
              highlightBlock={highlightBlock}
              onCursorLineChange={handleCursorLineChange}
              inspectMode={inspectMode}
              onOpenDocs={() => setIsDocsOpen(true)}
              onNewCode={handleNewProject}
              isMaximized={isEditorMaximized}
              onToggleMaximize={() => setIsEditorMaximized(!isEditorMaximized)}
              previewIsDark={isDark}
            />
          </div>
        )}

        {/* Interactive Drag Handle Divider (Only for Large/HD screens >=1320px) */}
        {!isPresentationMode && !isCompactScreen && !isEditorMaximized && (
          <div
            onMouseDown={handleMouseDown}
            className={`w-3 mx-1 flex items-center justify-center cursor-col-resize select-none group transition-all shrink-0 z-20 ${
              isDraggingSplitter ? "bg-purple-600/30 rounded-full" : "hover:bg-purple-500/10"
            }`}
            title="Drag to resize editor and live preview"
          >
            <div
              className={`w-1 h-12 rounded-full transition-all flex items-center justify-center ${
                isDraggingSplitter
                  ? "bg-purple-600 h-20"
                  : "bg-neutral-300 dark:bg-neutral-700 group-hover:bg-purple-500 group-hover:h-16"
              }`}
            />
          </div>
        )}

        {/* Right Pane: Material 3 Expressive Live Preview */}
        {!isEditorMaximized && (!isCompactScreen || compactActiveTab === "preview") && (
          <div
            className={`flex-1 flex flex-col h-full bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xl overflow-hidden ${
              isCompactScreen ? "w-full min-w-0" : "min-w-[320px]"
            }`}
          >
            {/* Canvas Subheader / Preview Toolbar */}
            <div className="h-12 border-b border-neutral-200 dark:border-neutral-800 px-4 flex items-center justify-between bg-neutral-50/80 dark:bg-neutral-950/80 text-xs shrink-0 select-none">
              {/* Width Presets & Viewport switcher */}
              <div className="flex items-center gap-2">
                {/* Viewport switcher */}
                <div className="flex items-center gap-1 bg-neutral-200/60 dark:bg-neutral-800/80 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setViewportMode("desktop")}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      viewportMode === "desktop"
                        ? "bg-white dark:bg-neutral-700 text-purple-700 dark:text-purple-300 shadow-xs"
                        : "text-neutral-500 hover:text-neutral-800 dark:hover:text-white"
                    }`}
                    title="Desktop View (100% width)"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewportMode("tablet")}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      viewportMode === "tablet"
                        ? "bg-white dark:bg-neutral-700 text-purple-700 dark:text-purple-300 shadow-xs"
                        : "text-neutral-500 hover:text-neutral-800 dark:hover:text-white"
                    }`}
                    title="iPad Tablet View (768px)"
                  >
                    <Tablet className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewportMode("mobile")}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      viewportMode === "mobile"
                        ? "bg-white dark:bg-neutral-700 text-purple-700 dark:text-purple-300 shadow-xs"
                        : "text-neutral-500 hover:text-neutral-800 dark:hover:text-white"
                    }`}
                    title="Pixel Mobile View (390px)"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Quick Split Width Presets */}
                <div className="hidden sm:flex items-center gap-1 text-[11px] text-neutral-500 font-mono">
                  <span className="text-[10px] uppercase font-semibold text-neutral-400">Editor:</span>
                  {[35, 50, 65].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setEditorWidthPercent(pct)}
                      className={`px-1.5 py-0.5 rounded cursor-pointer transition-all ${
                        Math.round(editorWidthPercent) === pct
                          ? "bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-bold"
                          : "hover:bg-neutral-200 dark:hover:bg-neutral-800"
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Inspect Mode Toggle & Presentation */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (inspectMode) {
                      setInspectMode(false);
                      setSelectedNodeId(null);
                      setHighlightBlock(null);
                      setHighlightLine(null);
                    } else {
                      setInspectMode(true);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                    inspectMode
                      ? "bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border-purple-400 shadow-xs ring-1 ring-purple-400/40"
                      : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700"
                  }`}
                  title="Bidirectional Inspect Mode: Click any element to highlight its code block, or move editor cursor to locate component on canvas"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Mode</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPresentationMode(true)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-all border border-neutral-200 dark:border-neutral-700 cursor-pointer"
                  title="Fullscreen presentation mode without code"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Presentation</span>
                </button>
              </div>
            </div>

            {/* Live Canvas Viewport Container */}
            <div className="flex-1 overflow-auto p-4 md:p-6 bg-neutral-100/50 dark:bg-neutral-950/50 flex justify-center items-start">
              <div
                className={`transition-all duration-300 w-full ${
                  viewportMode === "mobile"
                    ? "max-w-[400px] bg-white dark:bg-neutral-900 rounded-[44px] p-3.5 sm:p-4 border-[10px] border-neutral-900 dark:border-neutral-800 shadow-2xl min-h-[720px] flex flex-col"
                    : viewportMode === "tablet"
                    ? "max-w-[780px] bg-white dark:bg-neutral-900 rounded-[32px] p-5 sm:p-6 border-[8px] border-neutral-900 dark:border-neutral-800 shadow-2xl min-h-[600px]"
                    : "max-w-5xl bg-white dark:bg-neutral-900 rounded-3xl p-6 md:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-sm"
                }`}
                style={{
                  backgroundColor: activeColorScheme.surface,
                  color: activeColorScheme.onSurface,
                }}
              >
                {viewportMode === "mobile" && (
                  <div className="w-full flex items-center justify-between px-2 pt-1 pb-3 shrink-0 select-none">
                    <span className="text-[11px] font-bold tracking-tight opacity-60">9:41</span>
                    <div className="w-20 h-4 bg-neutral-900 dark:bg-neutral-800 rounded-full flex items-center justify-end px-2 shadow-inner">
                      <div className="w-1.5 h-1.5 rounded-full bg-neutral-700" />
                    </div>
                    <div className="flex items-center gap-1.5 opacity-60 text-[11px] font-semibold">
                      <span>5G</span>
                      <div className="w-4 h-2.5 rounded-xs border border-current flex items-center p-0.5">
                        <div className="w-full h-full bg-current rounded-2xs" />
                      </div>
                    </div>
                  </div>
                )}

                {currentScreen ? (
                  <MaterialRenderer
                    screen={currentScreen}
                    allScreens={wispDocument.screens}
                    colorScheme={activeColorScheme}
                    isDark={isDark}
                    inspectMode={inspectMode}
                    selectedNodeId={selectedNodeId}
                    flashNodeId={flashNodeId}
                    flashTimestamp={flashTimestamp}
                    onSelectNode={handleInspectSelect}
                    onNavigate={handleNavigate}
                    activeWizardStep={activeWizardStep}
                    onWizardStepChange={setActiveWizardStep}
                    viewportMode={viewportMode}
                    activeToast={activeToast}
                    onTriggerToast={setActiveToast}
                  />
                ) : (
                  <div className="text-center py-16 text-neutral-400 space-y-2">
                    <p className="text-lg font-bold">No screens declared</p>
                    <p className="text-xs">
                      Write <code className="font-mono text-purple-600">@Home:screen</code> in the editor to start prototyping.
                    </p>
                  </div>
                )}
              </div>

              {/* Global Floating Active Snackbar / Toast Notification Overlay */}
              <AnimatePresence>
                {activeToast && (
                  <motion.div
                    key={activeToast.id}
                    initial={{ opacity: 0, y: viewportMode === "mobile" ? 28 : -28, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: viewportMode === "mobile" ? 16 : -16, scale: 0.96 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className={`fixed ${
                      viewportMode === "mobile"
                        ? "bottom-6 left-4 right-4"
                        : "top-20 right-6 md:right-10 max-w-md"
                    } z-50 shadow-2xl rounded-2xl p-3.5 sm:p-4 border flex items-center justify-between gap-3 text-xs sm:text-sm backdrop-blur-md`}
                    style={{
                      backgroundColor: activeColorScheme.inverseSurface || "#1F1F24",
                      color: activeColorScheme.inverseOnSurface || "#F1F0F7",
                      borderColor: "rgba(255,255,255,0.12)",
                    }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {activeToast.icon ? (
                        <DynamicIcon name={activeToast.icon} className="w-4 h-4 shrink-0" />
                      ) : activeToast.type === "success" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : activeToast.type === "warning" ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      ) : activeToast.type === "error" ? (
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      ) : (
                        <Info className="w-4 h-4 text-sky-400 shrink-0" />
                      )}
                      <span className="font-medium truncate leading-relaxed">{activeToast.message}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {activeToast.action && (
                        <button
                          type="button"
                          onClick={() => {
                            if (activeToast.goto) {
                              handleNavigate(activeToast.goto);
                            }
                            setActiveToast(null);
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all hover:bg-white/15 active:scale-95 cursor-pointer uppercase tracking-wider select-none"
                          style={{
                            color: activeColorScheme.inversePrimary || "#D0BCFF",
                          }}
                        >
                          {activeToast.action}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setActiveToast(null)}
                        className="p-1 rounded-full hover:bg-white/15 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                        title="Close notification"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AICopilotModal
        isOpen={isAICopilotOpen}
        onClose={() => setIsAICopilotOpen(false)}
        currentCode={wispCode}
        onApplyWisp={handleApplyAICode}
        initialPrompt={initialAIPrompt}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        document={wispDocument}
      />

      <WispDocsModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
        onSendToAICopilot={handleSendPromptToAI}
      />

      <UnsavedChangesModal
        isOpen={isUnsavedWarningOpen}
        targetTemplate={pendingTemplate}
        onConfirmDownloadAndApply={handleConfirmDownloadAndApplyTemplate}
        onConfirmDiscardAndApply={handleConfirmDiscardTemplate}
        onCancel={handleCancelTemplateSwitch}
      />

      <M3ThemeStudioModal
        isOpen={isM3ThemeStudioOpen}
        onClose={() => setIsM3ThemeStudioOpen(false)}
        currentPresetId={currentPresetId}
        onSelectPreset={handleSelectPreset}
        seedHex={seedHex}
        onChangeSeedHex={setSeedHex}
        schemeVariant={schemeVariant}
        onChangeSchemeVariant={setSchemeVariant}
        contrastLevel={contrastLevel}
        onChangeContrastLevel={setContrastLevel}
        isDark={isDark}
        onToggleDarkMode={() => setIsDark(!isDark)}
        activeColorScheme={activeColorScheme}
      />
    </div>
  );
}
