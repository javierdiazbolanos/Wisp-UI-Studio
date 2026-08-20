import React, { useState, useEffect } from "react";
import {
  WispNode,
  ScreenNode,
  StepNode,
  NavigationAction,
} from "../wisp/types";
import { M3ColorScheme } from "../theme/material3";
import { DynamicIcon } from "../components/DynamicIcon";
import { motion, AnimatePresence } from "motion/react";
import {
  Check,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  X,
  Sparkles,
  Info,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  Layers,
  Search,
  Calendar,
  Star,
  Plus,
  Home,
  MoreVertical,
  Copy,
  Edit,
  Trash2,
  Eye,
  Download,
  User,
  Clock,
  DollarSign,
  CheckSquare,
  Square,
} from "lucide-react";

export interface ActiveToastData {
  id: string;
  message: string;
  action?: string;
  icon?: string;
  type?: string;
  goto?: string;
  duration?: number;
}

interface MaterialRendererProps {
  screen: ScreenNode;
  allScreens: ScreenNode[];
  colorScheme: M3ColorScheme;
  isDark: boolean;
  inspectMode?: boolean;
  selectedNodeId?: string | null;
  onSelectNode?: (node: WispNode) => void;
  onNavigate?: (target: string) => void;
  activeWizardStep?: number;
  onWizardStepChange?: (step: number) => void;
  viewportMode?: "desktop" | "tablet" | "mobile";
  activeToast?: ActiveToastData | null;
  onTriggerToast?: (toast: ActiveToastData | null) => void;
}

