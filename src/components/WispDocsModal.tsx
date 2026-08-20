import React, { useState, useMemo } from "react";
import {
  X,
  Bot,
  Copy,
  Check,
  FileCode,
  Sparkles,
  Layers,
  Search,
  BookOpen,
  Terminal,
  Code2,
  ListFilter,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { WispLogo } from "./WispLogo";
import { highlightWispLine } from "../wisp/highlighter";
import { WISP_DOCS_DATABASE } from "../wisp/docs";

interface WispDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToAICopilot?: (prompt: string) => void;
}

// Complete Formal WDL EBNF & Syntax Specification for Tab 2
const FORMAL_WDL_SPECIFICATION = `# WDL (Wisp Design Language) — Formal Grammar & Specification

## 1. Gramática Formal EBNF (Extended Backus-Naur Form)

\`\`\`ebnf
Document        ::= { TopLevelDeclaration | BlankLine | Comment }
TopLevelDeclaration ::= ScreenDeclaration | SnackbarDeclaration

ScreenDeclaration   ::= "@" Identifier ":" ScreenType "\\n" { IndentedBlock }
ScreenType          ::= "screen" | "form" | "dialog" | "wizard" | "sheet"

SnackbarDeclaration ::= "@" Identifier ":" "snackbar" [ StringLiteral ] { Attribute } "\\n"

IndentedBlock       ::= "  " ( ComponentStatement | ControlStatement | Comment | BlankLine )

ComponentStatement  ::= ComponentName [ Identifier | StringLiteral ] { Modifier } { Attribute } [ "\\n" { NestedBlock } ]
NestedBlock         ::= Indentation ( ComponentStatement | NestedBlockItem )

NestedBlockItem     ::= OptionStatement | StepStatement | RowStatement | LeftRightBlock

OptionStatement     ::= "option" StringLiteral [ "icon=" Identifier ] [ "badge=" StringLiteral ]
StepStatement       ::= "step" StringLiteral "\\n" { IndentedBlock }
RowStatement        ::= ( "row" ArrayLiteral | PipeTableRow )
LeftRightBlock      ::= ( "left" | "right" ) "\\n" { IndentedBlock }

ComponentName       ::= "appbar" | "breadcrumbs" | "tabs" | "accordion" | "wizard" | "card" 
                      | "split" | "grid" | "row" | "column" | "divider" | "spacer"
                      | "textfield" | "textarea" | "select" | "autocomplete" | "datepicker"
                      | "checkbox" | "radio" | "switch" | "slider" | "rating" | "searchbar"
                      | "button" | "fab" | "segmentedbutton" | "chip"
                      | "metric" | "table" | "listitem" | "progress" | "avatar" | "badge" | "tag"
                      | "alert" | "snackbar" | "text" | "image" | "icon"

Modifier            ::= "elevated" | "outlined" | "filled" | "tonal" | "text"
                      | "display" | "headline" | "title" | "body" | "label" | "caption"
                      | "bold" | "striped" | "searchable" | "bordered" | "compact"
                      | "extended" | "expanded"

Attribute           ::= AttrName "=" ( StringLiteral | NumberLiteral | BooleanLiteral | ArrayLiteral | TargetRef )
AttrName            ::= [a-zA-Z0-9_-]+
TargetRef           ::= "@" Identifier [ "(" "step=" Integer ")" ] | "back" | "close"

ArrayLiteral        ::= "[" [ StringLiteral { "," StringLiteral } ] "]"
StringLiteral       ::= '"' { Character } '"'
NumberLiteral       ::= [0-9]+ [ "." [0-9]+ ] [ "%" ]
BooleanLiteral      ::= "true" | "false"
\`\`\`

## 2. Reglas Léxicas y de Tipado
- **Indentación**: Estrictamente **2 espacios** por nivel. No se permiten tabuladores tab (\`\\t\`).
- **Comentarios**: Tanto líneas con \`//\` como con \`#\` son ignoradas por el parser.
- **Tipos de Columnas en Tablas**: 
  - \`:code\` (código monoespaciado)
  - \`:avatar\` (iniciales / círculo)
  - \`:progress\` (barra de progreso porcentual)
  - \`:status\` (badge de estado verde/ámbar/rojo)
  - \`:currency\` (monto monetario formateado)
  - \`:date\` (fecha legible)
  - \`:checkbox\` (control booleano interactivo)
  - \`:link\` (hipervínculo interactivo)
  - \`:action\` (botón de acción rápida)
  - \`:dropdown\` (menú de 3 puntos)
  - \`:rating\` (estrellas de calificación)`;

