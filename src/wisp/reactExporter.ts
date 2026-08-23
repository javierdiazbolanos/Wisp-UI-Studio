import { WispDocument, ScreenNode, WispNode } from "./types";

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
        res += `${indent}<button className="${btnClasses}" ${goto}>${node.props.label || "Button"}</button>\n`;
        break;
      }

      case "splitbutton":
      case "split-button":
      case "split-btn": {
        const label = node.props.label || "Action";
        const goto = node.props.goto ? `onClick={() => handleNavigate('${node.props.goto}')}` : "";
        res += `${indent}<div className="inline-flex rounded-full shadow-sm bg-purple-700 text-white overflow-hidden divide-x divide-purple-800">
${indent}  <button className="px-5 py-2.5 text-sm font-semibold hover:bg-purple-800 flex items-center gap-2" ${goto}><span>${label}</span></button>
${indent}  <button className="px-3 py-2.5 hover:bg-purple-800"><ChevronDown className="w-4 h-4" /></button>
${indent}</div>\n`;
        break;
      }

      case "buttongroup":
      case "button-group":
      case "connectedbuttons":
      case "connected-buttons": {
        res += `${indent}<div className="inline-flex rounded-2xl border border-neutral-300 overflow-hidden divide-x divide-neutral-200 shadow-xs">
${node.children.length > 0 ? renderNodesToReact(node.children, indentLevel + 1) : `${indent}  <button className="px-4 py-2 text-xs font-semibold bg-purple-50 text-purple-900">Option 1</button>\n${indent}  <button className="px-4 py-2 text-xs font-semibold bg-white text-neutral-700">Option 2</button>\n`}${indent}</div>\n`;
        break;
      }

      case "fabmenu":
      case "fab-menu":
      case "speeddial": {
        const label = node.props.label || "";
        res += `${indent}<div className="relative inline-block space-y-2">
${indent}  <button className="px-5 py-3 rounded-full bg-purple-700 text-white shadow-lg flex items-center gap-2 font-bold text-sm">
${indent}    <Plus className="w-5 h-5" />
${indent}    ${label ? `<span>${label}</span>` : ""}
${indent}  </button>
${node.children.length > 0 ? `${indent}  <div className="space-y-2">\n${renderNodesToReact(node.children, indentLevel + 2)}${indent}  </div>\n` : ""}${indent}</div>\n`;
        break;
      }

      case "fabitem":
      case "fab-item": {
        const label = node.props.label || "Action";
        const goto = node.props.goto ? `onClick={() => handleNavigate('${node.props.goto}')}` : "";
        res += `${indent}<div className="flex items-center gap-2" ${goto}>
${indent}  <button className="w-10 h-10 rounded-full bg-white shadow-md border border-neutral-200 flex items-center justify-center text-purple-700 hover:bg-neutral-50"><Sparkles className="w-4 h-4" /></button>
${indent}  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-neutral-900 text-white shadow-sm">${label}</span>
${indent}</div>\n`;
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
        const placeholder = node.props.placeholder || "Search...";
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
          : (Array.isArray(node.props.options) ? node.props.options : ["Option 1", "Option 2"]);
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
          : (Array.isArray(node.props.options) ? node.props.options : ["Option 1", "Option 2", "Option 3"]);
        res += `${indent}<div className="space-y-1.5 w-full">
${indent}  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wide">${autoLabel}</label>
${indent}  <input 
${indent}    type="text" 
${indent}    list="list_${autoName}" 
${indent}    placeholder="${node.props.placeholder || "Type to filter..."}" 
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
        const label = node.props.label || "Metric";
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
        else if (tabPanels.length > 0) items = tabPanels.map(p => p.props.title || p.props.label || p.props.value || "Tab");
        else items = ["Tab 1", "Tab 2", "Tab 3"];

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
          headers = ["ID", "Name", "Status", "Actions"];
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
            ["#101", "Auth Gateway Service", "Active", "Configure"],
            ["#102", "Notification Worker", "Active", "Configure"],
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
      </tr>`;
}).join("\n")}
    </tbody>
  </table>
