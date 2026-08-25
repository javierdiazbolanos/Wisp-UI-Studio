import React, { useState, useRef, useEffect, useMemo } from "react";
import { ScreenNode, ScreenType } from "../wisp/types";
import { motion, AnimatePresence } from "motion/react";
import {
  Smartphone,
  Layers,
  AppWindow,
  PanelBottom,
  FileText,
  Bell,
  Sparkles,
  Boxes,
  ChevronDown,
  Search,
  Check,
  Code2,
  Plus,
  ArrowRight,
  Filter,
} from "lucide-react";

interface ScreenNavigatorDropdownProps {
  screens: ScreenNode[];
  activeScreenName: string;
  onSelectScreen: (screenName: string) => void;
  onJumpToLine?: (line: number) => void;
  onInsertSnippet?: (snippet: string) => void;
  onOpenCreateModal?: () => void;
}

export const ScreenNavigatorDropdown: React.FC<ScreenNavigatorDropdownProps> = ({
  screens,
  activeScreenName,
  onSelectScreen,
  onJumpToLine,
  onInsertSnippet,
  onOpenCreateModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Focus search input when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery("");
    }
  }, [isOpen]);

  // Get active screen object
  const activeScreen = useMemo(
    () => screens.find((s) => s.name === activeScreenName) || screens[0],
    [screens, activeScreenName]
  );

  // Icon & Style Helper per ScreenType
  const getTypeMeta = (type: ScreenType) => {
    switch (type) {
      case "wizard":
        return {
          icon: <Layers className="w-3.5 h-3.5 text-indigo-500" />,
          label: "Wizard",
          badgeColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300/40",
          category: "flows",
        };
      case "form":
        return {
          icon: <FileText className="w-3.5 h-3.5 text-blue-500" />,
          label: "Form",
          badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300/40",
          category: "screens",
        };
      case "dialog":
      case "modal":
        return {
          icon: <AppWindow className="w-3.5 h-3.5 text-amber-500" />,
          label: "Modal / Dialog",
          badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300/40",
          category: "overlays",
        };
      case "sheet":
        return {
          icon: <PanelBottom className="w-3.5 h-3.5 text-teal-500" />,
          label: "Sheet",
          badgeColor: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300/40",
          category: "overlays",
        };
      case "snackbar":
      case "toast":
        return {
          icon: <Bell className="w-3.5 h-3.5 text-emerald-500" />,
          label: "Snackbar / Toast",
          badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300/40",
          category: "toasts",
        };
      case "component":
        return {
          icon: <Boxes className="w-3.5 h-3.5 text-fuchsia-500" />,
          label: "Component",
          badgeColor: "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-300 border-fuchsia-300/40",
          category: "components",
        };
      case "screen":
      default:
        return {
          icon: <Smartphone className="w-3.5 h-3.5 text-purple-500" />,
          label: "Screen",
          badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300/40",
          category: "screens",
        };
    }
  };

  // Filter screens by search query
  const filteredScreens = useMemo(() => {
    if (!searchQuery.trim()) return screens;
    const q = searchQuery.toLowerCase();
    return screens.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.type.toLowerCase().includes(q) ||
        (s.props.title && String(s.props.title).toLowerCase().includes(q))
    );
  }, [screens, searchQuery]);

  // Group filtered screens
  const groupedScreens = useMemo(() => {
    const screensList: ScreenNode[] = [];
    const overlaysList: ScreenNode[] = [];
    const toastsList: ScreenNode[] = [];
    const componentsList: ScreenNode[] = [];

    filteredScreens.forEach((screen) => {
      const meta = getTypeMeta(screen.type);
      if (meta.category === "overlays") overlaysList.push(screen);
      else if (meta.category === "toasts") toastsList.push(screen);
      else if (meta.category === "components") componentsList.push(screen);
      else screensList.push(screen);
    });

    return {
      screensList,
      overlaysList,
      toastsList,
      componentsList,
    };
  }, [filteredScreens]);

  const activeMeta = activeScreen ? getTypeMeta(activeScreen.type) : null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-neutral-100/90 hover:bg-neutral-200/80 dark:bg-neutral-900/90 dark:hover:bg-neutral-800/90 border border-neutral-200/80 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 transition-all cursor-pointer shadow-xs group"
        title="Switch active screen or explore declared views and components"
      >
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-white dark:bg-neutral-800 shadow-xs border border-neutral-200/60 dark:border-neutral-700">
            {activeMeta?.icon || <Smartphone className="w-3.5 h-3.5 text-purple-500" />}
          </div>

          <div className="flex items-center gap-1.5 text-left">
            <span className="font-mono text-xs font-bold text-neutral-900 dark:text-white">
              @{activeScreen?.name || "No screens"}
            </span>

            {activeMeta && (
              <span
                className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded-md border font-sans ${activeMeta.badgeColor}`}
              >
                {activeScreen.type}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 pl-1 text-neutral-400 dark:text-neutral-500">
          <span className="text-[10px] font-mono font-medium hidden md:inline px-1 py-0.2 rounded bg-neutral-200/50 dark:bg-neutral-800">
            {screens.length} {screens.length === 1 ? "view" : "views"}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-purple-600 dark:text-purple-400" : ""
            }`}
          />
        </div>
      </button>

      {/* Popover Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#15131d] rounded-2xl p-2.5 shadow-2xl border border-neutral-200 dark:border-neutral-800 z-50 overflow-hidden"
          >
            {/* Header & Search */}
            <div className="p-1 mb-2 border-b border-neutral-100 dark:border-neutral-800 pb-2.5">
              <div className="flex items-center justify-between px-1 mb-2 text-xs">
                <span className="font-bold text-neutral-800 dark:text-neutral-200">
                  WDL Screen Navigator
                </span>
                <span className="text-[11px] font-mono text-neutral-400">
                  {screens.length} {screens.length === 1 ? "item" : "items"}
                </span>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search screen (@Home, modal, toast)..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-700/80 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Screen List grouped */}
            <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
              {filteredScreens.length === 0 ? (
                <div className="text-center py-6 text-neutral-400 space-y-1">
                  <p className="text-xs font-semibold">No matching screens found</p>
                  <p className="text-[10px]">Try searching by name or component type</p>
                </div>
              ) : (
                <>
                  {/* Group 1: Screens & Main Views */}
                  {groupedScreens.screensList.length > 0 && (
                    <div className="space-y-1">
                      <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                        📱 Screens & Main Views ({groupedScreens.screensList.length})
                      </div>
                      {groupedScreens.screensList.map((screen) =>
                        renderScreenItem(screen)
                      )}
                    </div>
                  )}

                  {/* Group 2: Dialogs, Modals & Sheets */}
                  {groupedScreens.overlaysList.length > 0 && (
                    <div className="space-y-1">
                      <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                        🪟 Dialogs, Modals & Sheets ({groupedScreens.overlaysList.length})
                      </div>
                      {groupedScreens.overlaysList.map((screen) =>
                        renderScreenItem(screen)
                      )}
                    </div>
                  )}

                  {/* Group 3: Snackbars & Toasts */}
                  {groupedScreens.toastsList.length > 0 && (
                    <div className="space-y-1">
                      <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                        🔔 Toasts & Snackbars ({groupedScreens.toastsList.length})
                      </div>
                      {groupedScreens.toastsList.map((screen) =>
                        renderScreenItem(screen)
                      )}
                    </div>
                  )}

                  {/* Group 4: Reusable Components */}
                  {groupedScreens.componentsList.length > 0 && (
                    <div className="space-y-1">
                      <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                        🧩 Reusable Components ({groupedScreens.componentsList.length})
                      </div>
                      {groupedScreens.componentsList.map((screen) =>
                        renderScreenItem(screen)
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer quick action buttons */}
            <div className="mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500 px-1">
              <span className="text-[10px]">WDL v1.0 M3</span>
              <div className="flex items-center gap-1.5">
                {onOpenCreateModal ? (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenCreateModal();
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-950 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 font-semibold cursor-pointer transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Screen</span>
                  </button>
                ) : onInsertSnippet ? (
                  <button
                    type="button"
                    onClick={() => {
                      onInsertSnippet("\n@NewScreen:screen\n  text \"Screen Title\" headline color=primary\n  card elevated\n    text \"Main content goes here\"\n");
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-950 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 font-semibold cursor-pointer transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Screen</span>
                  </button>
                ) : null}
                {onInsertSnippet && (
                  <button
                    type="button"
                    onClick={() => {
                      onInsertSnippet("\n@MyComponent:component\n  grid cols=2 gap=12\n    textfield firstName label=\"First Name\"\n    textfield lastName label=\"Last Name\"\n");
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-fuchsia-50 hover:bg-fuchsia-100 dark:bg-fuchsia-950 dark:hover:bg-fuchsia-900 text-fuchsia-700 dark:text-fuchsia-300 font-semibold cursor-pointer transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Component</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  function renderScreenItem(screen: ScreenNode) {
    const isCurrent = screen.name === activeScreenName;
    const meta = getTypeMeta(screen.type);
    const lineNum = screen.position?.line || screen.lineStart || 1;

    return (
      <div
        key={screen.name}
        className={`group flex items-center justify-between p-2 rounded-xl transition-all ${
          isCurrent
            ? "bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60"
            : "hover:bg-neutral-100 dark:hover:bg-neutral-800/60"
        }`}
      >
        <button
          type="button"
          onClick={() => {
            onSelectScreen(screen.name);
            setIsOpen(false);
          }}
          className="flex items-center gap-2.5 flex-1 min-w-0 text-left cursor-pointer"
        >
          <div className="p-1 rounded-lg bg-white dark:bg-neutral-800 shadow-2xs border border-neutral-200/50 dark:border-neutral-700 shrink-0">
            {meta.icon}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`font-mono text-xs font-bold truncate ${
                  isCurrent
                    ? "text-purple-700 dark:text-purple-300"
                    : "text-neutral-900 dark:text-white"
                }`}
              >
                @{screen.name}
              </span>
              <span
                className={`text-[9px] uppercase font-bold px-1.5 py-0.1 rounded-sm border font-sans ${meta.badgeColor}`}
              >
                {screen.type}
              </span>
            </div>

            <div className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate flex items-center gap-2 mt-0.5">
              <span>Line {lineNum}</span>
              {screen.steps && screen.steps.length > 0 && (
                <span>• {screen.steps.length} steps</span>
              )}
              {screen.children && screen.children.length > 0 && (
                <span>• {screen.children.length} items</span>
              )}
            </div>
          </div>
        </button>

        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
          {onJumpToLine && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onJumpToLine(lineNum);
                setIsOpen(false);
              }}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-neutral-700 text-neutral-400 hover:text-purple-600 dark:hover:text-purple-300 transition-all cursor-pointer"
              title="Jump to line in code editor"
            >
              <Code2 className="w-3.5 h-3.5" />
            </button>
          )}

          {isCurrent && (
            <div className="p-1 text-purple-600 dark:text-purple-400">
              <Check className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>
    );
  }
};
