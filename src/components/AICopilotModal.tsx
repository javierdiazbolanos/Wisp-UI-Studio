import React, { useState } from "react";
import { Sparkles, X, Wand2, RefreshCw, Check, ArrowRight, Lightbulb } from "lucide-react";

interface AICopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCode: string;
  onApplyWisp: (generatedCode: string, mode: "replace" | "append") => void;
  initialPrompt?: string;
}

const QUICK_PROMPTS = [
  "Create a registration screen with name, email, password, role selector with chips, and terms switch",
  "Generate a 3-step Wizard for a loan application with document split view and final summary",
  "Design a SaaS analytics dashboard with user metrics, revenue KPIs, subscription table, and new plan button",
  "Create a clinical medical form for allergy registration, medical history, pain scale, and specialist selector",
  "Build a mobile digital wallet screen with available balance, frequent contacts, and recent transaction list",
];

export const AICopilotModal: React.FC<AICopilotModalProps> = ({
  isOpen,
  onClose,
  currentCode,
  onApplyWisp,
  initialPrompt = "",
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);

  // Sync when initialPrompt changes
  React.useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, [initialPrompt, isOpen]);
  const [mode, setMode] = useState<"generate" | "modify">("generate");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setGeneratedCode(null);

    try {
      const response = await fetch("/api/gemini/generate-wisp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          currentCode,
          mode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error connecting to AI service");
      }

      if (data.wispCode) {
        setGeneratedCode(data.wispCode);
      } else {
        throw new Error("No generated Wisp code received");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error generating Wisp code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                Wisp AI Copilot (Gemini 2.5 Flash)
              </h3>
              <p className="text-xs text-neutral-500">
                Describe in natural language the screen or interactive flow you want to build.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-2 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-2xl">
          <button
            type="button"
            onClick={() => setMode("generate")}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
              mode === "generate"
                ? "bg-white dark:bg-neutral-700 shadow-sm text-purple-700 dark:text-purple-300"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            Generate New Screen
          </button>
          <button
            type="button"
            onClick={() => setMode("modify")}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
              mode === "modify"
                ? "bg-white dark:bg-neutral-700 shadow-sm text-purple-700 dark:text-purple-300"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            Modify / Enrich Existing Code
          </button>
        </div>

        {/* Input prompt */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
            Screen Requirements & Features:
          </label>
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: Create a 3-step wizard for payment gateway setup with endpoints, credentials, environment selector, and confirmation..."
            className="w-full p-3.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl outline-none focus:ring-2 focus:ring-purple-600 resize-none text-neutral-900 dark:text-white"
          />
        </div>

        {/* Quick prompt suggestions */}
        {!generatedCode && !isLoading && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-semibold">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Quick suggestions:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((qp, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(qp)}
                  className="text-[11px] text-left p-2 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 text-purple-900 dark:text-purple-200 border border-purple-200/60 dark:border-purple-800/60 transition-all cursor-pointer"
                >
                  {qp}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs">
            {error}
          </div>
        )}

        {/* Preview of Generated Wisp DSL */}
        {generatedCode && (
          <div className="flex-1 overflow-hidden flex flex-col space-y-2">
            <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
              Generated Wisp DSL Code:
            </span>
            <div className="flex-1 overflow-y-auto p-3.5 bg-neutral-950 text-purple-200 font-mono text-xs rounded-2xl border border-neutral-800 max-h-48 whitespace-pre">
              {generatedCode}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full cursor-pointer"
          >
            Cancel
          </button>

          {!generatedCode ? (
            <button
              type="button"
              disabled={isLoading || !prompt.trim()}
              onClick={handleGenerate}
              className={`px-6 py-2.5 text-xs font-semibold rounded-full flex items-center gap-2 shadow-md transition-all ${
                isLoading || !prompt.trim()
                  ? "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white cursor-pointer"
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Designing with Gemini...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generate Wisp DSL</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onApplyWisp(generatedCode, "append")}
                className="px-4 py-2 text-xs font-semibold rounded-full border border-purple-600 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 cursor-pointer"
              >
                Append to Code
              </button>
              <button
                type="button"
                onClick={() => onApplyWisp(generatedCode, "replace")}
                className="px-5 py-2 text-xs font-semibold rounded-full bg-purple-700 hover:bg-purple-800 text-white shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Replace Code</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