</div>\n`;
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
  <div className="h-full bg-purple-700 rounded-full" style={{ width: '${val}%' }} />
</div>\n`;
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
  <summary className="px-4 py-3.5 flex items-center justify-between gap-3 text-sm font-semibold text-neutral-800 cursor-pointer list-none select-none hover:bg-neutral-50">
    <span className="flex items-center gap-2.5">
${icon ? `      <i data-lucide="${icon}" className="w-4 h-4 text-purple-700" />\n` : ""}      ${title}
    </span>
    <span className="text-neutral-400 group-open:rotate-180 transition-transform">▼</span>
  </summary>
  <div className="px-4 py-3.5 border-t border-neutral-100 space-y-3">
${renderNodesToReact(node.children, indentLevel + 2)}  </div>
</details>\n`;
        break;
      }

      case "fab": {
        const label = node.props.label || "";
        const icon = sanitizeIconName(node.props.icon || "plus");
        const isExt = node.props.extended !== undefined ? node.props.extended === true || node.props.extended === "true" : Boolean(label);
        const goto = node.props.goto;
        res += `${indent}<div className="flex justify-end w-full py-1">
  <button 
    type="button" 
${goto ? `    onClick={() => handleNavigateAction('${goto}')}\n` : ""}    className="${isExt ? "px-5 py-3.5 rounded-3xl gap-2.5" : "w-14 h-14 rounded-3xl"} inline-flex items-center justify-center bg-purple-700 text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
  >
    <i data-lucide="${icon}" className="w-5 h-5" />
${isExt && label ? `    <span>${label}</span>\n` : ""}  </button>
</div>\n`;
        break;
      }

      case "snackbar": {
        const msg = node.props.message || node.props.value || "Notificación de acción";
        const action = node.props.action;
        const icon = node.props.icon ? sanitizeIconName(node.props.icon) : "info";
        const goto = node.props.goto;
        res += `${indent}<div className="w-full p-4 rounded-xl bg-neutral-900 text-neutral-100 flex items-center justify-between gap-3 text-sm shadow-xl">
  <div className="flex items-center gap-2.5">
    <i data-lucide="${icon}" className="w-4 h-4 text-purple-300 shrink-0" />
    <span className="font-medium">${msg}</span>
  </div>
