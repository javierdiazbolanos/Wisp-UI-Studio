import { WispDocument, ScreenNode, WispNode } from "./types";
import { generateM3Scheme, M3ColorScheme, M3SchemeVariant } from "../theme/material3";

export interface ExportHTMLOptions {
  isDark?: boolean;
  seedHex?: string;
  schemeVariant?: M3SchemeVariant;
  contrastLevel?: number;
  lightScheme?: M3ColorScheme;
  darkScheme?: M3ColorScheme;
}

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
 * Converts a lucide icon name to kebab-case.
 */
function sanitizeIconName(iconName: string): string {
  if (!iconName) return "star";
  return iconName
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

/**
 * Recursively converts AST nodes into semantic HTML elements styled with Material 3 + Dynamic CSS Tokens.
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
        let cls = "text-base leading-relaxed m3-text-body";
        let inlineStyle = "color: var(--md-sys-color-on-surface);";

        if (variant === "display") {
          tag = "h1";
          cls = "text-3xl md:text-4xl font-extrabold tracking-tight font-sans";
          inlineStyle = "color: var(--md-sys-color-on-surface);";
        } else if (variant === "headline") {
          tag = "h2";
          cls = "text-2xl md:text-3xl font-bold tracking-tight font-sans";
          inlineStyle = "color: var(--md-sys-color-on-surface);";
        } else if (variant === "title") {
          tag = "h3";
          cls = "text-lg md:text-xl font-semibold";
          inlineStyle = "color: var(--md-sys-color-on-surface);";
        } else if (variant === "label") {
          tag = "p";
          cls = "text-xs font-semibold uppercase tracking-wider";
          inlineStyle = "color: var(--md-sys-color-on-surface-variant);";
        } else if (variant === "caption") {
          tag = "p";
          cls = "text-xs";
          inlineStyle = "color: var(--md-sys-color-on-surface-variant);";
        }

        if (node.props.color === "primary") {
          inlineStyle = "color: var(--md-sys-color-primary);";
        } else if (node.props.color === "error") {
          inlineStyle = "color: var(--md-sys-color-error);";
        }

        html += `${indent}<${tag} class="${cls}" style="${inlineStyle}">${val}</${tag}>\n`;
        break;
      }

      case "button": {
        const variant = node.props.variant || "filled";
        const label = escapeHtml(node.props.label || "Button");
        const icon = node.props.icon ? sanitizeIconName(node.props.icon) : null;
        const goto = node.props.goto ? `data-goto="${escapeHtml(node.props.goto)}"` : "";
        const disabled = node.props.disabled ? "disabled" : "";

        let cls = "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm transition-all active:scale-96 select-none cursor-pointer shadow-xs";
        let style = "";

        if (variant === "filled") {
          style = "background-color: var(--md-sys-color-primary); color: var(--md-sys-color-on-primary);";
        } else if (variant === "tonal") {
          style = "background-color: var(--md-sys-color-secondary-container); color: var(--md-sys-color-on-secondary-container);";
        } else if (variant === "outlined") {
          style = "border: 1px solid var(--md-sys-color-outline); color: var(--md-sys-color-primary); background-color: transparent;";
        } else if (variant === "text") {
          style = "color: var(--md-sys-color-primary); background-color: transparent; box-shadow: none; padding-left: 1rem; padding-right: 1rem;";
        } else if (variant === "elevated") {
          style = "background-color: var(--md-sys-color-surface-container-low); color: var(--md-sys-color-primary); border: 1px solid var(--md-sys-color-outline-variant); box-shadow: 0 1px 3px rgba(0,0,0,0.12);";
        }

        if (disabled) {
          cls += " opacity-50 cursor-not-allowed pointer-events-none";
        }

        html += `${indent}<button type="button" class="${cls}" style="${style}" ${goto} ${disabled}>
${icon ? `${indent}  <i data-lucide="${icon}" class="w-4 h-4 shrink-0"></i>\n` : ""}${indent}  <span>${label}</span>
${indent}</button>\n`;
        break;
      }

      case "splitbutton":
      case "split-button":
      case "split-btn": {
        const label = escapeHtml(node.props.label || "Action");
        const icon = node.props.icon ? sanitizeIconName(node.props.icon) : null;
        const goto = node.props.goto ? `data-goto="${escapeHtml(node.props.goto)}"` : "";
        const menuItems = (node.children || []).filter(c => c.type === "menuitem" || c.type === "button");

        html += `${indent}<div class="relative inline-flex rounded-full shadow-xs overflow-visible select-none" style="background-color: var(--md-sys-color-primary); color: var(--md-sys-color-on-primary);">\n`;
        html += `${indent}  <button type="button" class="px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 rounded-l-full cursor-pointer" ${goto}>\n`;
        if (icon) html += `${indent}    <i data-lucide="${icon}" class="w-4 h-4"></i>\n`;
        html += `${indent}    <span>${label}</span>\n`;
        html += `${indent}  </button>\n`;
        html += `${indent}  <button type="button" onclick="this.nextElementSibling.classList.toggle('hidden')" class="px-3 py-2.5 hover:opacity-90 transition-opacity border-l border-black/15 rounded-r-full cursor-pointer flex items-center justify-center">\n`;
        html += `${indent}    <i data-lucide="chevron-down" class="w-4 h-4"></i>\n`;
        html += `${indent}  </button>\n`;
        html += `${indent}  <div class="hidden absolute right-0 top-full mt-2 w-48 rounded-2xl border p-1.5 shadow-xl z-50" style="background-color: var(--md-sys-color-surface-container-low); border-color: var(--md-sys-color-outline-variant); color: var(--md-sys-color-on-surface);">\n`;
        if (menuItems.length > 0) {
          menuItems.forEach(mi => {
            const miLabel = escapeHtml(mi.props.label || mi.props.title || mi.props.value || "Action");
            const miIcon = mi.props.icon ? sanitizeIconName(mi.props.icon) : null;
            const miGoto = mi.props.goto ? `data-goto="${escapeHtml(mi.props.goto)}"` : "";
            html += `${indent}    <button type="button" ${miGoto} class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-left">\n`;
            if (miIcon) html += `${indent}      <i data-lucide="${miIcon}" class="w-4 h-4"></i>\n`;
            html += `${indent}      <span>${miLabel}</span>\n`;
            html += `${indent}    </button>\n`;
          });
        } else {
          html += `${indent}    <button type="button" class="w-full px-3 py-2 rounded-xl text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left">Option 1</button>\n`;
          html += `${indent}    <button type="button" class="w-full px-3 py-2 rounded-xl text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left">Option 2</button>\n`;
        }
        html += `${indent}  </div>\n`;
        html += `${indent}</div>\n`;
        break;
      }

      case "buttongroup":
      case "button-group":
      case "connectedbuttons":
      case "connected-buttons": {
        const buttons = (node.children || []).filter(c => c.type === "button");
        html += `${indent}<div class="inline-flex rounded-2xl border overflow-hidden divide-x shadow-2xs" style="border-color: var(--md-sys-color-outline); divide-color: var(--md-sys-color-outline-variant);">\n`;
        if (buttons.length > 0) {
          buttons.forEach((btn, bIdx) => {
            const bLabel = escapeHtml(btn.props.label || `Option ${bIdx + 1}`);
            const bIcon = btn.props.icon ? sanitizeIconName(btn.props.icon) : null;
            const bGoto = btn.props.goto ? `data-goto="${escapeHtml(btn.props.goto)}"` : "";
            const isActive = btn.props.active === true || btn.props.active === "true" || bIdx === 0;
            const btnStyle = isActive
              ? "background-color: var(--md-sys-color-secondary-container); color: var(--md-sys-color-on-secondary-container);"
              : "background-color: var(--md-sys-color-surface-container-lowest); color: var(--md-sys-color-on-surface);";
            html += `${indent}  <button type="button" ${bGoto} class="px-4 py-2 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5" style="${btnStyle}">\n`;
            if (bIcon) html += `${indent}    <i data-lucide="${bIcon}" class="w-3.5 h-3.5"></i>\n`;
            html += `${indent}    <span>${bLabel}</span>\n`;
            html += `${indent}  </button>\n`;
          });
        }
        html += `${indent}</div>\n`;
        break;
      }

      case "fabmenu":
      case "fab-menu":
      case "speeddial": {
        const label = escapeHtml(node.props.label || "");
        const icon = sanitizeIconName(node.props.icon || "plus");
        const fabItems = (node.children || []).filter(c => c.type === "fabitem" || c.type === "fab-item" || c.type === "fab" || c.type === "button");

        html += `${indent}<div class="relative inline-flex flex-col items-end gap-2 group select-none">\n`;
        if (fabItems.length > 0) {
          html += `${indent}  <div class="space-y-2 flex flex-col items-end">\n`;
          fabItems.forEach(fi => {
            const fiLabel = escapeHtml(fi.props.label || fi.props.title || fi.props.value || "Action");
            const fiIcon = sanitizeIconName(fi.props.icon || "sparkles");
            const fiGoto = fi.props.goto ? `data-goto="${escapeHtml(fi.props.goto)}"` : "";
            html += `${indent}    <div class="flex items-center gap-2 cursor-pointer" ${fiGoto}>\n`;
            html += `${indent}      <span class="text-xs font-bold px-2.5 py-1 rounded-full shadow-md" style="background-color: var(--md-sys-color-inverse-surface); color: var(--md-sys-color-inverse-on-surface);">${fiLabel}</span>\n`;
            html += `${indent}      <button type="button" class="w-10 h-10 rounded-full shadow-md border flex items-center justify-center hover:scale-105 transition-transform" style="background-color: var(--md-sys-color-surface-container-low); border-color: var(--md-sys-color-outline-variant); color: var(--md-sys-color-primary);">\n`;
            html += `${indent}        <i data-lucide="${fiIcon}" class="w-4 h-4"></i>\n`;
            html += `${indent}      </button>\n`;
            html += `${indent}    </div>\n`;
          });
          html += `${indent}  </div>\n`;
        }
        html += `${indent}  <button type="button" class="inline-flex items-center gap-2 px-5 py-3 rounded-full font-bold text-sm shadow-xl transition-all cursor-pointer" style="background-color: var(--md-sys-color-primary); color: var(--md-sys-color-on-primary);">\n`;
        html += `${indent}    <i data-lucide="${icon}" class="w-5 h-5"></i>\n`;
        if (label) html += `${indent}    <span>${label}</span>\n`;
        html += `${indent}  </button>\n`;
        html += `${indent}</div>\n`;
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
${indent}  <label class="block text-xs font-semibold uppercase tracking-wide" style="color: var(--md-sys-color-on-surface-variant);">${label}${node.props.required ? ' <span class="text-red-500">*</span>' : ""}</label>
${indent}  <div class="relative flex items-center">
${icon ? `${indent}    <div class="absolute left-3.5 pointer-events-none" style="color: var(--md-sys-color-on-surface-variant);"><i data-lucide="${icon}" class="w-4 h-4"></i></div>\n` : ""}${indent}    <input type="${type}" name="${name}" placeholder="${placeholder}" class="w-full px-4 py-2.5 rounded-2xl text-sm transition-all outline-none border focus:ring-2 focus:ring-purple-500/25 ${icon ? "pl-10" : ""}" style="background-color: var(--md-sys-color-surface-container-lowest); color: var(--md-sys-color-on-surface); border-color: var(--md-sys-color-outline);" />
${indent}  </div>
${helper ? `${indent}  <p class="text-[11px]" style="color: var(--md-sys-color-on-surface-variant);">${helper}</p>\n` : ""}${indent}</div>\n`;
        break;
      }

      case "textarea": {
        const name = escapeHtml(node.props.name || "textarea");
        const label = escapeHtml(node.props.label || name);
        const placeholder = escapeHtml(node.props.placeholder || "");
        const rows = Number(node.props.rows) || 3;

        html += `${indent}<div class="space-y-1.5 w-full">
${indent}  <label class="block text-xs font-semibold uppercase tracking-wide" style="color: var(--md-sys-color-on-surface-variant);">${label}</label>
${indent}  <textarea name="${name}" rows="${rows}" placeholder="${placeholder}" class="w-full px-4 py-2.5 rounded-2xl text-sm transition-all outline-none border focus:ring-2 focus:ring-purple-500/25 resize-y" style="background-color: var(--md-sys-color-surface-container-lowest); color: var(--md-sys-color-on-surface); border-color: var(--md-sys-color-outline);"></textarea>
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
${indent}  <label class="block text-xs font-semibold uppercase tracking-wide" style="color: var(--md-sys-color-on-surface-variant);">${label}</label>
${indent}  <div class="relative">
${indent}    <select name="${name}" class="w-full px-4 py-2.5 rounded-2xl text-sm transition-all outline-none border appearance-none cursor-pointer pr-10 focus:ring-2 focus:ring-purple-500/25" style="background-color: var(--md-sys-color-surface-container-lowest); color: var(--md-sys-color-on-surface); border-color: var(--md-sys-color-outline);">
${options.map(opt => `${indent}      <option value="${escapeHtml(opt)}">${escapeHtml(opt)}</option>`).join("\n")}
${indent}    </select>
${indent}    <i data-lucide="chevron-down" class="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style="color: var(--md-sys-color-on-surface-variant);"></i>
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
${indent}  <label class="block text-xs font-semibold uppercase tracking-wide" style="color: var(--md-sys-color-on-surface-variant);">${label}</label>
${indent}  <div class="relative flex items-center">
${indent}    <div class="absolute left-3.5 pointer-events-none" style="color: var(--md-sys-color-on-surface-variant);"><i data-lucide="search" class="w-4 h-4"></i></div>
${indent}    <input type="text" list="list_${name}" name="${name}" placeholder="${escapeHtml(node.props.placeholder || "Type to filter...")}" class="w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm transition-all outline-none border focus:ring-2 focus:ring-purple-500/25" style="background-color: var(--md-sys-color-surface-container-lowest); color: var(--md-sys-color-on-surface); border-color: var(--md-sys-color-outline);" />
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
${indent}  <label class="block text-xs font-semibold uppercase tracking-wide" style="color: var(--md-sys-color-on-surface-variant);">${label}</label>
${indent}  <input type="date" name="${name}" class="w-full px-4 py-2.5 rounded-2xl text-sm transition-all outline-none border cursor-pointer" style="background-color: var(--md-sys-color-surface-container-lowest); color: var(--md-sys-color-on-surface); border-color: var(--md-sys-color-outline);" />
${indent}</div>\n`;
        break;
      }

      case "radio": {
        const name = escapeHtml(node.props.name || node.props.group || "radio");
        const label = escapeHtml(node.props.label || name);
        const val = escapeHtml(node.props.value || label);

        html += `${indent}<label class="flex items-center gap-2.5 py-1.5 cursor-pointer select-none">
${indent}  <input type="radio" name="${name}" value="${val}" ${node.props.checked ? "checked" : ""} class="w-4 h-4" style="accent-color: var(--md-sys-color-primary);" />
${indent}  <span class="text-sm" style="color: var(--md-sys-color-on-surface);">${label}</span>
${indent}</label>\n`;
        break;
      }

      case "segmentedbutton":
      case "segmented-button": {
        const name = escapeHtml(node.props.name || node.id);
        const options: string[] = Array.isArray(node.props.options)
          ? node.props.options
          : ["Option A", "Option B", "Option C"];
        const selected = node.props.selected || options[0];

        html += `${indent}<div class="inline-flex p-1 rounded-full border overflow-hidden w-auto" data-segmented="${name}" style="background-color: var(--md-sys-color-surface-container); border-color: var(--md-sys-color-outline-variant);">
${options
  .map(
    (opt, idx) => `  <button type="button" class="px-4 py-1.5 text-xs font-medium rounded-full transition-all flex items-center gap-1.5 cursor-pointer" style="${
      opt === selected
        ? "background-color: var(--md-sys-color-secondary-container); color: var(--md-sys-color-on-secondary-container); font-weight: 600;"
        : "color: var(--md-sys-color-on-surface-variant);"
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
        const chipStyle = isSelected
          ? "background-color: var(--md-sys-color-secondary-container); color: var(--md-sys-color-on-secondary-container); border: 1px solid var(--md-sys-color-primary);"
          : "background-color: var(--md-sys-color-surface-container-low); color: var(--md-sys-color-on-surface-variant); border: 1px solid var(--md-sys-color-outline-variant);";

        html += `${indent}<button type="button" class="chip-item inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer select-none" style="${chipStyle}" onclick="toggleChip(this)">
${icon ? `${indent}  <i data-lucide="${icon}" class="w-3.5 h-3.5"></i>\n` : ""}${indent}  <span>${label}</span>
${indent}</button>\n`;
        break;
      }

      case "switch": {
        const name = escapeHtml(node.props.name || node.id);
        const label = escapeHtml(node.props.label || name);
        const isChecked = node.props.checked === true;

        html += `${indent}<label class="flex items-center justify-between py-1.5 cursor-pointer select-none w-full">
${indent}  <span class="text-sm font-medium" style="color: var(--md-sys-color-on-surface);">${label}</span>
${indent}  <input type="checkbox" name="${name}" ${isChecked ? "checked" : ""} class="w-5 h-5 cursor-pointer rounded" style="accent-color: var(--md-sys-color-primary);" />
${indent}</label>\n`;
        break;
      }

      case "checkbox": {
        const name = escapeHtml(node.props.name || node.id);
        const label = escapeHtml(node.props.label || name);
        const isChecked = node.props.checked === true;

        html += `${indent}<label class="flex items-start gap-2.5 py-1.5 cursor-pointer select-none">
${indent}  <input type="checkbox" name="${name}" ${isChecked ? "checked" : ""} class="w-4 h-4 mt-0.5 rounded cursor-pointer" style="accent-color: var(--md-sys-color-primary);" />
${indent}  <span class="text-sm leading-snug" style="color: var(--md-sys-color-on-surface);">${label}</span>
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
${indent}    <label class="text-xs font-semibold uppercase" style="color: var(--md-sys-color-on-surface-variant);">${label}</label>
${indent}    <span class="text-xs font-bold px-2 py-0.5 rounded-full slider-val" style="background-color: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container);">${val}</span>
${indent}  </div>
${indent}  <input type="range" name="${name}" min="${min}" max="${max}" value="${val}" class="w-full cursor-pointer h-2 rounded-lg" style="accent-color: var(--md-sys-color-primary); background-color: var(--md-sys-color-surface-container-highest);" oninput="this.parentElement.querySelector('.slider-val').textContent = this.value" />
${indent}</div>\n`;
        break;
      }

      case "card": {
        const variant = node.props.variant || "elevated";
        let cardStyle = "background-color: var(--md-sys-color-surface-container-lowest); color: var(--md-sys-color-on-surface); border: 1px solid var(--md-sys-color-outline-variant);";
        let cardCls = "rounded-3xl p-5 md:p-6 transition-all space-y-4";

        if (variant === "elevated") {
          cardStyle = "background-color: var(--md-sys-color-surface-container-low); color: var(--md-sys-color-on-surface); border: 1px solid var(--md-sys-color-outline-variant); box-shadow: 0 1px 3px rgba(0,0,0,0.08);";
        } else if (variant === "filled") {
          cardStyle = "background-color: var(--md-sys-color-surface-container-highest); color: var(--md-sys-color-on-surface); border: none;";
        } else if (variant === "outlined") {
          cardStyle = "background-color: var(--md-sys-color-surface); color: var(--md-sys-color-on-surface); border: 1px solid var(--md-sys-color-outline);";
        }

        html += `${indent}<div class="${cardCls}" style="${cardStyle}">\n`;
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

      case "sidebar": {
        const width = node.props.width || 280;
        const widthStyle = typeof width === "number" ? `${width}px` : width;
        html += `${indent}<div class="rounded-3xl p-4 border space-y-3 shrink-0" style="width: ${widthStyle}; background-color: var(--md-sys-color-surface-container-low); border-color: var(--md-sys-color-outline-variant); color: var(--md-sys-color-on-surface);">\n`;
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

        html += `${indent}<div class="flex items-center justify-between p-3.5 rounded-2xl transition-all border border-transparent hover:border-black/10 dark:hover:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer" style="color: var(--md-sys-color-on-surface);" ${goto}>
${indent}  <div class="flex items-center gap-3.5">
${icon ? `${indent}    <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style="background-color: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container);"><i data-lucide="${icon}" class="w-5 h-5"></i></div>\n` : ""}${indent}    <div>
${indent}      <p class="text-sm font-semibold" style="color: var(--md-sys-color-on-surface);">${label}</p>
${subtitle ? `${indent}      <p class="text-xs mt-0.5" style="color: var(--md-sys-color-on-surface-variant);">${subtitle}</p>\n` : ""}${indent}    </div>
${indent}  </div>
${indent}  <div class="flex items-center gap-2">
${badge ? `${indent}    <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full" style="background-color: var(--md-sys-color-secondary-container); color: var(--md-sys-color-on-secondary-container);">${badge}</span>\n` : ""}${indent}    <i data-lucide="chevron-right" class="w-4 h-4" style="color: var(--md-sys-color-on-surface-variant);"></i>
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

        html += `${indent}<div class="w-10 h-10 rounded-full font-bold text-sm flex items-center justify-center shadow-xs select-none shrink-0" style="background-color: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container);">${initials}</div>\n`;
        break;
      }

      case "badge": {
        const text = escapeHtml(node.props.text || node.props.value || "New");
        html += `${indent}<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider" style="background-color: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container);">${text}</span>\n`;
        break;
      }

      case "icon": {
        const iconName = sanitizeIconName(node.props.name || "star");
        html += `${indent}<div class="inline-flex items-center justify-center" style="color: var(--md-sys-color-primary);"><i data-lucide="${iconName}" class="w-6 h-6"></i></div>\n`;
        break;
      }

      case "image": {
        const src = escapeHtml(node.props.src || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80");
        html += `${indent}<img src="${src}" alt="Preview" class="w-full h-48 object-cover rounded-2xl shadow-xs border" style="border-color: var(--md-sys-color-outline-variant);" />\n`;
        break;
      }

      case "progress": {
        const val = Math.min(100, Math.max(0, Number(node.props.value) || 50));
        html += `${indent}<div class="w-full space-y-1">
${indent}  <div class="h-2 rounded-full overflow-hidden w-full" style="background-color: var(--md-sys-color-surface-container-highest);">
${indent}    <div class="h-full rounded-full transition-all duration-300" style="width: ${val}%; background-color: var(--md-sys-color-primary);"></div>
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

        html += `${indent}<div class="p-5 rounded-3xl border space-y-2 transition-all" style="background-color: var(--md-sys-color-surface-container-lowest); color: var(--md-sys-color-on-surface); border-color: var(--md-sys-color-outline-variant);">
${indent}  <div class="flex items-center justify-between">
${indent}    <span class="text-xs font-semibold uppercase tracking-wider" style="color: var(--md-sys-color-on-surface-variant);">${label}</span>
${icon ? `${indent}    <div class="w-8 h-8 rounded-xl flex items-center justify-center" style="background-color: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container);"><i data-lucide="${icon}" class="w-4 h-4"></i></div>\n` : ""}${indent}  </div>
${indent}  <p class="text-2xl md:text-3xl font-extrabold" style="color: var(--md-sys-color-on-surface);">${val}</p>
${delta ? `${indent}  <span class="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${delta.startsWith("+") ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300" : "bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300"}">${delta}</span>\n` : ""}${indent}</div>\n`;
        break;
      }

      case "alert": {
        const title = node.props.title ? escapeHtml(node.props.title) : null;
        const msg = escapeHtml(node.props.value || "");
        const type = node.props.type || "info";

        let alertStyle = "background-color: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container); border: 1px solid var(--md-sys-color-outline-variant);";
        let iconName = "info";

        if (type === "success") {
          alertStyle = "background-color: rgba(16, 185, 129, 0.15); color: #065F46; border: 1px solid rgba(16, 185, 129, 0.3);";
          iconName = "check-circle-2";
        } else if (type === "warning") {
          alertStyle = "background-color: rgba(245, 158, 11, 0.15); color: #92400E; border: 1px solid rgba(245, 158, 11, 0.3);";
          iconName = "alert-triangle";
        } else if (type === "error") {
          alertStyle = "background-color: var(--md-sys-color-error-container); color: var(--md-sys-color-on-error-container); border: 1px solid var(--md-sys-color-error);";
          iconName = "alert-circle";
        }

        html += `${indent}<div class="p-4 rounded-2xl flex items-start gap-3 shadow-2xs" style="${alertStyle}">
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
${indent}  <div class="border-b" style="border-color: var(--md-sys-color-outline-variant);">
${indent}    <div class="flex gap-2">
${items
  .map(
    (tab, idx) => `${indent}      <button type="button" class="tab-btn px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer border-b-2" style="${
      idx === 0 ? "border-color: var(--md-sys-color-primary); color: var(--md-sys-color-primary); font-weight: bold;" : "border-color: transparent; color: var(--md-sys-color-on-surface-variant);"
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
            ["#103", "Data Pipeline", "Active", "Manage"],
          ];
        }

        const title = node.props.title || node.props.label;
        html += `${indent}<div class="overflow-x-auto rounded-2xl border shadow-2xs" style="background-color: var(--md-sys-color-surface-container-lowest); color: var(--md-sys-color-on-surface); border-color: var(--md-sys-color-outline-variant);">
${title ? `${indent}  <div class="p-4 border-b font-bold" style="border-color: var(--md-sys-color-outline-variant); color: var(--md-sys-color-on-surface);">${escapeHtml(title)}</div>\n` : ""}${indent}  <table class="w-full text-left text-sm">
${indent}    <thead style="background-color: var(--md-sys-color-surface-container); color: var(--md-sys-color-on-surface-variant);">
${indent}      <tr>
${headers.map(h => `${indent}        <th class="p-3 font-semibold text-xs uppercase tracking-wider">${escapeHtml(h)}</th>`).join("\n")}
${indent}      </tr>
${indent}    </thead>
${indent}    <tbody class="divide-y" style="divide-color: var(--md-sys-color-outline-variant);">
${rows
  .map(
    row => `${indent}      <tr class="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
${headers
  .map((_, cIdx) => {
    const cell = row[cIdx] !== undefined ? String(row[cIdx]) : "";
    const isStatus = ["activo", "active", "completado", "completed", "success", "ok"].includes(cell.toLowerCase());
    return `${indent}        <td class="p-3" style="color: var(--md-sys-color-on-surface);">${
      isStatus
        ? `<span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">${escapeHtml(
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
        html += `${indent}<hr class="my-2" style="border-color: var(--md-sys-color-outline-variant);" />\n`;
        break;

      case "accordion": {
        const title = escapeHtml(node.props.title || node.props.label || node.props.value || "Sección");
        const isExp = node.props.expanded === true || node.props.expanded === "true";
        const icon = node.props.icon ? sanitizeIconName(node.props.icon) : null;
        html += `${indent}<details class="group rounded-2xl border overflow-hidden shadow-2xs w-full" style="background-color: var(--md-sys-color-surface-container-lowest); color: var(--md-sys-color-on-surface); border-color: var(--md-sys-color-outline-variant);"${isExp ? " open" : ""}>\n`;
        html += `${indent}  <summary class="px-4 py-3.5 flex items-center justify-between gap-3 text-sm font-semibold cursor-pointer list-none select-none hover:bg-black/5 dark:hover:bg-white/5">\n`;
        html += `${indent}    <span class="flex items-center gap-2.5">\n`;
        if (icon) html += `${indent}      <i data-lucide="${icon}" class="w-4 h-4" style="color: var(--md-sys-color-primary);"></i>\n`;
        html += `${indent}      ${title}\n`;
        html += `${indent}    </span>\n`;
        html += `${indent}    <i data-lucide="chevron-down" class="w-4 h-4 group-open:rotate-180 transition-transform" style="color: var(--md-sys-color-on-surface-variant);"></i>\n`;
        html += `${indent}  </summary>\n`;
        html += `${indent}  <div class="px-4 py-3.5 border-t space-y-3" style="border-color: var(--md-sys-color-outline-variant);">\n`;
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
        html += `${indent}  <button type="button" ${goto} class="${isExt ? "px-5 py-3.5 rounded-3xl gap-2.5" : "w-14 h-14 rounded-3xl"} inline-flex items-center justify-center font-semibold text-sm shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer" style="background-color: var(--md-sys-color-primary); color: var(--md-sys-color-on-primary);">\n`;
        html += `${indent}    <i data-lucide="${icon}" class="w-5 h-5"></i>\n`;
        if (isExt && label) html += `${indent}    <span>${label}</span>\n`;
        html += `${indent}  </button>\n`;
        html += `${indent}</div>\n`;
        break;
      }

      case "snackbar": {
        const msg = escapeHtml(node.props.message || node.props.value || "Notificación");
        const action = node.props.action ? escapeHtml(node.props.action) : null;
        const icon = sanitizeIconName(node.props.icon || "info");
        const goto = node.props.goto ? `data-goto="${escapeHtml(node.props.goto)}"` : "";
        html += `${indent}<div class="w-full p-4 rounded-xl flex items-center justify-between gap-3 text-sm shadow-xl" style="background-color: var(--md-sys-color-inverse-surface); color: var(--md-sys-color-inverse-on-surface);">\n`;
        html += `${indent}  <div class="flex items-center gap-2.5">\n`;
        html += `${indent}    <i data-lucide="${icon}" class="w-4 h-4 shrink-0" style="color: var(--md-sys-color-inverse-primary);"></i>\n`;
        html += `${indent}    <span class="font-medium">${msg}</span>\n`;
        html += `${indent}  </div>\n`;
        if (action) {
          html += `${indent}  <button type="button" ${goto} class="text-xs font-bold uppercase tracking-wider px-2 py-1 cursor-pointer" style="color: var(--md-sys-color-inverse-primary);">${action}</button>\n`;
        }
        html += `${indent}</div>\n`;
        break;
      }

      case "breadcrumbs": {
        const items = Array.isArray(node.props.items)
          ? node.props.items
          : (typeof node.props.items === "string" ? node.props.items.split(",").map((s: string) => s.trim()) : ["Inicio", "Sección", "Detalle"]);
        const sep = node.props.separator === "slash" ? "/" : ">";
        html += `${indent}<nav class="flex items-center gap-2 text-xs md:text-sm py-1" style="color: var(--md-sys-color-on-surface-variant);">\n`;
        items.forEach((it: string, idx: number) => {
          const isLast = idx === items.length - 1;
          html += `${indent}  ${idx > 0 ? `<span>${sep}</span> ` : ""}<span class="${isLast ? "font-bold" : "hover:underline cursor-pointer"}" style="${isLast ? "color: var(--md-sys-color-on-surface);" : ""}">${escapeHtml(it)}</span>\n`;
        });
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

        html += `${indent}<header class="w-full rounded-2xl border px-4 py-3 flex items-center justify-between gap-3 shadow-2xs" style="background-color: var(--md-sys-color-surface-container-low); color: var(--md-sys-color-on-surface); border-color: var(--md-sys-color-outline-variant);">\n`;
        html += `${indent}  <div class="flex items-center gap-3">\n`;
        html += `${indent}    <button type="button" ${goto} class="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer" style="color: var(--md-sys-color-on-surface);"><i data-lucide="${icon}" class="w-5 h-5"></i></button>\n`;
        if (title) html += `${indent}    <h2 class="text-base font-bold" style="color: var(--md-sys-color-on-surface);">${title}</h2>\n`;
        html += `${indent}  </div>\n`;
        if (action) {
          html += `${indent}  <button type="button" ${actionGoto} class="px-3.5 py-1.5 rounded-full text-xs font-bold cursor-pointer" style="background-color: var(--md-sys-color-primary); color: var(--md-sys-color-on-primary);">${action}</button>\n`;
        }
        html += `${indent}</header>\n`;
        break;
      }

      case "bottomnav":
      case "bottombar":
      case "navigationbar": {
        html += `${indent}<nav class="w-full rounded-2xl border p-2 flex items-center justify-around gap-1 shadow-xs" style="background-color: var(--md-sys-color-surface-container-low); color: var(--md-sys-color-on-surface); border-color: var(--md-sys-color-outline-variant);">\n`;
        if (node.children && node.children.length > 0) {
          html += renderNodesToHTML(node.children, indentLevel + 1);
        }
        html += `${indent}</nav>\n`;
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
 * Exports AST to a complete, standalone, interactive single-file HTML document powered by Google Material 3 Expressive tokens.
 */
export function exportToHTML(doc: WispDocument, options?: ExportHTMLOptions): string {
  const firstScreen = doc.screens[0]?.name || "Main";
  const isInitialDark = options?.isDark ?? false;
  const seedHex = options?.seedHex || "#6750A4";
  const schemeVariant = options?.schemeVariant || "tonal_spot";
  const contrastLevel = options?.contrastLevel ?? 0.0;

  const lightScheme = options?.lightScheme || generateM3Scheme(seedHex, false, schemeVariant, contrastLevel);
  const darkScheme = options?.darkScheme || generateM3Scheme(seedHex, true, schemeVariant, contrastLevel);

  const standardScreens = doc.screens.filter(
    s => s.type !== "dialog" && s.type !== "modal" && s.type !== "sheet"
  );
  const modalScreens = doc.screens.filter(
    s => s.type === "dialog" || s.type === "modal" || s.type === "sheet"
  );

  return `<!DOCTYPE html>
<html lang="en" class="h-full ${isInitialDark ? "dark" : ""}">
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

  <!-- Material Design 3 Expressive Dynamic Tokens Engine -->
  <style>
    :root {
      --md-sys-color-primary: ${lightScheme.primary};
      --md-sys-color-on-primary: ${lightScheme.onPrimary};
      --md-sys-color-primary-container: ${lightScheme.primaryContainer};
      --md-sys-color-on-primary-container: ${lightScheme.onPrimaryContainer};
      --md-sys-color-secondary: ${lightScheme.secondary};
      --md-sys-color-on-secondary: ${lightScheme.onSecondary};
      --md-sys-color-secondary-container: ${lightScheme.secondaryContainer};
      --md-sys-color-on-secondary-container: ${lightScheme.onSecondaryContainer};
      --md-sys-color-tertiary: ${lightScheme.tertiary};
      --md-sys-color-on-tertiary: ${lightScheme.onTertiary};
      --md-sys-color-tertiary-container: ${lightScheme.tertiaryContainer};
      --md-sys-color-on-tertiary-container: ${lightScheme.onTertiaryContainer};
      --md-sys-color-error: ${lightScheme.error};
      --md-sys-color-on-error: ${lightScheme.onError};
      --md-sys-color-error-container: ${lightScheme.errorContainer};
      --md-sys-color-on-error-container: ${lightScheme.onErrorContainer};
      --md-sys-color-background: ${lightScheme.background};
      --md-sys-color-on-background: ${lightScheme.onBackground};
      --md-sys-color-surface: ${lightScheme.surface};
      --md-sys-color-surface-dim: ${lightScheme.surfaceDim};
      --md-sys-color-surface-bright: ${lightScheme.surfaceBright};
      --md-sys-color-surface-container-lowest: ${lightScheme.surfaceContainerLowest};
      --md-sys-color-surface-container-low: ${lightScheme.surfaceContainerLow};
      --md-sys-color-surface-container: ${lightScheme.surfaceContainer};
      --md-sys-color-surface-container-high: ${lightScheme.surfaceContainerHigh};
      --md-sys-color-surface-container-highest: ${lightScheme.surfaceContainerHighest};
      --md-sys-color-on-surface: ${lightScheme.onSurface};
      --md-sys-color-on-surface-variant: ${lightScheme.onSurfaceVariant};
      --md-sys-color-outline: ${lightScheme.outline};
      --md-sys-color-outline-variant: ${lightScheme.outlineVariant};
      --md-sys-color-inverse-surface: ${lightScheme.inverseSurface};
      --md-sys-color-inverse-on-surface: ${lightScheme.inverseOnSurface};
      --md-sys-color-inverse-primary: ${lightScheme.inversePrimary};
    }

    html.dark, .dark {
      --md-sys-color-primary: ${darkScheme.primary};
      --md-sys-color-on-primary: ${darkScheme.onPrimary};
      --md-sys-color-primary-container: ${darkScheme.primaryContainer};
      --md-sys-color-on-primary-container: ${darkScheme.onPrimaryContainer};
      --md-sys-color-secondary: ${darkScheme.secondary};
      --md-sys-color-on-secondary: ${darkScheme.onSecondary};
      --md-sys-color-secondary-container: ${darkScheme.secondaryContainer};
      --md-sys-color-on-secondary-container: ${darkScheme.onSecondaryContainer};
      --md-sys-color-tertiary: ${darkScheme.tertiary};
      --md-sys-color-on-tertiary: ${darkScheme.onTertiary};
      --md-sys-color-tertiary-container: ${darkScheme.tertiaryContainer};
      --md-sys-color-on-tertiary-container: ${darkScheme.onTertiaryContainer};
      --md-sys-color-error: ${darkScheme.error};
      --md-sys-color-on-error: ${darkScheme.onError};
      --md-sys-color-error-container: ${darkScheme.errorContainer};
      --md-sys-color-on-error-container: ${darkScheme.onErrorContainer};
      --md-sys-color-background: ${darkScheme.background};
      --md-sys-color-on-background: ${darkScheme.onBackground};
      --md-sys-color-surface: ${darkScheme.surface};
      --md-sys-color-surface-dim: ${darkScheme.surfaceDim};
      --md-sys-color-surface-bright: ${darkScheme.surfaceBright};
      --md-sys-color-surface-container-lowest: ${darkScheme.surfaceContainerLowest};
      --md-sys-color-surface-container-low: ${darkScheme.surfaceContainerLow};
      --md-sys-color-surface-container: ${darkScheme.surfaceContainer};
      --md-sys-color-surface-container-high: ${darkScheme.surfaceContainerHigh};
      --md-sys-color-surface-container-highest: ${darkScheme.surfaceContainerHighest};
      --md-sys-color-on-surface: ${darkScheme.onSurface};
      --md-sys-color-on-surface-variant: ${darkScheme.onSurfaceVariant};
      --md-sys-color-outline: ${darkScheme.outline};
      --md-sys-color-outline-variant: ${darkScheme.outlineVariant};
      --md-sys-color-inverse-surface: ${darkScheme.inverseSurface};
      --md-sys-color-inverse-on-surface: ${darkScheme.inverseOnSurface};
      --md-sys-color-inverse-primary: ${darkScheme.inversePrimary};
    }

    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background-color: var(--md-sys-color-background);
      color: var(--md-sys-color-on-background);
      transition: background-color 0.25s cubic-bezier(0.2, 0, 0, 1), color 0.25s cubic-bezier(0.2, 0, 0, 1);
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
    button, input[type="button"], select, a {
      transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
    }
    button:active {
      transform: scale(0.96);
    }

    @keyframes m3-ripple-expand {
      0% { transform: scale(0); opacity: 0.35; }
      60% { opacity: 0.22; }
      100% { transform: scale(2.8); opacity: 0; }
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
<body class="min-h-full p-4 md:p-8">
  <div class="max-w-5xl mx-auto space-y-6">
    <!-- Top Bar / App Navigation -->
    <header class="p-4 md:px-6 md:py-4 rounded-3xl border shadow-xs flex items-center justify-between gap-4" style="background-color: var(--md-sys-color-surface-container-low); border-color: var(--md-sys-color-outline-variant);">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-2xl flex items-center justify-center font-extrabold shadow-xs" style="background-color: var(--md-sys-color-primary); color: var(--md-sys-color-on-primary);">
          W
        </div>
        <div>
          <h1 class="text-base font-bold leading-tight" style="color: var(--md-sys-color-on-surface);">Wisp Prototype</h1>
          <p class="text-[11px] font-medium" style="color: var(--md-sys-color-primary);">Material 3 Expressive UI</p>
        </div>
      </div>

      <!-- Screen Jump Navigator & Dark Mode -->
      <div class="flex items-center gap-2">
        <div class="relative">
          <select id="screen-selector" onchange="navigateToScreen(this.value)" class="text-xs font-semibold px-3 py-2 rounded-xl border outline-none cursor-pointer pr-8 appearance-none" style="background-color: var(--md-sys-color-surface-container-high); color: var(--md-sys-color-on-surface); border-color: var(--md-sys-color-outline-variant);">
            ${doc.screens
              .map(
                s =>
                  `<option value="${escapeHtml(s.name)}">@${escapeHtml(s.name)} (${s.type})</option>`
              )
              .join("\n            ")}
          </select>
          <i data-lucide="chevron-down" class="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style="color: var(--md-sys-color-on-surface-variant);"></i>
        </div>

        <!-- Dark Mode Toggle Button -->
        <button type="button" onclick="toggleDarkMode()" class="p-2 rounded-xl transition-colors cursor-pointer border" style="background-color: var(--md-sys-color-surface-container-high); color: var(--md-sys-color-on-surface); border-color: var(--md-sys-color-outline-variant);" title="Cambiar tema Claro / Oscuro">
          <i data-lucide="moon" id="icon-moon" class="w-4 h-4 ${isInitialDark ? "hidden" : ""}"></i>
          <i data-lucide="sun" id="icon-sun" class="w-4 h-4 ${isInitialDark ? "" : "hidden"}"></i>
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
        <div class="p-6 md:p-8 rounded-3xl border shadow-xs space-y-4" style="background-color: var(--md-sys-color-surface-container-low); border-color: var(--md-sys-color-outline-variant);">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-xs uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full" style="background-color: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container);">
                Wizard • <span class="wizard-step-label">Step 1 of ${totalSteps}</span>
              </span>
              <h2 class="text-2xl font-bold mt-1" style="color: var(--md-sys-color-on-surface);">${escapeHtml(screen.name)}</h2>
            </div>
          </div>

          <div class="flex items-center gap-2" data-wizard-stepper="${escapeHtml(screen.name)}" data-total-steps="${totalSteps}">
            ${Array.from({ length: totalSteps })
              .map(
                (_, idx) => `
            <button type="button" class="w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center transition-all cursor-pointer step-btn" style="${
              idx === 0
                ? "background-color: var(--md-sys-color-primary); color: var(--md-sys-color-on-primary);"
                : "background-color: var(--md-sys-color-surface-container-high); color: var(--md-sys-color-on-surface-variant);"
            }" onclick="goToWizardStep('${escapeHtml(screen.name)}', ${idx + 1})">
              ${idx + 1}
            </button>
            ${
              idx < totalSteps - 1
                ? '<div class="flex-1 h-1 rounded-full step-line" style="background-color: var(--md-sys-color-outline-variant);"></div>'
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
                    (step, stIdx) => `
            <div class="wizard-step ${stIdx === 0 ? "active" : ""} space-y-4" data-step="${stIdx + 1}">
              ${renderNodesToHTML(step.children, 7)}
            </div>`
                  )
                  .join("")
              : `
            <div class="wizard-step active space-y-4" data-step="1">
              ${renderNodesToHTML(screen.children, 7)}
            </div>`
          }
        </div>
      </section>`;
          }

          return `<!-- Screen: @${escapeHtml(screen.name)} -->
      <section id="screen-${escapeHtml(screen.name)}" class="screen-view space-y-6 ${
            screen.name === firstScreen ? "active" : ""
          }">
        ${renderNodesToHTML(screen.children, 4)}
      </section>`;
        })
        .join("\n\n      ")}
    </main>

    <!-- Modal Dialogs / Sheets -->
    <div id="modal-container">
      ${modalScreens
        .map(
          modal => `
      <div id="modal-${escapeHtml(modal.name)}" class="modal-overlay fixed inset-0 z-50 items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <div class="w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-2xl border space-y-4" style="background-color: var(--md-sys-color-surface-container-low); border-color: var(--md-sys-color-outline-variant); color: var(--md-sys-color-on-surface);">
          <div class="flex items-center justify-between pb-3 border-b" style="border-color: var(--md-sys-color-outline-variant);">
            <h3 class="text-lg font-bold" style="color: var(--md-sys-color-on-surface);">${escapeHtml(modal.name)}</h3>
            <button type="button" onclick="closeModal()" class="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer" style="color: var(--md-sys-color-on-surface-variant);">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>
          <div class="space-y-4">
            ${renderNodesToHTML(modal.children, 6)}
          </div>
        </div>
      </div>`
        )
        .join("\n")}
    </div>
  </div>

  <!-- Runtime JavaScript Engine for Interactive Screens & Dark Mode -->
  <script>
    // Initialize Lucide icons
    lucide.createIcons();

    // Screen navigation
    function navigateToScreen(screenName) {
      document.querySelectorAll('.screen-view').forEach(el => {
        el.classList.remove('active');
      });
      const target = document.getElementById('screen-' + screenName);
      if (target) {
        target.classList.add('active');
        const selector = document.getElementById('screen-selector');
        if (selector) selector.value = screenName;
      }
      lucide.createIcons();
    }

    // Modal controls
    function openModal(modalName) {
      const modal = document.getElementById('modal-' + modalName);
      if (modal) {
        modal.classList.add('active');
        lucide.createIcons();
      }
    }

    function closeModal() {
      document.querySelectorAll('.modal-overlay').forEach(el => {
        el.classList.remove('active');
      });
    }

    // Wizard stepper navigation
    function goToWizardStep(screenName, stepNum) {
      const screenEl = document.getElementById('screen-' + screenName);
      if (!screenEl) return;

      const totalSteps = parseInt(screenEl.querySelector('[data-wizard-stepper]')?.dataset.totalSteps || '3', 10);
      const label = screenEl.querySelector('.wizard-step-label');
      if (label) label.textContent = 'Step ' + stepNum + ' of ' + totalSteps;

      const buttons = screenEl.querySelectorAll('.step-btn');
      buttons.forEach((btn, idx) => {
        const s = idx + 1;
        if (s === stepNum) {
          btn.style.backgroundColor = 'var(--md-sys-color-primary)';
          btn.style.color = 'var(--md-sys-color-on-primary)';
          btn.textContent = s;
        } else if (s < stepNum) {
          btn.style.backgroundColor = 'var(--md-sys-color-primary-container)';
          btn.style.color = 'var(--md-sys-color-on-primary-container)';
          btn.textContent = '✓';
        } else {
          btn.style.backgroundColor = 'var(--md-sys-color-surface-container-high)';
          btn.style.color = 'var(--md-sys-color-on-surface-variant)';
          btn.textContent = s;
        }
      });

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

    // Segmented button selection
    function selectSegmented(button) {
      const container = button.closest('[data-segmented]');
      if (!container) return;
      container.querySelectorAll('button').forEach(btn => {
        btn.style.backgroundColor = 'transparent';
        btn.style.color = 'var(--md-sys-color-on-surface-variant)';
        btn.style.fontWeight = 'normal';
      });
      button.style.backgroundColor = 'var(--md-sys-color-secondary-container)';
      button.style.color = 'var(--md-sys-color-on-secondary-container)';
      button.style.fontWeight = '600';
    }

    // Chip toggle
    function toggleChip(chip) {
      const isSelected = chip.classList.toggle('selected');
      if (isSelected) {
        chip.style.backgroundColor = 'var(--md-sys-color-secondary-container)';
        chip.style.color = 'var(--md-sys-color-on-secondary-container)';
        chip.style.borderColor = 'var(--md-sys-color-primary)';
      } else {
        chip.style.backgroundColor = 'var(--md-sys-color-surface-container-low)';
        chip.style.color = 'var(--md-sys-color-on-surface-variant)';
        chip.style.borderColor = 'var(--md-sys-color-outline-variant)';
      }
    }

    // Tab switching
    function switchTab(tabBtn, tabIndex) {
      const container = tabBtn.closest('.tabs-container');
      if (!container) return;
      container.querySelectorAll('.tab-btn').forEach((btn, idx) => {
        if (idx === tabIndex) {
          btn.style.borderColor = 'var(--md-sys-color-primary)';
          btn.style.color = 'var(--md-sys-color-primary)';
          btn.style.fontWeight = 'bold';
        } else {
          btn.style.borderColor = 'transparent';
          btn.style.color = 'var(--md-sys-color-on-surface-variant)';
          btn.style.fontWeight = 'normal';
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

    // Dark Mode Toggle Function
    function toggleDarkMode() {
      const isDark = document.documentElement.classList.toggle('dark');
      const iconMoon = document.getElementById('icon-moon');
      const iconSun = document.getElementById('icon-sun');
      if (iconMoon && iconSun) {
        if (isDark) {
          iconMoon.classList.add('hidden');
          iconSun.classList.remove('hidden');
        } else {
          iconMoon.classList.remove('hidden');
          iconSun.classList.add('hidden');
        }
      }
      lucide.createIcons();
    }

    // Bind data-goto buttons
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('[data-goto]').forEach(btn => {
        btn.addEventListener('click', () => {
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
    });

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
