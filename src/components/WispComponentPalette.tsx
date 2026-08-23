import React, { useState, useMemo, useRef } from "react";
import {
  Search,
  X,
  Plus,
  Sparkles,
  Layers,
  Check,
  ArrowRight,
  Info,
  SlidersHorizontal,
  ChevronRight,
  Eye,
  AlertTriangle,
  HelpCircle,
  Copy,
  Compass,
} from "lucide-react";
import {
  PaletteCategory,
  PaletteComponentItem,
  WispCursorContext,
  WISP_PALETTE_CATALOG,
  evaluateComponentContext,
} from "../wisp/paletteCatalog";

export interface WispComponentPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  cursorContext: WispCursorContext;
  onInsert: (snippet: string) => void;
  isLight?: boolean;
  previewIsDark?: boolean;
}

const CATEGORIES: { id: string; label: string; countBadge?: number }[] = [
  { id: "suggested", label: "⭐ Suggested" },
  { id: "all", label: "All" },
  { id: "Views & Root", label: "Views" },
  { id: "Layout & Surfaces", label: "Layout" },
  { id: "Inputs & Forms", label: "Inputs" },
  { id: "Actions & Controls", label: "Actions" },
  { id: "Data & Tables", label: "Data" },
  { id: "Feedback & Alerts", label: "Feedback" },
  { id: "Logic & Flow", label: "Logic" },
];