// Comprehensive AI System Prompt with full component schema, params, and table column types
const AI_SYSTEM_PROMPT_COMPREHENSIVE = `# WDL (WISP DESIGN LANGUAGE) — MASTER AI SPECIFICATION

You are the Lead UI Architect and Code Synthesizer for **Wisp UI Studio**. Your task is to output interface prototypes EXCLUSIVELY in **WDL** (Wisp Design Language) adhering to **Google Material 3 Expressive**.

## 1. CORE SYNTAX & FORMATTING RULES
1. **NO HTML/JSX/XML or curly braces \`{}\`**. Output pure WDL code only.
2. **Indentation**: Exactly **2 spaces** per hierarchy level (no tabs).
3. **Strings**: Any text containing spaces MUST be in double quotes (e.g. \`text "Mi Título" title\`, \`label="Correo Electrónico"\`).
4. **Booleans & Numbers**: Unquoted (e.g. \`checked=true\`, \`cols=3\`, \`gap=16\`, \`padding=20\`, \`rows=3\`).
5. **Top-Level Declarations**: Every screen or dialog starts at root (0 spaces):
   - \`@ScreenName:screen\` — Full application viewport.
   - \`@FormName:form\` — Dedicated structured data entry view.
   - \`@ModalName:dialog\` — Centered modal popup with backdrop.
   - \`@WizardName:wizard\` — Step-by-step interactive assistant.
   - \`@SheetName:sheet\` — Mobile-friendly bottom sheet.
   - \`@ToastName:snackbar "Mensaje..." snackbar-type=success\` — Standalone reusable toast.

---

## 2. NAVIGATION & DIRECTIVES
- \`goto=@ScreenName\` : Navigates to target screen.
- \`goto=@WizardName(step=N)\` : Navigates directly to step N of a wizard.
- \`modal=@DialogName\` : Opens a modal dialog.
- \`goto=back\` : Returns to previous screen.
- \`goto=close\` : Dismisses the active dialog or bottom sheet.
- \`snackbar="Mensaje"\` : Displays a Material 3 snackbar toast on click.
- \`snackbar-action="Texto"\` : Button inside the snackbar.
- \`snackbar-type=success|info|warning|error\` : Snack color palette.

---

## 3. EXHAUSTIVE COMPONENT REFERENCE (+35 COMPONENTS)

### A. Surface & Layout Containers
- \`card [elevated | outlined | filled] [padding=12|16|20|24]\`
- \`split\` : Creates 2-panel master-detail layout:
  \`\`\`wdl
  split
    left
      listitem "Menú 1" icon=home goto=@Home
      listitem "Menú 2" icon=settings goto=@Settings
    right
      card elevated
        text "Área de Trabajo" headline
  \`\`\`
- \`grid [cols=1|2|3|4|5|6] [gap=8|12|16|20|24]\`
- \`row [spacing=8|12|16|24] [align=start|center|end|stretch] [justify=start|center|end|between|around|evenly] [wrap=true|false]\`
- \`column [spacing=8|12|16|24] [align=start|center|end|stretch]\`
- \`divider\`
- \`spacer [height=8|16|24|32]\`

### B. Navigation & Structure
- \`appbar "Título" [subtitle="..."] [icon=<lucide-icon>] [actionIcon=<lucide-icon>] [goto=@Screen|back]\`
- \`breadcrumbs items=["Nivel 1", "Nivel 2", "Actual"] [separator=chevron|slash]\`
- \`tabs items=["Pestaña 1", "Pestaña 2", "Pestaña 3"]\`
- \`accordion "Título" [expanded=true|false] [icon=<icon>] [badge="..."]\`
- \`wizard\` : Wizard container with nested \`step "Título":\`
  \`\`\`wdl
  @AltaUsuario:wizard
    steps: 3
    step "1. Perfil"
      card elevated
        textfield nombre label="Nombre" icon=user
        button "Siguiente" filled goto=@AltaUsuario(step=2)
    step "2. Rol"
      card elevated
        segmentedbutton options=["Admin", "Editor", "Lector"] selected="Editor"
        row spacing=12
          button "Atrás" text goto=@AltaUsuario(step=1)
          button "Continuar" filled goto=@AltaUsuario(step=3)
    step "3. Confirmar"
      alert "Listo para crear cuenta" type=success
      button "Crear Usuario" filled goto=@Dashboard snackbar="Usuario creado"
  \`\`\`

### C. Inputs & Form Controls
- \`textfield <id> label="..." [placeholder="..."] [type=text|email|password|number] [icon=<icon>] [helper="..."] [required=true|false] [value="..."] [disabled=true|false]\`
- \`textarea <id> label="..." [rows=2|3|4|5] [placeholder="..."] [helper="..."] [required=true|false]\`
- \`select <id> label="..." [value="..."]\` with nested \`option "Nombre" [icon=<icon>]\`
- \`autocomplete <id> label="..." [placeholder="..."]\` with nested \`option "Nombre"\`
- \`datepicker <id> label="..." [value="YYYY-MM-DD"] [placeholder="..."]\`
- \`checkbox <id> label="..." [checked=true|false] [disabled=true|false]\`
- \`radio <id> label="..." group="..." [checked=true|false]\`
- \`switch <id> label="..." [checked=true|false] [disabled=true|false]\`
- \`slider <id> label="..." [min=0] [max=100] [value=50] [step=1]\`
- \`rating <id> label="..." [value=4] [max=5]\`
- \`searchbar [placeholder="Buscar..."] [icon=search]\`

### D. Actions & Buttons
- \`button "Texto" [filled | tonal | outlined | elevated | text] [icon=<icon>] [goto=@Screen] [snackbar="..."] [disabled=true|false]\`
- \`fab "Texto" [icon=<icon>] [extended=true|false] [goto=@Screen]\`
- \`segmentedbutton options=["Opción A", "Opción B", "Opción C"] [selected="Opción A"]\`
- \`chip "Texto" [icon=<icon>] [selected=true|false]\`

### E. Data & Tables
- \`table [title="..."] columns=["Col1:tipo", "Col2:tipo", ...] [striped=true|false] [searchable=true|false] [pageSize=5|10|20]\`
  - Column Types:
    * \`:code\` -> Monospace pill
    * \`:avatar\` -> Name with initial badge
    * \`:progress\` -> Progress bar (value e.g. "75%")
    * \`:status\` -> Color-coded status badge ("Activo", "Pendiente", "Error", "Cancelado")
    * \`:currency\` -> Formatted price e.g. "$1,250.00"
    * \`:date\` -> Formatted date
    * \`:action\` -> Clickable button e.g. "Editar", "Ver"
    * \`:dropdown\` -> 3-dots kebab menu
    * \`:checkbox\` -> Interactive selection
    * \`:rating\` -> Star rating (1-5)
  - Row declaration:
    \`row ["#101", "Javier Díaz", "85%", "$3,400.00", "Activo", "Editar", ""]\`
    or markdown pipes: \`| #102 | Ana Soto | 40% | $850.00 | Pendiente | Ver | |\`
- \`metric label="..." value="..." [delta="+12%"] [icon=<icon>]\` (or \`stat\`)
- \`listitem "Título" [subtitle="..."] [icon=<icon>] [badge="..."] [goto=@Screen]\`
- \`progress [value=0..100] [label="..."]\`
- \`avatar [name="Nombre"] [src="url"] [size=small|medium|large]\`
- \`badge [value="..."] [color=primary|error|warning|success]\`
- \`tag "Texto" [color=primary|secondary|error|warning|info|success]\`

### F. Typography & Feedback
- \`text "Mensaje" [display | headline | title | body | label | caption] [bold=true] [color=primary|secondary|tertiary|error|warning|success|muted]\`
- \`alert "Mensaje" [title="..."] [type=info|success|warning|error]\`
- \`image [src="url"] [alt="..."] [height=200]\`
- \`icon <lucide-name> [size=16|20|24|32] [color=primary|...]\`

---

## 4. EXAMPLE COMPLETE SCREEN GENERATION

\`\`\`wdl
@Facturacion:screen
  appbar "Facturación Express" icon=receipt-text goto=@Dashboard
  breadcrumbs items=["Inicio", "Finanzas", "Nueva Factura"]

  grid cols=3 gap=16
    metric label="Facturado Este Mes" value="$38,900" delta="+18%" icon=dollar-sign
    metric label="Facturas Emitidas" value="142" delta="+9%" icon=file-text
    metric label="Pendientes de Pago" value="12" delta="Requiere Atención" icon=clock

  card elevated padding=20
    text "Emitir Nueva Factura Fiscal" headline color=primary
    text "Completa la información del receptor y concepto" body color=muted

    grid cols=2 gap=16
      textfield rfc label="RFC / Tax ID" placeholder="XAXX010101000" icon=building required=true
      textfield razon label="Razón Social" placeholder="Empresa S.A. de C.V." icon=user required=true

    grid cols=2 gap=16
      textfield email label="Correo de Envío" type=email placeholder="facturacion@cliente.com" icon=mail required=true
      autocomplete regimen label="Régimen Fiscal" placeholder="Buscar régimen..."
        option "601 - General de Ley Personas Morales"
        option "612 - Personas Físicas con Actividades Empresariales"
        option "626 - Régimen Simplificado de Confianza (RESICO)"

    datepicker fechaEmision label="Fecha de Emisión"
    textarea concepto label="Descripción del Servicio" rows=2 placeholder="Servicios de consultoría y desarrollo..."

    text "Forma de Pago:" label bold
    row spacing=16
      radio spei label="Transferencia Electrónica (SPEI)" group="pago" checked=true
      radio tarjeta label="Tarjeta Corporativa" group="pago"

    row spacing=12
      chip "Desglose IVA (16%)" selected=true
      chip "Retención ISR"
      switch timbradoAutomatico label="Timbrado SAT Automático" checked=true

    accordion "Archivos Adjuntos & Opciones Avanzadas" expanded=false icon=paperclip
      textfield ordenCompra label="Orden de Compra (PO)" placeholder="PO-2026-089"
      checkbox enviarCopia label="Enviar copia oculta al contador" checked=true

    row spacing=12
      button "Emitir Factura" filled icon=send snackbar="Factura emitida exitosamente" goto=@Dashboard
      button "Guardar Borrador" tonal icon=save snackbar="Borrador guardado en la nube"
      button "Cancelar" text goto=back
\`\`\``;

