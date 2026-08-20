import React, { useState } from "react";
import { WispDocument } from "../wisp/types";
import { exportToReactTSX, exportToHTML } from "../wisp/exporter";
import { X, Copy, Check, Download, FileCode, Code, Layers } from "lucide-react";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: WispDocument;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  document,
}) => {
  const [activeTab, setActiveTab] = useState<"react" | "html" | "ast" | "wisp">("react");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  let contentToDisplay = "";
  let fileExtension = "tsx";
  let mimeType = "text/plain";

  if (activeTab === "react") {
    contentToDisplay = exportToReactTSX(document);
    fileExtension = "tsx";
  } else if (activeTab === "html") {
    contentToDisplay = exportToHTML(document);
    fileExtension = "html";
  } else if (activeTab === "ast") {
    contentToDisplay = JSON.stringify(document.screens, null, 2);
    fileExtension = "json";
  } else if (activeTab === "wisp") {
    contentToDisplay = document.rawCode;
    fileExtension = "wdsl";
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
    a.download = activeTab === "wisp" ? `codigo.wdsl` : `wisp-prototype.${fileExtension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-3xl bg-white dark:bg-neutral-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-5 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              Exportar Prototipo Wisp
            </h3>
            <p className="text-xs text-neutral-500">
              Genera código listo para desarrollo o comparte la especificación.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab("react")}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "react"
                ? "bg-white dark:bg-neutral-700 shadow-sm text-purple-700 dark:text-purple-300"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>React (TSX + Tailwind)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("html")}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "html"
                ? "bg-white dark:bg-neutral-700 shadow-sm text-purple-700 dark:text-purple-300"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>HTML5 + CSS M3</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("wisp")}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "wisp"
                ? "bg-white dark:bg-neutral-700 shadow-sm text-purple-700 dark:text-purple-300"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            <span>Código WDSL (.wdsl)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ast")}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "ast"
                ? "bg-white dark:bg-neutral-700 shadow-sm text-purple-700 dark:text-purple-300"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>AST (JSON)</span>
          </button>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 bg-neutral-950 text-purple-200 font-mono text-xs rounded-2xl border border-neutral-800 whitespace-pre">
            {contentToDisplay}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800 pt-4">
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
                  <Check className="w-4 h-4" />
                  <span>¡Copiado al portapapeles!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Código</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
