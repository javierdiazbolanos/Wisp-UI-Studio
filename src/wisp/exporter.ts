import { WispDocument, ScreenNode, WispNode } from "./types";
export { exportToJetpackCompose } from "./composeExporter";
export { exportToFlutterM3 } from "./flutterExporter";

/**
 * Escapes HTML entities.
 */
function escapeHtml(str: string): string {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Converts a lucide icon name (e.g. user, arrow-right, bell) to kebab-case for Lucide icon attribute.
 */
function sanitizeIconName(iconName: string): string {
  if (!iconName) return "star";
  return iconName
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

/**
 * Generates ready-to-use React + Tailwind CSS code from Wisp AST.
 */
export function exportToReactTSX(doc: WispDocument): string {
  const firstScreenName = doc.screens[0]?.name || "Main";

  let code = `import React, { useState } from 'react';
import { 
  Check, ChevronRight, ChevronDown, Save, User, Mail, Lock, Search, 
  Settings, Bell, AlertCircle, AlertTriangle, CheckCircle2, Info, ArrowLeft, ArrowRight, X, 
  Menu, Eye, EyeOff, Trash, Plus, FileText, TrendingUp, Sparkles, HelpCircle, Star, Phone, Calendar
} from 'lucide-react';

export default function AppPrototype() {
  const [currentScreen, setCurrentScreen] = useState('${firstScreenName}');
  const [wizardStep, setWizardStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [activeTabs, setActiveTabs] = useState<Record<string, number>>({});
  const [selectedChips, setSelectedChips] = useState<Record<string, boolean>>({});
  const [segmentedValues, setSegmentedValues] = useState<Record<string, string>>({});

  const handleNavigate = (target: string) => {
    if (!target) return;
    if (target === 'back' || target === 'close') {
      if (activeModal) {
        setActiveModal(null);
        return;
      }
      return;
    }
    if (target.startsWith('@')) {
      const match = target.match(/^@([a-zA-Z0-9_-]+)(?:\\((?:step=(\\d+)|([^)]+))\\))?/);
      if (match) {
        const targetScreen = match[1];
        const stepParam = match[2];
        
        // Check if target is a modal/sheet/dialog
        const modalScreens = [${doc.screens
          .filter(s => s.type === "dialog" || s.type === "modal" || s.type === "sheet")
          .map(s => `'${s.name}'`)
          .join(", ")}];
        
        if (modalScreens.includes(targetScreen)) {
          setActiveModal(targetScreen);
          return;
        }

        setCurrentScreen(targetScreen);
        if (stepParam) {
          setWizardStep(parseInt(stepParam, 10));
        }
      }
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-[#FDF8FD] text-[#1D1B20] font-sans antialiased p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
`;

  for (const screen of doc.screens) {
    if (screen.type === "dialog" || screen.type === "modal" || screen.type === "sheet" || screen.type === "component") {
      continue;
    }

    if (screen.type === "wizard") {
      const totalSteps = screen.steps?.length || Number(screen.props.totalSteps) || 3;
      code += `        {/* Wizard Screen: @${screen.name} */}
        {currentScreen === '${screen.name}' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-neutral-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full">
                    Wizard • Paso {wizardStep} de ${totalSteps}
                  </span>
                  <h1 className="text-2xl font-bold text-neutral-900 mt-1">${screen.name}</h1>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {Array.from({ length: ${totalSteps} }).map((_, idx) => (
                  <React.Fragment key={idx}>
                    <button
                      type="button"
                      onClick={() => setWizardStep(idx + 1)}
                      className={\`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center transition-all \${
                        wizardStep === idx + 1
                          ? 'bg-purple-700 text-white shadow-md'
                          : wizardStep > idx + 1
                          ? 'bg-purple-100 text-purple-900'
                          : 'bg-neutral-100 text-neutral-500'
                      }\`}
                    >
                      {wizardStep > idx + 1 ? '✓' : idx + 1}
                    </button>
                    {idx < ${totalSteps} - 1 && (
                      <div className={\`flex-1 h-1 rounded-full \${wizardStep > idx + 1 ? 'bg-purple-700' : 'bg-neutral-200'}\`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div className="space-y-6">
`;
      if (screen.steps && screen.steps.length > 0) {
        screen.steps.forEach((step, sIdx) => {
          code += `              {wizardStep === ${sIdx + 1} && (
                <div className="space-y-6">
${renderNodesToReact(step.children, 9)}
                </div>
              )}
`;
        });
      } else {
        code += renderNodesToReact(screen.children, 7);
      }
      code += `            </div>
          </div>
        )}
`;
    } else {
      code += `        {/* Screen: @${screen.name} */}
        {currentScreen === '${screen.name}' && (
          <div className="space-y-6">
${renderNodesToReact(screen.children, 6)}
          </div>
        )}
`;
    }
  }

  // Render modal overlays
  const modalScreens = doc.screens.filter(s => s.type === "dialog" || s.type === "modal" || s.type === "sheet");
  if (modalScreens.length > 0) {
    code += `
        {/* Modals & Dialogs */}
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="w-full max-w-lg bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-neutral-200 relative">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>
`;
    for (const m of modalScreens) {
      code += `              {activeModal === '${m.name}' && (
                <div className="space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700">
                    ${m.type} • @${m.name}
                  </span>
${renderNodesToReact(m.children, 9)}
                </div>
              )}
`;
    }
    code += `            </div>
          </div>
        )}
`;
  }

  code += `      </div>
    </div>
  );
}
`;

  return code;
}

function renderNodesToReact(nodes: WispNode[], indentLevel: number): string {
  const indent = " ".repeat(indentLevel * 2);
  let res = "";

  for (const node of nodes) {
    switch (node.type) {
      case "text": {
        const variant = node.props.variant || "body";
        let fontClass = "text-neutral-700 text-base leading-relaxed";
        if (variant === "display") fontClass = "text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight";
        else if (variant === "headline") fontClass = "text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight";
        else if (variant === "title") fontClass = "text-lg md:text-xl font-semibold text-neutral-800";
        else if (variant === "label") fontClass = "text-xs font-semibold text-neutral-500 uppercase tracking-wider";
        else if (variant === "caption") fontClass = "text-xs text-neutral-500";
        res += `${indent}<p className="${fontClass}">${escapeHtml(node.props.value || "")}</p>\n`;
        break;
      }

      case "button": {
        const btnVariant = node.props.variant || "filled";
        const goto = node.props.goto ? `onClick={() => handleNavigate('${node.props.goto}')}` : "";
        let btnClasses = "px-6 py-2.5 rounded-full font-medium text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer";
        if (btnVariant === "filled") btnClasses += " bg-purple-700 hover:bg-purple-800 text-white";
        else if (btnVariant === "tonal") btnClasses += " bg-purple-100 hover:bg-purple-200 text-purple-900";
        else if (btnVariant === "outlined") btnClasses += " border border-purple-700 text-purple-700 hover:bg-purple-50 bg-transparent";
        else if (btnVariant === "text") btnClasses += " text-purple-700 hover:bg-purple-50 bg-transparent shadow-none";
        else if (btnVariant === "elevated") btnClasses += " bg-white hover:bg-neutral-50 text-purple-700 shadow-md border border-neutral-100";
        res += `${indent}<button className="${btnClasses}" ${goto}>${node.props.label || "Botón"}</button>\n`;
        break;
      }

      case "textfield": {
        const name = node.props.name || "input";
        const label = node.props.label || name;
        res += `${indent}<div className="space-y-1.5 w-full">
${indent}  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wide">${label}</label>
${indent}  <input 
${indent}    type="${node.props.type || "text"}" 
${indent}    placeholder="${node.props.placeholder || ""}"
${indent}    className="w-full px-4 py-2.5 rounded-2xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white text-sm"
${indent}    value={formData['${name}'] || ''}
${indent}    onChange={e => handleInputChange('${name}', e.target.value)}
${indent}  />
${indent}</div>\n`;
        break;
      }

      case "searchbar":
      case "search": {
        const name = node.props.name || node.id || "query";
        const placeholder = node.props.placeholder || "Buscar...";
        res += `${indent}<div className="relative flex items-center w-full">
${indent}  <Search className="w-4 h-4 absolute left-3.5 text-neutral-400 pointer-events-none" />
${indent}  <input 
${indent}    type="text" 
${indent}    placeholder="${placeholder}"
${indent}    className="w-full pl-10 pr-4 py-2.5 rounded-full border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white text-sm"
${indent}    value={formData['${name}'] || ''}
${indent}    onChange={e => handleInputChange('${name}', e.target.value)}
${indent}  />
${indent}</div>\n`;
        break;
      }

      case "textarea": {
        const name = node.props.name || "textarea";
        const label = node.props.label || name;
        const rows = Number(node.props.rows) || 3;
        res += `${indent}<div className="space-y-1.5 w-full">
${indent}  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wide">${label}</label>
${indent}  <textarea 
${indent}    rows={${rows}} 
${indent}    placeholder="${node.props.placeholder || ""}"
${indent}    className="w-full px-4 py-2.5 rounded-2xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white text-sm resize-y"
${indent}    value={formData['${name}'] || ''}
${indent}    onChange={e => handleInputChange('${name}', e.target.value)}
${indent}  />
${indent}</div>\n`;
        break;
      }

      case "card": {
        res += `${indent}<div className="bg-white rounded-3xl p-5 md:p-6 border border-neutral-200/80 shadow-sm space-y-4">\n`;
        res += renderNodesToReact(node.children, indentLevel + 1);
        res += `${indent}</div>\n`;
        break;
      }

      case "row": {
        const gap = Number(node.props.spacing) || 16;
        res += `${indent}<div className="flex flex-wrap items-center gap-[${gap}px] w-full">\n`;
        res += renderNodesToReact(node.children, indentLevel + 1);
        res += `${indent}</div>\n`;
        break;
      }

      case "column": {
        const colGap = Number(node.props.spacing) || 16;
        res += `${indent}<div className="flex flex-col gap-[${colGap}px] w-full">\n`;
        res += renderNodesToReact(node.children, indentLevel + 1);
        res += `${indent}</div>\n`;
        break;
      }

      case "grid": {
        const cols = Number(node.props.cols) || 2;
        const gap = Number(node.props.gap) || 16;
        res += `${indent}<div className="grid grid-cols-1 md:grid-cols-${cols} gap-[${gap}px] w-full">\n`;
        res += renderNodesToReact(node.children, indentLevel + 1);
        res += `${indent}</div>\n`;
        break;
      }

      case "split": {
        const leftNode = node.children.find(c => c.type === "left");
        const rightNode = node.children.find(c => c.type === "right");
        res += `${indent}<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">\n`;
        res += `${indent}  <div className="lg:col-span-4 space-y-4">\n`;
        if (leftNode) res += renderNodesToReact(leftNode.children, indentLevel + 2);
        res += `${indent}  </div>\n`;
        res += `${indent}  <div className="lg:col-span-8 space-y-4">\n`;
        if (rightNode) res += renderNodesToReact(rightNode.children, indentLevel + 2);
        res += `${indent}  </div>\n`;
        res += `${indent}</div>\n`;
        break;
      }

      case "sidebar": {
        const width = node.props.width || 280;
        res += `${indent}<div className="rounded-3xl p-4 border border-neutral-200/80 bg-white space-y-3 shrink-0" style={{ width: '${typeof width === "number" ? width + "px" : width}' }}>\n`;
        res += renderNodesToReact(node.children, indentLevel + 1);
        res += `${indent}</div>\n`;
        break;
      }

      case "listitem": {
        const itemGoto = node.props.goto ? `onClick={() => handleNavigate('${node.props.goto}')}` : "";
        res += `${indent}<div className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-neutral-50 cursor-pointer border border-neutral-100 transition-colors" ${itemGoto}>
${indent}  <div>
${indent}    <p className="font-semibold text-sm text-neutral-900">${node.props.label || ""}</p>
${indent}    ${node.props.subtitle ? `<p className="text-xs text-neutral-500 mt-0.5">${node.props.subtitle}</p>` : ""}
${indent}  </div>
${indent}  <ChevronRight className="w-4 h-4 text-neutral-400" />
${indent}</div>\n`;
        break;
      }

      case "switch": {
        const name = node.props.name || node.id;
        const label = node.props.label || name;
        res += `${indent}<div className="flex items-center justify-between py-2 w-full">
${indent}  <span className="text-sm font-medium text-neutral-800">${label}</span>
${indent}  <input 
${indent}    type="checkbox" 
${indent}    checked={formData['${name}'] ?? ${node.props.checked ? "true" : "false"}} 
${indent}    onChange={e => handleInputChange('${name}', e.target.checked)} 
${indent}    className="w-5 h-5 accent-purple-700 cursor-pointer rounded" 
${indent}  />
${indent}</div>\n`;
        break;
      }

      case "checkbox": {
        const name = node.props.name || node.id;
        const label = node.props.label || name;
        res += `${indent}<label className="flex items-start gap-2.5 py-1.5 cursor-pointer select-none">
${indent}  <input 
${indent}    type="checkbox" 
${indent}    checked={formData['${name}'] ?? ${node.props.checked ? "true" : "false"}} 
${indent}    onChange={e => handleInputChange('${name}', e.target.checked)} 
${indent}    className="w-4 h-4 accent-purple-700 mt-0.5" 
${indent}  />
${indent}  <span className="text-sm text-neutral-800">${label}</span>
${indent}</label>\n`;
        break;
      }

      case "slider": {
        const name = node.props.name || "slider";
        const label = node.props.label || name;
        const min = Number(node.props.min) || 0;
        const max = Number(node.props.max) || 100;
        const defaultVal = Number(node.props.value) || Math.floor((min + max) / 2);
        res += `${indent}<div className="space-y-2 w-full">
${indent}  <div className="flex justify-between text-xs font-semibold text-neutral-700 uppercase">
${indent}    <span>${label}</span>
${indent}    <span className="font-bold text-purple-700">{formData['${name}'] ?? ${defaultVal}}</span>
${indent}  </div>
${indent}  <input 
${indent}    type="range" 
${indent}    min={${min}} 
${indent}    max={${max}} 
${indent}    value={formData['${name}'] ?? ${defaultVal}} 
${indent}    onChange={e => handleInputChange('${name}', Number(e.target.value))} 
${indent}    className="w-full accent-purple-700 cursor-pointer" 
${indent}  />
${indent}</div>\n`;
        break;
      }

      case "chip": {
        const label = node.props.label || "";
        res += `${indent}<button 
${indent}  type="button" 
${indent}  onClick={() => setSelectedChips(prev => ({ ...prev, ['${node.id}']: !prev['${node.id}'] }))} 
${indent}  className={\`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all \${
${indent}    selectedChips['${node.id}'] 
${indent}      ? 'bg-purple-100 border-purple-300 text-purple-900' 
${indent}      : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
${indent}  }\`}
${indent}>
${indent}  <span>${label}</span>
${indent}</button>\n`;
        break;
      }

      case "select": {
        const selName = node.props.name || "select";
        const selLabel = node.props.label || selName;
        const selChildOptions = (node.children || [])
          .filter(c => c.type === "option")
          .map(c => String(c.props.value || c.props.label || ""));
        const selOptions = selChildOptions.length > 0
          ? selChildOptions
          : (Array.isArray(node.props.options) ? node.props.options : ["Opción 1", "Opción 2"]);
        const initialVal = node.props.value ? String(node.props.value) : (selOptions[0] || "");
        res += `${indent}<div className="space-y-1.5 w-full">
${indent}  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wide">${selLabel}</label>
${indent}  <select 
${indent}    className="w-full px-4 py-2.5 rounded-2xl border border-neutral-300 bg-white text-sm" 
${indent}    value={formData['${selName}'] || '${initialVal}'} 
${indent}    onChange={e => handleInputChange('${selName}', e.target.value)}
${indent}  >
${selOptions.map(opt => `${indent}    <option value="${opt}">${opt}</option>`).join("\n")}
${indent}  </select>
${indent}</div>\n`;
        break;
      }

      case "autocomplete": {
        const autoName = node.props.name || "autocomplete";
        const autoLabel = node.props.label || autoName;
        const autoChildOptions = (node.children || [])
          .filter(c => c.type === "option")
          .map(c => String(c.props.value || c.props.label || ""));
        const autoOptions = autoChildOptions.length > 0
          ? autoChildOptions
          : (Array.isArray(node.props.options) ? node.props.options : ["Opción 1", "Opción 2", "Opción 3"]);
        res += `${indent}<div className="space-y-1.5 w-full">
${indent}  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wide">${autoLabel}</label>
${indent}  <input 
${indent}    type="text" 
${indent}    list="list_${autoName}" 
${indent}    placeholder="${node.props.placeholder || "Escribe para buscar..."}" 
${indent}    className="w-full px-4 py-2.5 rounded-2xl border border-neutral-300 bg-white text-sm" 
${indent}    value={formData['${autoName}'] || ''} 
${indent}    onChange={e => handleInputChange('${autoName}', e.target.value)}
${indent}  />
${indent}  <datalist id="list_${autoName}">
${autoOptions.map(opt => `${indent}    <option value="${opt}" />`).join("\n")}
${indent}  </datalist>
${indent}</div>\n`;
        break;
      }

      case "datepicker": {
        const dateName = node.props.name || "date";
        const dateLabel = node.props.label || dateName;
        res += `${indent}<div className="space-y-1.5 w-full">
${indent}  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wide">${dateLabel}</label>
${indent}  <input 
${indent}    type="date" 
${indent}    className="w-full px-4 py-2.5 rounded-2xl border border-neutral-300 bg-white text-sm" 
${indent}    value={formData['${dateName}'] || ''} 
${indent}    onChange={e => handleInputChange('${dateName}', e.target.value)}
${indent}  />
${indent}</div>\n`;
        break;
      }

      case "radio": {
        const radName = node.props.name || node.props.group || "radio";
        const radLabel = node.props.label || radName;
        const radVal = node.props.value || radLabel;
        res += `${indent}<label className="flex items-center gap-2.5 py-1.5 cursor-pointer select-none">
${indent}  <input 
${indent}    type="radio" 
${indent}    name="${radName}" 
${indent}    value="${radVal}" 
${indent}    checked={formData['${radName}'] === '${radVal}'} 
${indent}    onChange={() => handleInputChange('${radName}', '${radVal}')} 
${indent}    className="w-4 h-4 accent-purple-700" 
${indent}  />
${indent}  <span className="text-sm text-neutral-800">${radLabel}</span>
${indent}</label>\n`;
        break;
      }

      case "metric":
      case "stat": {
        const label = node.props.label || "Métrica";
        const val = node.props.value || "0";
        const delta = node.props.delta;
        res += `${indent}<div className="p-5 rounded-3xl border border-neutral-200/80 bg-white space-y-2">
${indent}  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">${label}</span>
${indent}  <p className="text-2xl md:text-3xl font-extrabold text-neutral-900">${val}</p>
${delta ? `${indent}  <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${delta.startsWith("+") ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}">${delta}</span>\n` : ""}${indent}</div>\n`;
        break;
      }

      case "alert": {
        const title = node.props.title;
        const msg = node.props.value || "";
        res += `${indent}<div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 text-purple-900 space-y-1">
${title ? `${indent}  <p className="text-xs font-bold uppercase tracking-wider">${title}</p>\n` : ""}${indent}  <p className="text-sm font-medium leading-relaxed">${msg}</p>
${indent}</div>\n`;
        break;
      }

      case "tabs": {
        const tabPanels = (node.children || []).filter(c => c.type === "tab" || c.type === "panel");
        let items: string[] = [];
        if (Array.isArray(node.props.items)) items = node.props.items;
        else if (Array.isArray(node.props.tabs)) items = node.props.tabs;
        else if (tabPanels.length > 0) items = tabPanels.map(p => p.props.title || p.props.label || p.props.value || "Pestaña");
        else items = ["Pestaña 1", "Pestaña 2", "Pestaña 3"];

        res += `${indent}<div className="w-full space-y-4">
${indent}  <div className="border-b border-neutral-200">
${indent}    <div className="flex gap-2">
${items.map((tab: string, idx: number) => `${indent}      <button type="button" onClick={() => setActiveTabs(prev => ({ ...prev, ['${node.id}']: ${idx} }))} className={\`px-4 py-2.5 text-sm font-semibold transition-all border-b-2 \${(activeTabs['${node.id}'] ?? 0) === ${idx} ? 'border-purple-700 text-purple-700 font-bold' : 'border-transparent text-neutral-500 hover:text-neutral-800'}\`}>${tab}</button>`).join("\n")}
${indent}    </div>
${indent}  </div>
`;
        if (tabPanels.length > 0) {
          tabPanels.forEach((panel, pIdx) => {
            res += `${indent}  {(activeTabs['${node.id}'] ?? 0) === ${pIdx} && (
${indent}    <div className="space-y-4">
${renderNodesToReact(panel.children, indentLevel + 3)}${indent}    </div>
${indent}  )}\n`;
          });
        } else if (node.children && node.children.length > 0) {
          res += renderNodesToReact(node.children, indentLevel + 1);
        }
        res += `${indent}</div>\n`;
        break;
      }

      case "tab":
      case "panel": {
        res += renderNodesToReact(node.children, indentLevel);
        break;
      }

      case "table": {
        let headers: string[] = [];
        let colTypes: string[] = [];
        const rawCols = node.props.columns || node.props.headers || node.props.cols;
        if (Array.isArray(rawCols)) {
          rawCols.forEach(col => {
            const str = String(col);
            if (str.includes(":")) {
              const idx = str.lastIndexOf(":");
              headers.push(str.substring(0, idx).trim());
              colTypes.push(str.substring(idx + 1).trim().toLowerCase());
            } else {
              headers.push(str);
              colTypes.push("text");
            }
          });
        } else if (typeof rawCols === "string") {
          rawCols.split(",").forEach(col => {
            const clean = col.trim().replace(/^["']|["']$/g, "");
            if (clean.includes(":")) {
              const idx = clean.lastIndexOf(":");
              headers.push(clean.substring(0, idx).trim());
              colTypes.push(clean.substring(idx + 1).trim().toLowerCase());
            } else {
              headers.push(clean);
              colTypes.push("text");
            }
          });
        } else {
          headers = ["ID", "Nombre", "Estado", "Acciones"];
          colTypes = ["code", "text", "status", "action"];
        }

        let rows: any[][] = [];
        if (node.children && node.children.length > 0) {
          node.children.forEach(c => {
            if (c.props.values && Array.isArray(c.props.values)) rows.push(c.props.values);
            else if (c.props.cells && Array.isArray(c.props.cells)) rows.push(c.props.cells);
            else if (c.props.value) rows.push([c.props.value]);
          });
        }
        if (rows.length === 0 && (node.props.rows || node.props.data)) {
          const rawData = node.props.rows || node.props.data;
          if (Array.isArray(rawData)) {
            rawData.forEach(item => {
              if (Array.isArray(item)) rows.push(item);
              else if (typeof item === "object" && item !== null) rows.push(Object.values(item));
              else rows.push([String(item)]);
            });
          }
        }
        if (rows.length === 0) {
          rows = [
            ["#101", "Servicio Auth Gateway", "Activo", "Configurar"],
            ["#102", "Worker de Notificaciones", "Activo", "Configurar"],
          ];
        }

        const title = node.props.title || node.props.label;
        const isStriped = node.props.striped === true || node.props.striped === "true";
        res += `${indent}<div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-xs">
${title ? `${indent}  <div className="p-4 border-b border-neutral-200 font-bold text-neutral-900">${title}</div>\n` : ""}${indent}  <table className="w-full text-left text-sm">
${indent}    <thead className="bg-neutral-50 text-neutral-600">
${indent}      <tr>
${headers.map((h, i) => `${indent}        <th className="p-3 font-semibold text-xs uppercase tracking-wider">${h}</th>`).join("\n")}
${indent}      </tr>
${indent}    </thead>
${indent}    <tbody className="divide-y divide-neutral-200">
${rows.map((row, rI) => {
  const bgClass = isStriped && rI % 2 === 1 ? "bg-neutral-50/60" : "bg-white";
  return `${indent}      <tr className="${bgClass} hover:bg-neutral-50">
${headers.map((_, cIdx) => {
  const cellVal = row[cIdx] !== undefined ? String(row[cIdx]) : "";
  const type = colTypes[cIdx] || "text";
  if (type === "status" || type === "badge") {
    return `${indent}        <td className="p-3"><span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />${cellVal}</span></td>`;
  }
  if (type === "avatar" || type === "user") {
    return `${indent}        <td className="p-3"><div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-purple-100 text-purple-800 font-bold text-xs flex items-center justify-center">${cellVal.substring(0, 2).toUpperCase()}</div><span className="font-medium text-neutral-900">${cellVal}</span></div></td>`;
  }
  if (type === "action" || type === "button") {
    return `${indent}        <td className="p-3"><button type="button" className="px-3 py-1 bg-purple-100 text-purple-900 rounded-lg text-xs font-semibold hover:bg-purple-200 transition-colors">${cellVal || "Acción"}</button></td>`;
  }
  if (type === "dropdown" || type === "menu") {
    return `${indent}        <td className="p-3"><button type="button" className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-500">⋮</button></td>`;
  }
  if (type === "code" || type === "id") {
    return `${indent}        <td className="p-3"><span className="font-mono text-xs px-2 py-0.5 rounded bg-neutral-100 text-purple-700 font-semibold">${cellVal}</span></td>`;
  }
  if (type === "progress") {
    const num = Math.min(100, Math.max(0, parseFloat(cellVal.replace(/[^0-9.]/g, "")) || 50));
    return `${indent}        <td className="p-3"><div className="flex items-center gap-2"><div className="w-20 h-2 bg-neutral-200 rounded-full overflow-hidden"><div className="h-full bg-purple-600 rounded-full" style={{ width: '${num}%' }} /></div><span className="text-xs font-mono font-medium">${num}%</span></div></td>`;
  }
  if (type === "currency" || type === "money") {
    return `${indent}        <td className="p-3 font-mono font-bold text-emerald-700">${cellVal}</td>`;
  }
  return `${indent}        <td className="p-3 text-neutral-800">${cellVal}</td>`;
}).join("\n")}
${indent}      </tr>`;
}).join("\n")}
${indent}    </tbody>
${indent}  </table>
${indent}</div>\n`;
        break;
      }

      case "avatar": {
        const name = node.props.name || "Usuario";
        const initials = name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();
        res += `${indent}<div className="w-10 h-10 rounded-full font-bold text-sm bg-purple-100 text-purple-900 flex items-center justify-center shadow-sm shrink-0">${initials}</div>\n`;
        break;
      }

      case "badge": {
        const text = node.props.text || node.props.value || "Nuevo";
        res += `${indent}<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-900">${text}</span>\n`;
        break;
      }

      case "progress": {
        const val = Math.min(100, Math.max(0, Number(node.props.value) || 50));
        res += `${indent}<div className="w-full h-2 rounded-full bg-neutral-200 overflow-hidden">
${indent}  <div className="h-full bg-purple-700 rounded-full" style={{ width: '${val}%' }} />
${indent}</div>\n`;
        break;
      }

      case "image": {
        const src = node.props.src || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80";
        res += `${indent}<img src="${src}" alt="Preview" className="w-full h-48 object-cover rounded-2xl shadow-sm border border-neutral-200" />\n`;
        break;
      }

      case "divider":
        res += `${indent}<hr className="border-neutral-200 my-2" />\n`;
        break;

      case "accordion": {
        const title = node.props.title || node.props.label || node.props.value || "Sección";
        const isExp = node.props.expanded === true || node.props.expanded === "true";
        const icon = node.props.icon ? sanitizeIconName(node.props.icon) : null;
        res += `${indent}<details className="group rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-xs w-full"${isExp ? " open" : ""}>
${indent}  <summary className="px-4 py-3.5 flex items-center justify-between gap-3 text-sm font-semibold text-neutral-800 cursor-pointer list-none select-none hover:bg-neutral-50">
${indent}    <span className="flex items-center gap-2.5">
${icon ? `${indent}      <i data-lucide="${icon}" className="w-4 h-4 text-purple-700" />\n` : ""}${indent}      ${title}
${indent}    </span>
${indent}    <span className="text-neutral-400 group-open:rotate-180 transition-transform">▼</span>
${indent}  </summary>
${indent}  <div className="px-4 py-3.5 border-t border-neutral-100 space-y-3">
${renderNodesToReact(node.children, indentLevel + 2)}${indent}  </div>
${indent}</details>\n`;
        break;
      }

      case "fab": {
        const label = node.props.label || "";
        const icon = sanitizeIconName(node.props.icon || "plus");
        const isExt = node.props.extended !== undefined ? node.props.extended === true || node.props.extended === "true" : Boolean(label);
        const goto = node.props.goto;
        res += `${indent}<div className="flex justify-end w-full py-1">
${indent}  <button 
${indent}    type="button" 
${goto ? `${indent}    onClick={() => handleNavigateAction('${goto}')}\n` : ""}${indent}    className="${isExt ? "px-5 py-3.5 rounded-3xl gap-2.5" : "w-14 h-14 rounded-3xl"} inline-flex items-center justify-center bg-purple-700 text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
${indent}  >
${indent}    <i data-lucide="${icon}" className="w-5 h-5" />
${isExt && label ? `${indent}    <span>${label}</span>\n` : ""}${indent}  </button>
${indent}</div>\n`;
        break;
      }

      case "snackbar": {
        const msg = node.props.message || node.props.value || "Notificación de acción";
        const action = node.props.action;
        const icon = node.props.icon ? sanitizeIconName(node.props.icon) : "info";
        const goto = node.props.goto;
        res += `${indent}<div className="w-full p-4 rounded-xl bg-neutral-900 text-neutral-100 flex items-center justify-between gap-3 text-sm shadow-xl">
${indent}  <div className="flex items-center gap-2.5">
${indent}    <i data-lucide="${icon}" className="w-4 h-4 text-purple-300 shrink-0" />
${indent}    <span className="font-medium">${msg}</span>
${indent}  </div>
${action ? `${indent}  <button type="button" ${goto ? `onClick={() => handleNavigateAction('${goto}')} ` : ""}className="text-xs font-bold text-purple-300 hover:text-purple-200 uppercase tracking-wider px-2 py-1">${action}</button>\n` : ""}${indent}</div>\n`;
        break;
      }

      case "breadcrumbs": {
        const items = Array.isArray(node.props.items)
          ? node.props.items
          : (typeof node.props.items === "string" ? node.props.items.split(",").map((s: string) => s.trim()) : ["Inicio", "Sección", "Detalle"]);
        const sep = node.props.separator === "slash" ? "/" : ">";
        res += `${indent}<nav className="flex items-center gap-2 text-xs md:text-sm text-neutral-500 py-1">
${items.map((it: string, idx: number) => {
  const isLast = idx === items.length - 1;
  return `${indent}  ${idx > 0 ? `<span>${sep}</span> ` : ""}<span className="${isLast ? "font-bold text-neutral-800" : "hover:underline cursor-pointer"}">${it}</span>`;
}).join("\n")}
${indent}</nav>\n`;
        break;
      }

      case "rating": {
        const ratName = node.props.name || "rating";
        const ratLabel = node.props.label || "";
        const max = Number(node.props.max) || 5;
        const initialVal = Number(node.props.value) || 0;
        const readonly = node.props.readonly === true || node.props.readonly === "true";
        res += `${indent}<div className="space-y-1.5">
${ratLabel ? `${indent}  <label className="block text-xs font-semibold uppercase text-neutral-600">${ratLabel}</label>\n` : ""}${indent}  <div className="flex items-center gap-1">
${Array.from({ length: max }).map((_, idx) => `${indent}    <button type="button" disabled={${readonly}} onClick={() => handleInputChange('${ratName}', ${idx + 1})} className="p-1 text-amber-400 hover:scale-110 transition-transform ${readonly ? "cursor-default" : "cursor-pointer"}">★</button>`).join("\n")}
${indent}    <span className="text-xs font-semibold text-neutral-500 ml-2">{(formData['${ratName}'] ?? ${initialVal})} / ${max}</span>
${indent}  </div>
${indent}</div>\n`;
        break;
      }

      case "appbar":
      case "topappbar":
      case "navbar":
      case "topbar":
      case "header": {
        const title = node.props.title || node.props.label || node.props.value || (typeof node.props.name === "string" ? node.props.name : "") || "App Bar";
        const subtitle = node.props.subtitle;
        const icon = node.props.icon ? sanitizeIconName(node.props.icon) : (node.props.goto ? "arrow-left" : "");
        const goto = node.props.goto;
        const action = node.props.action;
        const isElevated = node.props.elevated === true || node.props.variant === "elevated";

        res += `${indent}<div className="w-full rounded-2xl md:rounded-3xl border border-neutral-200 bg-white px-4 py-3 md:px-5 md:py-3.5 flex flex-wrap items-center justify-between gap-3 ${isElevated ? "shadow-md" : "shadow-xs"}">
${indent}  <div className="flex items-center gap-3">
${icon ? `${indent}    <button type="button" ${goto ? `onClick={() => handleNavigateAction('${goto}')} ` : ""}className="p-2 rounded-full hover:bg-neutral-100 transition-colors text-neutral-700">
${indent}      <i data-lucide="${icon}" className="w-5 h-5" />
${indent}    </button>\n` : ""}${indent}    <div>
${indent}      <h2 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight">${title}</h2>
${subtitle ? `${indent}      <p className="text-xs text-neutral-500">${subtitle}</p>\n` : ""}${indent}    </div>
${indent}  </div>
${indent}  <div className="flex items-center gap-2">
${node.children.length > 0 ? renderNodesToReact(node.children, indentLevel + 2) : ""}${action ? `${indent}    <button type="button" className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-purple-700 text-white shadow-xs uppercase tracking-wider">${action}</button>\n` : ""}${indent}  </div>
${indent}</div>\n`;
        break;
      }

      case "bottomnav":
      case "bottombar":
      case "navigationbar": {
        res += `${indent}<nav className="w-full rounded-2xl md:rounded-3xl border border-neutral-200 bg-white p-2 flex items-center justify-around gap-1 shadow-sm">
${node.children.length > 0 ? renderNodesToReact(node.children, indentLevel + 1) : `${indent}  <button className="flex-1 py-1.5 px-2 flex flex-col items-center gap-1 text-purple-700 font-bold text-xs"><i data-lucide="home" className="w-4 h-4" /><span>Inicio</span></button>\n${indent}  <button className="flex-1 py-1.5 px-2 flex flex-col items-center gap-1 text-neutral-500 text-xs"><i data-lucide="search" className="w-4 h-4" /><span>Buscar</span></button>\n${indent}  <button className="flex-1 py-1.5 px-2 flex flex-col items-center gap-1 text-neutral-500 text-xs"><i data-lucide="user" className="w-4 h-4" /><span>Perfil</span></button>\n`}${indent}</nav>\n`;
        break;
      }

      case "navitem": {
        const label = node.props.label || node.props.title || node.props.value || "Item";
        const icon = node.props.icon ? sanitizeIconName(node.props.icon) : "circle";
        const isActive = node.props.active === true || node.props.active === "true";
        const goto = node.props.goto;

        res += `${indent}<button type="button" ${goto ? `onClick={() => handleNavigateAction('${goto}')} ` : ""}className="flex-1 py-1.5 px-2 flex flex-col items-center justify-center gap-1 rounded-xl transition-all ${isActive ? "text-purple-700 font-bold" : "text-neutral-500 hover:text-neutral-900"}">
${indent}  <div className="px-4 py-1 rounded-full ${isActive ? "bg-purple-100 text-purple-800" : ""}">
${indent}    <i data-lucide="${icon}" className="w-4 h-4" />
${indent}  </div>
${indent}  <span className="text-xs truncate">${label}</span>
${indent}</button>\n`;
        break;
      }

      case "spacer": {
        const height = Number(node.props.height) || 16;
        res += `${indent}<div style={{ height: '${height}px' }} />\n`;
        break;
      }

      case "loading":
      case "spinner":
      case "circularprogress":
      case "linearprogress": {
        const val = node.props.value;
        const msg = node.props.message || node.props.label || "";
        res += `${indent}<div className="flex flex-col items-center justify-center p-4 gap-2">
${indent}  <div className="w-8 h-8 rounded-full border-4 border-purple-200 border-t-purple-700 animate-spin" />
${msg ? `${indent}  <span className="text-xs font-semibold text-neutral-600">${msg}</span>\n` : ""}${indent}</div>\n`;
        break;
      }

      case "navigationrail":
      case "apprail":
      case "navrail":
      case "rail": {
        const title = node.props.title || "";
        res += `${indent}<aside className="w-20 border-r border-neutral-200 bg-white p-3 flex flex-col items-center gap-4 rounded-2xl">
${title ? `${indent}  <span className="text-[10px] font-bold uppercase text-purple-700">${title}</span>\n` : ""}${node.children.length > 0 ? renderNodesToReact(node.children, indentLevel + 1) : ""}${indent}</aside>\n`;
        break;
      }

      case "drawer":
      case "navigationdrawer":
      case "appdrawer":
      case "navdrawer": {
        const title = node.props.title || "Navegación";
        res += `${indent}<nav className="w-72 rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm space-y-2">
${indent}  <h3 className="text-sm font-bold text-neutral-900 px-3 py-2">${title}</h3>
${node.children.length > 0 ? renderNodesToReact(node.children, indentLevel + 1) : ""}${indent}</nav>\n`;
        break;
      }

      case "draweritem": {
        const label = node.props.label || "Item";
        const icon = node.props.icon ? sanitizeIconName(node.props.icon) : "circle";
        const isActive = node.props.active === true || node.props.active === "true";
        res += `${indent}<button className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-semibold ${isActive ? "bg-purple-100 text-purple-900" : "text-neutral-600 hover:bg-neutral-50"}">
${indent}  <i data-lucide="${icon}" className="w-4 h-4" />
${indent}  <span>${label}</span>
${indent}</button>\n`;
        break;
      }

      case "sidesheet":
      case "side-sheet": {
        const title = node.props.title || "Detalles";
        res += `${indent}<aside className="w-80 rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm space-y-4">
${indent}  <h3 className="text-sm font-bold text-neutral-900 border-b pb-2">${title}</h3>
${node.children.length > 0 ? renderNodesToReact(node.children, indentLevel + 1) : ""}${indent}</aside>\n`;
        break;
      }

      case "bottomsheet": {
        const title = node.props.title || "";
        res += `${indent}<div className="w-full rounded-t-3xl border border-neutral-200 bg-white p-5 shadow-lg space-y-4">
${indent}  <div className="w-12 h-1 rounded-full bg-neutral-300 mx-auto" />
${title ? `${indent}  <h3 className="text-base font-bold text-neutral-900">${title}</h3>\n` : ""}${node.children.length > 0 ? renderNodesToReact(node.children, indentLevel + 1) : ""}${indent}</div>\n`;
        break;
      }

      case "tooltip":
      case "richtooltip":
      case "rich-tooltip": {
        const text = node.props.text || node.props.message || node.props.value || "Información";
        res += `${indent}<div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 border text-xs text-neutral-700">
${indent}  <span>${text}</span>
${indent}</div>\n`;
        break;
      }

      case "carousel": {
        res += `${indent}<div className="w-full rounded-3xl border border-neutral-200 bg-white p-4 space-y-3">
${node.children.length > 0 ? renderNodesToReact(node.children, indentLevel + 1) : ""}${indent}</div>\n`;
        break;
      }

      case "iconbutton":
      case "icon-button": {
        const icon = node.props.icon || "star";
        res += `${indent}<button className="p-2.5 rounded-full hover:bg-neutral-100 transition-all text-neutral-700">
${indent}  <i data-lucide="${sanitizeIconName(icon)}" className="w-5 h-5" />
${indent}</button>\n`;
        break;
      }

      case "timepicker":
      case "time-picker": {
        const name = node.props.name || "time";
        const label = node.props.label || name;
        res += `${indent}<div className="space-y-1.5">
${indent}  <label className="text-xs font-semibold text-neutral-600 uppercase">${label}</label>
${indent}  <input type="time" className="px-4 py-2 rounded-2xl border border-neutral-300 bg-white font-bold" />
${indent}</div>\n`;
        break;
      }

      case "menu":
      case "dropdown":
      case "dropdownmenu": {
        const label = node.props.label || "Opciones";
        res += `${indent}<div className="relative inline-block">
${indent}  <button className="px-3.5 py-2 rounded-2xl border bg-white text-xs font-semibold flex items-center gap-2">${label}</button>
${node.children.length > 0 ? `${indent}  <div className="mt-1 rounded-2xl border bg-white p-1 shadow-lg">\n${renderNodesToReact(node.children, indentLevel + 2)}${indent}  </div>\n` : ""}${indent}</div>\n`;
        break;
      }

      case "menuitem": {
        const label = node.props.label || "Acción";
        res += `${indent}<button className="w-full px-3 py-2 rounded-xl text-xs font-semibold hover:bg-neutral-100 text-left">${label}</button>\n`;
        break;
      }

      case "section": {
        const title = node.props.title || "Sección";
        res += `${indent}<div className="pt-3 pb-1 text-[10px] font-bold uppercase text-purple-700 tracking-wider">${title}</div>\n`;
        break;
      }

      case "list": {
        res += `${indent}<div className="w-full rounded-2xl border border-neutral-200 divide-y divide-neutral-100 bg-white overflow-hidden">
${node.children.length > 0 ? renderNodesToReact(node.children, indentLevel + 1) : ""}${indent}</div>\n`;
        break;
      }

      case "component":
      case "include":
      case "use": {
        if (node.children && node.children.length > 0) {
          res += `${indent}{/* Reusable Component: @${node.props.name || node.props.id || "component"} */}\n`;
          res += renderNodesToReact(node.children, indentLevel);
        }
        break;
      }

      default:
        if (node.children && node.children.length > 0) {
          res += renderNodesToReact(node.children, indentLevel);
        }
        break;
    }
  }

  return res;
}

/**
 * Recursively converts AST nodes into semantic HTML elements styled with Material 3 + Tailwind CSS.
 */
function renderNodesToHTML(nodes: WispNode[], indentLevel = 4): string {
  const indent = " ".repeat(indentLevel * 2);
  let html = "";

  for (const node of nodes) {
    switch (node.type) {
      case "text": {
        const variant = node.props.variant || "body";
        const val = escapeHtml(node.props.value || "");
        let tag = "p";
        let cls = "text-neutral-700 dark:text-neutral-300 text-base leading-relaxed";

        if (variant === "display") {
          tag = "h1";
          cls = "text-3xl md:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight font-sans";
        } else if (variant === "headline") {
          tag = "h2";
          cls = "text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight font-sans";
        } else if (variant === "title") {
          tag = "h3";
          cls = "text-lg md:text-xl font-semibold text-neutral-900 dark:text-white";
        } else if (variant === "label") {
          tag = "p";
          cls = "text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider";
        } else if (variant === "caption") {
          tag = "p";
          cls = "text-xs text-neutral-500 dark:text-neutral-400";
        }

        if (node.props.color === "primary") cls += " text-purple-700 dark:text-purple-400";
        else if (node.props.color === "error") cls += " text-red-600 dark:text-red-400";

        html += `${indent}<${tag} class="${cls}">${val}</${tag}>\n`;
        break;
      }

      case "button": {
        const variant = node.props.variant || "filled";
        const label = escapeHtml(node.props.label || "Button");
        const icon = node.props.icon ? sanitizeIconName(node.props.icon) : null;
        const goto = node.props.goto ? `data-goto="${escapeHtml(node.props.goto)}"` : "";
        const disabled = node.props.disabled ? "disabled" : "";

        let cls = "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm transition-all active:scale-98 select-none cursor-pointer shadow-sm";
        if (variant === "filled") {
          cls += " bg-purple-700 hover:bg-purple-800 text-white shadow-purple-900/10";
        } else if (variant === "tonal") {
          cls += " bg-purple-100 dark:bg-purple-950/60 hover:bg-purple-200 dark:hover:bg-purple-900/60 text-purple-900 dark:text-purple-200";
        } else if (variant === "outlined") {
          cls += " border border-purple-700 dark:border-purple-400 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 bg-transparent";
        } else if (variant === "text") {
          cls += " text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 bg-transparent shadow-none px-4";
        } else if (variant === "elevated") {
          cls += " bg-white dark:bg-[#1E1B24] hover:bg-neutral-50 dark:hover:bg-neutral-800 text-purple-700 dark:text-purple-400 shadow-md border border-neutral-100 dark:border-neutral-800";
        }

        if (disabled) {
          cls += " opacity-50 cursor-not-allowed pointer-events-none";
        }

        html += `${indent}<button type="button" class="${cls}" ${goto} ${disabled}>
${icon ? `${indent}  <i data-lucide="${icon}" class="w-4 h-4 shrink-0"></i>\n` : ""}${indent}  <span>${label}</span>
${indent}</button>\n`;
        break;
      }

      case "textfield": {
        const name = escapeHtml(node.props.name || "input");
        const label = escapeHtml(node.props.label || name);
        const placeholder = escapeHtml(node.props.placeholder || "");
        const type = escapeHtml(node.props.type || "text");
        const icon = node.props.icon || node.props.leadingIcon ? sanitizeIconName(node.props.icon || node.props.leadingIcon) : null;
        const helper = node.props.helper || node.props.helperText ? escapeHtml(node.props.helper || node.props.helperText) : null;

        html += `${indent}<div class="space-y-1.5 w-full">
${indent}  <label class="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide">${label}${node.props.required ? ' <span class="text-red-500">*</span>' : ""}</label>
${indent}  <div class="relative flex items-center">
${icon ? `${indent}    <div class="absolute left-3.5 pointer-events-none text-neutral-400"><i data-lucide="${icon}" class="w-4 h-4"></i></div>\n` : ""}${indent}    <input type="${type}" name="${name}" placeholder="${placeholder}" class="w-full px-4 py-2.5 rounded-2xl text-sm transition-all outline-none border border-neutral-300 dark:border-neutral-700 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 bg-white dark:bg-[#1E1B24] text-neutral-900 dark:text-white ${icon ? "pl-10" : ""}" />
${indent}  </div>
${helper ? `${indent}  <p class="text-[11px] text-neutral-500 dark:text-neutral-400">${helper}</p>\n` : ""}${indent}</div>\n`;
        break;
      }

      case "textarea": {
        const name = escapeHtml(node.props.name || "textarea");
        const label = escapeHtml(node.props.label || name);
        const placeholder = escapeHtml(node.props.placeholder || "");
        const rows = Number(node.props.rows) || 3;

        html += `${indent}<div class="space-y-1.5 w-full">
${indent}  <label class="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide">${label}</label>
${indent}  <textarea name="${name}" rows="${rows}" placeholder="${placeholder}" class="w-full px-4 py-2.5 rounded-2xl text-sm transition-all outline-none border border-neutral-300 dark:border-neutral-700 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 bg-white dark:bg-[#1E1B24] text-neutral-900 dark:text-white resize-y"></textarea>
${indent}</div>\n`;
        break;
      }

      case "select": {
        const name = escapeHtml(node.props.name || "select");
        const label = escapeHtml(node.props.label || name);
        const childOptions = (node.children || [])
          .filter(c => c.type === "option")
          .map(c => String(c.props.value || c.props.label || c.props.name || ""));
        const options: string[] = childOptions.length > 0
          ? childOptions
          : (Array.isArray(node.props.options) ? node.props.options : ["Option 1", "Option 2", "Option 3"]);

        html += `${indent}<div class="space-y-1.5 w-full">
${indent}  <label class="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide">${label}</label>
${indent}  <div class="relative">
${indent}    <select name="${name}" class="w-full px-4 py-2.5 rounded-2xl text-sm transition-all outline-none border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1E1B24] text-neutral-900 dark:text-white appearance-none cursor-pointer pr-10 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20">
${options.map(opt => `${indent}      <option value="${escapeHtml(opt)}">${escapeHtml(opt)}</option>`).join("\n")}
${indent}    </select>
${indent}    <i data-lucide="chevron-down" class="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400"></i>
${indent}  </div>
${indent}</div>\n`;
        break;
      }

      case "autocomplete":
      case "searchbar": {
        const name = escapeHtml(node.props.name || "autocomplete");
        const label = escapeHtml(node.props.label || name);
        const childOptions = (node.children || [])
          .filter(c => c.type === "option")
          .map(c => String(c.props.value || c.props.label || c.props.name || ""));
        const options: string[] = childOptions.length > 0
          ? childOptions
          : (Array.isArray(node.props.options) ? node.props.options : ["Option 1", "Option 2", "Option 3"]);

        html += `${indent}<div class="space-y-1.5 w-full">
${indent}  <label class="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide">${label}</label>
${indent}  <div class="relative flex items-center">
${indent}    <div class="absolute left-3.5 pointer-events-none text-neutral-400"><i data-lucide="search" class="w-4 h-4"></i></div>
${indent}    <input type="text" list="list_${name}" name="${name}" placeholder="${escapeHtml(node.props.placeholder || "Type to filter...")}" class="w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm transition-all outline-none border border-neutral-300 dark:border-neutral-700 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 bg-white dark:bg-[#1E1B24] text-neutral-900 dark:text-white" />
${indent}    <datalist id="list_${name}">
${options.map(opt => `${indent}      <option value="${escapeHtml(opt)}"></option>`).join("\n")}
${indent}    </datalist>
${indent}  </div>
${indent}</div>\n`;
        break;
      }

      case "datepicker": {
        const name = escapeHtml(node.props.name || "date");
        const label = escapeHtml(node.props.label || name);

        html += `${indent}<div class="space-y-1.5 w-full">
${indent}  <label class="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide">${label}</label>
${indent}  <input type="date" name="${name}" class="w-full px-4 py-2.5 rounded-2xl text-sm transition-all outline-none border border-neutral-300 dark:border-neutral-700 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 bg-white dark:bg-[#1E1B24] text-neutral-900 dark:text-white cursor-pointer" />
${indent}</div>\n`;
        break;
      }

      case "radio": {
        const name = escapeHtml(node.props.name || node.props.group || "radio");
        const label = escapeHtml(node.props.label || name);
        const val = escapeHtml(node.props.value || label);

        html += `${indent}<label class="flex items-center gap-2.5 py-1.5 cursor-pointer select-none">
${indent}  <input type="radio" name="${name}" value="${val}" ${node.props.checked ? "checked" : ""} class="w-4 h-4 accent-purple-700" />
${indent}  <span class="text-sm text-neutral-800 dark:text-neutral-200">${label}</span>
${indent}</label>\n`;
        break;
      }

      case "segmentedbutton": {
        const name = escapeHtml(node.props.name || node.id);
        const options: string[] = Array.isArray(node.props.options)
          ? node.props.options
          : ["Option A", "Option B", "Option C"];
        const selected = node.props.selected || options[0];

        html += `${indent}<div class="inline-flex p-1 rounded-full border border-neutral-200 dark:border-neutral-700 bg-neutral-100/80 dark:bg-neutral-800/80 overflow-hidden w-auto" data-segmented="${name}">
${options
  .map(
    (opt, idx) => `  <button type="button" class="px-4 py-1.5 text-xs font-medium rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
      opt === selected ? "bg-purple-100 dark:bg-purple-950/80 text-purple-900 dark:text-purple-200 shadow-xs font-semibold active-segment" : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60"
    }" onclick="selectSegmented(this)">
    <span>${escapeHtml(opt)}</span>
  </button>`
  )
  .join("\n")}
${indent}</div>\n`;
        break;
      }

      case "chip": {
        const label = escapeHtml(node.props.label || "");
        const icon = node.props.icon ? sanitizeIconName(node.props.icon) : null;
        const isSelected = node.props.selected === true;

        html += `${indent}<button type="button" class="chip-item inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border cursor-pointer select-none ${
          isSelected ? "bg-purple-100 dark:bg-purple-950/80 border-purple-300 dark:border-purple-700 text-purple-900 dark:text-purple-200" : "bg-white dark:bg-[#1E1B24] border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
        }" onclick="toggleChip(this)">
${icon ? `${indent}  <i data-lucide="${icon}" class="w-3.5 h-3.5"></i>\n` : ""}${indent}  <span>${label}</span>
${indent}</button>\n`;
        break;
      }

      case "switch": {
        const name = escapeHtml(node.props.name || node.id);
        const label = escapeHtml(node.props.label || name);
        const isChecked = node.props.checked === true;

        html += `${indent}<label class="flex items-center justify-between py-1.5 cursor-pointer select-none w-full">
${indent}  <span class="text-sm font-medium text-neutral-800 dark:text-neutral-200">${label}</span>
${indent}  <input type="checkbox" name="${name}" ${isChecked ? "checked" : ""} class="w-5 h-5 accent-purple-700 cursor-pointer rounded" />
${indent}</label>\n`;
        break;
      }

      case "checkbox": {
        const name = escapeHtml(node.props.name || node.id);
        const label = escapeHtml(node.props.label || name);
        const isChecked = node.props.checked === true;

        html += `${indent}<label class="flex items-start gap-2.5 py-1.5 cursor-pointer select-none">
${indent}  <input type="checkbox" name="${name}" ${isChecked ? "checked" : ""} class="w-4 h-4 accent-purple-700 mt-0.5 rounded cursor-pointer" />
${indent}  <span class="text-sm leading-snug text-neutral-800 dark:text-neutral-200">${label}</span>
${indent}</label>\n`;
        break;
      }

      case "slider": {
        const name = escapeHtml(node.props.name || "slider");
        const label = escapeHtml(node.props.label || name);
        const min = Number(node.props.min) || 0;
        const max = Number(node.props.max) || 100;
        const val = Number(node.props.value) || Math.floor((min + max) / 2);

        html += `${indent}<div class="space-y-2 w-full">
${indent}  <div class="flex items-center justify-between">
${indent}    <label class="text-xs font-semibold uppercase text-neutral-600 dark:text-neutral-400">${label}</label>
${indent}    <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-900 dark:text-purple-200 slider-val">${val}</span>
${indent}  </div>
${indent}  <input type="range" name="${name}" min="${min}" max="${max}" value="${val}" class="w-full accent-purple-700 cursor-pointer h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg" oninput="this.parentElement.querySelector('.slider-val').textContent = this.value" />
${indent}</div>\n`;
        break;
      }

      case "card": {
        const variant = node.props.variant || "elevated";
        let cardCls = "bg-white dark:bg-[#1E1B24] rounded-3xl p-5 md:p-6 border transition-all space-y-4";
        if (variant === "elevated") {
          cardCls += " border-neutral-100 dark:border-neutral-800 shadow-[0_2px_8px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]";
        } else if (variant === "filled") {
          cardCls += " bg-neutral-50/80 dark:bg-neutral-800/60 border-transparent shadow-none";
        } else if (variant === "outlined") {
          cardCls += " border-neutral-200 dark:border-neutral-800 shadow-none";
        }

        html += `${indent}<div class="${cardCls}">\n`;
        html += renderNodesToHTML(node.children, indentLevel + 1);
        html += `${indent}</div>\n`;
        break;
      }

      case "row": {
        const spacing = Number(node.props.spacing) || 12;
        const align = node.props.align || "center";
        const justify = node.props.justify || "start";

        let alignCls = "items-center";
        if (align === "start") alignCls = "items-start";
        else if (align === "end") alignCls = "items-end";
        else if (align === "stretch") alignCls = "items-stretch";

        let justifyCls = "justify-start";
        if (justify === "between") justifyCls = "justify-between";
        else if (justify === "center") justifyCls = "justify-center";
        else if (justify === "end") justifyCls = "justify-end";

        html += `${indent}<div class="flex flex-wrap ${alignCls} ${justifyCls} w-full" style="gap: ${spacing}px;">\n`;
        html += renderNodesToHTML(node.children, indentLevel + 1);
        html += `${indent}</div>\n`;
        break;
      }

      case "column": {
        const spacing = Number(node.props.spacing) || 16;
        html += `${indent}<div class="flex flex-col w-full" style="gap: ${spacing}px;">\n`;
        html += renderNodesToHTML(node.children, indentLevel + 1);
        html += `${indent}</div>\n`;
        break;
      }

      case "grid": {
        const cols = Number(node.props.cols) || 2;
        const gap = Number(node.props.gap) || 16;
        let colCls = "grid-cols-1 md:grid-cols-2";
        if (cols === 3) colCls = "grid-cols-1 md:grid-cols-3";
        else if (cols === 4) colCls = "grid-cols-1 sm:grid-cols-2 md:grid-cols-4";
        else if (cols === 1) colCls = "grid-cols-1";

        html += `${indent}<div class="grid ${colCls} w-full" style="gap: ${gap}px;">\n`;
        html += renderNodesToHTML(node.children, indentLevel + 1);
        html += `${indent}</div>\n`;
        break;
      }

      case "split": {
        const leftNode = node.children.find(c => c.type === "left");
        const rightNode = node.children.find(c => c.type === "right");

        html += `${indent}<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">\n`;
        html += `${indent}  <div class="lg:col-span-4 space-y-4">\n`;
        if (leftNode) html += renderNodesToHTML(leftNode.children, indentLevel + 2);
        html += `${indent}  </div>\n`;
        html += `${indent}  <div class="lg:col-span-8 space-y-4">\n`;
        if (rightNode) html += renderNodesToHTML(rightNode.children, indentLevel + 2);
        html += `${indent}  </div>\n`;
        html += `${indent}</div>\n`;
        break;
      }

      case "sidebar": {
        const width = node.props.width || 280;
        const widthStyle = typeof width === "number" ? `${width}px` : width;
        html += `${indent}<div class="rounded-3xl p-4 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1E1B24] space-y-3 shrink-0" style="width: ${widthStyle};">\n`;
        html += renderNodesToHTML(node.children, indentLevel + 1);
        html += `${indent}</div>\n`;
        break;
      }

      case "listitem": {
        const label = escapeHtml(node.props.label || "");
        const subtitle = node.props.subtitle ? escapeHtml(node.props.subtitle) : null;
        const icon = node.props.icon ? sanitizeIconName(node.props.icon) : null;
        const badge = node.props.badge ? escapeHtml(node.props.badge) : null;
        const goto = node.props.goto ? `data-goto="${escapeHtml(node.props.goto)}"` : "";

        html += `${indent}<div class="flex items-center justify-between p-3.5 rounded-2xl transition-all border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 cursor-pointer" ${goto}>
${indent}  <div class="flex items-center gap-3.5">
${icon ? `${indent}    <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-purple-100 dark:bg-purple-950/80 text-purple-900 dark:text-purple-200"><i data-lucide="${icon}" class="w-5 h-5"></i></div>\n` : ""}${indent}    <div>
${indent}      <p class="text-sm font-semibold text-neutral-900 dark:text-white">${label}</p>
${subtitle ? `${indent}      <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">${subtitle}</p>\n` : ""}${indent}    </div>
${indent}  </div>
${indent}  <div class="flex items-center gap-2">
${badge ? `${indent}    <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-900 dark:text-purple-200">${badge}</span>\n` : ""}${indent}    <i data-lucide="chevron-right" class="w-4 h-4 text-neutral-400"></i>
${indent}  </div>
${indent}</div>\n`;
        break;
      }

      case "avatar": {
        const name = escapeHtml(node.props.name || "User");
        const initials = name
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase();

        html += `${indent}<div class="w-10 h-10 rounded-full font-bold text-sm flex items-center justify-center shadow-sm select-none shrink-0 bg-purple-100 dark:bg-purple-950/80 text-purple-900 dark:text-purple-200">${initials}</div>\n`;
        break;
      }

      case "badge": {
        const text = escapeHtml(node.props.text || node.props.value || "New");
        html += `${indent}<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-950/80 text-purple-900 dark:text-purple-200">${text}</span>\n`;
        break;
      }

      case "icon": {
        const iconName = sanitizeIconName(node.props.name || "star");
        html += `${indent}<div class="text-purple-700 dark:text-purple-400 inline-flex items-center justify-center"><i data-lucide="${iconName}" class="w-6 h-6"></i></div>\n`;
        break;
      }

      case "image": {
        const src = escapeHtml(node.props.src || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80");
        html += `${indent}<img src="${src}" alt="Preview" class="w-full h-48 object-cover rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800" />\n`;
        break;
      }

      case "progress": {
        const val = Math.min(100, Math.max(0, Number(node.props.value) || 50));
        html += `${indent}<div class="w-full space-y-1">
${indent}  <div class="h-2 rounded-full overflow-hidden w-full bg-neutral-200 dark:bg-neutral-700">
${indent}    <div class="h-full bg-purple-700 dark:bg-purple-500 rounded-full transition-all duration-300" style="width: ${val}%;"></div>
${indent}  </div>
${indent}</div>\n`;
        break;
      }

      case "metric":
      case "stat": {
        const label = escapeHtml(node.props.label || "Metric");
        const val = escapeHtml(node.props.value || "0");
        const delta = node.props.delta ? escapeHtml(node.props.delta) : null;
        const icon = node.props.icon ? sanitizeIconName(node.props.icon) : null;

        html += `${indent}<div class="p-5 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#1E1B24] space-y-2 transition-all">
${indent}  <div class="flex items-center justify-between">
${indent}    <span class="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">${label}</span>
${icon ? `${indent}    <div class="w-8 h-8 rounded-xl flex items-center justify-center bg-purple-100 dark:bg-purple-950/80 text-purple-900 dark:text-purple-200"><i data-lucide="${icon}" class="w-4 h-4"></i></div>\n` : ""}${indent}  </div>
${indent}  <p class="text-2xl md:text-3xl font-extrabold text-neutral-900 dark:text-white">${val}</p>
${delta ? `${indent}  <span class="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${delta.startsWith("+") ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300" : "bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300"}">${delta}</span>\n` : ""}${indent}</div>\n`;
        break;
      }

      case "alert": {
        const title = node.props.title ? escapeHtml(node.props.title) : null;
        const msg = escapeHtml(node.props.value || "");
        const type = node.props.type || "info";

        let alertBg = "bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 border-purple-100 dark:border-purple-800";
        let iconName = "info";

        if (type === "success") {
          alertBg = "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-100 dark:border-emerald-800";
          iconName = "check-circle-2";
        } else if (type === "warning") {
          alertBg = "bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-100 dark:border-amber-800";
          iconName = "alert-triangle";
        } else if (type === "error") {
          alertBg = "bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200 border-red-100 dark:border-red-800";
          iconName = "alert-circle";
        }

        html += `${indent}<div class="p-4 rounded-2xl flex items-start gap-3 border shadow-xs ${alertBg}">
${indent}  <div class="shrink-0 mt-0.5"><i data-lucide="${iconName}" class="w-5 h-5"></i></div>
${indent}  <div class="space-y-0.5">
${title ? `${indent}    <p class="text-xs font-bold uppercase tracking-wider">${title}</p>\n` : ""}${indent}    <p class="text-sm font-medium leading-relaxed">${msg}</p>
${indent}  </div>
${indent}</div>\n`;
        break;
      }

      case "tabs": {
        const tabPanels = (node.children || []).filter(c => c.type === "tab" || c.type === "panel");
        let items: string[] = [];
        if (Array.isArray(node.props.items)) items = node.props.items;
        else if (Array.isArray(node.props.tabs)) items = node.props.tabs;
        else if (tabPanels.length > 0) items = tabPanels.map(p => p.props.title || p.props.label || p.props.value || "Tab");
        else items = ["Tab 1", "Tab 2", "Tab 3"];

        html += `${indent}<div class="w-full space-y-4 tabs-container">
${indent}  <div class="border-b border-neutral-200 dark:border-neutral-800">
${indent}    <div class="flex gap-2">
${items
  .map(
    (tab, idx) => `${indent}      <button type="button" class="tab-btn px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer border-b-2 ${
      idx === 0 ? "border-purple-700 dark:border-purple-400 text-purple-700 dark:text-purple-400 font-bold" : "border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
    }" onclick="switchTab(this, ${idx})">${escapeHtml(tab)}</button>`
  )
  .join("\n")}
