import React from "react";
import * as LucideIcons from "lucide-react";

interface DynamicIconProps {
  name: string;
  className?: string;
  size?: number;
  color?: string;
}

// Convert kebab-case or snake_case to PascalCase (e.g. arrow-right -> ArrowRight, check-circle -> CheckCircle)
function toPascalCase(str: string): string {
  if (!str) return "HelpCircle";
  return str
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

// Common aliases mapping to guarantee Lucide icons
const ALIASES: Record<string, string> = {
  save: "Save",
  edit: "Edit3",
  delete: "Trash2",
  trash: "Trash2",
  add: "Plus",
  plus: "Plus",
  search: "Search",
  user: "User",
  users: "Users",
  mail: "Mail",
  email: "Mail",
  lock: "Lock",
  key: "Key",
  globe: "Globe",
  cloud: "Cloud",
  shield: "Shield",
  "shield-check": "ShieldCheck",
  palette: "Palette",
  settings: "Settings",
  gear: "Settings",
  home: "Home",
  dashboard: "LayoutDashboard",
  bell: "Bell",
  notification: "Bell",
  calendar: "Calendar",
  clock: "Clock",
  check: "Check",
  "check-circle": "CheckCircle2",
  close: "X",
  x: "X",
  "arrow-left": "ArrowLeft",
  "arrow-right": "ArrowRight",
  "arrow-up": "ArrowUp",
  "arrow-down": "ArrowDown",
  "chevron-left": "ChevronLeft",
  "chevron-right": "ChevronRight",
  "chevron-down": "ChevronDown",
  "chevron-up": "ChevronUp",
  zap: "Zap",
  rocket: "Rocket",
  "trending-up": "TrendingUp",
  "trending-down": "TrendingDown",
  "file-text": "FileText",
  database: "Database",
  server: "Server",
  "credit-card": "CreditCard",
  dollar: "DollarSign",
  "dollar-sign": "DollarSign",
  laptop: "Laptop",
  monitor: "Monitor",
  keyboard: "Keyboard",
  phone: "Phone",
  "map-pin": "MapPin",
  send: "Send",
  eye: "Eye",
  "eye-off": "EyeOff",
  download: "Download",
  upload: "Upload",
  filter: "Filter",
  copy: "Copy",
  share: "Share2",
  info: "Info",
  alert: "AlertTriangle",
  "alert-circle": "AlertCircle",
  "alert-triangle": "AlertTriangle",
  refresh: "RefreshCw",
  sparkles: "Sparkles",
  code: "Code2",
  layers: "Layers",
  smartphone: "Smartphone",
  tablet: "Tablet",
  desktop: "Monitor",
};

export const DynamicIcon: React.FC<DynamicIconProps> = ({
  name,
  className = "w-4 h-4",
  size,
  color,
}) => {
  if (!name) return null;

  const normalized = name.toLowerCase().trim();
  const pascalName = ALIASES[normalized] || toPascalCase(name);

  // Look up in LucideIcons dictionary
  const IconComponent = (LucideIcons as any)[pascalName] || (LucideIcons as any)[toPascalCase(name)] || LucideIcons.HelpCircle;

  return <IconComponent className={className} size={size} color={color} />;
};
