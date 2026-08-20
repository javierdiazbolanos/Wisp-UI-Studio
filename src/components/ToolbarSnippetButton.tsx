import React, { useState, useRef } from "react";
import {
  MousePointerClick,
  FormInput,
  Layers,
  Columns2,
  LayoutGrid,
  Milestone,
  ToggleRight,
  TrendingUp,
  ListFilter,
  Smile,
  LucideIcon,
  Tag,
  Check,
  Folder,
  DollarSign,
  Users,
  CheckCircle2,
  Mail,
  Save,
  ArrowRight,
  Search,
  ChevronDown,
  Plus,
  BellRing,
  Navigation,
  Star,
  Table as TableIcon,
  FolderKanban,
} from "lucide-react";

export interface ToolbarSnippetItem {
  id: string;
  name: string;
  category: "Control" | "Entrada" | "Estructura" | "Layout" | "Datos" | "Flujo";
  icon: LucideIcon;
  color: string;
  snippet: string;
  description: string;
  modifiers: string[];
  renderPreview: () => React.ReactNode;
}

export const TOOLBAR_SNIPPETS: ToolbarSnippetItem[] = [
  {
    id: "button",
    name: "button",
    category: "Control",
    icon: MousePointerClick,
    color: "from-purple-500 to-indigo-500",
    snippet: `button "Guardar" filled icon=save goto=@Home`,
    description: "Botón Material 3 interactivo con soporte de íconos, variantes visuales y navegación.",
    modifiers: ["filled", "outlined", "tonal", "elevated", "text", "icon=save", "goto=@Screen"],
    renderPreview: () => (
      <div className="flex items-center gap-2 p-3 bg-neutral-900/90 rounded-2xl border border-neutral-800">
        <button
          type="button"
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-purple-600 text-white text-xs font-semibold shadow-md shadow-purple-600/30 cursor-default"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Guardar</span>
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-purple-400/60 text-purple-300 text-xs font-medium cursor-default"
        >
          <span>Cancelar</span>
        </button>
      </div>
    ),
  },
  {
    id: "textfield",
    name: "textfield",
    category: "Entrada",
    icon: FormInput,
    color: "from-blue-500 to-cyan-500",
    snippet: `textfield email label="Correo Electrónico" placeholder="usuario@correo.com" icon=mail`,
    description: "Campo de texto Material 3 con etiqueta flotante, ícono integrado y placeholder.",
    modifiers: ["label=\"...\"", "placeholder=\"...\"", "icon=mail", "type=password", "required=true"],
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/90 rounded-2xl border border-neutral-800">
        <div className="relative border-2 border-purple-500 rounded-xl px-3 py-2 bg-neutral-950/60">
          <span className="absolute -top-2.5 left-3 px-1 bg-neutral-900 text-[10px] text-purple-400 font-semibold">
            Correo Electrónico
          </span>
          <div className="flex items-center gap-2 text-xs text-neutral-200 mt-0.5">
            <Mail className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-neutral-400">usuario@correo.com</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "autocomplete",
    name: "autocomplete",
    category: "Entrada",
    icon: Search,
    color: "from-purple-500 to-pink-500",
    snippet: `autocomplete pais label="País de Residencia" placeholder="Escribe para buscar..."\n  option "Argentina"\n  option "Chile"\n  option "Colombia"\n  option "Costa Rica"\n  option "España"\n  option "México"\n  option "Perú"`,
    description: "Menú desplegable con campo de búsqueda predictiva / filtro dinámico en tiempo real.",
    modifiers: ["label=\"...\"", "placeholder=\"...\"", "option \"...\""],
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/90 rounded-2xl border border-neutral-800 space-y-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-950/60 border border-purple-500/60 text-xs">
          <Search className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-neutral-200">Méx</span>
          <span className="ml-auto text-[10px] text-purple-400 font-semibold bg-purple-950/80 px-1.5 py-0.5 rounded">Filtro M3</span>
        </div>
        <div className="p-1.5 bg-neutral-800 rounded-xl border border-neutral-700 text-xs space-y-1">
          <div className="px-2.5 py-1 rounded-lg bg-purple-900/50 text-purple-200 font-semibold flex items-center justify-between">
            <span>México</span>
            <Check className="w-3 h-3 text-purple-400" />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "card",
    name: "card",
    category: "Estructura",
    icon: Layers,
    color: "from-amber-500 to-orange-500",
    snippet: `card elevated\n  text "Título de Tarjeta" title\n  text "Descripción del contenido con estilo M3..." body\n  button "Ver Detalles" filled icon=arrow-right`,
    description: "Contenedor de superficie M3 con elevación o bordes para agrupar contenido y acciones.",
    modifiers: ["elevated", "outlined", "filled", "padding=16"],
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/90 rounded-2xl border border-neutral-800">
        <div className="p-3 rounded-2xl bg-neutral-800 border border-neutral-700/80 shadow-lg space-y-1.5">
          <div className="font-bold text-xs text-white">Título de Tarjeta</div>
          <div className="text-[11px] text-neutral-400 line-clamp-1">
            Descripción del contenido con estilo M3...
          </div>
          <div className="pt-1 flex justify-end">
            <span className="text-[10px] font-semibold text-purple-400 flex items-center gap-1">
              Ver Detalles <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "split",
    name: "split (left/right)",
    category: "Layout",
    icon: Columns2,
    color: "from-emerald-500 to-teal-500",
    snippet: `split\n  left\n    text "Navegación" title\n    listitem "Dashboard" icon=layout\n    listitem "Ajustes" icon=settings\n  right\n    card\n      text "Panel Principal" title`,
    description: "Diseño dividido responsivo: barra lateral a la izquierda y panel de trabajo a la derecha.",
    modifiers: ["left", "right", "sidebar", "gap=16"],
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/90 rounded-2xl border border-neutral-800">
        <div className="flex h-16 rounded-xl border border-neutral-700 overflow-hidden text-[10px]">
          <div className="w-1/3 bg-neutral-800 p-2 border-r border-neutral-700 space-y-1">
            <div className="w-8 h-1.5 bg-purple-400 rounded-full" />
            <div className="flex items-center gap-1 text-neutral-300">
              <Folder className="w-2.5 h-2.5 text-purple-400" />
              <span>Menú</span>
            </div>
          </div>
          <div className="flex-1 bg-neutral-950 p-2 flex flex-col justify-center items-center text-neutral-400">
            <div className="w-16 h-2 bg-neutral-800 rounded mb-1" />
            <span className="text-[9px]">Área de contenido</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "grid",
    name: "grid cols=3",
    category: "Layout",
    icon: LayoutGrid,
    color: "from-indigo-500 to-purple-500",
    snippet: `grid cols=3 gap=16\n  metric label="Ventas" value="$12,450" delta="+18%" icon=dollar-sign\n  metric label="Usuarios" value="1,200" delta="+5%" icon=users\n  metric label="Salud" value="99.9%" delta="OK" icon=check-circle`,
    description: "Matriz adaptable de columnas para tableros, indicadores KPI y listados dinámicos.",
    modifiers: ["cols=1|2|3|4", "gap=8|16|24"],
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/90 rounded-2xl border border-neutral-800">
        <div className="grid grid-cols-3 gap-1.5 text-center">
          <div className="p-1.5 bg-neutral-800/80 rounded-xl border border-neutral-700/60">
            <DollarSign className="w-3 h-3 text-emerald-400 mx-auto" />
            <div className="text-[10px] font-bold text-white mt-0.5">$12K</div>
            <div className="text-[8px] text-emerald-400 font-semibold">+18%</div>
          </div>
          <div className="p-1.5 bg-neutral-800/80 rounded-xl border border-neutral-700/60">
            <Users className="w-3 h-3 text-purple-400 mx-auto" />
            <div className="text-[10px] font-bold text-white mt-0.5">1.2K</div>
            <div className="text-[8px] text-purple-400 font-semibold">+5%</div>
          </div>
          <div className="p-1.5 bg-neutral-800/80 rounded-xl border border-neutral-700/60">
            <CheckCircle2 className="w-3 h-3 text-sky-400 mx-auto" />
            <div className="text-[10px] font-bold text-white mt-0.5">99.9%</div>
            <div className="text-[8px] text-sky-400 font-semibold">OK</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "wizard",
    name: "wizard (steps)",
    category: "Flujo",
    icon: Milestone,
    color: "from-fuchsia-500 to-pink-500",
    snippet: `@NuevoWizard:wizard\n  steps: 3\n\n  step "Paso 1: Inicio"\n    text "Bienvenido al proceso" title\n    button "Continuar" filled goto=@NuevoWizard(step=2)\n\n  step "Paso 2: Datos"\n    textfield nombre label="Nombre Completo"\n    button "Finalizar" filled goto=@NuevoWizard(step=3)`,
    description: "Flujo paso a paso con indicador interactivo de progreso y navegación entre pasos.",
    modifiers: ["steps: N", "step \"...\"", "goto=@Wizard(step=N)"],
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/90 rounded-2xl border border-neutral-800">
        <div className="flex items-center justify-between px-2 py-1 text-[10px]">
          <div className="flex items-center gap-1 text-purple-400 font-bold">
            <span className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[9px]">1</span>
            <span>Inicio</span>
          </div>
          <div className="flex-1 h-0.5 bg-neutral-700 mx-2" />
          <div className="flex items-center gap-1 text-neutral-500">
            <span className="w-4 h-4 rounded-full bg-neutral-800 text-neutral-400 flex items-center justify-center text-[9px]">2</span>
            <span>Datos</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "chips-switch",
    name: "chips / switch",
    category: "Control",
    icon: ToggleRight,
    color: "from-rose-500 to-amber-500",
    snippet: `row spacing=8\n  chip "Filtro Activo" selected=true icon=check\n  chip "Pendiente" icon=tag\nswitch activar label="Habilitar notificaciones" checked=true`,
    description: "Selectores tipo chip con estado seleccionado e interruptores tipo switch interactivos.",
    modifiers: ["selected=true", "checked=true", "label=\"...\"", "icon=check"],
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/90 rounded-2xl border border-neutral-800 space-y-2">
        <div className="flex items-center gap-1.5">
          <span className="px-2 py-1 rounded-lg bg-purple-600 text-white text-[10px] font-semibold flex items-center gap-1">
            <Check className="w-3 h-3" /> Filtro Activo
          </span>
          <span className="px-2 py-1 rounded-lg bg-neutral-800 text-neutral-300 text-[10px] border border-neutral-700">
            Pendiente
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-neutral-300 pt-1">
          <span className="text-[11px]">Habilitar servicio</span>
          <div className="w-8 h-4 bg-purple-600 rounded-full p-0.5 flex justify-end">
            <div className="w-3 h-3 bg-white rounded-full shadow-xs" />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "metric",
    name: "metric KPI",
    category: "Datos",
    icon: TrendingUp,
    color: "from-green-500 to-emerald-500",
    snippet: `metric label="Ingresos Mensuales" value="$48,250" delta="+24.5%" icon=dollar-sign`,
    description: "Tarjeta de analíticas e indicador clave KPI con número destacado, etiqueta y tasa.",
    modifiers: ["label=\"...\"", "value=\"...\"", "delta=\"+X%\"", "icon=dollar-sign"],
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/90 rounded-2xl border border-neutral-800">
        <div className="p-2.5 rounded-xl bg-neutral-800 border border-neutral-700/60 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-neutral-400 font-medium">Ingresos Mensuales</div>
            <div className="text-sm font-bold text-white mt-0.5">$48,250</div>
          </div>
          <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 text-[10px] font-bold border border-emerald-800/60">
            +24.5%
          </span>
        </div>
      </div>
    ),
  },
  {
    id: "select",
    name: "select",
    category: "Entrada",
    icon: ListFilter,
    color: "from-sky-500 to-blue-500",
    snippet: `select categoria label="Categoría de Proyecto" value="Diseño UI"\n  option "Diseño UI"\n  option "Desarrollo Frontend"\n  option "Backend & Cloud"`,
    description: "Menú desplegable de selección única con etiqueta M3 y lista de opciones.",
    modifiers: ["label=\"...\"", "value=\"...\"", "option \"...\""],
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/90 rounded-2xl border border-neutral-800">
        <div className="border border-neutral-700 rounded-xl px-3 py-1.5 bg-neutral-800 flex items-center justify-between text-xs text-neutral-200">
          <div>
            <div className="text-[9px] text-purple-400">Categoría</div>
            <div className="font-semibold text-[11px]">Diseño UI</div>
          </div>
          <ListFilter className="w-3.5 h-3.5 text-neutral-400" />
        </div>
      </div>
    ),
  },
  {
    id: "accordion",
    name: "accordion",
    category: "Estructura",
    icon: ChevronDown,
    color: "from-amber-500 to-yellow-500",
    snippet: `accordion "Datos Fiscales (Opcional)" expanded=false icon=file-text\n  textfield rfc label="RFC / Tax ID"\n  textfield razon label="Razón Social"`,
    description: "Contenedor colapsable / panel de expansión con encabezado y chevron para formularios o FAQs.",
    modifiers: ["expanded=false", "expanded=true", "icon=file-text", "variant=outlined|elevated|filled"],
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/90 rounded-2xl border border-neutral-800">
        <div className="rounded-xl border border-neutral-700 bg-neutral-800/80 p-2.5 flex items-center justify-between text-xs text-neutral-200">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="font-semibold text-[11px]">Datos Fiscales (Opcional)</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
        </div>
      </div>
    ),
  },
  {
    id: "fab",
    name: "fab",
    category: "Control",
    icon: Plus,
    color: "from-purple-600 to-pink-600",
    snippet: `fab "Nueva Venta" icon=plus extended=true goto=@NuevaVentaModal`,
    description: "Botón de acción flotante (Floating Action Button) Material 3 para la acción primaria.",
    modifiers: ["extended=true", "extended=false", "icon=plus", "goto=@Screen", "variant=primary|secondary|surface"],
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/90 rounded-2xl border border-neutral-800 flex justify-end">
        <div className="px-3 py-1.5 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-purple-600/40">
          <Plus className="w-3.5 h-3.5" />
          <span>Nueva Venta</span>
        </div>
      </div>
    ),
  },
  {
    id: "snackbar",
    name: "snackbar",
    category: "Control",
    icon: BellRing,
    color: "from-emerald-500 to-teal-500",
    snippet: `snackbar "Factura #1024 enviada por correo" action="Deshacer" icon=check-circle-2 type=success`,
    description: "Mensaje flotante de feedback temporal o permanente post-acción con botón de acción opcional.",
    modifiers: ["action=\"...\"", "icon=check-circle-2", "type=info|success|warning|error", "goto=@Screen"],
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/90 rounded-2xl border border-neutral-800">
        <div className="p-2 rounded-xl bg-neutral-950 border border-neutral-700/80 flex items-center justify-between text-xs text-white">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-[10px] text-neutral-300">Factura #1024 enviada</span>
          </div>
          <span className="text-[10px] font-bold text-purple-400 uppercase">Deshacer</span>
        </div>
      </div>
    ),
  },
  {
    id: "breadcrumbs",
    name: "breadcrumbs",
    category: "Layout",
    icon: Navigation,
    color: "from-blue-500 to-indigo-500",
    snippet: `breadcrumbs items=["Clientes", "Acme Corporation", "Facturas"] separator=chevron`,
    description: "Línea de navegación jerárquica con separadores para SaaS y jerarquías profundas.",
    modifiers: ["items=[\"...\", \"...\"]", "separator=chevron|slash"],
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/90 rounded-2xl border border-neutral-800">
        <div className="flex items-center gap-1.5 text-[10px] text-neutral-400">
          <span className="hover:underline">Clientes</span>
          <span className="text-neutral-600">&gt;</span>
          <span className="hover:underline">Acme Corp</span>
          <span className="text-neutral-600">&gt;</span>
          <span className="font-bold text-purple-300">Facturas</span>
        </div>
      </div>
    ),
  },
  {
    id: "rating",
    name: "rating",
    category: "Entrada",
    icon: Star,
    color: "from-amber-400 to-orange-500",
    snippet: `rating satisfaccion label="Califica tu experiencia" value=4 max=5 readonly=false`,
    description: "Selector de 1 a 5 estrellas interactivo para evaluaciones de satisfacción CSAT y reseñas.",
    modifiers: ["label=\"...\"", "value=4", "max=5", "readonly=false|true", "size=sm|md|lg"],
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/90 rounded-2xl border border-neutral-800 space-y-1">
        <div className="text-[9px] text-neutral-400 uppercase font-semibold">Calificación</div>
        <div className="flex items-center gap-1 text-amber-400">
          <Star className="w-3 h-3 fill-amber-400" />
          <Star className="w-3 h-3 fill-amber-400" />
          <Star className="w-3 h-3 fill-amber-400" />
          <Star className="w-3 h-3 fill-amber-400" />
          <Star className="w-3 h-3 text-neutral-600" />
          <span className="text-[10px] font-bold text-neutral-300 ml-1">4/5</span>
        </div>
      </div>
    ),
  },
  {
    id: "table",
    name: "table",
    category: "Datos",
    icon: TableIcon,
    color: "from-teal-500 to-emerald-600",
    snippet: `table title="Servicios y Responsables" columns=["ID:code", "Responsable:avatar", "Progreso:progress", "Estado:status", "Acciones:action", "Opciones:dropdown"] striped=true searchable=true\n  row ["#101", "Javier Diaz", "92%", "Activo", "Configurar", ""]\n  row ["#102", "Elena Gomez", "45%", "Pendiente", "Configurar", ""]\n  row ["#103", "Carlos Vera", "100%", "Activo", "Configurar", ""]`,
    description: "Tabla interactiva de datos con tipos de columnas enriquecidas (code, avatar, progress, status, action, dropdown, currency, date, checkbox) con búsqueda y paginación.",
    modifiers: [
      "columns=[\"ID:code\", \"Usuario:avatar\", \"Progreso:progress\", \"Estado:status\", \"Acción:action\", \"Opciones:dropdown\"]",
      "striped=true",
      "searchable=true",
      "pageSize=5",
      "bordered=true",
      "compact=true"
    ],
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/90 rounded-2xl border border-neutral-800 space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-bold text-neutral-200">
          <span>Servicios y Responsables</span>
          <span className="text-[9px] font-normal text-emerald-400">columnas tipadas</span>
        </div>
        <div className="rounded-lg border border-neutral-700/60 overflow-hidden text-[9px]">
          <div className="bg-neutral-800/90 px-2 py-1 flex justify-between font-semibold text-neutral-300 border-b border-neutral-700/60">
            <span>ID:code</span>
            <span>Usuario:avatar</span>
            <span>Estado:status</span>
            <span>Progreso:progress</span>
          </div>
          <div className="px-2 py-1 flex items-center justify-between text-neutral-400 bg-neutral-950/40">
            <span className="font-mono text-purple-400 text-[8px]">#101</span>
            <span className="text-[8px] text-neutral-200 font-medium">Javier D.</span>
            <span className="text-emerald-400 text-[8px] font-semibold">Activo</span>
            <span className="text-[8px] text-indigo-400 font-mono">92%</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "tabs",
    name: "tabs",
    category: "Layout",
    icon: FolderKanban,
    color: "from-indigo-500 to-purple-600",
    snippet: `tabs items=["General", "Seguridad", "Facturación"]\n  tab "General"\n    card\n      text "Configuración General" title\n  tab "Seguridad"\n    card\n      text "Ajustes de Seguridad" title\n  tab "Facturación"\n    card\n      text "Historial de Pagos" title`,
    description: "Pestañas / Tabuladores interactivos con paneles de contenido por sección.",
    modifiers: ["items=[\"...\", \"...\"]", "tab \"...\"", "active=0"],
    renderPreview: () => (
      <div className="p-3 bg-neutral-900/90 rounded-2xl border border-neutral-800 space-y-2">
        <div className="flex border-b border-neutral-700 text-[10px] gap-2 pb-1">
          <span className="text-purple-400 font-bold border-b border-purple-400 pb-0.5">General</span>
          <span className="text-neutral-500">Seguridad</span>
          <span className="text-neutral-500">Facturación</span>
        </div>
        <div className="p-2 rounded-lg bg-neutral-800/60 border border-neutral-700/40 text-[9px] text-neutral-300">
          Contenido de la pestaña activa...
        </div>
      </div>
    ),
  },
];