export const WispDocsModal: React.FC<WispDocsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"syntax" | "spec" | "ai">("syntax");
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const docEntries = useMemo(() => {
    return Object.values(WISP_DOCS_DATABASE);
  }, []);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    docEntries.forEach((entry) => cats.add(entry.category));
    return ["all", ...Array.from(cats)];
  }, [docEntries]);

  const filteredDocEntries = useMemo(() => {
    return docEntries.filter((entry) => {
      const matchesSearch =
        entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.signature.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || entry.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [docEntries, searchQuery, selectedCategory]);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-5xl bg-white dark:bg-[#13111C] rounded-3xl p-5 sm:p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-4 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800/90 pb-3.5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0B0914] border border-purple-800/50 p-1 flex items-center justify-center shadow-md shadow-purple-950/40 ring-1 ring-purple-500/20">
              <WispLogo size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <span>Documentación & Especificación WDL</span>
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
                  Wisp UI Studio
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Guía interactiva de componentes con colores del editor, especificación formal EBNF y System Prompt AI.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-800 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Streamlined Tabs Navigation */}
        <div className="flex gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-900/90 rounded-2xl shrink-0 select-none border border-neutral-200/60 dark:border-neutral-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("syntax")}
            className={`flex-1 py-2 px-3 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "syntax"
                ? "bg-white dark:bg-neutral-800 shadow-xs text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/40 font-bold"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-purple-500" />
            <span>Guía de Sintaxis (+35 Componentes)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("spec")}
            className={`flex-1 py-2 px-3 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "spec"
                ? "bg-white dark:bg-neutral-800 shadow-xs text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/40 font-bold"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Especificación Formal WDL</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ai")}
            className={`flex-1 py-2 px-3 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "ai"
                ? "bg-white dark:bg-neutral-800 shadow-xs text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/40 font-bold"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-pink-400" />
            <span>Prompt Completo para LLM</span>
          </button>
        </div>

        {/* TAB 1: Complete Interactive Syntax Guide with Editor Colors */}
        {activeTab === "syntax" && (
          <div className="flex-1 overflow-hidden flex flex-col space-y-3">
            {/* Search & Category Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-2 items-center justify-between shrink-0">
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Buscar componente, parámetro o modificador..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto no-scrollbar pb-1 sm:pb-0">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-purple-600 text-white font-bold"
                        : "bg-neutral-100 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
                    }`}
                  >
                    {cat === "all" ? "Todos (+35)" : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Component Cards Grid */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 no-scrollbar">
              {filteredDocEntries.map((doc) => (
                <div
                  key={doc.name}
                  className="p-4 rounded-2xl bg-neutral-50/80 dark:bg-[#171522] border border-neutral-200/80 dark:border-neutral-800 space-y-3 transition-all hover:border-purple-300 dark:hover:border-purple-800/70"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-cyan-400 dark:text-cyan-300 bg-cyan-950/40 px-2.5 py-0.5 rounded-lg border border-cyan-800/40">
                        {doc.name}
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                        {doc.category}
                      </span>
                    </div>

                    <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                      {doc.summary}
                    </span>
                  </div>

                  {/* Signature Code Block with Live Syntax Highlighting (Editor colors) */}
                  <div className="relative group">
                    <div className="p-3 bg-[#0C0A14] text-neutral-100 rounded-xl font-mono text-xs overflow-x-auto border border-neutral-800/90 leading-relaxed shadow-inner">
                      {highlightWispLine(doc.signature)}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(doc.signature, `sig-${doc.name}`)}
                      className="absolute right-2 top-2 p-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer text-[10px] flex items-center gap-1"
                      title="Copiar firma"
                    >
                      {copiedText === `sig-${doc.name}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Modifiers and Parameters breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                    {doc.modifiers && doc.modifiers.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-white/60 dark:bg-[#110F1A] border border-neutral-200/60 dark:border-neutral-800/60 space-y-1.5">
                        <div className="font-bold text-teal-400 flex items-center gap-1">
                          <span>Modificadores:</span>
                        </div>
                        <div className="space-y-1">
                          {doc.modifiers.map((m) => (
                            <div key={m.name} className="flex items-start gap-1.5">
                              <code className="text-teal-300 font-mono font-semibold bg-teal-950/40 px-1.5 py-0.5 rounded text-[10px] border border-teal-800/40">
                                {m.name}
                              </code>
                              <span className="text-neutral-600 dark:text-neutral-400 leading-tight">
                                {m.description}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {doc.parameters && doc.parameters.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-white/60 dark:bg-[#110F1A] border border-neutral-200/60 dark:border-neutral-800/60 space-y-1.5">
                        <div className="font-bold text-sky-400 flex items-center gap-1">
                          <span>Parámetros & Atributos:</span>
                        </div>
                        <div className="space-y-1 max-h-32 overflow-y-auto no-scrollbar">
                          {doc.parameters.map((p) => (
                            <div key={p.name} className="flex items-start gap-1.5">
                              <code className="text-sky-300 font-mono font-semibold bg-sky-950/40 px-1.5 py-0.5 rounded text-[10px] border border-sky-800/40">
                                {p.name}
                              </code>
                              <span className="text-neutral-600 dark:text-neutral-400 leading-tight">
                                {p.description}{" "}
                                {p.values && (
                                  <span className="text-[10px] text-purple-400 font-mono">
                                    [{p.values.join("|")}]
                                  </span>
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Examples Code Block with Live Syntax Highlighting */}
                  {doc.examples && doc.examples.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                        Ejemplo de uso en WDL:
                      </div>
                      <div className="p-2.5 bg-[#0C0A14] text-neutral-100 rounded-xl font-mono text-[11px] overflow-x-auto border border-neutral-800/80 leading-relaxed shadow-inner">
                        {doc.examples.map((ex, i) => (
                          <div key={i} className="mb-2 last:mb-0">
                            {ex.split("\n").map((line, lIdx) => (
                              <div key={lIdx}>{highlightWispLine(line)}</div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: Formal WDL EBNF Specification */}
        {activeTab === "spec" && (
          <div className="flex-1 overflow-y-auto space-y-3 text-xs pr-1 no-scrollbar flex flex-col">
            <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-between gap-3 shrink-0">
              <div className="space-y-0.5">
                <p className="font-bold text-indigo-900 dark:text-indigo-200 text-xs flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-indigo-500" />
                  Especificación Formal EBNF & Gramática de WDL
                </p>
                <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300">
                  Estructura canónica de tokens, declaraciones raíz, componentes, bloques anidados y reglas de tipado.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(FORMAL_WDL_SPECIFICATION, "spec")}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer text-xs shrink-0"
              >
                {copiedText === "spec" ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar EBNF</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex-1 p-4 bg-[#0C0A14] text-indigo-200 font-mono text-[11px] rounded-2xl border border-neutral-800 overflow-y-auto whitespace-pre no-scrollbar leading-relaxed">
              {FORMAL_WDL_SPECIFICATION}
            </div>
          </div>
        )}

        {/* TAB 3: Comprehensive AI System Prompt Specification */}
        {activeTab === "ai" && (
          <div className="flex-1 overflow-y-auto space-y-3 text-xs pr-1 no-scrollbar flex flex-col">
            <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/80 flex items-center justify-between gap-3 shrink-0">
              <div className="space-y-0.5">
                <p className="font-bold text-purple-900 dark:text-purple-200 text-xs flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-purple-500" />
                  Prompt Maestro para LLMs (Claude, ChatGPT, Gemini, Cursor)
                </p>
                <p className="text-[11px] text-purple-800/80 dark:text-purple-300">
                  Instrucción exhaustiva con todos los componentes (+35), variantes, tipos de columnas de tabla y directivas de navegación.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(AI_SYSTEM_PROMPT_COMPREHENSIVE, "ai-full")}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer text-xs shrink-0"
              >
                {copiedText === "ai-full" ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Prompt Maestro</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex-1 p-4 bg-[#0C0A14] text-purple-200 font-mono text-[11px] rounded-2xl border border-neutral-800 overflow-y-auto whitespace-pre no-scrollbar leading-relaxed">
              {AI_SYSTEM_PROMPT_COMPREHENSIVE}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