${indent}    </div>
${indent}  </div>
`;
        if (tabPanels.length > 0) {
          tabPanels.forEach((panel, pIdx) => {
            html += `${indent}  <div class="tab-panel ${pIdx === 0 ? "" : "hidden"} space-y-4">
${renderNodesToHTML(panel.children, indentLevel + 2)}${indent}  </div>\n`;
          });
        } else if (node.children && node.children.length > 0) {
          html += renderNodesToHTML(node.children, indentLevel + 1);
        }
        html += `${indent}</div>\n`;
        break;
      }

      case "tab":
      case "panel": {
        html += renderNodesToHTML(node.children, indentLevel);
        break;
      }

      case "table": {
        let headers: string[] = [];
        const rawCols = node.props.columns || node.props.headers || node.props.cols;
        if (Array.isArray(rawCols)) headers = rawCols.map(String);
        else if (typeof rawCols === "string") headers = rawCols.split(",").map(s => s.trim().replace(/^["']|["']$/g, ""));
        else headers = ["ID", "Name", "Status", "Actions"];

        let rows: any[][] = [];
        if (node.children && node.children.length > 0) {
          node.children.forEach(c => {
            if (c.props.values && Array.isArray(c.props.values)) rows.push(c.props.values);
            else if (c.props.cells && Array.isArray(c.props.cells)) rows.push(c.props.cells);
            else if (c.props.value) rows.push([c.props.value]);
          });
        }
        if (rows.length === 0 && (node.props.rows || node.props.data)) {
          const rawData = node.props.rows || node.props.data;
          if (Array.isArray(rawData)) {
            rawData.forEach(item => {
              if (Array.isArray(item)) rows.push(item);
              else if (typeof item === "object" && item !== null) rows.push(Object.values(item));
              else rows.push([String(item)]);
            });
          }
        }
        if (rows.length === 0) {
          rows = [
            ["#101", "Auth Gateway Service", "Active", "Configure"],
            ["#102", "Notification Worker", "Active", "Configure"],
            ["#103", "Javier Díaz Bolaños", "Active", "Manage"],
          ];
        }

        const title = node.props.title || node.props.label;
        html += `${indent}<div class="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1E1B24] shadow-xs">
