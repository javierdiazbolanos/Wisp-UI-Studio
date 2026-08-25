import React, { useState } from "react";
import { WispDocument } from "../wisp/types";
import {
  exportToReactTSX,
  exportToHTML,
  exportToJetpackCompose,
  exportToFlutterM3,
} from "../wisp/exporter";
import { M3ColorScheme } from "../theme/material3";
import {
  X,
  Copy,
  Check,
  Download,
  FileCode,
  Code,
  Smartphone,
  HelpCircle,
} from "lucide-react";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: WispDocument;
  colorScheme?: M3ColorScheme;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  document,
  colorScheme,
}) => {
  const [activeTab, setActiveTab] = useState<
    "compose" | "flutter" | "react" | "html" | "wisp"
  >("compose");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  let contentToDisplay = "";
  let fileExtension = "kt";
  let mimeType = "text/plain";
  let formatGuide = "";
  let howToUseGuide = "";

  if (activeTab === "compose") {
    contentToDisplay = exportToJetpackCompose(document);
    fileExtension = "kt";
    formatGuide = "Código nativo Jetpack Compose (Kotlin) con soporte de componentes Material 3 Expressive.";
    howToUseGuide = "Pega este código en tu proyecto Android Studio dentro de tu paquete de UI o composables.";
  } else if (activeTab === "flutter") {
    contentToDisplay = exportToFlutterM3(document);
    fileExtension = "dart";
    formatGuide = "Código Flutter Material 3 con State Management y navegación integrada.";
    howToUseGuide = "Pega este archivo en /lib/screens de tu proyecto Flutter.";
  } else if (activeTab === "react") {
    contentToDisplay = exportToReactTSX(document);
    fileExtension = "tsx";
    formatGuide = "Componentes modulares de React con TypeScript y Tailwind CSS.";
    howToUseGuide = "Úsalo en aplicaciones Next.js, Vite o Remix con Tailwind CSS.";
  } else if (activeTab === "html") {
    contentToDisplay = exportToHTML(document, { lightScheme: colorScheme });
    fileExtension = "html";
    mimeType = "text/html";
    formatGuide = "Archivo HTML autónomo interactivo con CSS Tokens y animaciones listas para previsualizar.";
    howToUseGuide = "Ábrelo directamente en cualquier navegador o súbelo a un hosting estático.";
  } else if (activeTab === "wisp") {
    contentToDisplay = document.rawCode;
    fileExtension = "wdsl";
    formatGuide = "Código fuente declarativo Wisp DSL original.";
    howToUseGuide = "Guárdalo como respaldo o compártelo para editarlo en Wisp Studio.";
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(contentToDisplay);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([contentToDisplay], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement("a");
    a.href = url;
    a.download =
      activeTab === "wisp"
        ? `wisp_design.wdsl`
        : `wisp-prototype.${fileExtension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-5xl bg-white dark:bg-neutral-900 rounded-3xl p-5 md:p-7 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-4 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <span>Exportar Prototipo Material 3</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                Multi-Destino
              </span>
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">{formatGuide}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab("compose")}
            className={`flex-1 min-w-[120px] py-1.5 px-2.5 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "compose"
                ? "bg-white dark:bg-neutral-700 shadow-sm text-purple-700 dark:text-purple-300"
                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
            <span>Jetpack Compose</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("flutter")}
            className={`flex-1 min-w-[100px] py-1.5 px-2.5 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "flutter"
                ? "bg-white dark:bg-neutral-700 shadow-sm text-purple-700 dark:text-purple-300"
                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-sky-500" />
            <span>Flutter M3</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("react")}
            className={`flex-1 min-w-[100px] py-1.5 px-2.5 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "react"
                ? "bg-white dark:bg-neutral-700 shadow-sm text-purple-700 dark:text-purple-300"
                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            }`}
          >
            <Code className="w-3.5 h-3.5 text-cyan-500" />
            <span>React (TSX)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("html")}
            className={`flex-1 min-w-[100px] py-1.5 px-2.5 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "html"
                ? "bg-white dark:bg-neutral-700 shadow-sm text-purple-700 dark:text-purple-300"
                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-emerald-500" />
            <span>HTML5</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("wisp")}
            className={`flex-1 min-w-[85px] py-1.5 px-2.5 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "wisp"
                ? "bg-white dark:bg-neutral-700 shadow-sm text-purple-700 dark:text-purple-300"
                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            }`}
          >
            <span>WDSL</span>
          </button>
        </div>

        {/* How to use instruction helper */}
        <div className="flex items-center gap-2 px-3 py-2 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl text-xs text-neutral-600 dark:text-neutral-300 border border-neutral-200/60 dark:border-neutral-800/60">
          <HelpCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
          <span className="font-medium">{howToUseGuide}</span>
        </div>

        {/* Code / Script Content Display */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-[300px]">
          <div className="flex-1 overflow-y-auto p-4 bg-neutral-950 text-purple-200 font-mono text-xs rounded-2xl border border-neutral-800 whitespace-pre selection:bg-purple-800 selection:text-white">
            {contentToDisplay}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full cursor-pointer"
          >
            Cerrar
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="px-4 py-2 text-xs font-semibold rounded-full border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar .{fileExtension}</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="px-5 py-2 text-xs font-semibold rounded-full bg-purple-700 hover:bg-purple-800 text-white shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar al Portapapeles</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