export const MaterialRenderer: React.FC<MaterialRendererProps> = ({
  screen,
  allScreens,
  colorScheme,
  isDark,
  inspectMode = false,
  selectedNodeId = null,
  onSelectNode,
  onNavigate,
  activeWizardStep = 1,
  onWizardStepChange,
  viewportMode = "desktop",
  activeToast: parentActiveToast,
  onTriggerToast: parentOnTriggerToast,
}) => {
  const isMobile = viewportMode === "mobile";
  const isTablet = viewportMode === "tablet";
  // Local state for interactive controls inside preview
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [activeTabs, setActiveTabs] = useState<Record<string, number>>({});
  const [selectedChips, setSelectedChips] = useState<Record<string, boolean>>({});
  const [segmentedValues, setSegmentedValues] = useState<Record<string, string>>({});
  const [activeDialog, setActiveDialog] = useState<ScreenNode | null>(null);
  const [expandedAccordions, setExpandedAccordions] = useState<Record<string, boolean>>({});
  const [ratingValues, setRatingValues] = useState<Record<string, number>>({});
  const [ratingHovers, setRatingHovers] = useState<Record<string, number>>({});
  const [dismissedSnackbars, setDismissedSnackbars] = useState<Record<string, boolean>>({});
  const [tableSearches, setTableSearches] = useState<Record<string, string>>({});
  const [tablePages, setTablePages] = useState<Record<string, number>>({});
  const [openTableDropdowns, setOpenTableDropdowns] = useState<Record<string, boolean>>({});
  const [tableSelectedRows, setTableSelectedRows] = useState<Record<string, Record<number, boolean>>>({});

  // Active snackbar / toast triggered from buttons or actions (when not controlled by parent)
  const [localActiveToast, setLocalActiveToast] = useState<ActiveToastData | null>(null);

  const activeToast = parentActiveToast !== undefined ? null : localActiveToast;
  const setActiveToast = (toast: ActiveToastData | null) => {
    if (parentOnTriggerToast) {
      parentOnTriggerToast(toast);
    } else {
      setLocalActiveToast(toast);
    }
  };

  // Auto-dismiss active snackbar after its duration
  useEffect(() => {
    if (activeToast) {
      const timeout = activeToast.duration || 4500;
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, timeout);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  const triggerSnackbar = (buttonProps: Record<string, any>) => {
    let rawMessage =
      buttonProps.snackbar !== undefined
        ? buttonProps.snackbar
        : buttonProps.toast !== undefined
        ? buttonProps.toast
        : buttonProps["snackbar-message"] ||
          buttonProps.snackbar_message ||
          buttonProps["toast-message"] ||
          buttonProps.toast_message;

    let message = rawMessage;
    if (message === true || message === "true") {
      message = "Acción realizada con éxito";
    }

    let action =
      buttonProps["snackbar-action"] ||
      buttonProps.snackbar_action ||
      buttonProps["toast-action"] ||
      buttonProps.toast_action ||
      buttonProps.action;
    let icon =
      buttonProps["snackbar-icon"] ||
      buttonProps.snackbar_icon ||
      buttonProps["toast-icon"] ||
      buttonProps.toast_icon ||
      buttonProps.icon;
    let type =
      buttonProps["snackbar-type"] ||
      buttonProps.snackbar_type ||
      buttonProps["toast-type"] ||
      buttonProps.toast_type ||
      buttonProps.type ||
      "info";
    let goto =
      buttonProps["snackbar-goto"] ||
      buttonProps.snackbar_goto ||
      buttonProps["snackbar-action-goto"] ||
      buttonProps.snackbar_action_goto ||
      buttonProps["toast-goto"] ||
      buttonProps.toast_goto;
    let duration =
      Number(
        buttonProps["snackbar-duration"] ||
        buttonProps.snackbar_duration ||
        buttonProps["toast-duration"] ||
        buttonProps.toast_duration
      ) || 4500;

    // If message is a reference like @FacturaToast or @SuccessAlert
    if (typeof rawMessage === "string" && rawMessage.startsWith("@")) {
      const toastName = rawMessage.substring(1);
      const targetScreen = allScreens.find(s => s.name === toastName);
      if (targetScreen) {
        message =
          targetScreen.props.message ||
          targetScreen.props.value ||
          targetScreen.props.label ||
          targetScreen.name;
        action =
          targetScreen.props["snackbar-action"] ||
          targetScreen.props.snackbar_action ||
          targetScreen.props.action ||
          action;
        icon =
          targetScreen.props["snackbar-icon"] ||
          targetScreen.props.snackbar_icon ||
          targetScreen.props.icon ||
          icon;
        type =
          targetScreen.props["snackbar-type"] ||
          targetScreen.props.snackbar_type ||
          targetScreen.props.type ||
          type;
        goto =
          targetScreen.props["snackbar-goto"] ||
          targetScreen.props.snackbar_goto ||
          targetScreen.props.goto ||
          goto;
        duration =
          Number(
            targetScreen.props["snackbar-duration"] ||
            targetScreen.props.snackbar_duration ||
            targetScreen.props.duration
          ) || duration;
      }
    }

    if (message && typeof message === "string" && message.trim().length > 0) {
      setActiveToast({
        id: "toast_" + Date.now(),
        message,
        action,
        icon,
        type,
        goto,
        duration,
      });
    }
  };

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleNavigateAction = (target?: string) => {
    if (!target) return;

    if (target === "back" || target === "close") {
      if (activeDialog) {
        setActiveDialog(null);
        return;
      }
      if (onNavigate) onNavigate("back");
      return;
    }

    // Check if target is a modal/dialog or screen
    if (target.startsWith("@")) {
      const match = target.match(/^@([a-zA-Z0-9_-]+)(?:\((?:step=(\d+)|([^)]+))\))?/);
      if (match) {
        const targetScreenName = match[1];
        const stepParam = match[2];

        // If step param on current wizard
        if (screen.type === "wizard" && targetScreenName === screen.name && stepParam) {
          if (onWizardStepChange) {
            onWizardStepChange(parseInt(stepParam, 10));
          }
          return;
        }

        // Find if target screen is a dialog/modal/sheet
        const targetScreen = allScreens.find(s => s.name === targetScreenName);
        if (targetScreen && (targetScreen.type === "dialog" || targetScreen.type === "modal" || targetScreen.type === "sheet")) {
          setActiveDialog(targetScreen);
          return;
        }

        if (onNavigate) {
          onNavigate(target);
        }
      }
    }
  };

  // Auto-scroll selected element into view when selected from code editor in inspect mode
  useEffect(() => {
    if (inspectMode && selectedNodeId) {
      const el = document.getElementById(`inspect-${selectedNodeId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
      }
    }
  }, [selectedNodeId, inspectMode]);

  // Inspect wrapper
  const wrapInspectable = (node: WispNode, children: React.ReactNode) => {
    if (!inspectMode) return <React.Fragment key={node.id}>{children}</React.Fragment>;

    const isSelected = selectedNodeId === node.id;
    const startLine = node.lineStart ?? node.position?.line;
    const endLine = node.lineEnd ?? startLine;
    const lineLabel = startLine ? (startLine === endLine ? `L${startLine}` : `L${startLine}-${endLine}`) : null;

    return (
      <div
        key={node.id}
        id={`inspect-${node.id}`}
        onClick={(e) => {
          e.stopPropagation();
          if (onSelectNode) onSelectNode(node);
        }}
        className={`relative transition-all rounded-2xl cursor-pointer group ${
          isSelected
            ? "ring-2 ring-purple-500 ring-offset-2 ring-offset-white dark:ring-offset-neutral-900 bg-purple-500/10 dark:bg-purple-500/15 shadow-md shadow-purple-500/10"
            : "hover:ring-1 hover:ring-purple-400/80 hover:bg-purple-500/5"
        }`}
      >
        {/* Subtle inspect tag with block line numbers */}
        <div
          className={`transition-all absolute -top-3 left-3 z-30 bg-[#161320] border border-purple-500/60 text-purple-200 text-[10px] font-mono px-2 py-0.5 rounded-md shadow-md flex items-center gap-1.5 pointer-events-none ${
            isSelected
              ? "opacity-100 scale-100 ring-1 ring-purple-400 bg-purple-950 text-white font-semibold"
              : "opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100"
          }`}
        >
          <span className="font-bold">{node.type}</span>
          {lineLabel && <span className="text-purple-300 font-mono">[{lineLabel}]</span>}
          {node.props.variant && <span className="opacity-75">({node.props.variant})</span>}
        </div>
        {children}
      </div>
    );
  };

  // Node rendering dispatcher
  const renderNode = (node: WispNode): React.ReactNode => {
    switch (node.type) {
      case "card":
        return wrapInspectable(node, renderCard(node));
      case "text":
        return wrapInspectable(node, renderText(node));
      case "button":
        return wrapInspectable(node, renderButton(node));
      case "textfield":
        return wrapInspectable(node, renderTextField(node));
      case "textarea":
        return wrapInspectable(node, renderTextArea(node));
      case "select":
        return wrapInspectable(node, renderSelect(node));
      case "autocomplete":
      case "searchbar":
        return wrapInspectable(node, renderAutocomplete(node));
      case "datepicker":
        return wrapInspectable(node, renderDatePicker(node));
      case "radio":
        return wrapInspectable(node, renderRadio(node));
      case "segmentedbutton":
        return wrapInspectable(node, renderSegmentedButton(node));
      case "chip":
        return wrapInspectable(node, renderChip(node));
      case "switch":
        return wrapInspectable(node, renderSwitch(node));
      case "checkbox":
        return wrapInspectable(node, renderCheckbox(node));
      case "slider":
        return wrapInspectable(node, renderSlider(node));
      case "listitem":
        return wrapInspectable(node, renderListItem(node));
      case "avatar":
        return wrapInspectable(node, renderAvatar(node));
      case "badge":
        return wrapInspectable(node, renderBadge(node));
      case "icon":
        return wrapInspectable(node, renderIcon(node));
      case "image":
        return wrapInspectable(node, renderImage(node));
      case "progress":
        return wrapInspectable(node, renderProgress(node));
      case "metric":
      case "stat":
        return wrapInspectable(node, renderMetric(node));
      case "divider":
        return wrapInspectable(node, renderDivider(node));
      case "spacer":
        return wrapInspectable(node, renderSpacer(node));
      case "alert":
        return wrapInspectable(node, renderAlert(node));
      case "tabs":
        return wrapInspectable(node, renderTabs(node));
      case "tab":
      case "panel":
      case "tabitem":
      case "tab-item":
        return wrapInspectable(node, <div className="space-y-4 w-full">{node.children.map(renderNode)}</div>);
      case "table":
        return wrapInspectable(node, renderTable(node));
      case "row":
        return wrapInspectable(node, renderRow(node));
      case "column":
        return wrapInspectable(node, renderColumn(node));
      case "grid":
        return wrapInspectable(node, renderGrid(node));
      case "split":
        return wrapInspectable(node, renderSplit(node));
      case "sidebar":
        return wrapInspectable(node, renderSidebar(node));
      case "container":
        return wrapInspectable(node, renderContainer(node));
      case "accordion":
        return wrapInspectable(node, renderAccordion(node));
      case "fab":
        return wrapInspectable(node, renderFab(node));
      case "snackbar":
        return wrapInspectable(node, renderSnackbar(node));
      case "breadcrumbs":
        return wrapInspectable(node, renderBreadcrumbs(node));
      case "rating":
        return wrapInspectable(node, renderRating(node));
      default:
        // Default container fallback
        if (node.children && node.children.length > 0) {
          return wrapInspectable(
            node,
            <div className="space-y-3">{node.children.map(renderNode)}</div>
          );
        }
        return null;
    }
  };

  // Component Renderers
  const renderCard = (node: WispNode) => {
    const variant = node.props.variant || "elevated";
    let bgStyle: React.CSSProperties = {
      backgroundColor: colorScheme.surfaceContainerLow,
      borderColor: colorScheme.outlineVariant,
      color: colorScheme.onSurface,
    };

    let shadowClass = "shadow-sm";
    if (variant === "elevated") {
      bgStyle.backgroundColor = colorScheme.surfaceContainerLow;
      shadowClass = "shadow-[0_2px_8px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]";
    } else if (variant === "filled") {
      bgStyle.backgroundColor = colorScheme.surfaceContainerHighest;
      shadowClass = "shadow-none";
    } else if (variant === "outlined") {
      bgStyle.backgroundColor = colorScheme.surface;
      shadowClass = "border";
    }

    const paddingClass = isMobile ? "p-3.5 sm:p-4 rounded-2xl space-y-3" : "p-5 md:p-6 rounded-3xl space-y-4";

    return (
      <div
        className={`border transition-all w-full overflow-hidden ${shadowClass} ${paddingClass}`}
        style={bgStyle}
      >
        {node.children.map(renderNode)}
      </div>
    );
  };

  const renderText = (node: WispNode) => {
    const variant = node.props.variant || "body";
    const textValue = node.props.value || "";

    let styleClass = isMobile ? "text-sm leading-relaxed" : "text-base leading-relaxed";
    let textColor = colorScheme.onSurface;

    if (node.props.color === "primary") textColor = colorScheme.primary;
    else if (node.props.color === "secondary") textColor = colorScheme.secondary;
    else if (node.props.color === "tertiary") textColor = colorScheme.tertiary;
    else if (node.props.color === "error") textColor = colorScheme.error;
    else if (node.props.color === "onSurfaceVariant") textColor = colorScheme.onSurfaceVariant;

    if (variant === "display") {
      styleClass = isMobile
        ? "text-2xl font-bold tracking-tight font-sans"
        : "text-3xl md:text-4xl font-extrabold tracking-tight font-sans";
    } else if (variant === "headline") {
      styleClass = isMobile
        ? "text-xl font-bold tracking-tight font-sans"
        : "text-2xl md:text-3xl font-bold tracking-tight font-sans";
    } else if (variant === "title") {
      styleClass = isMobile
        ? "text-base font-bold tracking-normal"
        : "text-lg md:text-xl font-semibold tracking-normal";
    } else if (variant === "label") {
      styleClass = "text-xs font-semibold tracking-wider uppercase opacity-80";
    } else if (variant === "caption") {
      styleClass = "text-xs text-neutral-500";
    }

    return (
      <p className={`${styleClass} transition-colors break-words`} style={{ color: textColor }}>
        {textValue}
      </p>
    );
  };

  const renderButton = (node: WispNode) => {
    const variant = node.props.variant || "filled";
    const label = node.props.label || "";
    const icon = node.props.icon;
    const disabled = node.props.disabled === true;
    const goto = node.props.goto;
    const hasSnackbar = Boolean(node.props.snackbar || node.props.toast);

    let btnStyle: React.CSSProperties = {};
    let className =
      "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm transition-all active:scale-[0.98] select-none cursor-pointer";

    if (variant === "filled") {
      btnStyle = {
        backgroundColor: colorScheme.primary,
        color: colorScheme.onPrimary,
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
      };
    } else if (variant === "tonal") {
      btnStyle = {
        backgroundColor: colorScheme.secondaryContainer,
        color: colorScheme.onSecondaryContainer,
      };
    } else if (variant === "outlined") {
      btnStyle = {
        backgroundColor: "transparent",
        color: colorScheme.primary,
        border: `1px solid ${colorScheme.outline}`,
      };
    } else if (variant === "text") {
      btnStyle = {
        backgroundColor: "transparent",
        color: colorScheme.primary,
      };
      className += " hover:bg-neutral-500/10 px-4";
    } else if (variant === "elevated") {
      btnStyle = {
        backgroundColor: colorScheme.surfaceContainerLow,
        color: colorScheme.primary,
        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
      };
    }

    if (disabled) {
      btnStyle.opacity = 0.45;
      className += " cursor-not-allowed pointer-events-none";
    }

    return (
      <button
        type="button"
        style={btnStyle}
        className={className}
        onClick={() => {
          if (hasSnackbar) {
            triggerSnackbar(node.props);
          }
          if (goto) {
            handleNavigateAction(goto);
          }
        }}
      >
        {icon && <DynamicIcon name={icon} className="w-4 h-4 shrink-0" />}
        {label && <span>{label}</span>}
      </button>
    );
  };

  const renderTextField = (node: WispNode) => {
    const name = node.props.name || "input";
    const label = node.props.label || name;
    const placeholder = node.props.placeholder || "";
    const type = node.props.type || "text";
    const icon = node.props.icon || node.props.leadingIcon;
    const value = formData[name] !== undefined ? formData[name] : "";
    const helper = node.props.helper || node.props.helperText;

    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label
            className="block text-xs font-semibold tracking-wide uppercase"
            style={{ color: colorScheme.onSurfaceVariant }}
          >
            {label}
            {node.props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div
              className="absolute left-3.5 pointer-events-none"
              style={{ color: colorScheme.onSurfaceVariant }}
            >
              <DynamicIcon name={icon} className="w-4 h-4" />
            </div>
          )}
          <input
            type={type}
            value={value}
            placeholder={placeholder}
            onChange={(e) => handleInputChange(name, e.target.value)}
            className={`w-full px-4 py-2.5 rounded-2xl text-sm transition-all outline-none border ${
              icon ? "pl-10" : ""
            }`}
            style={{
              backgroundColor: colorScheme.surfaceContainerLowest,
              borderColor: colorScheme.outlineVariant,
              color: colorScheme.onSurface,
            }}
          />
        </div>
        {helper && (
          <p className="text-[11px]" style={{ color: colorScheme.onSurfaceVariant }}>
            {helper}
          </p>
        )}
      </div>
    );
  };

  const renderTextArea = (node: WispNode) => {
    const name = node.props.name || "textarea";
    const label = node.props.label || name;
    const placeholder = node.props.placeholder || "";
    const rows = Number(node.props.rows) || 3;
    const value = formData[name] !== undefined ? formData[name] : "";

    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label
            className="block text-xs font-semibold tracking-wide uppercase"
            style={{ color: colorScheme.onSurfaceVariant }}
          >
            {label}
          </label>
        )}
        <textarea
          rows={rows}
          value={value}
          placeholder={placeholder}
          onChange={(e) => handleInputChange(name, e.target.value)}
          className="w-full px-4 py-2.5 rounded-2xl text-sm transition-all outline-none border resize-y"
          style={{
            backgroundColor: colorScheme.surfaceContainerLowest,
            borderColor: colorScheme.outlineVariant,
            color: colorScheme.onSurface,
          }}
        />
      </div>
    );
  };

  const renderSelect = (node: WispNode) => {
    const name = node.props.name || "select";
    const label = node.props.label || name;

    // Collect options from nested 'option' children or from props.options array
    const childOptions = (node.children || [])
      .filter((c) => c.type === "option")
      .map((c) => String(c.props.value || c.props.label || c.props.name || ""));

    const options: string[] = childOptions.length > 0
      ? childOptions
      : Array.isArray(node.props.options)
      ? node.props.options
      : ["Opción 1", "Opción 2", "Opción 3"];

    const defaultInitialValue = node.props.value !== undefined ? String(node.props.value) : (options[0] || "");
    const value = formData[name] !== undefined ? formData[name] : defaultInitialValue;

    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label
            className="block text-xs font-semibold tracking-wide uppercase"
            style={{ color: colorScheme.onSurfaceVariant }}
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            value={value}
            onChange={(e) => handleInputChange(name, e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl text-sm transition-all outline-none border appearance-none cursor-pointer pr-10"
            style={{
              backgroundColor: colorScheme.surfaceContainerLowest,
              borderColor: colorScheme.outlineVariant,
              color: colorScheme.onSurface,
            }}
          >
            {options.map((opt, idx) => (
              <option key={idx} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <ChevronDown
            className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: colorScheme.onSurfaceVariant }}
          />
        </div>
      </div>
    );
  };

  const renderAutocomplete = (node: WispNode) => {
    const name = node.props.name || node.id;
    const label = node.props.label || name;
    const placeholder = node.props.placeholder || "Escribe para filtrar...";

    // Collect options from nested 'option' children or from props.options array
    const childOptions = (node.children || [])
      .filter((c) => c.type === "option")
      .map((c) => String(c.props.value || c.props.label || c.props.name || ""));

    const options: string[] = childOptions.length > 0
      ? childOptions
      : Array.isArray(node.props.options)
      ? node.props.options
      : ["Opción 1", "Opción 2", "Opción 3"];

    const selectedValue = formData[name] || "";
    const filterQuery = (formData[`__query_${name}`] !== undefined ? formData[`__query_${name}`] : selectedValue).toLowerCase();
    const isOpen = formData[`__open_${name}`] === true;

    const filteredOptions = options.filter(opt =>
      opt.toLowerCase().includes(filterQuery)
    );

    return (
      <div className="space-y-1.5 w-full relative">
        {label && (
          <label
            className="block text-xs font-semibold tracking-wide uppercase"
            style={{ color: colorScheme.onSurfaceVariant }}
          >
            {label}
          </label>
        )}
        <div
          className="relative flex items-center rounded-2xl border transition-all"
          style={{
            backgroundColor: colorScheme.surfaceContainerLowest,
            borderColor: isOpen ? colorScheme.primary : colorScheme.outlineVariant,
          }}
        >
          <div className="pl-3.5 pr-2 pointer-events-none opacity-60">
            <Search className="w-4 h-4" style={{ color: colorScheme.onSurfaceVariant }} />
          </div>

          <input
            type="text"
            placeholder={placeholder}
            value={isOpen ? (formData[`__query_${name}`] ?? selectedValue) : (selectedValue || "")}
            onChange={(e) => {
              handleInputChange(`__query_${name}`, e.target.value);
              if (!isOpen) handleInputChange(`__open_${name}`, true);
            }}
            onFocus={() => handleInputChange(`__open_${name}`, true)}
            className="w-full py-2.5 pr-10 text-sm bg-transparent outline-none"
            style={{ color: colorScheme.onSurface }}
          />

          <div className="absolute right-3 flex items-center gap-1">
            {selectedValue && (
              <button
                type="button"
                onClick={() => {
                  handleInputChange(name, "");
                  handleInputChange(`__query_${name}`, "");
                }}
                className="p-1 rounded-full hover:opacity-75 cursor-pointer"
                style={{ color: colorScheme.onSurfaceVariant }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => handleInputChange(`__open_${name}`, !isOpen)}
              className="p-1 cursor-pointer"
              style={{ color: colorScheme.onSurfaceVariant }}
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
          </div>
        </div>

        {isOpen && (
          <div
            className="absolute left-0 right-0 z-50 mt-1 max-h-52 overflow-y-auto rounded-2xl border shadow-xl p-1.5 space-y-0.5"
            style={{
              backgroundColor: colorScheme.surfaceContainerLow,
              borderColor: colorScheme.outlineVariant,
            }}
          >
            {filteredOptions.length === 0 ? (
              <div
                className="p-3 text-center text-xs opacity-60"
                style={{ color: colorScheme.onSurfaceVariant }}
              >
                Sin coincidencias
              </div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected = selectedValue === opt;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      handleInputChange(name, opt);
                      handleInputChange(`__query_${name}`, opt);
                      handleInputChange(`__open_${name}`, false);
                    }}
                    className="flex items-center justify-between px-3.5 py-2 rounded-xl text-sm cursor-pointer transition-colors"
                    style={{
                      backgroundColor: isSelected
                        ? colorScheme.secondaryContainer
                        : "transparent",
                      color: isSelected
                        ? colorScheme.onSecondaryContainer
                        : colorScheme.onSurface,
                    }}
                  >
                    <span>{opt}</span>
                    {isSelected && <Check className="w-4 h-4 text-purple-700 dark:text-purple-300" />}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    );
  };

  const renderDatePicker = (node: WispNode) => {
    const name = node.props.name || node.id;
    const label = node.props.label || name;
    const value = formData[name] || node.props.value || "";

    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label
            className="block text-xs font-semibold tracking-wide uppercase"
            style={{ color: colorScheme.onSurfaceVariant }}
          >
            {label}
          </label>
        )}
        <div
          className="relative flex items-center rounded-2xl border transition-all"
          style={{
            backgroundColor: colorScheme.surfaceContainerLowest,
            borderColor: colorScheme.outlineVariant,
          }}
        >
          <div className="pl-3.5 pr-2 pointer-events-none opacity-60">
            <Calendar className="w-4 h-4" style={{ color: colorScheme.onSurfaceVariant }} />
          </div>
          <input
            type="date"
            value={value}
            onChange={(e) => handleInputChange(name, e.target.value)}
            className="w-full py-2.5 pr-4 text-sm bg-transparent outline-none cursor-pointer"
            style={{ color: colorScheme.onSurface }}
          />
        </div>
      </div>
    );
  };

  const renderRadio = (node: WispNode) => {
    const name = node.props.name || node.props.group || "radio_group";
    const label = node.props.label || node.props.value || "";
    const value = node.props.value || label;
    const checked = formData[name] === value || (formData[name] === undefined && node.props.checked === true);

    return (
      <label
        onClick={() => handleInputChange(name, value)}
        className="flex items-center gap-2.5 py-1.5 cursor-pointer select-none"
      >
        <div
          className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
          style={{
            borderColor: checked ? colorScheme.primary : colorScheme.outline,
          }}
        >
          {checked && (
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: colorScheme.primary }}
            />
          )}
        </div>
        <span className="text-sm" style={{ color: colorScheme.onSurface }}>
          {label}
        </span>
      </label>
    );
  };

  const renderSegmentedButton = (node: WispNode) => {
    const name = node.props.name || node.id;
    const options: string[] = Array.isArray(node.props.options)
      ? node.props.options
      : ["Opción A", "Opción B", "Opción C"];
    const selected = segmentedValues[name] || node.props.selected || options[0];

    return (
      <div
        className="inline-flex p-1 rounded-full border border-neutral-200/80 bg-neutral-100/60 dark:bg-neutral-800/60 overflow-hidden"
        style={{ borderColor: colorScheme.outlineVariant }}
      >
        {options.map((opt, idx) => {
          const isSelected = selected === opt;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setSegmentedValues(prev => ({ ...prev, [name]: opt }))}
              className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all flex items-center gap-1.5 ${
                isSelected
                  ? "shadow-sm font-semibold"
                  : "hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50"
              }`}
              style={
                isSelected
                  ? {
                      backgroundColor: colorScheme.secondaryContainer,
                      color: colorScheme.onSecondaryContainer,
                    }
                  : { color: colorScheme.onSurfaceVariant }
              }
            >
              {isSelected && <Check className="w-3.5 h-3.5" />}
              <span>{opt}</span>
            </button>
          );
        })}
      </div>
    );
  };

  const renderChip = (node: WispNode) => {
    const label = node.props.label || "";
    const icon = node.props.icon;
    const isInitiallySelected = node.props.selected === true;
    const isSelected =
      selectedChips[node.id] !== undefined
        ? selectedChips[node.id]
        : isInitiallySelected;

    return (
      <button
        type="button"
        onClick={() => setSelectedChips(prev => ({ ...prev, [node.id]: !isSelected }))}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border cursor-pointer select-none"
        style={
          isSelected
            ? {
                backgroundColor: colorScheme.secondaryContainer,
                borderColor: colorScheme.secondaryContainer,
                color: colorScheme.onSecondaryContainer,
              }
            : {
                backgroundColor: colorScheme.surfaceContainerLow,
                borderColor: colorScheme.outlineVariant,
                color: colorScheme.onSurfaceVariant,
              }
        }
      >
        {isSelected ? (
          <Check className="w-3.5 h-3.5 text-purple-700 dark:text-purple-300" />
        ) : (
          icon && <DynamicIcon name={icon} className="w-3.5 h-3.5" />
        )}
        <span>{label}</span>
      </button>
    );
  };

  const renderSwitch = (node: WispNode) => {
    const name = node.props.name || node.id;
    const label = node.props.label || name;
    const checked =
      formData[name] !== undefined
        ? !!formData[name]
        : node.props.checked === true;

    return (
      <label className="flex items-center justify-between py-1.5 cursor-pointer select-none w-full">
        <span className="text-sm font-medium" style={{ color: colorScheme.onSurface }}>
          {label}
        </span>
        <div
          onClick={() => handleInputChange(name, !checked)}
          className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
          style={{
            backgroundColor: checked ? colorScheme.primary : colorScheme.surfaceContainerHighest,
          }}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
              checked ? "translate-x-5" : "translate-x-0"
            }`}
          >
            {checked && <Check className="w-3 h-3 text-purple-800" />}
          </span>
        </div>
      </label>
    );
  };

  const renderCheckbox = (node: WispNode) => {
    const name = node.props.name || node.id;
    const label = node.props.label || name;
    const checked =
      formData[name] !== undefined
        ? !!formData[name]
        : node.props.checked === true;

    return (
      <label className="flex items-start gap-2.5 py-1.5 cursor-pointer select-none">
        <div
          onClick={() => handleInputChange(name, !checked)}
          className="w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 mt-0.5"
          style={
            checked
              ? {
                  backgroundColor: colorScheme.primary,
                  borderColor: colorScheme.primary,
                  color: colorScheme.onPrimary,
                }
              : {
                  backgroundColor: colorScheme.surfaceContainerLowest,
                  borderColor: colorScheme.outline,
                }
          }
        >
          {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </div>
        <span className="text-sm leading-snug" style={{ color: colorScheme.onSurface }}>
          {label}
        </span>
      </label>
    );
  };

  const renderSlider = (node: WispNode) => {
    const name = node.props.name || "slider";
    const label = node.props.label || name;
    const min = Number(node.props.min) || 0;
    const max = Number(node.props.max) || 100;
    const value =
      formData[name] !== undefined
        ? Number(formData[name])
        : Number(node.props.value) || Math.floor((min + max) / 2);

    return (
      <div className="space-y-2 w-full">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase" style={{ color: colorScheme.onSurfaceVariant }}>
            {label}
          </label>
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: colorScheme.primaryContainer,
              color: colorScheme.onPrimaryContainer,
            }}
          >
            {value}
          </span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => handleInputChange(name, Number(e.target.value))}
          className="w-full accent-purple-700 cursor-pointer h-2 bg-neutral-200 rounded-lg dark:bg-neutral-700"
        />
      </div>
    );
  };

  const renderListItem = (node: WispNode) => {
    const label = node.props.label || "";
    const subtitle = node.props.subtitle;
    const icon = node.props.icon;
    const badge = node.props.badge;
    const goto = node.props.goto;
    const hasSnackbar = Boolean(node.props.snackbar || node.props.toast);

    return (
      <div
        onClick={() => {
          if (hasSnackbar) {
            triggerSnackbar(node.props);
          }
          if (goto) {
            handleNavigateAction(goto);
          }
        }}
        className="flex items-center justify-between p-3.5 rounded-2xl transition-all border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 hover:bg-neutral-500/5 cursor-pointer"
      >
        <div className="flex items-center gap-3.5">
          {icon && (
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{
                backgroundColor: colorScheme.primaryContainer,
                color: colorScheme.onPrimaryContainer,
              }}
            >
              <DynamicIcon name={icon} className="w-5 h-5" />
            </div>
          )}
          <div>
            <p className="text-sm font-semibold" style={{ color: colorScheme.onSurface }}>
              {label}
            </p>
            {subtitle && (
              <p className="text-xs mt-0.5" style={{ color: colorScheme.onSurfaceVariant }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {badge && (
            <span
              className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
              style={{
                backgroundColor: colorScheme.secondaryContainer,
                color: colorScheme.onSecondaryContainer,
              }}
            >
              {badge}
            </span>
          )}
          <ChevronRight className="w-4 h-4 opacity-40" />
        </div>
      </div>
    );
  };

  const renderAvatar = (node: WispNode) => {
    const name = node.props.name || "Usuario";
    const initials = name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

    return (
      <div
        className="w-10 h-10 rounded-full font-bold text-sm flex items-center justify-center shadow-sm select-none shrink-0"
        style={{
          backgroundColor: colorScheme.primaryContainer,
          color: colorScheme.onPrimaryContainer,
        }}
      >
        {initials}
      </div>
    );
  };

  const renderBadge = (node: WispNode) => {
    const text = node.props.text || node.props.value || "Nuevo";
    return (
      <span
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider"
        style={{
          backgroundColor: colorScheme.primaryContainer,
          color: colorScheme.onPrimaryContainer,
        }}
      >
        {text}
      </span>
    );
  };

  const renderIcon = (node: WispNode) => {
    const name = node.props.name || "star";
    return (
      <div style={{ color: colorScheme.primary }}>
        <DynamicIcon name={name} className="w-6 h-6" />
      </div>
    );
  };

  const renderImage = (node: WispNode) => {
    const src =
      node.props.src ||
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80";

    return (
      <img
        src={src}
        alt="Preview"
        className="w-full h-48 object-cover rounded-2xl shadow-sm border"
        style={{ borderColor: colorScheme.outlineVariant }}
      />
    );
  };

  const renderProgress = (node: WispNode) => {
    const value = Math.min(100, Math.max(0, Number(node.props.value) || 50));
    return (
      <div className="w-full space-y-1">
        <div
          className="h-2 rounded-full overflow-hidden w-full"
          style={{ backgroundColor: colorScheme.surfaceContainerHighest }}
        >
          <div
            className="h-full transition-all duration-300 rounded-full"
            style={{
              width: `${value}%`,
              backgroundColor: colorScheme.primary,
            }}
          />
        </div>
      </div>
    );
  };

  const renderMetric = (node: WispNode) => {
    const label = node.props.label || "Métrica";
    const value = node.props.value || "0";
    const delta = node.props.delta;
    const icon = node.props.icon;

    const metricPadding = isMobile ? "p-3.5 sm:p-4 rounded-2xl space-y-1.5" : "p-5 rounded-3xl space-y-2";
    const valueFontSize = isMobile ? "text-xl sm:text-2xl font-extrabold" : "text-2xl md:text-3xl font-extrabold";

    return (
      <div
        className={`border transition-all w-full ${metricPadding}`}
        style={{
          backgroundColor: colorScheme.surfaceContainerLow,
          borderColor: colorScheme.outlineVariant,
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider truncate mr-2" style={{ color: colorScheme.onSurfaceVariant }}>
            {label}
          </span>
          {icon && (
            <div
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{
                backgroundColor: colorScheme.primaryContainer,
                color: colorScheme.onPrimaryContainer,
              }}
            >
              <DynamicIcon name={icon} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          )}
        </div>
        <p className={valueFontSize} style={{ color: colorScheme.onSurface }}>
          {value}
        </p>
        {delta && (
          <span
            className="inline-flex items-center text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: delta.startsWith("+") ? "#E8F5E9" : "#FFEBEE",
              color: delta.startsWith("+") ? "#2E7D32" : "#C62828",
            }}
          >
            {delta}
          </span>
        )}
      </div>
    );
  };

  const renderDivider = (node: WispNode) => {
    return <hr className="border-t my-2" style={{ borderColor: colorScheme.outlineVariant }} />;
  };

  const renderSpacer = (node: WispNode) => {
    const height = Number(node.props.height) || 16;
    return <div style={{ height: `${height}px` }} />;
  };

  const renderAlert = (node: WispNode) => {
    const title = node.props.title;
    const message = node.props.value || "";
    const type = node.props.type || "info";

    let icon = <Info className="w-5 h-5 text-blue-600" />;
    let bg = "#E3F2FD";
    let text = "#0D47A1";

    if (type === "success") {
      icon = <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      bg = "#E8F5E9";
      text = "#1B5E20";
    } else if (type === "warning") {
      icon = <AlertTriangle className="w-5 h-5 text-amber-600" />;
      bg = "#FFF8E1";
      text = "#E65100";
    } else if (type === "error") {
      icon = <AlertCircle className="w-5 h-5 text-red-600" />;
      bg = "#FFEBEE";
      text = "#B71C1C";
    }

    return (
      <div className="p-4 rounded-2xl flex items-start gap-3 border border-transparent shadow-sm" style={{ backgroundColor: bg, color: text }}>
        <div className="shrink-0 mt-0.5">{icon}</div>
        <div className="space-y-0.5">
          {title && <p className="text-xs font-bold uppercase tracking-wider">{title}</p>}
          <p className="text-sm font-medium leading-relaxed">{message}</p>
        </div>
      </div>
    );
  };

  const renderTabs = (node: WispNode) => {
    // Check if children contain tab panels e.g. tab "Pestaña 1", panel "Pestaña 2"
    const tabPanels = node.children.filter(
      (c) => c.type === "tab" || c.type === "panel" || c.type === "tabitem" || c.type === "tab-item"
    );

    let items: string[] = [];
    if (Array.isArray(node.props.items)) {
      items = node.props.items;
    } else if (Array.isArray(node.props.tabs)) {
      items = node.props.tabs;
    } else if (typeof node.props.items === "string") {
      items = node.props.items.split(",").map((s: string) => s.trim().replace(/^["']|["']$/g, ""));
    } else if (typeof node.props.tabs === "string") {
      items = node.props.tabs.split(",").map((s: string) => s.trim().replace(/^["']|["']$/g, ""));
    } else if (tabPanels.length > 0) {
      items = tabPanels.map((p) => p.props.title || p.props.label || p.props.value || "Pestaña");
    } else {
      items = ["Pestaña 1", "Pestaña 2", "Pestaña 3"];
    }

    const activeIndex = activeTabs[node.id] !== undefined ? activeTabs[node.id] : 0;
    const activePanel = tabPanels.length > 0 ? tabPanels[activeIndex] || tabPanels[0] : null;
    const nonPanelChildren = tabPanels.length === 0 ? node.children : [];

    return (
      <div className="w-full space-y-4">
        <div className="border-b" style={{ borderColor: colorScheme.outlineVariant }}>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {items.map((tab, idx) => {
              const isActive = activeIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveTabs((prev) => ({ ...prev, [node.id]: idx }))}
                  className="px-4 py-2.5 text-sm font-semibold transition-all relative shrink-0 cursor-pointer select-none"
                  style={{
                    color: isActive ? colorScheme.primary : colorScheme.onSurfaceVariant,
                  }}
                >
                  {tab}
                  {isActive && (
                    <motion.div
                      layoutId={`tab-indicator-${node.id}`}
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                      style={{ backgroundColor: colorScheme.primary }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Panel Content */}
        {activePanel && (
          <motion.div
            key={activePanel.id || activeIndex}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className="space-y-4 w-full"
          >
            {activePanel.children.map(renderNode)}
          </motion.div>
        )}

        {/* If no panels, render regular children */}
        {nonPanelChildren.length > 0 && (
          <div className="space-y-4 w-full">
            {nonPanelChildren.map(renderNode)}
          </div>
        )}
      </div>
    );
  };

  const renderTableCellContent = (
    cellStr: string,
    rawVal: any,
    tableNode: WispNode,
    colType: string,
    rIdx: number,
    cIdx: number,
    row: any[]
  ) => {
    const lower = cellStr.toLowerCase();
    const cellKey = `${tableNode.id}_r${rIdx}_c${cIdx}`;
    const rowId = `${tableNode.id}_r${rIdx}`;
    const normalizedType = (colType || "").toLowerCase().trim();

    // 1. CHECKBOX / BOOLEAN / SELECT
    if (["checkbox", "boolean", "select", "toggle", "check"].includes(normalizedType)) {
      const isSelected =
        tableSelectedRows[tableNode.id]?.[rIdx] !== undefined
          ? tableSelectedRows[tableNode.id][rIdx]
          : ["true", "1", "si", "sí", "checked", "activo"].includes(lower);

      return (
        <button
          type="button"
          onClick={() => {
            setTableSelectedRows((prev) => {
              const currentTable = prev[tableNode.id] || {};
              return {
                ...prev,
                [tableNode.id]: {
                  ...currentTable,
                  [rIdx]: !isSelected,
                },
              };
            });
          }}
          className="inline-flex items-center justify-center p-1 rounded-md transition-all hover:bg-neutral-500/10 cursor-pointer"
          title={isSelected ? "Deseleccionar fila" : "Seleccionar fila"}
        >
          {isSelected ? (
            <CheckSquare className="w-4 h-4" style={{ color: colorScheme.primary }} />
          ) : (
            <Square className="w-4 h-4 opacity-40 hover:opacity-80" style={{ color: colorScheme.onSurfaceVariant }} />
          )}
        </button>
      );
    }

    // 2. AVATAR / USER / MEMBER
    if (["avatar", "user", "member", "usuario", "perfil"].includes(normalizedType)) {
      let avatarUrl = "";
      let userName = cellStr;
      if (cellStr.includes("|")) {
        const parts = cellStr.split("|");
        avatarUrl = parts[0].trim();
        userName = parts[1].trim();
      } else if (cellStr.startsWith("http")) {
        avatarUrl = cellStr;
        userName = "Usuario";
      }

      const initials = userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase() || "U";

      return (
        <div className="flex items-center gap-2.5">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={userName}
              referrerPolicy="no-referrer"
              className="w-7 h-7 rounded-full object-cover shrink-0 border"
              style={{ borderColor: colorScheme.outlineVariant }}
            />
          ) : (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs"
              style={{
                backgroundColor: colorScheme.primaryContainer,
                color: colorScheme.onPrimaryContainer,
              }}
            >
              {initials}
            </div>
          )}
          <span className="font-medium text-xs sm:text-sm truncate max-w-[160px]" style={{ color: colorScheme.onSurface }}>
            {userName}
          </span>
        </div>
      );
    }

    // 3. DROPDOWN / MENU / MORE / OPTIONS
    if (["dropdown", "menu", "more", "options", "opciones", "acciones_menu"].includes(normalizedType)) {
      const isDropdownOpen = !!openTableDropdowns[cellKey];

      return (
        <div className="relative inline-block text-left">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpenTableDropdowns((prev) => ({
                ...prev,
                [cellKey]: !prev[cellKey],
              }));
            }}
            className="p-1.5 rounded-lg transition-all hover:bg-neutral-500/10 cursor-pointer active:scale-95 flex items-center justify-center"
            style={{ color: colorScheme.onSurfaceVariant }}
            title="Opciones"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setOpenTableDropdowns((prev) => ({ ...prev, [cellKey]: false }))}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-full mt-1 w-44 rounded-xl border shadow-xl z-50 py-1 overflow-hidden"
                  style={{
                    backgroundColor: colorScheme.surfaceContainerHigh,
                    borderColor: colorScheme.outlineVariant,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setOpenTableDropdowns((prev) => ({ ...prev, [cellKey]: false }));
                      triggerSnackbar({ message: `Detalles de la fila ${rIdx + 1}` });
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors hover:bg-neutral-500/10 cursor-pointer"
                    style={{ color: colorScheme.onSurface }}
                  >
                    <Eye className="w-3.5 h-3.5 opacity-70" />
                    <span>Ver detalles</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenTableDropdowns((prev) => ({ ...prev, [cellKey]: false }));
                      triggerSnackbar({ message: `Editando registro ${rIdx + 1}` });
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors hover:bg-neutral-500/10 cursor-pointer"
                    style={{ color: colorScheme.onSurface }}
                  >
                    <Edit className="w-3.5 h-3.5 opacity-70" />
                    <span>Editar registro</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenTableDropdowns((prev) => ({ ...prev, [cellKey]: false }));
                      const copyText = String(row[0] || cellStr);
                      navigator.clipboard?.writeText(copyText);
                      triggerSnackbar({ message: `Copiado: ${copyText}` });
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors hover:bg-neutral-500/10 cursor-pointer"
                    style={{ color: colorScheme.onSurface }}
                  >
                    <Copy className="w-3.5 h-3.5 opacity-70" />
                    <span>Copiar identificador</span>
                  </button>
                  <div className="border-t my-1" style={{ borderColor: colorScheme.outlineVariant }} />
                  <button
                    type="button"
                    onClick={() => {
                      setOpenTableDropdowns((prev) => ({ ...prev, [cellKey]: false }));
                      triggerSnackbar({ message: `Registro ${rIdx + 1} eliminado` });
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-500 transition-colors hover:bg-red-500/10 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      );
    }

    // 4. ACTION / BUTTON
    if (["action", "button", "btn", "accion", "acciones"].includes(normalizedType)) {
      const targetNav = cellStr.startsWith("goto=")
        ? cellStr.substring(5)
        : cellStr.startsWith("@")
        ? cellStr
        : "";
      const label = targetNav ? "Ver" : cellStr || "Acción";

      return (
        <button
          type="button"
          onClick={() => {
            if (targetNav) {
              handleNavigateAction(targetNav);
            } else {
              triggerSnackbar({ message: `Acción '${label}' ejecutada` });
            }
          }}
          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-2xs whitespace-nowrap"
          style={{
            backgroundColor: colorScheme.primaryContainer,
            color: colorScheme.onPrimaryContainer,
          }}
        >
          <span>{label}</span>
          <ChevronRight className="w-3 h-3 opacity-70" />
        </button>
      );
    }

    // 5. PROGRESS / BAR / PERCENT
    if (["progress", "bar", "percent", "progreso", "avance"].includes(normalizedType)) {
      let numVal = parseFloat(cellStr.replace(/[^0-9.]/g, ""));
      if (isNaN(numVal)) numVal = 50;
      if (numVal <= 1 && cellStr.includes(".")) numVal = numVal * 100;
      const clamped = Math.min(100, Math.max(0, numVal));

      return (
        <div className="flex items-center gap-2 min-w-[90px] max-w-[130px]">
          <div
            className="flex-1 h-2 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-800"
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${clamped}%`,
                backgroundColor: clamped >= 100 ? "#10B981" : colorScheme.primary,
              }}
            />
          </div>
          <span className="text-xs font-mono font-semibold shrink-0" style={{ color: colorScheme.onSurfaceVariant }}>
            {clamped}%
          </span>
        </div>
      );
    }

    // 6. CODE / ID / MONO
    if (["code", "id", "mono", "hash", "version"].includes(normalizedType) || cellStr.startsWith("#") || cellStr.startsWith("0x") || /^[0-9a-f]{8}-/i.test(cellStr)) {
      return (
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(cellStr);
            triggerSnackbar({ message: `Copiado: ${cellStr}` });
          }}
          className="font-mono text-xs px-2 py-0.5 rounded font-medium inline-flex items-center gap-1 transition-all hover:opacity-80 active:scale-95 cursor-pointer"
          style={{
            backgroundColor: colorScheme.surfaceContainerHigh,
            color: colorScheme.primary,
          }}
          title="Click para copiar"
        >
          <span>{cellStr}</span>
        </button>
      );
    }

    // 7. CURRENCY / MONEY / PRICE
    if (["currency", "money", "price", "precio", "monto"].includes(normalizedType)) {
      return (
        <span className="font-semibold text-xs sm:text-sm font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
          {cellStr}
        </span>
      );
    }

    // 8. DATE / DATETIME / TIME
    if (["date", "datetime", "time", "fecha", "hora"].includes(normalizedType)) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: colorScheme.onSurfaceVariant }}>
          <Calendar className="w-3.5 h-3.5 opacity-60 shrink-0" />
          <span>{cellStr}</span>
        </span>
      );
    }

    // 9. LINK / URL
    if (["link", "url", "enlace"].includes(normalizedType)) {
      return (
        <a
          href={cellStr.startsWith("http") ? cellStr : `#${cellStr}`}
          onClick={(e) => {
            if (cellStr.startsWith("@")) {
              e.preventDefault();
              handleNavigateAction(cellStr);
            }
          }}
          className="inline-flex items-center gap-1 text-xs font-semibold underline hover:opacity-80 transition-opacity"
          style={{ color: colorScheme.primary }}
        >
          <span>{cellStr}</span>
          <ExternalLink className="w-3 h-3 opacity-70" />
        </a>
      );
    }

    // 10. RATING / STARS
    if (["rating", "stars", "calificacion", "score"].includes(normalizedType)) {
      const score = Math.round(parseFloat(cellStr) || 5);
      return (
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`w-3.5 h-3.5 ${s <= score ? "text-amber-400 fill-amber-400" : "text-neutral-300 dark:text-neutral-700"}`}
            />
          ))}
        </div>
      );
    }

    // 11. TAGS / CHIPS
    if (["tags", "chips", "etiquetas"].includes(normalizedType) || (cellStr.includes(",") && !cellStr.includes("$"))) {
      const tags = cellStr.split(",").map((t) => t.trim()).filter(Boolean);
      if (tags.length > 1) {
        return (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag, tIdx) => (
              <span
                key={tIdx}
                className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
                style={{
                  backgroundColor: colorScheme.surfaceContainerHigh,
                  color: colorScheme.onSurfaceVariant,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        );
      }
    }

    // 12. STATUS / BADGE (Explicit or Automatic detection)
    const isStatusType = ["status", "badge", "estado", "tag"].includes(normalizedType);
    const isSuccess = ["activo", "active", "completado", "completada", "success", "ok", "pagado", "listo", "aprobado", "habilitado", "online", "prd", "publicado"].includes(lower);
    const isPending = ["pendiente", "pending", "en proceso", "en revisión", "procesando", "proceso", "espera", "qas", "borrador"].includes(lower);
    const isWarning = ["advertencia", "warning", "alerta", "revisar", "pausado", "dev", "en prueba"].includes(lower);
    const isError = ["inactivo", "inactive", "error", "cancelado", "cancelada", "fallido", "rechazado", "urgente", "bloqueado", "offline"].includes(lower);

    if (isStatusType || isSuccess || isPending || isWarning || isError) {
      let badgeBg = colorScheme.secondaryContainer;
      let badgeText = colorScheme.onSecondaryContainer;
      let dotColor = colorScheme.primary;

      if (isSuccess) {
        badgeBg = "rgba(16, 185, 129, 0.12)";
        badgeText = isDark ? "#6EE7B7" : "#065F46";
        dotColor = "#10B981";
      } else if (isPending) {
        badgeBg = "rgba(245, 158, 11, 0.12)";
        badgeText = isDark ? "#FCD34D" : "#92400E";
        dotColor = "#F59E0B";
      } else if (isWarning) {
        badgeBg = "rgba(249, 115, 22, 0.12)";
        badgeText = isDark ? "#FDBA74" : "#9A3412";
        dotColor = "#F97316";
      } else if (isError) {
        badgeBg = "rgba(239, 68, 68, 0.12)";
        badgeText = isDark ? "#FCA5A5" : "#991B1B";
        dotColor = "#EF4444";
      }

      return (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide whitespace-nowrap"
          style={{ backgroundColor: badgeBg, color: badgeText }}
        >
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
          <span>{cellStr}</span>
        </span>
      );
    }

    // Auto-detect action if not explicit
    const isActionWord = ["configurar", "editar", "ver detalle", "ver", "detalle", "descargar", "eliminar", "gestionar", "abrir", "detalles"].includes(lower) || cellStr.startsWith("@") || cellStr.startsWith("goto=");
    if (isActionWord) {
      const targetNav = cellStr.startsWith("goto=") ? cellStr.substring(5) : cellStr.startsWith("@") ? cellStr : "";
      return (
        <button
          type="button"
          onClick={() => {
            if (targetNav) {
              handleNavigateAction(targetNav);
            } else {
              triggerSnackbar({ message: `Acción '${cellStr}' ejecutada` });
            }
          }}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-2xs whitespace-nowrap"
          style={{
            backgroundColor: colorScheme.primaryContainer,
            color: colorScheme.onPrimaryContainer,
          }}
        >
          <span>{cellStr.startsWith("goto=") || cellStr.startsWith("@") ? "Ver" : cellStr}</span>
          <ChevronRight className="w-3 h-3 opacity-70" />
        </button>
      );
    }

    return <span style={{ color: colorScheme.onSurface }}>{cellStr}</span>;
  };

  const renderTable = (node: WispNode) => {
    // 1. Resolve columns / headers / columnDefs
    let headers: string[] = [];
    let columnDefs: { name: string; type: string }[] = [];

    if (node.props.columnDefs && Array.isArray(node.props.columnDefs)) {
      columnDefs = node.props.columnDefs;
      headers = columnDefs.map((cd) => cd.name);
    } else {
      const rawCols = node.props.columns || node.props.headers || node.props.cols;
      if (Array.isArray(rawCols)) {
        rawCols.forEach((col: string) => {
          if (col.includes(":")) {
            const idx = col.lastIndexOf(":");
            headers.push(col.substring(0, idx).trim());
            columnDefs.push({ name: col.substring(0, idx).trim(), type: col.substring(idx + 1).trim() });
          } else {
            headers.push(col);
            columnDefs.push({ name: col, type: "text" });
          }
        });
      } else if (typeof rawCols === "string") {
        rawCols.split(",").forEach((col: string) => {
          const clean = col.trim().replace(/^["']|["']$/g, "");
          if (clean.includes(":")) {
            const idx = clean.lastIndexOf(":");
            headers.push(clean.substring(0, idx).trim());
            columnDefs.push({ name: clean.substring(0, idx).trim(), type: clean.substring(idx + 1).trim() });
          } else {
            headers.push(clean);
            columnDefs.push({ name: clean, type: "text" });
          }
        });
      }
    }

    // 2. Resolve rows
    let rows: any[][] = [];

    // From children (e.g. `row ["#101", "Auth Service", "Activo", "Configurar"]`)
    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => {
        if (child.props.values && Array.isArray(child.props.values)) {
          rows.push(child.props.values);
        } else if (child.props.cells && Array.isArray(child.props.cells)) {
          rows.push(child.props.cells);
        } else if (child.props.data && Array.isArray(child.props.data)) {
          rows.push(child.props.data);
        } else if (child.props.value) {
          rows.push([child.props.value]);
        } else if (child.children && child.children.length > 0) {
          // cells inside row
          const cellVals = child.children.map((c) => c.props.value || c.props.label || c.rawText || "");
          rows.push(cellVals);
        }
      });
    }

    // If no row children, check node.props.rows or node.props.data
    if (rows.length === 0 && (node.props.rows || node.props.data)) {
      const rawData = node.props.rows || node.props.data;
      if (Array.isArray(rawData)) {
        rawData.forEach((item) => {
          if (Array.isArray(item)) {
            rows.push(item);
          } else if (typeof item === "object" && item !== null) {
            // Object mapping: match headers or take values
            if (headers.length > 0) {
              const rowVals = headers.map((h) => {
                const key = Object.keys(item).find(
                  (k) => k.toLowerCase() === h.toLowerCase() || k.toLowerCase() === h.toLowerCase().replace(/\s+/g, "_")
                );
                return key ? item[key] : (item[h] !== undefined ? item[h] : "");
              });
              rows.push(rowVals);
            } else {
              rows.push(Object.values(item));
            }
          } else {
            rows.push([String(item)]);
          }
        });
      }
    }

    // Fallback headers if not specified
    if (headers.length === 0) {
      headers = ["ID", "Nombre", "Estado", "Acciones"];
      columnDefs = [
        { name: "ID", type: "code" },
        { name: "Nombre", type: "text" },
        { name: "Estado", type: "status" },
        { name: "Acciones", type: "action" },
      ];
    }

    // Fallback sample rows if none provided
    if (rows.length === 0) {
      rows = [
        ["#101", "Servicio Auth Gateway", "Activo", "Configurar"],
        ["#102", "Worker de Notificaciones", "Activo", "Configurar"],
        ["#103", "Procesador de Pagos", "Pendiente", "Configurar"],
      ];
    }

    // Props
    const title = node.props.title || node.props.label;
    const subtitle = node.props.subtitle;
    const isStriped = node.props.striped === true || node.props.striped === "true";
    const isCompact = node.props.compact === true || node.props.compact === "true" || node.props.dense === true;
    const isBordered = node.props.bordered === true || node.props.bordered === "true";
    const isSearchable = node.props.searchable === true || node.props.searchable === "true" || node.props.filter === true || node.props.search === true;
    const isPagination = node.props.pagination === true || node.props.pagination === "true" || node.props.paginate === true || rows.length > 6;
    const pageSize = Number(node.props.pageSize || node.props.pagesize || node.props.limit || 5);

    // Search query filter
    const searchQuery = (tableSearches[node.id] || "").toLowerCase().trim();
    const filteredRows = searchQuery
      ? rows.filter((r) => r.some((cell) => String(cell).toLowerCase().includes(searchQuery)))
      : rows;

    // Pagination
    const currentPage = tablePages[node.id] || 1;
    const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const paginatedRows = isPagination
      ? filteredRows.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize)
      : filteredRows;

    const cellPadding = isCompact ? "py-2 px-3 text-xs" : "py-3 px-4 text-sm";
    const headerPadding = isCompact ? "py-2.5 px-3 text-[11px]" : "py-3 px-4 text-xs";

    // Master checkbox logic
    const hasCheckboxCol = columnDefs.some((cd) => ["checkbox", "boolean", "select"].includes(cd.type.toLowerCase()));
    const selectedCount = Object.values(tableSelectedRows[node.id] || {}).filter(Boolean).length;
    const allSelected = paginatedRows.length > 0 && selectedCount === paginatedRows.length;

    return (
      <div
        className="w-full rounded-2xl border shadow-xs overflow-hidden transition-all"
        style={{
          backgroundColor: colorScheme.surfaceContainerLowest,
          borderColor: colorScheme.outlineVariant,
        }}
      >
        {/* Table Header Bar (Title, Subtitle, Search) */}
        {(title || subtitle || isSearchable) && (
          <div
            className="p-3.5 sm:p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            style={{
              backgroundColor: colorScheme.surfaceContainerLow,
              borderColor: colorScheme.outlineVariant,
            }}
          >
            <div>
              {title && (
                <h3 className="font-bold text-sm sm:text-base tracking-tight" style={{ color: colorScheme.onSurface }}>
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs mt-0.5" style={{ color: colorScheme.onSurfaceVariant }}>
                  {subtitle}
                </p>
              )}
            </div>

            {isSearchable && (
              <div className="relative min-w-[180px] max-w-xs w-full">
                <Search
                  className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none"
                  style={{ color: colorScheme.onSurfaceVariant }}
                />
                <input
                  type="text"
                  placeholder="Buscar en tabla..."
                  value={tableSearches[node.id] || ""}
                  onChange={(e) => {
                    setTableSearches((prev) => ({ ...prev, [node.id]: e.target.value }));
                    setTablePages((prev) => ({ ...prev, [node.id]: 1 }));
                  }}
                  className="w-full pl-8 pr-3 py-1.5 rounded-full text-xs border bg-transparent focus:outline-none transition-all"
                  style={{
                    borderColor: colorScheme.outlineVariant,
                    color: colorScheme.onSurface,
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Table Element */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead style={{ backgroundColor: colorScheme.surfaceContainerHigh }}>
              <tr>
                {headers.map((h, i) => {
                  const colDef = columnDefs[i];
                  const isCheckType = colDef && ["checkbox", "boolean", "select"].includes(colDef.type.toLowerCase());

                  return (
                    <th
                      key={i}
                      className={`${headerPadding} font-bold uppercase tracking-wider ${
                        isBordered && i > 0 ? "border-l" : ""
                      }`}
                      style={{
                        color: colorScheme.onSurfaceVariant,
                        borderColor: colorScheme.outlineVariant,
                      }}
                    >
                      {isCheckType ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const newSelection: Record<number, boolean> = {};
                              const targetVal = !allSelected;
                              paginatedRows.forEach((_, rI) => {
                                newSelection[rI] = targetVal;
                              });
                              setTableSelectedRows((prev) => ({
                                ...prev,
                                [node.id]: newSelection,
                              }));
                            }}
                            className="p-1 rounded hover:bg-neutral-500/10 cursor-pointer"
                            title={allSelected ? "Deseleccionar todos" : "Seleccionar todos"}
                          >
                            {allSelected ? (
                              <CheckSquare className="w-4 h-4" style={{ color: colorScheme.primary }} />
                            ) : (
                              <Square className="w-4 h-4 opacity-40" style={{ color: colorScheme.onSurfaceVariant }} />
                            )}
                          </button>
                          {h && h !== "Seleccionar" && <span>{h}</span>}
                        </div>
                      ) : (
                        h
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: colorScheme.outlineVariant }}>
              {paginatedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={headers.length}
                    className="p-6 text-center text-xs"
                    style={{ color: colorScheme.onSurfaceVariant }}
                  >
                    No se encontraron resultados para la búsqueda.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row, rIdx) => {
                  const isEven = rIdx % 2 === 1;
                  const rowBg = isStriped && isEven ? colorScheme.surfaceContainerLow : "transparent";

                  return (
                    <tr
                      key={rIdx}
                      className="hover:bg-neutral-500/5 transition-colors group"
                      style={{ backgroundColor: rowBg }}
                    >
                      {headers.map((_, cIdx) => {
                        const cell = row[cIdx] !== undefined ? row[cIdx] : "";
                        const cellStr = String(cell).trim();
                        const colDef = columnDefs[cIdx] || { name: "", type: "text" };

                        return (
                          <td
                            key={cIdx}
                            className={`${cellPadding} ${isBordered && cIdx > 0 ? "border-l" : ""}`}
                            style={{
                              color: colorScheme.onSurface,
                              borderColor: colorScheme.outlineVariant,
                            }}
                          >
                            {renderTableCellContent(cellStr, cell, node, colDef.type, rIdx, cIdx, row)}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {isPagination && totalPages > 1 && (
          <div
            className="px-4 py-2.5 border-t flex items-center justify-between text-xs"
            style={{
              backgroundColor: colorScheme.surfaceContainerLow,
              borderColor: colorScheme.outlineVariant,
              color: colorScheme.onSurfaceVariant,
            }}
          >
            <span>
              Mostrando {(safeCurrentPage - 1) * pageSize + 1} -{" "}
              {Math.min(safeCurrentPage * pageSize, filteredRows.length)} de {filteredRows.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={safeCurrentPage <= 1}
                onClick={() => setTablePages((prev) => ({ ...prev, [node.id]: safeCurrentPage - 1 }))}
                className="p-1 rounded-md transition-colors disabled:opacity-30 hover:bg-neutral-500/10 cursor-pointer disabled:cursor-not-allowed"
                title="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold px-2 py-0.5 rounded text-[11px] font-mono">
                {safeCurrentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={safeCurrentPage >= totalPages}
                onClick={() => setTablePages((prev) => ({ ...prev, [node.id]: safeCurrentPage + 1 }))}
                className="p-1 rounded-md transition-colors disabled:opacity-30 hover:bg-neutral-500/10 cursor-pointer disabled:cursor-not-allowed"
                title="Página siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRow = (node: WispNode) => {
    const spacing = Number(node.props.spacing) || 12;
    const align = node.props.align || "center";
    const justify = node.props.justify || "start";

    let alignClass = "items-center";
    if (align === "start") alignClass = "items-start";
    else if (align === "end") alignClass = "items-end";
    else if (align === "stretch") alignClass = "items-stretch";

    let justifyClass = "justify-start";
    if (justify === "between") justifyClass = "justify-between";
    else if (justify === "center") justifyClass = "justify-center";
    else if (justify === "end") justifyClass = "justify-end";

    return (
      <div
        className={`flex flex-wrap ${alignClass} ${justifyClass} w-full`}
        style={{ gap: `${spacing}px` }}
      >
        {node.children.map(renderNode)}
      </div>
    );
  };

  const renderColumn = (node: WispNode) => {
    const spacing = Number(node.props.spacing) || 16;
    return (
      <div className="flex flex-col w-full" style={{ gap: `${spacing}px` }}>
        {node.children.map(renderNode)}
      </div>
    );
  };

  const renderGrid = (node: WispNode) => {
    const cols = Number(node.props.cols) || 2;
    const gap = Number(node.props.gap) || (isMobile ? 12 : 16);

    let colClass = "grid-cols-1 md:grid-cols-2";
    if (isMobile) {
      colClass = cols === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1";
    } else if (isTablet) {
      if (cols >= 3) colClass = "grid-cols-2";
      else if (cols === 2) colClass = "grid-cols-2";
      else colClass = "grid-cols-1";
    } else {
      if (cols === 3) colClass = "grid-cols-1 md:grid-cols-3";
      else if (cols === 4) colClass = "grid-cols-1 sm:grid-cols-2 md:grid-cols-4";
      else if (cols === 1) colClass = "grid-cols-1";
    }

    return (
      <div className={`grid ${colClass} w-full`} style={{ gap: `${gap}px` }}>
        {node.children.map(renderNode)}
      </div>
    );
  };

  const renderSplit = (node: WispNode) => {
    const leftChild = node.children.find(c => c.type === "left");
    const rightChild = node.children.find(c => c.type === "right");

    if (isMobile) {
      return (
        <div className="flex flex-col gap-4 w-full items-stretch">
          {leftChild ? (
            <div className="w-full">
              {wrapInspectable(
                leftChild,
                <div className="space-y-4 w-full">
                  {leftChild.children.map(renderNode)}
                </div>
              )}
            </div>
          ) : null}
          {rightChild ? (
            <div className="w-full">
              {wrapInspectable(
                rightChild,
                <div className="space-y-4 w-full">
                  {rightChild.children.map(renderNode)}
                </div>
              )}
            </div>
          ) : null}
        </div>
      );
    }

    const gridClass = isTablet
      ? "grid grid-cols-1 md:grid-cols-12 gap-4 w-full items-start"
      : "grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start";
    const leftSpan = isTablet ? "md:col-span-5" : "lg:col-span-4";
    const rightSpan = isTablet ? "md:col-span-7" : "lg:col-span-8";

    return (
      <div className={gridClass}>
        <div className={leftSpan}>
          {leftChild ? (
            wrapInspectable(
              leftChild,
              <div className="space-y-4 w-full">
                {leftChild.children.map(renderNode)}
              </div>
            )
          ) : null}
        </div>
        <div className={rightSpan}>
          {rightChild ? (
            wrapInspectable(
              rightChild,
              <div className="space-y-4 w-full">
                {rightChild.children.map(renderNode)}
              </div>
            )
          ) : null}
        </div>
      </div>
    );
  };

  const renderSidebar = (node: WispNode) => {
    const width = node.props.width || 280;
    const isFullWidth = isMobile;

    return (
      <div
        className={`rounded-3xl p-4 border space-y-3 shrink-0 ${isFullWidth ? "w-full" : ""}`}
        style={{
          width: isFullWidth ? "100%" : typeof width === "number" ? `${width}px` : width,
          backgroundColor: colorScheme.surfaceContainerLow,
          borderColor: colorScheme.outlineVariant,
        }}
      >
        {node.children.map(renderNode)}
      </div>
    );
  };

  const renderContainer = (node: WispNode) => {
    return <div className="max-w-4xl mx-auto w-full space-y-6">{node.children.map(renderNode)}</div>;
  };

  const renderAccordion = (node: WispNode) => {
    const isExpanded =
      expandedAccordions[node.id] !== undefined
        ? expandedAccordions[node.id]
        : node.props.expanded === true || node.props.expanded === "true";
    const title = node.props.title || node.props.label || node.props.value || "Sección";
    const icon = node.props.icon;
    const badge = node.props.badge;
    const variant = node.props.variant || "outlined";

    const toggle = () => {
      setExpandedAccordions((prev) => ({
        ...prev,
        [node.id]: !isExpanded,
      }));
    };

    let containerBg = colorScheme.surfaceContainerLowest;
    let borderColor = colorScheme.outlineVariant;
    let shadowClass = "shadow-xs";

    if (variant === "elevated") {
      containerBg = colorScheme.surfaceContainerLow;
      shadowClass = "shadow-sm";
    } else if (variant === "filled") {
      containerBg = colorScheme.surfaceContainerHigh;
      borderColor = "transparent";
      shadowClass = "shadow-none";
    }

    return (
      <div
        className={`rounded-2xl border transition-all overflow-hidden ${shadowClass} w-full`}
        style={{
          backgroundColor: containerBg,
          borderColor: borderColor,
        }}
      >
        <button
          type="button"
          onClick={toggle}
          className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left transition-colors hover:bg-neutral-500/5 select-none cursor-pointer group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {icon && (
              <div
                className="shrink-0 p-1.5 rounded-lg transition-colors"
                style={{
                  backgroundColor: colorScheme.surfaceContainerHigh,
                  color: colorScheme.primary,
                }}
              >
                <DynamicIcon name={icon} className="w-4 h-4" />
              </div>
            )}
            <span
              className="text-sm font-semibold truncate transition-colors"
              style={{ color: colorScheme.onSurface }}
            >
              {title}
            </span>
            {badge && (
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: colorScheme.secondaryContainer,
                  color: colorScheme.onSecondaryContainer,
                }}
              >
                {badge}
              </span>
            )}
          </div>

          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="shrink-0 p-1 rounded-full text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-200 transition-colors"
            style={{ color: colorScheme.onSurfaceVariant }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </button>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div
                className="px-4 py-3.5 border-t space-y-3"
                style={{ borderColor: colorScheme.outlineVariant }}
              >
                {node.children && node.children.length > 0 ? (
                  node.children.map(renderNode)
                ) : (
                  <p className="text-xs italic" style={{ color: colorScheme.onSurfaceVariant }}>
                    Sin contenido interno.
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const renderFab = (node: WispNode) => {
    const label = node.props.label || "";
    const isExtended =
      node.props.extended !== undefined
        ? node.props.extended === true || node.props.extended === "true"
        : Boolean(label);
    const icon = node.props.icon || "plus";
    const goto = node.props.goto;
    const variant = node.props.variant || "primary";

    let bg = colorScheme.primaryContainer;
    let text = colorScheme.onPrimaryContainer;

    if (variant === "primary") {
      bg = colorScheme.primary;
      text = colorScheme.onPrimary;
    } else if (variant === "secondary") {
      bg = colorScheme.secondaryContainer;
      text = colorScheme.onSecondaryContainer;
    } else if (variant === "tertiary") {
      bg = colorScheme.tertiaryContainer;
      text = colorScheme.onTertiaryContainer;
    } else if (variant === "surface") {
      bg = colorScheme.surfaceContainerHigh;
      text = colorScheme.primary;
    }

    const hasSnackbar = Boolean(node.props.snackbar || node.props.toast);

    return (
      <div className="flex items-center justify-end w-full py-1">
        <button
          type="button"
          onClick={() => {
            if (hasSnackbar) {
              triggerSnackbar(node.props);
            }
            if (goto) {
              handleNavigateAction(goto);
            }
          }}
          className={`inline-flex items-center justify-center gap-2.5 font-medium text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg hover:shadow-xl select-none ${
            isExtended ? "px-5 py-3.5 rounded-2xl md:rounded-3xl" : "w-14 h-14 rounded-2xl md:rounded-3xl"
          }`}
          style={{
            backgroundColor: bg,
            color: text,
            boxShadow: "0 6px 16px -2px rgba(0,0,0,0.18), 0 2px 6px -1px rgba(0,0,0,0.12)",
          }}
        >
          <DynamicIcon name={icon} className="w-5 h-5 shrink-0" />
          {isExtended && label && <span className="font-semibold tracking-wide">{label}</span>}
        </button>
      </div>
    );
  };

  const renderSnackbar = (node: WispNode) => {
    const isDismissed = dismissedSnackbars[node.id] === true;
    if (isDismissed) return null;

    const message = node.props.message || node.props.value || "Notificación de acción";
    const action = node.props.action;
    const icon = node.props.icon;
    const type = node.props.type || "info";
    const goto = node.props.goto;

    let defaultIcon = null;
    if (icon) {
      defaultIcon = <DynamicIcon name={icon} className="w-4 h-4 shrink-0" />;
    } else if (type === "success") {
      defaultIcon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
    } else if (type === "warning") {
      defaultIcon = <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
    } else if (type === "error") {
      defaultIcon = <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />;
    } else {
      defaultIcon = <Info className="w-4 h-4 text-sky-400 shrink-0" />;
    }

    return (
      <div
        className="w-full p-3.5 md:p-4 rounded-xl shadow-xl border flex items-center justify-between gap-3 text-xs md:text-sm animate-in fade-in slide-in-from-bottom-2 duration-150"
        style={{
          backgroundColor: colorScheme.inverseSurface || "#1F1F24",
          color: colorScheme.inverseOnSurface || "#F1F0F7",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {defaultIcon}
          <span className="font-medium truncate leading-relaxed">{message}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {action && (
            <button
              type="button"
              onClick={() => {
                handleNavigateAction(goto);
              }}
              className="px-2.5 py-1 rounded-md text-xs font-bold transition-all hover:bg-white/10 active:scale-95 cursor-pointer uppercase tracking-wider"
              style={{
                color: colorScheme.inversePrimary || "#D0BCFF",
              }}
            >
              {action}
            </button>
          )}
          <button
            type="button"
            onClick={() => setDismissedSnackbars((prev) => ({ ...prev, [node.id]: true }))}
            className="p-1 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Cerrar notificación"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  const renderBreadcrumbs = (node: WispNode) => {
    let items: string[] = [];
    if (Array.isArray(node.props.items)) {
      items = node.props.items;
    } else if (typeof node.props.items === "string") {
      items = node.props.items.split(",").map((s: string) => s.trim());
    } else if (node.props.value) {
      items = [node.props.value];
    } else {
      items = ["Inicio", "Sección", "Detalle"];
    }

    const separator = node.props.separator || "chevron";

    return (
      <nav
        aria-label="Breadcrumbs"
        className="flex items-center flex-wrap gap-1.5 text-xs md:text-sm py-1"
        style={{ color: colorScheme.onSurfaceVariant }}
      >
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          const isFirst = idx === 0;

          return (
            <React.Fragment key={idx}>
              {idx > 0 && (
                <span className="opacity-40 select-none flex items-center justify-center">
                  {separator === "slash" ? (
                    <span className="px-0.5 font-mono text-xs">/</span>
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </span>
              )}

              <span
                className={`inline-flex items-center gap-1 transition-colors ${
                  isLast
                    ? "font-bold select-text"
                    : "hover:underline cursor-pointer opacity-80 hover:opacity-100"
                }`}
                style={{
                  color: isLast ? colorScheme.onSurface : colorScheme.onSurfaceVariant,
                }}
              >
                {isFirst && idx === 0 && <Home className="w-3.5 h-3.5 shrink-0 opacity-70" />}
                <span>{item}</span>
              </span>
            </React.Fragment>
          );
        })}
      </nav>
    );
  };

  const renderRating = (node: WispNode) => {
    const name = node.props.name || "rating";
    const label = node.props.label || "";
    const max = Number(node.props.max) || 5;
    const initialVal = Number(node.props.value) || 0;
    const currentVal =
      ratingValues[node.id] !== undefined
        ? ratingValues[node.id]
        : (formData[name] !== undefined ? Number(formData[name]) : initialVal);
    const hoverVal = ratingHovers[node.id] || 0;
    const readonly = node.props.readonly === true || node.props.readonly === "true";
    const size = node.props.size || "md";

    const displayVal = hoverVal > 0 ? hoverVal : currentVal;

    let starSizeClass = "w-5 h-5";
    if (size === "sm") starSizeClass = "w-4 h-4";
    else if (size === "lg") starSizeClass = "w-7 h-7";

    const handleStarClick = (starIdx: number) => {
      if (readonly) return;
      const newVal = starIdx + 1;
      setRatingValues((prev) => ({ ...prev, [node.id]: newVal }));
      handleInputChange(name, newVal);
    };

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            className="block text-xs font-semibold tracking-wide uppercase"
            style={{ color: colorScheme.onSurfaceVariant }}
          >
            {label}
          </label>
        )}

        <div className="flex items-center gap-2 select-none">
          <div
            className="flex items-center gap-1"
            onMouseLeave={() => {
              if (!readonly) setRatingHovers((prev) => ({ ...prev, [node.id]: 0 }));
            }}
          >
            {Array.from({ length: max }).map((_, idx) => {
              const starNum = idx + 1;
              const isFilled = starNum <= displayVal;

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={readonly}
                  onClick={() => handleStarClick(idx)}
                  onMouseEnter={() => {
                    if (!readonly) setRatingHovers((prev) => ({ ...prev, [node.id]: starNum }));
                  }}
                  className={`transition-all p-0.5 rounded-md ${
                    readonly
                      ? "cursor-default"
                      : "cursor-pointer hover:scale-115 active:scale-95 focus:outline-none"
                  }`}
                  aria-label={`${starNum} de ${max} estrellas`}
                >
                  <Star
                    className={`${starSizeClass} transition-colors ${
                      isFilled
                        ? "fill-amber-400 text-amber-500 drop-shadow-[0_1px_2px_rgba(245,158,11,0.3)]"
                        : "fill-transparent text-neutral-300 dark:text-neutral-600 hover:text-amber-300"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <span
            className="text-xs font-semibold font-mono ml-1 px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: colorScheme.surfaceContainerHigh,
              color: colorScheme.onSurfaceVariant,
            }}
          >
            {currentVal} / {max}
          </span>
        </div>
      </div>
    );
  };

  // Render Wizard Screen Layout
  if (screen.type === "wizard") {
    const totalSteps = screen.steps?.length || Number(screen.props.totalSteps) || 3;
    const currentStepIndex = Math.min(totalSteps, Math.max(1, activeWizardStep));
    const currentStepNode = screen.steps?.[currentStepIndex - 1];

    const wizardHeaderPadding = isMobile
      ? "p-3.5 sm:p-4 rounded-2xl space-y-3"
      : "p-5 md:p-6 rounded-3xl space-y-4";

    return (
      <div className="w-full space-y-4 sm:space-y-6">
        {/* Wizard Stepper Header */}
        <div
          className={`border shadow-xs ${wizardHeaderPadding}`}
          style={{
            backgroundColor: colorScheme.surfaceContainerLow,
            borderColor: colorScheme.outlineVariant,
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
            <div className="space-y-0.5">
              <div className="inline-flex">
                <span
                  className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full whitespace-nowrap"
                  style={{
                    backgroundColor: colorScheme.primaryContainer,
                    color: colorScheme.onPrimaryContainer,
                  }}
                >
                  Wizard • Paso {currentStepIndex} de {totalSteps}
                </span>
              </div>
              <h2
                className="text-lg sm:text-xl font-bold tracking-tight"
                style={{ color: colorScheme.onSurface }}
              >
                {screen.name}
              </h2>
            </div>
            {currentStepNode?.props.title && (
              <div className="flex items-center">
                <span
                  className="text-xs sm:text-sm font-semibold truncate max-w-full"
                  style={{ color: colorScheme.primary }}
                >
                  {currentStepNode.props.title}
                </span>
              </div>
            )}
          </div>

          {/* Stepper Progress Indicator */}
          <div className="flex items-center gap-1.5 sm:gap-2 pt-1 w-full overflow-x-auto no-scrollbar py-0.5">
            {Array.from({ length: totalSteps }).map((_, idx) => {
              const stepNum = idx + 1;
              const isCompleted = stepNum < currentStepIndex;
              const isCurrent = stepNum === currentStepIndex;

              return (
                <React.Fragment key={idx}>
                  <button
                    type="button"
                    onClick={() => onWizardStepChange && onWizardStepChange(stepNum)}
                    className="flex items-center gap-1.5 group cursor-pointer shrink-0"
                    title={`Paso ${stepNum}`}
                  >
                    <div
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full font-bold text-xs flex items-center justify-center transition-all shadow-xs shrink-0"
                      style={
                        isCurrent
                          ? {
                              backgroundColor: colorScheme.primary,
                              color: colorScheme.onPrimary,
                              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                            }
                          : isCompleted
                          ? {
                              backgroundColor: colorScheme.secondaryContainer,
                              color: colorScheme.onSecondaryContainer,
                            }
                          : {
                              backgroundColor: colorScheme.surfaceContainerHighest,
                              color: colorScheme.onSurfaceVariant,
                            }
                      }
                    >
                      {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : stepNum}
                    </div>
                  </button>
                  {idx < totalSteps - 1 && (
                    <div
                      className="flex-1 h-1 min-w-[12px] rounded-full transition-all"
                      style={{
                        backgroundColor:
                          stepNum < currentStepIndex
                            ? colorScheme.primary
                            : colorScheme.surfaceContainerHighest,
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Wizard Step Content */}
        <div className="space-y-4 sm:space-y-6">
          {currentStepNode ? (
            currentStepNode.children.map(renderNode)
          ) : (
            <div className="p-8 text-center" style={{ color: colorScheme.onSurfaceVariant }}>
              <p>No se encontró contenido para el paso {currentStepIndex}.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render Standalone Snackbar / Toast Screen Template
  if (screen.type === "snackbar" || screen.type === "toast") {
    const message =
      screen.props.message ||
      screen.props.value ||
      "Notificación de acción configurada";
    const action =
      screen.props.snackbar_action ||
      screen.props.action;
    const icon =
      screen.props.snackbar_icon ||
      screen.props.icon;
    const type =
      screen.props.snackbar_type ||
      screen.props.type ||
      "info";
    const goto =
      screen.props.snackbar_goto ||
      screen.props.goto;

    return (
      <div className="w-full space-y-6">
        <div
          className="p-5 md:p-6 rounded-3xl border space-y-4"
          style={{
            backgroundColor: colorScheme.surfaceContainerLow,
            borderColor: colorScheme.outlineVariant,
          }}
        >
          <div className="flex items-center justify-between">
            <span
              className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
              style={{
                backgroundColor: colorScheme.primaryContainer,
                color: colorScheme.onPrimaryContainer,
              }}
            >
              Feedback • @{screen.name} ({screen.type})
            </span>
            <button
              type="button"
              onClick={() => triggerSnackbar({ snackbar: `@${screen.name}` })}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              style={{
                backgroundColor: colorScheme.primary,
                color: colorScheme.onPrimary,
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Probar Notificación</span>
            </button>
          </div>
          <p className="text-xs" style={{ color: colorScheme.onSurfaceVariant }}>
            Esta pantalla define una plantilla de notificación reusable vinculable a botones con <code className="font-mono text-purple-600 dark:text-purple-300">snackbar=@{screen.name}</code>.
          </p>

          <div
            className="w-full p-4 rounded-2xl shadow-md border flex items-center justify-between gap-3 text-sm"
            style={{
              backgroundColor: colorScheme.inverseSurface || "#1F1F24",
              color: colorScheme.inverseOnSurface || "#F1F0F7",
              borderColor: "rgba(255,255,255,0.12)",
            }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {icon ? (
                <DynamicIcon name={icon} className="w-4 h-4 shrink-0" />
              ) : type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : type === "warning" ? (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              ) : type === "error" ? (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <Info className="w-4 h-4 text-sky-400 shrink-0" />
              )}
              <span className="font-medium truncate">{message}</span>
            </div>

            {action && (
              <span
                className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider"
                style={{ color: colorScheme.inversePrimary || "#D0BCFF" }}
              >
                {action}
              </span>
            )}
          </div>

          {screen.children && screen.children.length > 0 && (
            <div className="space-y-4 pt-2 border-t" style={{ borderColor: colorScheme.outlineVariant }}>
              {screen.children.map(renderNode)}
            </div>
          )}
        </div>

        {/* Floating Active Snackbar / Toast Notification (Top on Desktop/Tablet, Bottom on Mobile) */}
        <AnimatePresence>
          {activeToast && (
            <motion.div
              key={activeToast.id}
              initial={{ opacity: 0, y: isMobile ? 28 : -28, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: isMobile ? 16 : -16, scale: 0.96 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className={`fixed ${
                isMobile
                  ? "bottom-4 left-3 right-3"
                  : "top-6 left-6 right-6 md:left-auto md:right-8 md:max-w-md"
              } z-50 shadow-2xl rounded-2xl p-3.5 sm:p-4 border flex items-center justify-between gap-3 text-xs sm:text-sm backdrop-blur-md`}
              style={{
                backgroundColor: colorScheme.inverseSurface || "#1F1F24",
                color: colorScheme.inverseOnSurface || "#F1F0F7",
                borderColor: "rgba(255,255,255,0.12)",
              }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {activeToast.icon ? (
                  <DynamicIcon name={activeToast.icon} className="w-4 h-4 shrink-0" />
                ) : activeToast.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : activeToast.type === "warning" ? (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                ) : activeToast.type === "error" ? (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                ) : (
                  <Info className="w-4 h-4 text-sky-400 shrink-0" />
                )}
                <span className="font-medium truncate leading-relaxed">{activeToast.message}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {activeToast.action && (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeToast.goto) {
                        handleNavigateAction(activeToast.goto);
                      }
                      setActiveToast(null);
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all hover:bg-white/15 active:scale-95 cursor-pointer uppercase tracking-wider select-none"
                    style={{
                      color: colorScheme.inversePrimary || "#D0BCFF",
                    }}
                  >
                    {activeToast.action}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setActiveToast(null)}
                  className="p-1 rounded-full hover:bg-white/15 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  title="Cerrar notificación"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Render Standard Screen / Form / Dialog
  return (
    <div className="w-full space-y-6 relative">
      {screen.children.map(renderNode)}

      {/* Floating Active Snackbar / Toast Notification (Top on Desktop/Tablet, Bottom on Mobile) */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            key={activeToast.id}
            initial={{ opacity: 0, y: isMobile ? 28 : -28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: isMobile ? 16 : -16, scale: 0.96 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className={`fixed ${
              isMobile
                ? "bottom-4 left-3 right-3"
                : "top-6 left-6 right-6 md:left-auto md:right-8 md:max-w-md"
            } z-50 shadow-2xl rounded-2xl p-3.5 sm:p-4 border flex items-center justify-between gap-3 text-xs sm:text-sm backdrop-blur-md`}
            style={{
              backgroundColor: colorScheme.inverseSurface || "#1F1F24",
              color: colorScheme.inverseOnSurface || "#F1F0F7",
              borderColor: "rgba(255,255,255,0.12)",
            }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {activeToast.icon ? (
                <DynamicIcon name={activeToast.icon} className="w-4 h-4 shrink-0" />
              ) : activeToast.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : activeToast.type === "warning" ? (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              ) : activeToast.type === "error" ? (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <Info className="w-4 h-4 text-sky-400 shrink-0" />
              )}
              <span className="font-medium truncate leading-relaxed">{activeToast.message}</span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {activeToast.action && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeToast.goto) {
                      handleNavigateAction(activeToast.goto);
                    }
                    setActiveToast(null);
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all hover:bg-white/15 active:scale-95 cursor-pointer uppercase tracking-wider select-none"
                  style={{
                    color: colorScheme.inversePrimary || "#D0BCFF",
                  }}
                >
                  {activeToast.action}
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveToast(null)}
                className="p-1 rounded-full hover:bg-white/15 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title="Cerrar notificación"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Render Active Modal / Dialog overlay if triggered */}
      <AnimatePresence>
        {activeDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-2xl border relative overflow-hidden"
              style={{
                backgroundColor: colorScheme.surfaceContainerLow,
                borderColor: colorScheme.outlineVariant,
                color: colorScheme.onSurface,
              }}
            >
              <button
                onClick={() => setActiveDialog(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-neutral-500/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="space-y-4">
                <span
                  className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: colorScheme.primaryContainer,
                    color: colorScheme.onPrimaryContainer,
                  }}
                >
                  {activeDialog.type} • @{activeDialog.name}
                </span>
                {activeDialog.children.map(renderNode)}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