${title ? `${indent}  <div class="p-4 border-b border-neutral-200 dark:border-neutral-800 font-bold text-neutral-900 dark:text-white">${escapeHtml(title)}</div>\n` : ""}${indent}  <table class="w-full text-left text-sm">
${indent}    <thead class="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-300">
${indent}      <tr>
${headers.map(h => `${indent}        <th class="p-3 font-semibold text-xs uppercase tracking-wider">${escapeHtml(h)}</th>`).join("\n")}
${indent}      </tr>
${indent}    </thead>
${indent}    <tbody class="divide-y divide-neutral-200 dark:divide-neutral-800">
${rows
  .map(
    row => `${indent}      <tr class="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
${headers
  .map((_, cIdx) => {
    const cell = row[cIdx] !== undefined ? String(row[cIdx]) : "";
    const isStatus = ["activo", "active", "completado", "completed", "success", "ok"].includes(cell.toLowerCase());
    return `${indent}        <td class="p-3 text-neutral-800 dark:text-neutral-200">${
      isStatus
        ? `<span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">${escapeHtml(
            cell
          )}</span>`
        : escapeHtml(cell)
    }</td>`;
  })
  .join("\n")}
${indent}      </tr>`
  )
  .join("\n")}
${indent}    </tbody>
${indent}  </table>
${indent}</div>\n`;
        break;
      }

      case "divider":
        html += `${indent}<hr class="border-neutral-200 my-2" />\n`;
        break;

      case "accordion": {
        const title = escapeHtml(node.props.title || node.props.label || node.props.value || "Sección");
        const isExp = node.props.expanded === true || node.props.expanded === "true";
        const icon = node.props.icon ? sanitizeIconName(node.props.icon) : null;
        html += `${indent}<details class="group rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1E1B24] overflow-hidden shadow-xs w-full"${isExp ? " open" : ""}>\n`;
        html += `${indent}  <summary class="px-4 py-3.5 flex items-center justify-between gap-3 text-sm font-semibold text-neutral-800 dark:text-neutral-200 cursor-pointer list-none select-none hover:bg-neutral-50 dark:hover:bg-neutral-800/50">\n`;
        html += `${indent}    <span class="flex items-center gap-2.5">\n`;
        if (icon) html += `${indent}      <i data-lucide="${icon}" class="w-4 h-4 text-purple-700 dark:text-purple-400"></i>\n`;
        html += `${indent}      ${title}\n`;
        html += `${indent}    </span>\n`;
        html += `${indent}    <i data-lucide="chevron-down" class="w-4 h-4 text-neutral-400 group-open:rotate-180 transition-transform"></i>\n`;
        html += `${indent}  </summary>\n`;
        html += `${indent}  <div class="px-4 py-3.5 border-t border-neutral-100 dark:border-neutral-800 space-y-3">\n`;
        html += renderNodesToHTML(node.children, indentLevel + 2);
        html += `${indent}  </div>\n`;
        html += `${indent}</details>\n`;
        break;
      }

      case "fab": {
        const label = escapeHtml(node.props.label || "");
        const icon = sanitizeIconName(node.props.icon || "plus");
        const isExt = node.props.extended !== undefined ? node.props.extended === true || node.props.extended === "true" : Boolean(label);
        const goto = node.props.goto ? `data-goto="${escapeHtml(node.props.goto)}"` : "";
        html += `${indent}<div class="flex justify-end w-full py-1">\n`;
        html += `${indent}  <button type="button" ${goto} class="${isExt ? "px-5 py-3.5 rounded-3xl gap-2.5" : "w-14 h-14 rounded-3xl"} inline-flex items-center justify-center bg-purple-700 hover:bg-purple-800 text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer">\n`;
        html += `${indent}    <i data-lucide="${icon}" class="w-5 h-5"></i>\n`;
        if (isExt && label) html += `${indent}    <span>${label}</span>\n`;
        html += `${indent}  </button>\n`;
        html += `${indent}</div>\n`;
        break;
      }

      case "snackbar": {
        const msg = escapeHtml(node.props.message || node.props.value || "Notificación de acción");
        const action = node.props.action ? escapeHtml(node.props.action) : null;
        const icon = sanitizeIconName(node.props.icon || "info");
        const goto = node.props.goto ? `data-goto="${escapeHtml(node.props.goto)}"` : "";
        html += `${indent}<div class="w-full p-4 rounded-xl bg-neutral-900 text-neutral-100 flex items-center justify-between gap-3 text-sm shadow-xl">\n`;
        html += `${indent}  <div class="flex items-center gap-2.5">\n`;
        html += `${indent}    <i data-lucide="${icon}" class="w-4 h-4 text-purple-300 shrink-0"></i>\n`;
        html += `${indent}    <span class="font-medium">${msg}</span>\n`;
        html += `${indent}  </div>\n`;
        if (action) {
          html += `${indent}  <button type="button" ${goto} class="text-xs font-bold text-purple-300 hover:text-purple-200 uppercase tracking-wider px-2 py-1 cursor-pointer">${action}</button>\n`;
        }
        html += `${indent}</div>\n`;
        break;
      }

      case "breadcrumbs": {
        const items = Array.isArray(node.props.items)
          ? node.props.items
          : (typeof node.props.items === "string" ? node.props.items.split(",").map((s: string) => s.trim()) : ["Inicio", "Sección", "Detalle"]);
        const sep = node.props.separator === "slash" ? "/" : ">";
        html += `${indent}<nav class="flex items-center gap-2 text-xs md:text-sm text-neutral-500 py-1">\n`;
        items.forEach((it: string, idx: number) => {
          const isLast = idx === items.length - 1;
          html += `${indent}  ${idx > 0 ? `<span>${sep}</span> ` : ""}<span class="${isLast ? "font-bold text-neutral-800 dark:text-neutral-200" : "hover:underline cursor-pointer"}">${escapeHtml(it)}</span>\n`;
        });
        html += `${indent}</nav>\n`;
        break;
      }

      case "rating": {
        const ratName = escapeHtml(node.props.name || "rating");
        const ratLabel = node.props.label ? escapeHtml(node.props.label) : "";
        const max = Number(node.props.max) || 5;
        const initialVal = Number(node.props.value) || 0;
        html += `${indent}<div class="space-y-1.5" data-rating="${ratName}">\n`;
        if (ratLabel) html += `${indent}  <label class="block text-xs font-semibold uppercase text-neutral-600 dark:text-neutral-400">${ratLabel}</label>\n`;
        html += `${indent}  <div class="flex items-center gap-1">\n`;
        for (let idx = 0; idx < max; idx++) {
          const isFilled = idx + 1 <= initialVal;
          html += `${indent}    <span class="text-lg cursor-pointer transition-transform hover:scale-125 ${isFilled ? "text-amber-400" : "text-neutral-300 dark:text-neutral-600"}">★</span>\n`;
        }
        html += `${indent}    <span class="text-xs font-semibold text-neutral-500 ml-2">${initialVal} / ${max}</span>\n`;
        html += `${indent}  </div>\n`;
        html += `${indent}</div>\n`;
        break;
      }

      case "spacer": {
        const height = Number(node.props.height) || 16;
        html += `${indent}<div style="height: ${height}px;"></div>\n`;
        break;
      }

      case "loading":
      case "spinner":
      case "progressindicator":
      case "circularprogress": {
        const rawVal = node.props.value;
        const isDeterminate = rawVal !== undefined && !isNaN(Number(rawVal));
        const val = isDeterminate ? Math.min(100, Math.max(0, Number(rawVal))) : 0;
        const msg = escapeHtml(node.props.message || node.props.label || node.props.title || "");
        const variant = node.props.variant || (node.type === "circularprogress" ? "circular" : "circular");

        if (variant === "linear") {
          html += `${indent}<div class="w-full space-y-1.5 py-1">\n`;
          if (msg) html += `${indent}  <div class="flex items-center justify-between text-xs font-semibold text-neutral-800 dark:text-neutral-200"><span>${msg}</span>${isDeterminate ? `<span class="font-mono text-[11px]">${val}%</span>` : ""}</div>\n`;
          html += `${indent}  <div class="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-2 overflow-hidden">\n`;
          if (isDeterminate) {
            html += `${indent}    <div class="bg-purple-700 h-full rounded-full transition-all duration-300" style="width: ${val}%;"></div>\n`;
          } else {
            html += `${indent}    <div class="bg-purple-700 h-full rounded-full animate-pulse w-2/3"></div>\n`;
          }
          html += `${indent}  </div>\n`;
          html += `${indent}</div>\n`;
        } else {
          html += `${indent}<div class="flex flex-col items-center justify-center gap-2 p-3 text-center w-full">\n`;
          html += `${indent}  <div class="relative w-10 h-10 flex items-center justify-center">\n`;
          html += `${indent}    <svg class="animate-spin w-10 h-10 text-purple-700" viewBox="0 0 24 24" fill="none">\n`;
          html += `${indent}      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"></circle>\n`;
          html += `${indent}      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>\n`;
          html += `${indent}    </svg>\n`;
          html += `${indent}  </div>\n`;
          if (msg) html += `${indent}  <p class="text-xs font-semibold text-neutral-700 dark:text-neutral-300">${msg}</p>\n`;
          html += `${indent}</div>\n`;
        }
        break;
      }

      case "tooltip": {
        const text = escapeHtml(node.props.text || node.props.message || node.props.value || "Información de ayuda");
        html += `${indent}<div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-purple-200 bg-purple-50 dark:bg-purple-950/60 dark:border-purple-800 text-purple-900 dark:text-purple-300">\n`;
        html += `${indent}  <i data-lucide="help-circle" class="w-3.5 h-3.5 text-purple-700 dark:text-purple-400"></i>\n`;
        html += `${indent}  <span>${text}</span>\n`;
        html += `${indent}</div>\n`;
        break;
      }

      case "richtooltip":
      case "rich-tooltip": {
        const title = escapeHtml(node.props.title || node.props.label || "Información");
        const text = escapeHtml(node.props.text || node.props.message || node.props.value || "");
        const action = node.props.action ? escapeHtml(node.props.action) : null;
        const goto = (node.props.actionGoto || node.props.action_goto || node.props.goto) ? `data-goto="${escapeHtml(node.props.actionGoto || node.props.action_goto || node.props.goto)}"` : "";
        html += `${indent}<div class="max-w-xs rounded-2xl border border-purple-200 dark:border-purple-800 bg-purple-50/70 dark:bg-purple-950/50 p-4 shadow-md space-y-2">\n`;
        html += `${indent}  <div class="flex items-center gap-2">\n`;
        html += `${indent}    <i data-lucide="sparkles" class="w-4 h-4 text-purple-700 dark:text-purple-400"></i>\n`;
        html += `${indent}    <h4 class="text-xs font-bold text-neutral-900 dark:text-white">${title}</h4>\n`;
        html += `${indent}  </div>\n`;
        if (text) html += `${indent}  <p class="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">${text}</p>\n`;
        if (action) {
          html += `${indent}  <div class="pt-1 flex justify-end">\n`;
          html += `${indent}    <button type="button" ${goto} class="px-3 py-1 rounded-full text-xs font-bold text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 cursor-pointer">${action}</button>\n`;
          html += `${indent}  </div>\n`;
        }
        html += `${indent}</div>\n`;
        break;
      }

      case "iconbutton":
      case "icon-button": {
        const icon = sanitizeIconName(node.props.icon || node.props.name || "star");
        const goto = node.props.goto ? `data-goto="${escapeHtml(node.props.goto)}"` : "";
        const variant = node.props.variant || "standard";
        let cls = "w-10 h-10 rounded-full inline-flex items-center justify-center transition-all cursor-pointer ";
        if (variant === "filled") cls += "bg-purple-700 hover:bg-purple-800 text-white shadow-sm";
        else if (variant === "tonal") cls += "bg-purple-100 dark:bg-purple-950/60 hover:bg-purple-200 dark:hover:bg-purple-900/60 text-purple-900 dark:text-purple-200";
        else if (variant === "outlined") cls += "border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800";
        else cls += "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800";

        html += `${indent}<button type="button" ${goto} class="${cls}">\n`;
        html += `${indent}  <i data-lucide="${icon}" class="w-5 h-5"></i>\n`;
        html += `${indent}</button>\n`;
        break;
      }

      case "navigationrail":
      case "apprail":
      case "navrail":
      case "rail": {
        const title = escapeHtml(node.props.title || node.props.label || "");
        html += `${indent}<div class="w-full md:w-20 lg:w-24 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1E1B24] p-3 flex flex-col items-center gap-3 shadow-xs shrink-0">\n`;
        if (title) html += `${indent}  <span class="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">${title}</span>\n`;
        if (node.children && node.children.length > 0) {
          html += renderNodesToHTML(node.children, indentLevel + 1);
        }
        html += `${indent}</div>\n`;
        break;
      }

      case "navitem":
      case "railitem":
      case "rail-item":
      case "destination": {
        const label = escapeHtml(node.props.label || node.props.title || node.props.value || "Nav");
        const icon = sanitizeIconName(node.props.icon || "circle");
        const isActive = node.props.active === true || node.props.active === "true" || node.props.selected === true;
        const goto = node.props.goto ? `data-goto="${escapeHtml(node.props.goto)}"` : "";
        const badge = node.props.badge ? escapeHtml(node.props.badge) : null;

        html += `${indent}<button type="button" ${goto} class="w-full py-2 px-1 flex flex-col items-center justify-center gap-1 rounded-2xl transition-all cursor-pointer group text-neutral-700 dark:text-neutral-300">\n`;
        html += `${indent}  <div class="px-3.5 py-1 rounded-full flex items-center justify-center ${isActive ? "bg-purple-100 dark:bg-purple-950/80 text-purple-900 dark:text-purple-200 font-bold" : "group-hover:bg-neutral-100 dark:group-hover:bg-neutral-800"}">\n`;
        html += `${indent}    <i data-lucide="${icon}" class="w-4 h-4"></i>\n`;
        html += `${indent}  </div>\n`;
        html += `${indent}  <span class="text-[10px] font-medium truncate max-w-full">${label}</span>\n`;
        if (badge) html += `${indent}  <span class="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-purple-700 text-white">${badge}</span>\n`;
        html += `${indent}</button>\n`;
        break;
      }

      case "bottomnav":
      case "bottombar":
      case "navigationbar": {
        html += `${indent}<nav class="w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1E1B24] p-2 flex items-center justify-around gap-1 shadow-sm">\n`;
        if (node.children && node.children.length > 0) {
          html += renderNodesToHTML(node.children, indentLevel + 1);
        }
        html += `${indent}</nav>\n`;
        break;
      }

      case "appbar":
      case "topappbar":
      case "navbar":
      case "topbar":
      case "header": {
        const title = escapeHtml(node.props.title || node.props.label || node.props.value || "");
        const icon = sanitizeIconName(node.props.icon || (node.props.goto ? "arrow-left" : "menu"));
        const goto = node.props.goto ? `data-goto="${escapeHtml(node.props.goto)}"` : "";
        const action = node.props.action ? escapeHtml(node.props.action) : null;
        const actionGoto = (node.props.actionGoto || node.props.action_goto) ? `data-goto="${escapeHtml(node.props.actionGoto || node.props.action_goto)}"` : "";

        html += `${indent}<header class="w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1E1B24] px-4 py-3 flex items-center justify-between gap-3 shadow-xs">\n`;
        html += `${indent}  <div class="flex items-center gap-3">\n`;
        html += `${indent}    <button type="button" ${goto} class="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 cursor-pointer"><i data-lucide="${icon}" class="w-5 h-5"></i></button>\n`;
        if (title) html += `${indent}    <h2 class="text-base font-bold text-neutral-900 dark:text-white">${title}</h2>\n`;
        html += `${indent}  </div>\n`;
        if (action) {
          html += `${indent}  <button type="button" ${actionGoto} class="px-3.5 py-1.5 rounded-full text-xs font-bold bg-purple-700 text-white cursor-pointer">${action}</button>\n`;
        }
        html += `${indent}</header>\n`;
        break;
      }

      case "list": {
        html += `${indent}<div class="w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1E1B24] divide-y divide-neutral-100 dark:divide-neutral-800 overflow-hidden shadow-2xs">\n`;
        if (node.children && node.children.length > 0) {
          html += renderNodesToHTML(node.children, indentLevel + 1);
        }
        html += `${indent}</div>\n`;
        break;
      }

      case "drawer":
      case "navigationdrawer":
      case "appdrawer":
      case "navdrawer": {
        const title = escapeHtml(node.props.title || node.props.label || "Main Navigation");
        html += `${indent}<nav class="w-full max-w-xs rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1E1B24] p-4 shadow-sm space-y-3">\n`;
        html += `${indent}  <div class="px-3 py-2 font-bold text-sm text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800">${title}</div>\n`;
        if (node.children && node.children.length > 0) {
          html += renderNodesToHTML(node.children, indentLevel + 1);
        }
        html += `${indent}</nav>\n`;
        break;
      }

      case "draweritem": {
        const label = escapeHtml(node.props.label || node.props.title || node.props.value || "Item");
        const icon = node.props.icon ? sanitizeIconName(node.props.icon) : null;
        const goto = node.props.goto ? `data-goto="${escapeHtml(node.props.goto)}"` : "";
        const isActive = node.props.active === true || node.props.active === "true";
        const badge = node.props.badge ? escapeHtml(node.props.badge) : null;

        html += `${indent}<button type="button" ${goto} class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer select-none ${isActive ? "bg-purple-100 dark:bg-purple-950/80 text-purple-900 dark:text-purple-200" : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"}">\n`;
        html += `${indent}  <div class="flex items-center gap-3 min-w-0">\n`;
        if (icon) html += `${indent}    <i data-lucide="${icon}" class="w-4 h-4 shrink-0"></i>\n`;
        html += `${indent}    <span class="truncate">${label}</span>\n`;
        html += `${indent}  </div>\n`;
        if (badge) html += `${indent}  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-700 text-white">${badge}</span>\n`;
        html += `${indent}</button>\n`;
        break;
      }

      case "sidesheet":
      case "side-sheet":
      case "bottomsheet": {
        const title = escapeHtml(node.props.title || node.props.label || "Details");
        html += `${indent}<div class="w-full rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1E1B24] p-5 shadow-sm space-y-4">\n`;
        html += `${indent}  <div class="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">\n`;
        html += `${indent}    <h3 class="text-sm font-bold text-neutral-900 dark:text-white">${title}</h3>\n`;
        html += `${indent}  </div>\n`;
        if (node.children && node.children.length > 0) {
          html += renderNodesToHTML(node.children, indentLevel + 1);
        }
        html += `${indent}</div>\n`;
        break;
      }

      default:
        if (node.children && node.children.length > 0) {
          html += renderNodesToHTML(node.children, indentLevel);
        }
        break;
    }
  }

  return html;
}