interface ToolbarSnippetButtonProps {
  item: ToolbarSnippetItem;
  onInsert: (snippet: string) => void;
}

export const ToolbarSnippetButton: React.FC<ToolbarSnippetButtonProps> = ({
  item,
  onInsert,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = item.icon;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 100);
  };

  return (
    <div
      className="relative inline-block shrink-0"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onInsert(item.snippet)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-700/60 hover:border-purple-500/60 transition-all shrink-0 cursor-pointer font-medium text-[11px] shadow-xs group"
        title={`Insertar ${item.name}`}
      >
        <span
          className={`w-4 h-4 rounded-md bg-gradient-to-tr ${item.color} text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform`}
        >
          <Icon className="w-2.5 h-2.5" />
        </span>
        <span className="font-mono text-[11px]">+{item.name}</span>
      </button>

      {/* Expansive Rich Preview Popover on Hover */}
      {isHovered && (
        <div
          className="absolute left-0 top-full mt-2 w-84 bg-[#181622]/98 backdrop-blur-xl border border-neutral-700/80 rounded-3xl p-3.5 shadow-2xl z-50 text-left pointer-events-none animate-in fade-in zoom-in-95 duration-150"
          style={{ minWidth: "320px" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-lg bg-gradient-to-tr ${item.color} text-white flex items-center justify-center shadow-md`}
              >
                <Icon className="w-3.5 h-3.5" />
              </span>
              <div>
                <span className="font-mono font-bold text-neutral-100 text-xs">
                  {item.name}
                </span>
                <span className="block text-[10px] text-neutral-400">
                  {item.category}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/80 uppercase tracking-wider">
              Material 3
            </span>
          </div>

          {/* Description */}
          <p className="text-[11px] text-neutral-300 my-2 leading-relaxed">
            {item.description}
          </p>

          {/* Live Visual Representation */}
          <div className="my-2">
            <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <span>Representación visual:</span>
            </div>
            {item.renderPreview()}
          </div>

          {/* Syntax Code Example */}
          <div className="mt-2 bg-[#0C0B10] p-2 rounded-xl border border-neutral-800/80 font-mono text-[10px] text-neutral-300 overflow-x-auto whitespace-pre no-scrollbar">
            <div className="text-[9px] text-purple-400 font-bold uppercase tracking-wider mb-1">
              Sintaxis Wisp:
            </div>
            <code>{item.snippet}</code>
          </div>

          {/* Modifiers tags */}
          <div className="mt-2 pt-2 border-t border-neutral-800/80 flex flex-wrap gap-1 items-center">
            <span className="text-[9px] text-neutral-500 uppercase font-semibold mr-1">
              Atributos:
            </span>
            {item.modifiers.slice(0, 4).map((mod, idx) => (
              <span
                key={idx}
                className="text-[9px] px-1.5 py-0.5 rounded-md bg-neutral-800 text-neutral-300 font-mono"
              >
                {mod}
              </span>
            ))}
          </div>

          {/* Footer Callout */}
          <div className="mt-2 text-center text-[10px] text-purple-300/80 font-medium italic">
            Haz clic para insertar en la posición del cursor
          </div>
        </div>
      )}
    </div>
  );
};