${action ? `  <button type="button" ${goto ? `onClick={() => handleNavigateAction('${goto}')} ` : ""}className="text-xs font-bold text-purple-300 hover:text-purple-200 uppercase tracking-wider px-2 py-1">${action}</button>\n` : ""}</div>\n`;
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
  return `  ${idx > 0 ? `<span>${sep}</span> ` : ""}<span className="${isLast ? "font-bold text-neutral-800" : "hover:underline cursor-pointer"}">${it}</span>`;
}).join("\n")}
</nav>\n`;
        break;
      }

      case "rating": {
        const ratName = node.props.name || "rating";
        const ratLabel = node.props.label || "";
        const max = Number(node.props.max) || 5;
        const initialVal = Number(node.props.value) || 0;
        const readonly = node.props.readonly === true || node.props.readonly === "true";
        res += `${indent}<div className="space-y-1.5">
${ratLabel ? `  <label className="block text-xs font-semibold uppercase text-neutral-600">${ratLabel}</label>\n` : ""}  <div className="flex items-center gap-1">
${Array.from({ length: max }).map((_, idx) => `    <button type="button" disabled={${readonly}} onClick={() => handleInputChange('${ratName}', ${idx + 1})} className="p-1 text-amber-400 hover:scale-110 transition-transform ${readonly ? "cursor-default" : "cursor-pointer"}">★</button>`).join("\n")}
    <span className="text-xs font-semibold text-neutral-500 ml-2">{(formData['${ratName}'] ?? ${initialVal})} / ${max}</span>
  </div>
</div>\n`;
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
  <div className="flex items-center gap-3">
${icon ? `    <button type="button" ${goto ? `onClick={() => handleNavigateAction('${goto}')} ` : ""}className="p-2 rounded-full hover:bg-neutral-100 transition-colors text-neutral-700">
      <i data-lucide="${icon}" className="w-5 h-5" />
    </button>\n` : ""}    <div>
      <h2 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight">${title}</h2>
${subtitle ? `      <p className="text-xs text-neutral-500">${subtitle}</p>\n` : ""}    </div>
  </div>
  <div className="flex items-center gap-2">
${node.children.length > 0 ? renderNodesToReact(node.children, indentLevel + 2) : ""}${action ? `    <button type="button" className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-purple-700 text-white shadow-xs uppercase tracking-wider">${action}</button>\n` : ""}  </div>
</div>\n`;
        break;
      }

      case "bottomnav":
      case "bottombar":
      case "navigationbar": {
        res += `${indent}<nav className="w-full rounded-2xl md:rounded-3xl border border-neutral-200 bg-white p-2 flex items-center justify-around gap-1 shadow-sm">
${node.children.length > 0 ? renderNodesToReact(node.children, indentLevel + 1) : `  <button className="flex-1 py-1.5 px-2 flex flex-col items-center gap-1 text-purple-700 font-bold text-xs"><i data-lucide="home" className="w-4 h-4" /><span>Inicio</span></button>\n  <button className="flex-1 py-1.5 px-2 flex flex-col items-center gap-1 text-neutral-500 text-xs"><i data-lucide="search" className="w-4 h-4" /><span>Buscar</span></button>\n  <button className="flex-1 py-1.5 px-2 flex flex-col items-center gap-1 text-neutral-500 text-xs"><i data-lucide="user" className="w-4 h-4" /><span>Perfil</span></button>\n`}</nav>\n`;
        break;
      }

      case "navitem": {
        const label = node.props.label || node.props.title || node.props.value || "Item";
        const icon = node.props.icon ? sanitizeIconName(node.props.icon) : "circle";
        const isActive = node.props.active === true || node.props.active === "true";
        const goto = node.props.goto;

        res += `${indent}<button type="button" ${goto ? `onClick={() => handleNavigateAction('${goto}')} ` : ""}className="flex-1 py-1.5 px-2 flex flex-col items-center justify-center gap-1 rounded-xl transition-all ${isActive ? "text-purple-700 font-bold" : "text-neutral-500 hover:text-neutral-900"}">
  <div className="px-4 py-1 rounded-full ${isActive ? "bg-purple-100 text-purple-800" : ""}">
    <i data-lucide="${icon}" className="w-4 h-4" />
  </div>
  <span className="text-xs truncate">${label}</span>
</button>\n`;
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
  <div className="w-8 h-8 rounded-full border-4 border-purple-200 border-t-purple-700 animate-spin" />
${msg ? `  <span className="text-xs font-semibold text-neutral-600">${msg}</span>\n` : ""}</div>\n`;
        break;
      }

      case "wavyprogress":
      case "wavy-progress":
      case "progressindicator":
      case "progress-indicator": {
        const val = node.props.value !== undefined ? Math.min(100, Math.max(0, Number(node.props.value))) : null;
        const msg = node.props.message || node.props.label || "";
        res += `${indent}<div className="w-full space-y-1.5 p-2 bg-purple-50/50 rounded-2xl border border-purple-100">
  ${msg ? `<div className="flex justify-between text-xs font-semibold text-purple-950"><span>${msg}</span>${val !== null ? `<span>${val}%</span>` : ""}</div>` : ""}
  <div className="h-2.5 rounded-full overflow-hidden bg-purple-100">
    <div className="h-full bg-purple-700 rounded-full transition-all duration-500" style={{ width: '${val ?? 100}%' }} />
  </div>
</div>\n`;
        break;
      }

      case "navigationrail":
      case "apprail":
      case "navrail":
      case "rail": {
        const title = node.props.title || "";
        res += `${indent}<aside className="w-20 border-r border-neutral-200 bg-white p-3 flex flex-col items-center gap-4 rounded-2xl">
${title ? `  <span className="text-[10px] font-bold uppercase text-purple-700">${title}</span>\n` : ""}${node.children.length > 0 ? renderNodesToReact(node.children, indentLevel + 1) : ""}</aside>\n`;
        break;
      }

      case "drawer":
      case "navigationdrawer":
      case "appdrawer":
      case "navdrawer": {
        const title = node.props.title || "Navigation";
        res += `${indent}<nav className="w-72 rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm space-y-2">
  <h3 className="text-sm font-bold text-neutral-900 px-3 py-2">${title}</h3>
${node.children.length > 0 ? renderNodesToReact(node.children, indentLevel + 1) : ""}</nav>\n`;
        break;
      }

      case "draweritem": {
        const label = node.props.label || "Item";
        const icon = node.props.icon ? sanitizeIconName(node.props.icon) : "circle";
        const isActive = node.props.active === true || node.props.active === "true";
        res += `${indent}<button className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-semibold ${isActive ? "bg-purple-100 text-purple-900" : "text-neutral-600 hover:bg-neutral-50"}">
  <i data-lucide="${icon}" className="w-4 h-4" />
  <span>${label}</span>
</button>\n`;
        break;
      }

      case "sidesheet":
      case "side-sheet": {
        const title = node.props.title || "Details";
        res += `${indent}<aside className="w-80 rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm space-y-4">
  <h3 className="text-sm font-bold text-neutral-900 border-b pb-2">${title}</h3>
${node.children.length > 0 ? renderNodesToReact(node.children, indentLevel + 1) : ""}</aside>\n`;
        break;
      }

      case "bottomsheet": {
        const title = node.props.title || "";
        res += `${indent}<div className="w-full rounded-t-3xl border border-neutral-200 bg-white p-5 shadow-lg space-y-4">
  <div className="w-12 h-1 rounded-full bg-neutral-300 mx-auto" />
${title ? `  <h3 className="text-base font-bold text-neutral-900">${title}</h3>\n` : ""}${node.children.length > 0 ? renderNodesToReact(node.children, indentLevel + 1) : ""}</div>\n`;
        break;
      }

      case "tooltip":
      case "richtooltip":
      case "rich-tooltip": {
        const text = node.props.text || node.props.message || node.props.value || "Information";
        res += `${indent}<div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 border text-xs text-neutral-700">
  <span>${text}</span>
</div>\n`;
        break;
      }

      case "carousel": {
        res += `${indent}<div className="w-full rounded-3xl border border-neutral-200 bg-white p-4 space-y-3">
${node.children.length > 0 ? renderNodesToReact(node.children, indentLevel + 1) : ""}</div>\n`;
        break;
      }

      case "iconbutton":
      case "icon-button": {
        const icon = node.props.icon || "star";
        res += `${indent}<button className="p-2.5 rounded-full hover:bg-neutral-100 transition-all text-neutral-700">
  <i data-lucide="${sanitizeIconName(icon)}" className="w-5 h-5" />
</button>\n`;
        break;
      }

      case "timepicker":
      case "time-picker": {
        const name = node.props.name || "time";
        const label = node.props.label || name;
        res += `${indent}<div className="space-y-1.5">
  <label className="text-xs font-semibold text-neutral-600 uppercase">${label}</label>
  <input type="time" className="px-4 py-2 rounded-2xl border border-neutral-300 bg-white font-bold" />
</div>\n`;
        break;
      }

      case "menu":
      case "dropdown":
      case "dropdownmenu": {
        const label = node.props.label || "Options";
        res += `${indent}<div className="relative inline-block">
  <button className="px-3.5 py-2 rounded-2xl border bg-white text-xs font-semibold flex items-center gap-2">${label}</button>
${node.children.length > 0 ? `  <div className="mt-1 rounded-2xl border bg-white p-1 shadow-lg">\n${renderNodesToReact(node.children, indentLevel + 2)}  </div>\n` : ""}</div>\n`;
        break;
      }

      case "menuitem": {
        const label = node.props.label || "Action";
        res += `${indent}<button className="w-full px-3 py-2 rounded-xl text-xs font-semibold hover:bg-neutral-100 text-left">${label}</button>\n`;
        break;
      }

      case "section": {
        const title = node.props.title || "Section";
        res += `${indent}<div className="pt-3 pb-1 text-[10px] font-bold uppercase text-purple-700 tracking-wider">${title}</div>\n`;
        break;
      }

      case "list": {
        res += `${indent}<div className="w-full rounded-2xl border border-neutral-200 divide-y divide-neutral-100 bg-white overflow-hidden">
${node.children.length > 0 ? renderNodesToReact(node.children, indentLevel + 1) : ""}</div>\n`;
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