/**
 * Exports AST to a complete, standalone, interactive single-file HTML document.
 */
export function exportToHTML(doc: WispDocument): string {
  const firstScreen = doc.screens[0]?.name || "Main";

  const standardScreens = doc.screens.filter(
    s => s.type !== "dialog" && s.type !== "modal" && s.type !== "sheet"
  );
  const modalScreens = doc.screens.filter(
    s => s.type === "dialog" || s.type === "modal" || s.type === "sheet"
  );

  return `<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Wisp Material 3 Prototype</title>
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Roboto+Flex:wght@400;500;600;700&display=swap" rel="stylesheet">
  
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
          }
        }
      }
    }
  </script>

  <!-- Lucide Icons -->
  <script src="https://unpkg.com/lucide@latest"></script>

  <!-- Beer CSS & Material Design 3 Ecosystem (CDN Universal) -->
  <link href="https://cdn.jsdelivr.net/npm/beercss@3.9.1/dist/cdn/beer.min.css" rel="stylesheet" />
  <script type="module" src="https://cdn.jsdelivr.net/npm/beercss@3.9.1/dist/cdn/beer.min.js"></script>
  <script type="module" src="https://cdn.jsdelivr.net/npm/material-dynamic-colors@1.1.2/dist/cdn/material-dynamic-colors.min.js"></script>

  <style>
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .screen-view {
      display: none;
    }
    .screen-view.active {
      display: block;
    }
    .wizard-step {
      display: none;
    }
    .wizard-step.active {
      display: block;
    }
    .modal-overlay {
      display: none;
    }
    .modal-overlay.active {
      display: flex;
    }
    /* M3 Expressive Interactive Transitions & Click States */
    button, input[type="button"], select, a {
      transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
    }
    button:active {
      transform: scale(0.96);
    }

    /* M3 Expressive Ripple Wave Animation */
    @keyframes m3-ripple-expand {
      0% {
        transform: scale(0);
        opacity: 0.35;
      }
      60% {
        opacity: 0.22;
      }
      100% {
        transform: scale(2.8);
        opacity: 0;
      }
    }

    .m3-ripple-effect {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
      background-color: currentColor;
      transform: scale(0);
      animation: m3-ripple-expand 0.65s cubic-bezier(0.2, 0, 0, 1) forwards;
      z-index: 10;
    }
  </style>
</head>
<body class="min-h-full bg-[#FAF8FD] dark:bg-[#141218] text-[#1D1B20] dark:text-[#E6E1E5] font-sans antialiased p-4 md:p-8 transition-colors">
  
  <div class="max-w-5xl mx-auto space-y-6">
    <!-- Top Bar / App Navigation -->
    <header class="bg-white dark:bg-[#1E1B24] p-4 md:px-6 md:py-4 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-2xl bg-purple-700 text-white flex items-center justify-center font-extrabold shadow-sm">
          W
        </div>
        <div>
          <h1 class="text-base font-bold text-neutral-900 dark:text-white leading-tight">Wisp Prototype</h1>
          <p class="text-[11px] text-purple-700 dark:text-purple-400 font-medium">Material 3 Expressive UI</p>
        </div>
      </div>

      <!-- Screen Jump Navigator -->
      <div class="flex items-center gap-2">
        <div class="relative">
          <select id="screen-selector" onchange="navigateToScreen(this.value)" class="text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 outline-none cursor-pointer pr-8 appearance-none">
            ${doc.screens
              .map(
                s =>
                  `<option value="${escapeHtml(s.name)}">@${escapeHtml(s.name)} (${s.type})</option>`
              )
              .join("\n            ")}
          </select>
          <i data-lucide="chevron-down" class="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500"></i>
        </div>

        <!-- Dark Mode Toggle -->
        <button type="button" onclick="toggleDarkMode()" class="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer text-neutral-700 dark:text-neutral-300" title="Toggle dark/light theme">
          <i data-lucide="moon" class="w-4 h-4 dark:hidden"></i>
          <i data-lucide="sun" class="w-4 h-4 hidden dark:block"></i>
        </button>
      </div>
    </header>

    <!-- Main Screens Container -->
    <main class="space-y-6">
      ${standardScreens
        .map(screen => {
          const isWizard = screen.type === "wizard";
          const totalSteps = screen.steps?.length || Number(screen.props.totalSteps) || 3;

          if (isWizard) {
            return `<!-- Wizard Screen: @${escapeHtml(screen.name)} -->
      <section id="screen-${escapeHtml(screen.name)}" class="screen-view space-y-6 ${
              screen.name === firstScreen ? "active" : ""
            }">
        <!-- Stepper Card -->
        <div class="bg-white dark:bg-[#1E1B24] p-6 md:p-8 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-xs uppercase tracking-wider font-semibold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-full">
                Wizard • <span class="wizard-step-label">Step 1 of ${totalSteps}</span>
              </span>
              <h2 class="text-2xl font-bold text-neutral-900 dark:text-white mt-1">${escapeHtml(screen.name)}</h2>
            </div>
          </div>

          <div class="flex items-center gap-2" data-wizard-stepper="${escapeHtml(screen.name)}" data-total-steps="${totalSteps}">
            ${Array.from({ length: totalSteps })
              .map(
                (_, idx) => `
            <button type="button" class="w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center transition-all cursor-pointer step-btn ${
              idx === 0
                ? "bg-purple-700 text-white shadow-md"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
            }" onclick="goToWizardStep('${escapeHtml(screen.name)}', ${idx + 1})">
              ${idx + 1}
            </button>
            ${
              idx < totalSteps - 1
                ? '<div class="flex-1 h-1 rounded-full bg-neutral-200 dark:bg-neutral-800 step-line"></div>'
                : ""
            }`
              )
              .join("")}
          </div>
        </div>

        <!-- Wizard Step Contents -->
        <div class="wizard-steps-container space-y-6" data-wizard-content="${escapeHtml(screen.name)}">
          ${
            screen.steps && screen.steps.length > 0
              ? screen.steps
                  .map(
                    (step, sIdx) => `
          <div class="wizard-step space-y-6 ${sIdx === 0 ? "active" : ""}" data-step="${sIdx + 1}">
${renderNodesToHTML(step.children, 6)}
          </div>`
                  )
                  .join("\n")
              : `
          <div class="wizard-step space-y-6 active" data-step="1">
${renderNodesToHTML(screen.children, 6)}
          </div>`
          }
        </div>
      </section>`;
          }

          // Standard screen / form
          return `<!-- Screen: @${escapeHtml(screen.name)} -->
      <section id="screen-${escapeHtml(screen.name)}" class="screen-view space-y-6 ${
            screen.name === firstScreen ? "active" : ""
          }">
