import React, { useState } from "react";
import { DynamicIcon } from "./DynamicIcon";
import { Search, X, Check } from "lucide-react";

interface IconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIcon: (iconName: string) => void;
}

const COMMON_ICONS = [
  "save", "edit", "trash", "plus", "search", "user", "users", "mail",
  "lock", "key", "globe", "cloud", "shield", "shield-check", "palette",
  "settings", "home", "dashboard", "bell", "calendar", "clock", "check",
  "check-circle", "x", "arrow-left", "arrow-right", "arrow-up", "arrow-down",
  "chevron-left", "chevron-right", "chevron-down", "chevron-up", "zap",
  "rocket", "trending-up", "trending-down", "file-text", "database",
  "server", "credit-card", "dollar-sign", "laptop", "monitor", "keyboard",
  "phone", "map-pin", "send", "eye", "download", "upload", "filter",
  "copy", "share", "info", "alert-circle", "alert-triangle", "refresh",
  "sparkles", "code", "layers", "smartphone", "heart", "star", "bookmark",
  "tag", "message-square", "camera", "image", "music", "video", "folder",
  "file", "box", "briefcase", "coffee", "gift", "shopping-cart", "package",
  "activity", "award", "bar-chart", "pie-chart", "cpu", "hard-drive",
  "wifi", "bluetooth", "power", "sliders", "terminal", "tool", "truck",
];

export const IconPickerModal: React.FC<IconPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectIcon,
}) => {
  const [search, setSearch] = useState("");

  if (!isOpen) return null;

  const filteredIcons = COMMON_ICONS.filter((icon) =>
    icon.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-4 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              Selector de Íconos
            </h3>
            <p className="text-xs text-neutral-500">
              Haz clic en cualquier ícono para insertarlo en el DSL Wisp.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar ícono (ej. save, user, cloud, card, check)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl outline-none focus:ring-2 focus:ring-purple-600"
            autoFocus
          />
        </div>

        {/* Icons Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-4 sm:grid-cols-6 gap-2 p-1">
          {filteredIcons.map((icon) => (
            <button
              key={icon}
              type="button"
              onClick={() => {
                onSelectIcon(icon);
                onClose();
              }}
              className="flex flex-col items-center justify-center p-3 rounded-2xl border border-neutral-100 dark:border-neutral-800 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-all text-neutral-700 dark:text-neutral-300 hover:text-purple-700 dark:hover:text-purple-300 group cursor-pointer"
            >
              <DynamicIcon name={icon} className="w-6 h-6 mb-1.5 transition-transform group-hover:scale-110" />
              <span className="text-[10px] text-center font-mono truncate w-full">
                {icon}
              </span>
            </button>
          ))}
        </div>

        {filteredIcons.length === 0 && (
          <div className="text-center py-8 text-neutral-400 text-sm">
            No se encontraron íconos con "{search}".
          </div>
        )}
      </div>
    </div>
  );
};
