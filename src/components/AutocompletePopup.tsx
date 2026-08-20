import React, { useEffect, useRef } from "react";
import { WispCompletionItem, CompletionKind } from "../wisp/completions";
import {
  Code,
  Layout,
  Sliders,
  Sparkles,
  Info,
  Layers,
  Check,
  CornerDownLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react";

interface AutocompletePopupProps {
  items: WispCompletionItem[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  onAccept: (item: WispCompletionItem) => void;
  onClose: () => void;
  position: { top: number; left: number };
}

export const AutocompletePopup: React.FC<AutocompletePopupProps> = ({
  items,
  selectedIndex,
  onSelectIndex,
  onAccept,
  onClose,
  position,
}) => {
  const listRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the list to keep active item in view
  useEffect(() => {
    if (activeItemRef.current && listRef.current) {
      activeItemRef.current.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [selectedIndex]);

  if (items.length === 0) return null;

  const selectedItem = items[selectedIndex] || items[0];

  const getKindBadge = (kind: CompletionKind) => {
    switch (kind) {
      case "keyword":
        return {
          icon: <Code className="w-3.5 h-3.5 text-sky-400" />,
          label: "Palabra clave",
          badge: "K",
          color: "bg-sky-500/20 text-sky-300 border-sky-500/40",
        };
      case "screen":
        return {
          icon: <Layout className="w-3.5 h-3.5 text-purple-400" />,
          label: "Pantalla / Contenedor",
          badge: "S",
          color: "bg-purple-500/20 text-purple-300 border-purple-500/40",
        };
      case "parameter":
        return {
          icon: <Sliders className="w-3.5 h-3.5 text-emerald-400" />,
          label: "Parámetro",
          badge: "P",
          color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
        };
      case "modifier":
        return {
          icon: <Layers className="w-3.5 h-3.5 text-amber-400" />,
          label: "Modificador / Variante",
          badge: "M",
          color: "bg-amber-500/20 text-amber-300 border-amber-500/40",
        };
      case "icon":
        return {
          icon: <Sparkles className="w-3.5 h-3.5 text-rose-400" />,
          label: "Ícono",
          badge: "I",
          color: "bg-rose-500/20 text-rose-300 border-rose-500/40",
        };
      default:
        return {
          icon: <Info className="w-3.5 h-3.5 text-neutral-400" />,
          label: "Snippet",
          badge: "✂",
          color: "bg-neutral-500/20 text-neutral-300 border-neutral-500/40",
        };
    }
  };

  const selectedBadge = getKindBadge(selectedItem.kind);

  return (
    <div
      id="wisp-autocomplete-popup"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      className="absolute z-50 flex flex-col md:flex-row shadow-2xl rounded-xl border border-neutral-700/80 bg-[#16171d] backdrop-blur-xl text-neutral-200 overflow-hidden font-sans text-xs max-h-[420px] w-[340px] md:w-[680px] animate-in fade-in zoom-in-95 duration-100 ring-1 ring-black/40"
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* LEFT LIST OF SUGGESTIONS (VS Code Style) */}
      <div className="flex flex-col w-full md:w-[280px] border-b md:border-b-0 md:border-r border-neutral-800 shrink-0 bg-[#121318]">
        {/* Header Bar */}
        <div className="px-3 py-2 bg-neutral-900/90 border-b border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400 font-medium select-none">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            <span>Autocompletado Wisp</span>
          </div>
          <span className="text-[10px] text-neutral-500 font-mono">
            {selectedIndex + 1}/{items.length}
          </span>
        </div>

        {/* Suggestion Items */}
        <div
          ref={listRef}
          className="overflow-y-auto max-h-[220px] md:max-h-[350px] p-1 space-y-0.5 custom-scrollbar"
        >
          {items.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            const badge = getKindBadge(item.kind);

            return (
              <div
                key={`${item.label}-${idx}`}
                ref={isSelected ? activeItemRef : undefined}
                onMouseEnter={() => onSelectIndex(idx)}
                onClick={() => onAccept(item)}
                className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors text-[12px] font-mono ${
                  isSelected
                    ? "bg-purple-600 text-white font-medium shadow-xs"
                    : "hover:bg-neutral-800/60 text-neutral-300"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <span
                    className={`w-4 h-4 flex items-center justify-center rounded text-[10px] font-bold shrink-0 border ${
                      isSelected
                        ? "bg-white/20 text-white border-white/40"
                        : badge.color
                    }`}
                  >
                    {badge.badge}
                  </span>
                  <span
                    className={`truncate ${
                      isSelected ? "text-white font-bold" : "text-neutral-100"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0 text-[10px]">
                  <span
                    className={`truncate max-w-[90px] ${
                      isSelected ? "text-purple-200 opacity-90" : "text-neutral-500"
                    }`}
                  >
                    {item.detail.split(" ")[0]}
                  </span>
                  {isSelected && (
                    <CornerDownLeft className="w-3 h-3 text-purple-200 opacity-80" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-3 py-1.5 bg-neutral-950/80 border-t border-neutral-800/80 text-[10px] text-neutral-400 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <span>
              <kbd className="px-1 py-0.2 bg-neutral-800 rounded text-[9px] border border-neutral-700 text-neutral-300 font-mono">
                Tab
              </kbd>{" "}
              o{" "}
              <kbd className="px-1 py-0.2 bg-neutral-800 rounded text-[9px] border border-neutral-700 text-neutral-300 font-mono">
                ↵
              </kbd>{" "}
              insertar
            </span>
          </div>
          <span>
            <kbd className="px-1 py-0.2 bg-neutral-800 rounded text-[9px] border border-neutral-700 text-neutral-300 font-mono">
              Esc
            </kbd>{" "}
            cerrar
          </span>
        </div>
      </div>

      {/* RIGHT DOCUMENTATION FLYOUT (VS Code IntelliSense Doc Panel) */}
      <div className="flex flex-col flex-1 p-3.5 bg-[#181920] overflow-y-auto max-h-[220px] md:max-h-[390px] custom-scrollbar">
        {/* Header with Title & Signature */}
        <div className="border-b border-neutral-800 pb-2.5 mb-2.5">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border flex items-center gap-1 ${selectedBadge.color}`}
            >
              {selectedBadge.icon}
              <span>{selectedBadge.label}</span>
            </span>
            <span className="text-[13px] font-bold text-white font-mono">
              {selectedItem.label}
            </span>
          </div>

          <div className="bg-[#101115] border border-neutral-800 px-2.5 py-1 rounded text-purple-300 font-mono text-[11px] mt-1.5 select-all overflow-x-auto whitespace-nowrap">
            {selectedItem.detail}
          </div>
        </div>

        {/* Documentation Paragraph */}
        <div className="text-neutral-300 text-[11.5px] leading-relaxed mb-3">
          {selectedItem.documentation}
        </div>

        {/* Parameters & Options List */}
        {selectedItem.parameters && selectedItem.parameters.length > 0 && (
          <div className="mb-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center gap-1">
              <Sliders className="w-3 h-3 text-purple-400" />
              <span>Parámetros y Opciones</span>
            </div>
            <div className="space-y-1.5 bg-neutral-900/60 p-2 rounded-lg border border-neutral-800/80">
              {selectedItem.parameters.map((param, pIdx) => (
                <div key={pIdx} className="text-[11px] flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-semibold text-emerald-300 bg-emerald-950/40 px-1 rounded border border-emerald-800/40 text-[10px]">
                      {param.name}
                    </span>
                    <span className="text-[10px] text-neutral-500 italic">
                      ({param.type})
                    </span>
                  </div>
                  <span className="text-neutral-300 text-[10.5px] pl-1">
                    {param.description}
                  </span>
                  {param.values && (
                    <div className="flex flex-wrap gap-1 mt-0.5 pl-1">
                      <span className="text-[9.5px] text-neutral-500">Valores:</span>
                      {param.values.map((val) => (
                        <span
                          key={val}
                          className="font-mono text-[9px] bg-neutral-800 text-neutral-300 px-1 py-0.2 rounded border border-neutral-700"
                        >
                          {val}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Example Snippet */}
        {selectedItem.example && (
          <div className="mt-auto pt-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Code className="w-3 h-3 text-sky-400" />
                <span>Ejemplo de Sintaxis Wisp</span>
              </div>
              <button
                type="button"
                onClick={() => onAccept(selectedItem)}
                className="text-purple-400 hover:text-purple-300 hover:underline text-[10px] font-sans flex items-center gap-0.5 cursor-pointer"
              >
                <span>Insertar</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <pre className="p-2 rounded-lg bg-[#0e0f14] border border-neutral-800/90 text-purple-200/90 font-mono text-[10.5px] overflow-x-auto whitespace-pre leading-relaxed select-all">
              {selectedItem.example}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