${renderNodesToHTML(screen.children, 4)}
      </section>`;
        })
        .join("\n\n      ")}
    </main>

    <!-- Dialogs & Modals Overlays -->
    ${modalScreens
      .map(
        m => `
    <div id="modal-${escapeHtml(m.name)}" class="modal-overlay fixed inset-0 z-50 items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div class="w-full max-w-lg bg-white dark:bg-[#1E1B24] rounded-3xl p-6 md:p-8 shadow-2xl border border-neutral-200 dark:border-neutral-800 relative text-neutral-900 dark:text-neutral-100">
        <button type="button" onclick="closeModal('${escapeHtml(m.name)}')" class="absolute top-4 right-4 p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white cursor-pointer transition-colors">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
        <div class="space-y-4">
          <span class="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400">
            ${escapeHtml(m.type)} • @${escapeHtml(m.name)}
          </span>
${renderNodesToHTML(m.children, 5)}
        </div>
      </div>
    </div>`
      )
      .join("\n")}
  </div>

  <!-- Interactive Runtime Engine -->
  <script>
    // Initialize Lucide Icons
    document.addEventListener('DOMContentLoaded', () => {
      lucide.createIcons();
      bindGotoButtons();
    });

    // Screen navigation
    function navigateToScreen(screenName) {
      if (!screenName) return;

      // Check if it is a modal/dialog
      const modalEl = document.getElementById('modal-' + screenName);
      if (modalEl) {
        openModal(screenName);
        return;
      }

      // Hide all standard screens
      document.querySelectorAll('.screen-view').forEach(el => el.classList.remove('active'));

      // Show target screen
      const targetScreen = document.getElementById('screen-' + screenName);
      if (targetScreen) {
        targetScreen.classList.add('active');
        const selector = document.getElementById('screen-selector');
        if (selector) selector.value = screenName;
      }
    }

    // Modal helpers
    function openModal(modalName) {
      const modalEl = document.getElementById('modal-' + modalName);
      if (modalEl) modalEl.classList.add('active');
    }

    function closeModal(modalName) {
      if (modalName) {
        const modalEl = document.getElementById('modal-' + modalName);
        if (modalEl) modalEl.classList.remove('active');
      } else {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
      }
    }

    // Wizard Step Navigation
    function goToWizardStep(screenName, stepNum) {
      const screenEl = document.getElementById('screen-' + screenName);
      if (!screenEl) return;

      // Update step label
      const totalSteps = parseInt(screenEl.querySelector('[data-wizard-stepper]')?.dataset.totalSteps || '3', 10);
      const label = screenEl.querySelector('.wizard-step-label');
      if (label) label.textContent = 'Step ' + stepNum + ' of ' + totalSteps;

      // Update buttons
      const buttons = screenEl.querySelectorAll('.step-btn');
      buttons.forEach((btn, idx) => {
        const s = idx + 1;
        if (s === stepNum) {
          btn.className = 'w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center transition-all cursor-pointer step-btn bg-purple-700 text-white shadow-md';
          btn.textContent = s;
        } else if (s < stepNum) {
          btn.className = 'w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center transition-all cursor-pointer step-btn bg-purple-100 text-purple-900';
          btn.textContent = '✓';
        } else {
          btn.className = 'w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center transition-all cursor-pointer step-btn bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400';
          btn.textContent = s;
        }
      });

      // Update step views
      const steps = screenEl.querySelectorAll('.wizard-step');
      steps.forEach(st => {
        if (parseInt(st.dataset.step, 10) === stepNum) {
          st.classList.add('active');
        } else {
          st.classList.remove('active');
        }
      });

      lucide.createIcons();
    }

    // Bind data-goto attributes
    function bindGotoButtons() {
      document.querySelectorAll('[data-goto]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const target = btn.getAttribute('data-goto');
          if (!target) return;

          if (target === 'back' || target === 'close') {
            closeModal();
            return;
          }

          if (target.startsWith('@')) {
            const match = target.match(/^@([a-zA-Z0-9_-]+)(?:\\((?:step=(\\d+)|([^)]+))\\))?/);
            if (match) {
              const targetName = match[1];
              const stepParam = match[2];

              // Check if modal
              const modalEl = document.getElementById('modal-' + targetName);
              if (modalEl) {
                openModal(targetName);
                return;
              }

              navigateToScreen(targetName);
              if (stepParam) {
                goToWizardStep(targetName, parseInt(stepParam, 10));
              }
            }
          }
        });
      });
    }

    // Segmented button selection
    function selectSegmented(button) {
      const container = button.closest('[data-segmented]');
      if (!container) return;
      container.querySelectorAll('button').forEach(btn => {
        btn.className = 'px-4 py-1.5 text-xs font-medium rounded-full transition-all flex items-center gap-1.5 cursor-pointer text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60';
      });
      button.className = 'px-4 py-1.5 text-xs font-medium rounded-full transition-all flex items-center gap-1.5 cursor-pointer bg-purple-100 dark:bg-purple-950/80 text-purple-900 dark:text-purple-200 shadow-xs font-semibold active-segment';
    }

    // Chip toggle
    function toggleChip(chip) {
      const isSelected = chip.classList.contains('bg-purple-100') || chip.classList.contains('dark:bg-purple-950/80');
      if (isSelected) {
        chip.className = 'chip-item inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border cursor-pointer select-none bg-white dark:bg-[#1E1B24] border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800';
      } else {
        chip.className = 'chip-item inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border cursor-pointer select-none bg-purple-100 dark:bg-purple-950/80 border-purple-300 dark:border-purple-700 text-purple-900 dark:text-purple-200';
      }
    }

    // Tab switching
    function switchTab(tabBtn, tabIndex) {
      const container = tabBtn.closest('.tabs-container');
      if (!container) return;
      container.querySelectorAll('.tab-btn').forEach((btn, idx) => {
        if (idx === tabIndex) {
          btn.className = 'tab-btn px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer border-b-2 border-purple-700 dark:border-purple-400 text-purple-700 dark:text-purple-400 font-bold';
        } else {
          btn.className = 'tab-btn px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer border-b-2 border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200';
        }
      });
      const panels = container.querySelectorAll('.tab-panel');
      panels.forEach((p, idx) => {
        if (idx === tabIndex) {
          p.classList.remove('hidden');
        } else {
          p.classList.add('hidden');
        }
      });
      lucide.createIcons();
    }

    // Dark Mode Toggle
    function toggleDarkMode() {
      document.documentElement.classList.toggle('dark');
      lucide.createIcons();
    }

    // Material 3 Expressive Ripple Wave Handler
    document.addEventListener('pointerdown', (e) => {
      const target = e.target.closest('button, [role="button"], a, .tab-btn, .chip-item, [data-goto]');
      if (!target) return;

      const rect = target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const diameter = Math.max(rect.width, rect.height) * 2.2;

      const ripple = document.createElement('span');
      ripple.className = 'm3-ripple-effect';
      ripple.style.width = diameter + 'px';
      ripple.style.height = diameter + 'px';
      ripple.style.left = (x - diameter / 2) + 'px';
      ripple.style.top = (y - diameter / 2) + 'px';

      const computedPos = window.getComputedStyle(target).position;
      if (computedPos === 'static') {
        target.style.position = 'relative';
      }
      target.style.overflow = 'hidden';

      target.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 650);
    });

    // Close modal on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  </script>
</body>
</html>`;
}