export const WispComponentPalette: React.FC<WispComponentPaletteProps> = ({
  isOpen,
  onClose,
  cursorContext,
  onInsert,
  isLight = false,
  previewIsDark = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("suggested");
  const [onlyContextual, setOnlyContextual] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<PaletteComponentItem | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ top: number }>({ top: 100 });
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Evaluate each component against the current cursor context
  const evaluatedCatalog = useMemo(() => {
    return WISP_PALETTE_CATALOG.map((item) => {
      const evaluation = evaluateComponentContext(item, cursorContext);
      return {
        ...item,
        evaluation,
      };
    });
  }, [cursorContext]);

  // Suggested count for badge
  const suggestedCount = useMemo(() => {
    return evaluatedCatalog.filter((item) => item.evaluation.isRecommended).length;
  }, [evaluatedCatalog]);

  // Filter items according to search query, selected category, and contextual filters
  const filteredItems = useMemo(() => {
    let list = evaluatedCatalog;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.label.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.modifiers.some((m) => m.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategory === "suggested" || selectedCategory === "sugeridos") {
      list = list.filter((item) => item.evaluation.isRecommended);
    } else if (selectedCategory !== "all" && selectedCategory !== "todos") {
      list = list.filter((item) => {
        if (item.category === selectedCategory) return true;
        // Category mapping fallback
        if (selectedCategory === "Views & Root" && (item.category === "Views & Root" || item.category === ("Vistas & Raíz" as any))) return true;
        if (selectedCategory === "Layout & Surfaces" && (item.category === "Layout & Surfaces" || item.category === ("Layout & Superficie" as any))) return true;
        if (selectedCategory === "Inputs & Forms" && (item.category === "Inputs & Forms" || item.category === ("Entradas & Formularios" as any))) return true;
        if (selectedCategory === "Actions & Controls" && (item.category === "Actions & Controls" || item.category === ("Acciones & Controles" as any))) return true;
        if (selectedCategory === "Data & Tables" && (item.category === "Data & Tables" || item.category === ("Datos & Tablas" as any))) return true;
        if (selectedCategory === "Feedback & Alerts" && (item.category === "Feedback & Alerts" || item.category === ("Feedback & Alertas" as any))) return true;
        if (selectedCategory === "Logic & Flow" && (item.category === "Logic & Flow" || item.category === ("Lógica & Flujo" as any))) return true;
        return false;
      });
    }

    // Strict contextual mode
    if (onlyContextual && selectedCategory !== "suggested" && selectedCategory !== "sugeridos") {
      list = list.filter((item) => item.evaluation.isAllowed);
    }

    return list;
  }, [evaluatedCatalog, searchQuery, selectedCategory, onlyContextual]);

  // Handle hover popover triggering
  const handleMouseEnter = (item: PaletteComponentItem, e: React.MouseEvent<HTMLDivElement>) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverPosition({ top: Math.max(70, Math.min(rect.top - 40, window.innerHeight - 380)) });
    setHoveredItem(item);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredItem(null);
    }, 150);
  };

  const handleCopy = (e: React.MouseEvent, item: PaletteComponentItem) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.snippet);
    setCopiedSnippetId(item.id);
    setTimeout(() => setCopiedSnippetId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <aside
      aria-label="Wisp Component Palette"
      className={`absolute top-0 right-0 bottom-0 w-84 sm:w-96 z-40 flex flex-col shadow-2xl border-l backdrop-blur-xl transition-all duration-200 select-none ${
        isLight
          ? "bg-white/95 border-neutral-300 text-neutral-800"
          : "bg-[#181622]/95 border-neutral-800 text-neutral-100"
      }`}
    >
      {/* Header */}
      <div
        className={`p-3.5 border-b flex items-center justify-between shrink-0 ${
          isLight ? "bg-neutral-50/80 border-neutral-200" : "bg-[#14121A]/80 border-neutral-800"
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-xs tracking-tight flex items-center gap-1.5">
              <span>Component Palette</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-purple-900/40 text-purple-300 border border-purple-700/50">
                {WISP_PALETTE_CATALOG.length}
              </span>
            </h2>
            <p className="text-[10px] text-neutral-400">Insert Material 3 elements with 1 click</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
            isLight
              ? "hover:bg-neutral-200 border-neutral-300 text-neutral-600"
              : "hover:bg-neutral-800 border-neutral-700/60 text-neutral-400 hover:text-white"
          }`}
          title="Close component palette"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Context Indicator Banner */}
      <div
        className={`px-3 py-2 border-b text-[11px] shrink-0 flex items-center justify-between ${
          cursorContext.isInsideTable
            ? "bg-teal-950/40 border-teal-800/60 text-teal-300"
            : cursorContext.isInsideSelect
            ? "bg-blue-950/40 border-blue-800/60 text-blue-300"
            : cursorContext.isAtRoot
            ? "bg-purple-950/40 border-purple-800/60 text-purple-300"
            : isLight
            ? "bg-purple-50 border-purple-200 text-purple-900"
            : "bg-[#201C2B] border-neutral-800 text-neutral-300"
        }`}
      >
        <div className="flex items-center gap-1.5 overflow-hidden">
          <Compass className="w-3.5 h-3.5 shrink-0 text-purple-400" />
          <div className="truncate">
            <span className="font-semibold">Line {cursorContext.lineNum}: </span>
            <span className="font-mono text-[10px]">
              {cursorContext.parentPath.length > 0
                ? cursorContext.parentPath.map((p) => p.label).join(" > ")
                : cursorContext.enclosingContainerLabel}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOnlyContextual(!onlyContextual)}
          className={`text-[9px] px-1.5 py-0.5 rounded font-semibold shrink-0 transition-colors border cursor-pointer ${
            onlyContextual
              ? "bg-purple-600 text-white border-purple-500"
              : "bg-neutral-800/80 text-neutral-400 border-neutral-700 hover:text-neutral-200"
          }`}
          title="Toggle contextual compatibility filter"
        >
          {onlyContextual ? "Valid Only" : "All"}
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-neutral-800/60 shrink-0">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
            isLight
              ? "bg-neutral-100 border-neutral-300 text-neutral-800"
              : "bg-[#121118] border-neutral-700/80 text-neutral-200"
          }`}
        >
          <Search className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, type, or attribute..."
            className="w-full bg-transparent text-xs outline-none placeholder:text-neutral-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-neutral-400 hover:text-neutral-200"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills (Horizontal Scroll) */}
      <div
        className={`px-3 py-2 border-b flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 text-xs ${
          isLight ? "bg-neutral-50/50 border-neutral-200" : "border-neutral-800/60"
        }`}
      >
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-medium whitespace-nowrap transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? "bg-purple-600 text-white shadow-xs font-semibold"
                  : isLight
                  ? "bg-neutral-200/80 text-neutral-700 hover:bg-neutral-300"
                  : "bg-neutral-800/70 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200"
              }`}
            >
              <span>{cat.label}</span>
              {(cat.id === "suggested" || cat.id === "sugeridos") && (
                <span
                  className={`text-[9px] px-1 rounded-full font-mono ${
                    isSelected ? "bg-white/20 text-white" : "bg-purple-950 text-purple-300"
                  }`}
                >
                  {suggestedCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Component Cards List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
        {filteredItems.length === 0 ? (
          <div className="text-center py-10 px-4 text-neutral-400 space-y-2">
            <Info className="w-6 h-6 mx-auto text-neutral-500 opacity-60" />
            <p className="text-xs">No components found for this filter.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("todos");
                setOnlyContextual(false);
              }}
              className="text-[11px] text-purple-400 font-semibold hover:underline cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        ) : (
          filteredItems.map((item) => {
            const Icon = item.icon;
            const isRec = item.evaluation.isRecommended;
            const isAllowed = item.evaluation.isAllowed;

            return (
              <div
                key={item.id}
                onMouseEnter={(e) => handleMouseEnter(item, e)}
                onMouseLeave={handleMouseLeave}
                onClick={() => onInsert(item.snippet)}
                className={`group relative p-2.5 rounded-2xl border transition-all duration-150 cursor-pointer ${
                  !isAllowed
                    ? "opacity-50 hover:opacity-80 bg-neutral-900/30 border-neutral-800/40"
                    : isRec
                    ? isLight
                      ? "bg-purple-50/70 hover:bg-purple-100/80 border-purple-200 hover:border-purple-400"
                      : "bg-[#1E1B29] hover:bg-[#252233] border-purple-900/40 hover:border-purple-500/70"
                    : isLight
                    ? "bg-white hover:bg-neutral-100 border-neutral-200 hover:border-neutral-300"
                    : "bg-neutral-900/80 hover:bg-neutral-800 border-neutral-800 hover:border-neutral-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-7 h-7 rounded-xl bg-gradient-to-tr ${item.color} text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-neutral-100">
                          {item.name}
                        </span>
                        {isRec && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-purple-600 text-white font-semibold shadow-xs">
                            Suggested
                          </span>
                        )}
                      </div>
                      <span className="block text-[10px] text-neutral-400 truncate">
                        {item.label} • {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Actions Button */}
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <button
                      type="button"
                      onClick={(e) => handleCopy(e, item)}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        copiedSnippetId === item.id
                          ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                          : "bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white border-neutral-700/60"
                      }`}
                      title="Copy syntax snippet"
                    >
                      {copiedSnippetId === item.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onInsert(item.snippet);
                      }}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-semibold shadow-xs transition-colors cursor-pointer"
                      title="Insert at cursor position"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Insert</span>
                    </button>
                  </div>
                </div>

                {/* Reason notice if restricted */}
                {!isAllowed && item.evaluation.reason && (
                  <div className="mt-1.5 flex items-center gap-1 text-[9px] text-amber-400/90 font-medium">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span className="truncate">{item.evaluation.reason}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Floating Hover Mini-Preview Card (Anchored to the left of the palette drawer) */}
      {hoveredItem && (
        <div
          onMouseEnter={() => {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
          }}
          onMouseLeave={handleMouseLeave}
          style={{ top: `${hoverPosition.top}px` }}
          className="fixed right-88 sm:right-100 w-80 bg-[#161420]/98 backdrop-blur-2xl border border-neutral-700 rounded-3xl p-4 shadow-2xl z-50 text-left animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-xl bg-gradient-to-tr ${hoveredItem.color} text-white flex items-center justify-center shadow-md`}
              >
                {React.createElement(hoveredItem.icon, { className: "w-3.5 h-3.5" })}
              </span>
              <div>
                <span className="font-mono font-bold text-neutral-100 text-xs">
                  {hoveredItem.name}
                </span>
                <span className="block text-[10px] text-neutral-400">
                  {hoveredItem.category}
                </span>
              </div>
            </div>
            <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/80 uppercase">
              Material 3
            </span>
          </div>

          {/* Description */}
          <p className="text-[11px] text-neutral-300 my-2.5 leading-relaxed">
            {hoveredItem.description}
          </p>

          {/* Live Visual Preview */}
          <div className="my-2.5">
            <div className="text-[9px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Live Preview:</span>
              <span className="text-purple-400 text-[8px] font-mono">
                M3 Render ({previewIsDark ? "Dark" : "Light"})
              </span>
            </div>
            {hoveredItem.renderPreview(!previewIsDark)}
          </div>

          {/* Syntax Code Box */}
          <div className="mt-2.5 bg-[#0C0B10] p-2.5 rounded-2xl border border-neutral-800 font-mono text-[10px] text-neutral-300 overflow-x-auto whitespace-pre no-scrollbar">
            <div className="text-[9px] text-purple-400 font-bold uppercase tracking-wider mb-1">
              Wisp Syntax:
            </div>
            <code>{hoveredItem.snippet}</code>
          </div>

          {/* Modifiers List */}
          <div className="mt-2.5 pt-2 border-t border-neutral-800 flex flex-wrap gap-1 items-center">
            <span className="text-[9px] text-neutral-500 uppercase font-semibold mr-1">
              Modifiers:
            </span>
            {hoveredItem.modifiers.slice(0, 4).map((mod, idx) => (
              <span
                key={idx}
                className="text-[9px] px-1.5 py-0.5 rounded-md bg-neutral-800 text-neutral-300 font-mono"
              >
                {mod}
              </span>
            ))}
          </div>

          {/* Quick Insert Action Footer */}
          <div className="mt-3 pt-2 border-t border-neutral-800 flex items-center justify-between">
            <span className="text-[10px] text-neutral-400 italic">Click card to insert into editor</span>
            <button
              type="button"
              onClick={() => {
                onInsert(hoveredItem.snippet);
                setHoveredItem(null);
              }}
              className="flex items-center gap-1 px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold shadow-md cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Insert Now</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
