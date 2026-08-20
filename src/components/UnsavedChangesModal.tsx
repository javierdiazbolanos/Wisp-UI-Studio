import React from "react";
import { AlertTriangle, Download, ArrowRight, X, FileCode2, ShieldAlert } from "lucide-react";
import { WispTemplate } from "../data/templates";

interface UnsavedChangesModalProps {
  isOpen: boolean;
  targetTemplate: WispTemplate | null;
  onConfirmDownloadAndApply: () => void;
  onConfirmDiscardAndApply: () => void;
  onCancel: () => void;
}

export const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  isOpen,
  targetTemplate,
  onConfirmDownloadAndApply,
  onConfirmDiscardAndApply,
  onCancel,
}) => {
  if (!isOpen || !targetTemplate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-lg bg-white dark:bg-[#181622] rounded-3xl p-6 sm:p-7 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-5"
        role="dialog"
        aria-modal="true"
      >
        {/* Header with Warning Icon */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                ¿Cambiar de plantilla?
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Se detectaron cambios sin guardar en el editor
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Content */}
        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 space-y-2.5">
          <p className="text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">
            Estás a punto de cargar la plantilla{" "}
            <span className="font-bold text-purple-600 dark:text-purple-400">
              "{targetTemplate.title}"
            </span>
            . Al hacerlo, el código actual del editor será reemplazado.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-amber-700 dark:text-amber-300 font-medium">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>
              Te recomendamos descargar una copia de seguridad de tu archivo{" "}
              <strong className="font-mono text-purple-700 dark:text-purple-300">
                codigo.wdsl
              </strong>{" "}
              antes de continuar.
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-all cursor-pointer text-center"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirmDiscardAndApply}
            className="px-4 py-2.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40 dark:hover:text-red-300 rounded-xl border border-neutral-300 dark:border-neutral-700 transition-all cursor-pointer text-center"
          >
            Reemplazar sin guardar
          </button>

          <button
            type="button"
            onClick={onConfirmDownloadAndApply}
            className="px-4 py-2.5 text-xs font-semibold bg-purple-700 hover:bg-purple-800 text-white rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar .wdsl y Cambiar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
