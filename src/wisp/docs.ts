/**
 * Comprehensive Wisp DSL Documentation and Hover Provider data
 * Designed for rich VS Code-style hover cards, parameter guides, types, examples, and modifier breakdowns.
 */

export interface WispDocParameter {
  name: string;
  type: string;
  default?: string;
  description: string;
  values?: string[];
}

export interface WispDocModifier {
  name: string;
  description: string;
}

export interface WispDocEntry {
  name: string;
  category: "Layout" | "Entradas" | "Superficie" | "Feedback & Estado" | "Navegación & Estructura" | "Datos & Tablas" | "Tipografía" | "Acción";
  signature: string;
  summary: string;
  description: string;
  modifiers?: WispDocModifier[];
  parameters?: WispDocParameter[];
  examples: string[];
  tips?: string[];
}

export const WISP_DOCS_DATABASE: Record<string, WispDocEntry> = {
  // --- LAYOUT & CONTAINERS ---
  card: {
    name: "card",
    category: "Superficie",
    signature: 'card [elevated | outlined | filled] [padding=16]',
    summary: "Superficie contenedora con esquinas redondeadas y elevación de Material 3.",
    description: "Agrupa bloques de contenido, controles de formulario, estadísticas o gráficos dentro de un panel con jerarquía visual clara.",
    modifiers: [
      { name: "elevated", description: "Superficie con sombra suave de elevación superficial (Predeterminado)." },
      { name: "outlined", description: "Superficie plana con borde fino de 1px sin sombra." },
      { name: "filled", description: "Superficie con color de relleno tonal de contenedor." },
    ],
    parameters: [
      { name: "padding", type: "number", default: "16", description: "Espaciado interno en píxeles (ej. padding=12, padding=20)" },
    ],
    examples: [
      'card elevated\n  text "Plan Profesional" title\n  text "$29 / mes" headline\n  button "Elegir Plan" filled',
      'card outlined padding=20\n  text "Información de Cuenta" title',
    ],
    tips: [
      "Puedes anidar cualquier elemento dentro de una tarjeta respetando la indentación de 2 espacios.",
    ],
  },

  row: {
    name: "row",
    category: "Layout",
    signature: 'row [spacing=12] [align=center] [justify=between|center|start|end] [wrap=true]',
    summary: "Contenedor horizontal flexible (Flexbox row) para alinear elementos lado a lado.",
    description: "Coloca sus hijos horizontalmente con control de espaciado (gap), alineación vertical y justificación transversal.",
    parameters: [
      { name: "spacing", type: "number", default: "12", description: "Espaciado (gap) horizontal en píxeles entre hijos (ej. 8, 12, 16, 24)" },
      { name: "align", type: "string", default: "center", description: "Alineación vertical", values: ["start", "center", "end", "stretch"] },
      { name: "justify", type: "string", default: "start", description: "Distribución horizontal", values: ["start", "center", "end", "between", "around", "evenly"] },
      { name: "wrap", type: "boolean", default: "false", description: "Permite que los elementos salten a la siguiente línea en móviles", values: ["true", "false"] },
    ],
    examples: [
      'row spacing=8\n  chip "Filtro 1" selected=true\n  chip "Filtro 2"',
      'row spacing=12 justify=between align=center\n  text "Total a Pagar" title\n  text "$1,450.00" headline',
    ],
  },

  column: {
    name: "column",
    category: "Layout",
    signature: 'column [spacing=12] [align=center|start|end]',
    summary: "Contenedor vertical flexible (Flexbox column) con espaciado uniforme entre hijos.",
    description: "Apila sus elementos verticalmente manteniendo márgenes constantes sin necesidad de añadir spacers manuales.",
    parameters: [
      { name: "spacing", type: "number", default: "12", description: "Espaciado vertical (gap) entre hijos en píxeles (ej. 8, 12, 16, 24)" },
      { name: "align", type: "string", default: "start", description: "Alineación horizontal de los hijos", values: ["start", "center", "end", "stretch"] },
    ],
    examples: [
      'column spacing=16\n  card elevated\n    text "Paso 1" title\n  card elevated\n    text "Paso 2" title',
    ],
  },

  grid: {
    name: "grid",
    category: "Layout",
    signature: 'grid [cols=2|3|4] [gap=16]',
    summary: "Matriz adaptable en cuadrícula para tableros KPI, catálogo de productos o paneles.",
    description: "Distribuye automáticamente las tarjetas e hijos en columnas uniformes con separación fluida y adaptación responsiva.",
    parameters: [
      { name: "cols", type: "number", default: "2", description: "Cantidad de columnas", values: ["1", "2", "3", "4", "5", "6"] },
      { name: "gap", type: "number", default: "16", description: "Espacio de separación entre celdas en píxeles (ej. 12, 16, 24)" },
    ],
    examples: [
      'grid cols=3 gap=16\n  stat label="Usuarios" value="1,240" icon=users\n  stat label="Ventas" value="$48,500" icon=dollar-sign\n  stat label="Activos" value="98.4%" icon=activity',
    ],
  },

  split: {
    name: "split",
    category: "Layout",
    signature: 'split\n  left\n    ...\n  right\n    ...',
    summary: "Diseño dividido en dos paneles: sidebar izquierdo y área de contenido derecho.",
    description: "Estructura pantallas maestras de escritorio/tableta con menú de navegación lateral y vista de detalle principal.",
    examples: [
      'split\n  left\n    text "Navegación" title\n    listitem "Dashboard" icon=layout\n    listitem "Ajustes" icon=settings\n  right\n    card elevated\n      text "Contenido Principal" title',
    ],
  },

  // --- INTERACTIVE CONTROLS ---
  button: {
    name: "button",
    category: "Acción",
    signature: 'button "Texto" [filled | outlined | tonal | elevated | text] [icon=...] [goto=@Pantalla] [snackbar="..."]',
    summary: "Botón interactivo estándar de Material 3 con soporte completo de variantes, íconos y navegación.",
    description: "Dispara acciones, formularios, transiciones animadas entre pantallas y notificaciones flotantes (Snackbars / Toasts).",
    modifiers: [
      { name: "filled", description: "Variante de alto énfasis con fondo de color primario sólido (Predeterminado)." },
      { name: "outlined", description: "Variante de énfasis medio con borde sutil de 1px y fondo transparente." },
      { name: "tonal", description: "Variante de superficie tenue con color secundario para acciones intermedias." },
      { name: "elevated", description: "Variante con sombra y relieve superficial sobre fondos claros." },
      { name: "text", description: "Variante plana sin marco ni fondo, ideal para cancelar o acciones terciarias." },
    ],
    parameters: [
      { name: "icon", type: "string", description: "Nombre de ícono Lucide al inicio (ej. icon=save, icon=send, icon=plus)" },
      { name: "goto", type: "string", description: "Pantalla destino para navegación animada (ej. goto=@Configuracion, goto=@Wizard(step=2))" },
      { name: "snackbar", type: "string", description: "Mensaje o @PlantillaToast para disparar una notificación emergente al pulsar (ej. snackbar=\"Guardado con éxito\")" },
      { name: "snackbar-action", type: "string", description: "Texto del botón de acción en el snackbar (ej. snackbar-action=\"Deshacer\")" },
      { name: "snackbar-type", type: "string", default: "success", description: "Tipo cromático de la notificación", values: ["success", "info", "warning", "error"] },
      { name: "disabled", type: "boolean", default: "false", description: "Deshabilita la interacción visual y clics", values: ["true", "false"] },
      { name: "badge", type: "string", description: "Insignia numérica o de estado sobre el botón (ej. badge=\"3\")" },
    ],
    examples: [
      'button "Guardar Cambios" filled icon=save goto=@Inicio',
      'button "Facturar" filled icon=send snackbar="Factura #1024 emitida" snackbar-action="Deshacer" goto=@Panel',
      'button "Eliminar Cuenta" outlined icon=trash snackbar-type=error',
    ],
  },

  textfield: {
    name: "textfield",
    category: "Entradas",
    signature: 'textfield <id> label="..." [placeholder="..."] [type=text|password|email|number] [icon=...] [helper="..."] [required=true]',
    summary: "Campo de entrada de texto Material 3 con etiqueta flotante animada e ícono.",
    description: "Permite la captura interactiva de datos de texto, emails, contraseñas y números con validación visual.",
    parameters: [
      { name: "id", type: "identifier", description: "Identificador único de la variable en el formulario (ej. email, password, nombre)" },
      { name: "label", type: "string", description: "Etiqueta flotante superior de Material 3" },
      { name: "placeholder", type: "string", description: "Texto guía visible cuando el campo está vacío" },
      { name: "type", type: "string", default: "text", description: "Tipo de entrada", values: ["text", "password", "email", "number"] },
      { name: "icon", type: "string", description: "Ícono Lucide inicial (ej. icon=mail, icon=lock, icon=user)" },
      { name: "helper", type: "string", description: "Texto de asistencia o ayuda debajo del campo" },
      { name: "required", type: "boolean", default: "false", description: "Marca el campo con asterisco de obligatoriedad", values: ["true", "false"] },
      { name: "disabled", type: "boolean", default: "false", description: "Deshabilita la edición del campo", values: ["true", "false"] },
      { name: "value", type: "string", description: "Valor inicial precargado" },
    ],
    examples: [
      'textfield correo label="Correo Electrónico" placeholder="usuario@empresa.com" type=email icon=mail required=true',
      'textfield password label="Contraseña" type=password icon=lock helper="Mínimo 8 caracteres"',
    ],
  },

  textarea: {
    name: "textarea",
    category: "Entradas",
    signature: 'textarea <id> label="..." [rows=3] [placeholder="..."] [helper="..."] [required=true]',
    summary: "Área de texto multilínea para comentarios, notas o descripciones largas.",
    description: "Permite la entrada de texto fluido en múltiples líneas con redimensionamiento automático.",
    parameters: [
      { name: "id", type: "identifier", description: "Identificador único del campo" },
      { name: "label", type: "string", description: "Etiqueta superior descriptiva" },
      { name: "rows", type: "number", default: "3", description: "Altura inicial en cantidad de líneas visibles" },
      { name: "placeholder", type: "string", description: "Texto guía tenue de ejemplo" },
      { name: "helper", type: "string", description: "Mensaje de ayuda o límite de caracteres" },
      { name: "required", type: "boolean", default: "false", description: "Marca como obligatorio", values: ["true", "false"] },
    ],
    examples: [
      'textarea comentarios label="Notas adicionales" rows=4 placeholder="Escribe tus observaciones aquí..."',
    ],
  },

  text: {
    name: "text",
    category: "Tipografía",
    signature: 'text "Mensaje" [display | headline | title | body | label | caption] [color=primary|secondary|error|muted]',
    summary: "Elemento tipográfico que implementa la escala de tipos de Material 3.",
    description: "Renderiza titulares, subtítulos, párrafos, pies de foto y etiquetas con pesos y tamaños tipográficos matemáticamente armonizados.",
    modifiers: [
      { name: "display", description: "Titular gigante (Hero) para números clave o portadas destacadas." },
      { name: "headline", description: "Encabezado principal de sección de gran tamaño." },
      { name: "title", description: "Título estándar para tarjetas, modales y barras (Predeterminado)." },
      { name: "body", description: "Párrafo o cuerpo de texto normal para lectura." },
      { name: "label", description: "Texto pequeño para botones, tags e indicadores." },
      { name: "caption", description: "Pie de texto sutil o metadatos en gris." },
      { name: "bold", description: "Fuerza peso tipográfico en negrita (700)." },
    ],
    parameters: [
      { name: "color", type: "string", description: "Tonalidad cromática", values: ["primary", "secondary", "tertiary", "error", "success", "warning", "muted"] },
    ],
    examples: [
      'text "Panel de Control" headline color=primary',
      'text "Resumen financiero del último trimestre" body color=muted',
      'text "$124,500.00" display bold color=primary',
    ],
  },

  table: {
    name: "table",
    category: "Datos & Tablas",
    signature: 'table [title="..."] columns=["Col1:tipo", "Col2:tipo", ...] [striped=true] [searchable=true] [pageSize=5]',
    summary: "Tabla de datos interactiva con columnas tipadas (:code, :avatar, :progress, :status, :action, :dropdown), búsqueda y paginación.",
    description: "Renderiza colecciones estructuradas de datos con renderers especializados por celda (badges, barras de progreso, menús de 3 puntos, etc.).",
    modifiers: [
      { name: "striped", description: "Aplica filas alternadas en tono de superficie suave para facilitar la lectura." },
      { name: "searchable", description: "Añade una barra de búsqueda en vivo para filtrar filas en tiempo real." },
      { name: "bordered", description: "Añade bordes y rejilla visible entre celdas." },
      { name: "compact", description: "Reduce el padding vertical para alta densidad de datos." },
    ],
    parameters: [
      { name: "title", type: "string", description: "Título superior del encabezado de la tabla" },
      { name: "columns", type: "array", description: "Lista de encabezados con tipos opcionales: :code, :avatar, :progress, :status, :action, :dropdown, :currency, :date, :checkbox, :link, :rating" },
      { name: "pageSize", type: "number", default: "10", description: "Cantidad de filas mostradas por página" },
    ],
    examples: [
      'table title="Servicios y Responsables" columns=["ID:code", "Responsable:avatar", "Progreso:progress", "Monto:currency", "Estado:status", "Acciones:action", "Opciones:dropdown"] striped=true searchable=true\n  row ["#101", "Javier Diaz", "92%", "$4,250.00", "Activo", "Configurar", ""]\n  row ["#102", "Elena Gomez", "45%", "$1,800.00", "Pendiente", "Configurar", ""]',
    ],
    tips: [
      "Puedes declarar filas usando 'row [\"val1\", \"val2\"]' o usando sintaxis de pipes Markdown '| val1 | val2 |'.",
      "Los tipos de columna admitidos son: :code, :avatar, :progress, :status, :action, :dropdown, :currency, :date, :checkbox, :link, :rating, :tags.",
    ],
  },

  select: {
    name: "select",
    category: "Entradas",
    signature: 'select <id> label="..." [value="..."]\n  option "Opción 1"\n  option "Opción 2"',
    summary: "Menú desplegable de selección única (Dropdown) con estilo Material 3.",
    description: "Permite seleccionar un único elemento de una lista colapsable de opciones.",
    parameters: [
      { name: "id", type: "identifier", description: "Identificador del campo en el formulario" },
      { name: "label", type: "string", description: "Etiqueta descriptiva superior" },
      { name: "value", type: "string", description: "Opción seleccionada por defecto" },
      { name: "disabled", type: "boolean", default: "false", description: "Bloquea la interacción", values: ["true", "false"] },
    ],
    examples: [
      'select rol label="Rol del Usuario" value="Administrador"\n  option "Administrador"\n  option "Editor"\n  option "Visualizador"',
    ],
  },

  autocomplete: {
    name: "autocomplete",
    category: "Entradas",
    signature: 'autocomplete <id> label="..." [placeholder="..."]\n  option "Opción 1"\n  option "Opción 2"',
    summary: "Menú desplegable con filtro y búsqueda predictiva en vivo.",
    description: "Campo de texto interactivo que filtra opciones en tiempo real mientras el usuario escribe.",
    parameters: [
      { name: "id", type: "identifier", description: "Identificador del campo" },
      { name: "label", type: "string", description: "Etiqueta flotante del buscador" },
      { name: "placeholder", type: "string", description: "Texto guía tenue" },
    ],
    examples: [
      'autocomplete pais label="País de Residencia" placeholder="Escribe para buscar..."\n  option "Argentina"\n  option "Chile"\n  option "Colombia"\n  option "España"\n  option "México"',
    ],
  },

  datepicker: {
    name: "datepicker",
    category: "Entradas",
    signature: 'datepicker <id> label="..." [value="2026-08-20"] [required=true]',
    summary: "Selector de fechas nativo con estilo Material 3 e ícono de calendario integrado.",
    description: "Permite elegir fechas de forma accesible con soporte para valor inicial y obligatoriedad.",
    parameters: [
      { name: "id", type: "identifier", description: "Identificador del campo" },
      { name: "label", type: "string", description: "Etiqueta del selector de fecha" },
      { name: "value", type: "string", description: "Fecha inicial en formato AAAA-MM-DD" },
      { name: "required", type: "boolean", default: "false", description: "Obligatorio para enviar formulario", values: ["true", "false"] },
    ],
    examples: [
      'datepicker fecha_nacimiento label="Fecha de Nacimiento" value="2000-01-15"',
    ],
  },

  switch: {
    name: "switch",
    category: "Entradas",
    signature: 'switch <id> label="..." [checked=true|false] [disabled=true]',
    summary: "Interruptor toggle interactivo con soporte de etiqueta y estado activado/desactivado.",
    description: "Ideal para preferencias booleanas inmediatas (ej. modo oscuro, recibir alertas).",
    parameters: [
      { name: "id", type: "identifier", description: "Identificador de la preferencia" },
      { name: "label", type: "string", description: "Texto descriptivo junto al interruptor" },
      { name: "checked", type: "boolean", default: "false", description: "Estado inicial activado (true) o desactivado (false)", values: ["true", "false"] },
      { name: "disabled", type: "boolean", default: "false", description: "Deshabilita la interacción", values: ["true", "false"] },
    ],
    examples: [
      'switch notificaciones label="Recibir notificaciones por correo" checked=true',
      'switch 2fa label="Autenticación en dos pasos obligatoria" checked=false',
    ],
  },

  checkbox: {
    name: "checkbox",
    category: "Entradas",
    signature: 'checkbox <id> label="..." [checked=true|false] [disabled=true]',
    summary: "Casilla de verificación Material 3 para selecciones booleanas o confirmaciones.",
    description: "Permite aceptar términos, seleccionar elementos de listas o activar opciones múltiples.",
    parameters: [
      { name: "id", type: "identifier", description: "Identificador del campo" },
      { name: "label", type: "string", description: "Texto explicativo junto a la casilla" },
      { name: "checked", type: "boolean", default: "false", description: "Estado inicial marcado", values: ["true", "false"] },
      { name: "disabled", type: "boolean", default: "false", description: "Deshabilita la casilla", values: ["true", "false"] },
    ],
    examples: [
      'checkbox terminos label="Acepto los términos y la política de privacidad" checked=false',
    ],
  },

  slider: {
    name: "slider",
    category: "Entradas",
    signature: 'slider <id> label="..." [min=0] [max=100] [step=1] [value=50]',
    summary: "Control deslizante continuo o por pasos para valores numéricos.",
    description: "Permite ajustar volumen, brillo, presupuestos, porcentajes o umbrales de forma fluida.",
    parameters: [
      { name: "id", type: "identifier", description: "Identificador del control" },
      { name: "label", type: "string", description: "Etiqueta descriptiva superior" },
      { name: "min", type: "number", default: "0", description: "Valor mínimo" },
      { name: "max", type: "number", default: "100", description: "Valor máximo" },
      { name: "step", type: "number", default: "1", description: "Incremento por paso" },
      { name: "value", type: "number", default: "50", description: "Valor numérico inicial" },
    ],
    examples: [
      'slider volumen label="Nivel de Volumen" min=0 max=100 value=75',
      'slider presupuesto label="Presupuesto Mensual ($)" min=500 max=10000 step=500 value=2500',
    ],
  },

  chip: {
    name: "chip",
    category: "Acción",
    signature: 'chip "Texto" [selected=true|false] [icon=...] [dismissible=true]',
    summary: "Pastilla compacta interactiva (Filter/Action Chip) para filtros, categorías o tags.",
    description: "Elemento interactivo compacto con estado seleccionado y opción de botón de descarte.",
    parameters: [
      { name: "selected", type: "boolean", default: "false", description: "Muestra la pastilla como seleccionada/activa", values: ["true", "false"] },
      { name: "icon", type: "string", description: "Ícono Lucide al inicio (ej. icon=check, icon=clock)" },
      { name: "dismissible", type: "boolean", default: "false", description: "Muestra botón X para descartar el chip", values: ["true", "false"] },
    ],
    examples: [
      'chip "Todos" selected=true\nchip "En Progreso" icon=clock\nchip "Completados" icon=check',
    ],
  },

  segmentedbutton: {
    name: "segmentedbutton",
    category: "Entradas",
    signature: 'segmentedbutton options=["Opción 1", "Opción 2", ...] [selected=0]',
    summary: "Grupo de botones segmentados para alternar entre opciones o vistas mutuamente exclusivas.",
    description: "Control de selección horizontal unificado de Material 3 con pestaña activa resaltada.",
    parameters: [
      { name: "options", type: "array", description: "Arreglo de opciones de texto a mostrar (ej. [\"Día\", \"Semana\", \"Mes\"])" },
      { name: "selected", type: "number", default: "0", description: "Índice (0-based) de la opción seleccionada inicialmente" },
    ],
    examples: [
      'segmentedbutton options=["Diario", "Semanal", "Mensual", "Anual"] selected=1',
    ],
  },

  accordion: {
    name: "accordion",
    category: "Superficie",
    signature: 'accordion "Título" [expanded=true|false] [icon=...] [variant=elevated|outlined|filled] [badge="..."]',
    summary: "Panel de expansión / acordeón plegable Material 3 para agrupar contenido colapsable.",
    description: "Organiza contenido secundario o pasos opcionales con un encabezado clickeable y chevron animado.",
    parameters: [
      { name: "expanded", type: "boolean", default: "false", description: "Estado inicial desplegado (true) o plegado (false)", values: ["true", "false"] },
      { name: "icon", type: "string", description: "Ícono Lucide en el encabezado" },
      { name: "variant", type: "string", default: "elevated", description: "Variante de superficie", values: ["elevated", "outlined", "filled"] },
      { name: "badge", type: "string", description: "Insignia informativa visible en el encabezado" },
    ],
    examples: [
      'accordion "Datos Fiscales (Opcional)" expanded=false icon=file-text\n  textfield rfc label="RFC / Tax ID"\n  textfield razon label="Razón Social"',
    ],
  },

  tabs: {
    name: "tabs",
    category: "Navegación & Estructura",
    signature: 'tabs items=["Pestaña 1", "Pestaña 2"]\n  tab "Pestaña 1"\n    ...\n  tab "Pestaña 2"\n    ...',
    summary: "Contenedor de pestañas interactivas con cambio fluido de vistas por panel.",
    description: "Permite organizar subsecciones en una misma pantalla mediante barras de pestañas con indicador animado.",
    parameters: [
      { name: "items", type: "array", description: "Lista de nombres de pestañas (opcional si se definen bloques tab)" },
    ],
    examples: [
      'tabs items=["General", "Seguridad"]\n  tab "General"\n    card elevated\n      text "Ajustes Generales" title\n  tab "Seguridad"\n    card elevated\n      text "Configuración 2FA" title',
    ],
  },

  metric: {
    name: "metric",
    category: "Datos & Tablas",
    signature: 'metric label="..." value="..." [delta="..."] [icon=...] [trend=up|down]',
    summary: "Tarjeta de métrica e indicador clave (KPI) con cifra destacada y tendencia.",
    description: "Muestra métricas principales de negocio con indicadores porcentuales de crecimiento o caída.",
    parameters: [
      { name: "label", type: "string", description: "Nombre o descripción superior del indicador" },
      { name: "value", type: "string", description: "Cifra o resultado numérico destacado (ej. \"$48,250\")" },
      { name: "delta", type: "string", description: "Porcentaje de cambio o variación (ej. \"+24.5%\")" },
      { name: "trend", type: "string", default: "up", description: "Dirección de la tendencia", values: ["up", "down"] },
      { name: "icon", type: "string", description: "Ícono temático Lucide en la esquina" },
    ],
    examples: [
      'metric label="Ingresos Totales" value="$48,250" delta="+24.5%" trend=up icon=dollar-sign',
      'metric label="Tasa de Rebote" value="2.1%" delta="-0.8%" trend=down icon=trending-down',
    ],
  },

  stat: {
    name: "stat",
    category: "Datos & Tablas",
    signature: 'stat label="..." value="..." [icon=...]',
    summary: "Tarjeta de estadística compacta para resúmenes de datos rápidos.",
    description: "Versión simplificada de métricas sin cálculo de tendencia, ideal para cuadrículas densas.",
    parameters: [
      { name: "label", type: "string", description: "Título descriptivo del dato" },
      { name: "value", type: "string", description: "Valor o recuento numérico" },
      { name: "icon", type: "string", description: "Ícono temático decorativo" },
    ],
    examples: [
      'stat label="Usuarios Registrados" value="1,240" icon=users',
    ],
  },

  alert: {
    name: "alert",
    category: "Feedback & Estado",
    signature: 'alert "Mensaje" [variant=info|success|warning|error] [title="..."] [icon=...] [dismissible=true]',
    summary: "Banner contextual de alerta (informativo, éxito, advertencia o error).",
    description: "Comunica avisos importantes del sistema, confirmaciones o bloqueos en la interfaz.",
    parameters: [
      { name: "variant", type: "string", default: "info", description: "Severidad y esquema de color", values: ["info", "success", "warning", "error"] },
      { name: "title", type: "string", description: "Título destacado en negrita" },
      { name: "icon", type: "string", description: "Ícono personalizado de alerta" },
      { name: "dismissible", type: "boolean", default: "false", description: "Muestra botón X para cerrar la alerta", values: ["true", "false"] },
    ],
    examples: [
      'alert "Tu suscripción vence en 3 días." variant=warning title="Renovación Pendiente" dismissible=true',
      'alert "Cambios guardados con éxito." variant=success',
    ],
  },

  snackbar: {
    name: "snackbar",
    category: "Feedback & Estado",
    signature: 'snackbar "Mensaje" [action="..."] [icon=...] [type=info|success|warning|error] [goto=@Pantalla]',
    summary: "Notificación emergente temporal (Snackbar / Toast Material 3) post-acción.",
    description: "Brinda feedback inmediato tras guardar, eliminar o emitir documentos con soporte para botón de acción.",
    parameters: [
      { name: "message", type: "string", description: "Texto del mensaje emergente" },
      { name: "action", type: "string", description: "Texto del botón de acción (ej. \"Deshacer\", \"Ver\")" },
      { name: "icon", type: "string", description: "Ícono Lucide que acompaña al mensaje" },
      { name: "type", type: "string", default: "info", description: "Tipo o severidad", values: ["info", "success", "warning", "error"] },
      { name: "goto", type: "string", description: "Destino al hacer clic en el botón de acción" },
    ],
    examples: [
      'snackbar "Factura enviada por correo" action="Deshacer" icon=check-circle-2 type=success',
    ],
  },

  fab: {
    name: "fab",
    category: "Acción",
    signature: 'fab "Texto" [icon=plus] [extended=true|false] [goto=@Pantalla] [variant=primary|secondary|tertiary|surface]',
    summary: "Botón de acción flotante (FAB / Extended FAB Material 3) para la acción primordial de la vista.",
    description: "Se sitúa en la esquina inferior derecha para acciones primarias como crear, agregar o chatear.",
    parameters: [
      { name: "label", type: "string", description: "Texto descriptivo para Extended FAB" },
      { name: "icon", type: "string", default: "plus", description: "Ícono central del botón flotante" },
      { name: "extended", type: "boolean", default: "true", description: "Muestra versión extendida con texto e ícono", values: ["true", "false"] },
      { name: "goto", type: "string", description: "Pantalla destino de navegación" },
      { name: "variant", type: "string", default: "primary", description: "Variante cromática", values: ["primary", "secondary", "tertiary", "surface"] },
    ],
    examples: [
      'fab "Nuevo Documento" icon=plus extended=true goto=@CrearDocumentoModal',
    ],
  },

  appbar: {
    name: "appbar",
    category: "Navegación & Estructura",
    signature: 'appbar "Título" [icon=arrow-left|menu] [goto=@Pantalla] [action="..."]',
    summary: "Barra superior de aplicación (Top App Bar Material 3) con título y navegación.",
    description: "Encabezado principal de pantalla con botón de regreso o menú y botón de acción opcional a la derecha.",
    parameters: [
      { name: "title", type: "string", description: "Título principal mostrado en la barra" },
      { name: "icon", type: "string", default: "arrow-left", description: "Ícono de navegación a la izquierda (ej. arrow-left, menu)" },
      { name: "goto", type: "string", description: "Destino al pulsar el ícono de retroceso" },
      { name: "action", type: "string", description: "Texto o acción adicional en la esquina derecha" },
    ],
    examples: [
      'appbar "Ajustes de Perfil" icon=arrow-left goto=@Dashboard action="Guardar"',
    ],
  },

  bottomnav: {
    name: "bottomnav",
    category: "Navegación & Estructura",
    signature: 'bottomnav\n  navitem "Inicio" icon=home goto=@Home active=true\n  navitem "Buscar" icon=search goto=@Buscar',
    summary: "Barra de navegación inferior fija para interfaces móviles con pestañas interactivas.",
    description: "Permite cambiar rápidamente entre las 3-5 secciones principales de la aplicación en pantallas táctiles.",
    examples: [
      'bottomnav\n  navitem "Inicio" icon=home goto=@Inicio active=true\n  navitem "Explorar" icon=compass goto=@Explorar\n  navitem "Perfil" icon=user goto=@Perfil',
    ],
  },

  breadcrumbs: {
    name: "breadcrumbs",
    category: "Navegación & Estructura",
    signature: 'breadcrumbs items=["Inicio", "Clientes", "Detalle"] [separator=chevron|slash]',
    summary: "Línea de navegación jerárquica con separadores visuales.",
    description: "Muestra la ubicación del usuario dentro de la jerarquía de la app.",
    parameters: [
      { name: "items", type: "array", description: "Arreglo de niveles jerárquicos" },
      { name: "separator", type: "string", default: "chevron", description: "Tipo de separador visual", values: ["chevron", "slash"] },
    ],
    examples: [
      'breadcrumbs items=["Panel", "Organización", "Miembros"]',
    ],
  },

  rating: {
    name: "rating",
    category: "Entradas",
    signature: 'rating <id> label="..." [value=4] [max=5] [readonly=true|false] [size=sm|md|lg]',
    summary: "Control de estrellas interactivo de calificación y puntuación (Rating Bar Material 3).",
    description: "Permite a los usuarios calificar servicios o productos con estrellas animadas.",
    parameters: [
      { name: "id", type: "identifier", description: "Identificador del control" },
      { name: "label", type: "string", description: "Etiqueta descriptiva superior" },
      { name: "value", type: "number", default: "4", description: "Puntuación inicial seleccionada" },
      { name: "max", type: "number", default: "5", description: "Número total de estrellas" },
      { name: "readonly", type: "boolean", default: "false", description: "Modo solo lectura sin interacción", values: ["false", "true"] },
      { name: "size", type: "string", default: "md", description: "Tamaño visual de las estrellas", values: ["sm", "md", "lg"] },
    ],
    examples: [
      'rating satisfaccion label="¿Qué tan satisfecho estás con el servicio?" value=5 readonly=false',
    ],
  },

  listitem: {
    name: "listitem",
    category: "Superficie",
    signature: 'listitem "Título" [subtitle="..."] [icon=...] [goto=@Pantalla]',
    summary: "Fila estructurada de lista Material 3 con título, subtítulo, ícono y enlace.",
    description: "Elemento de lista clicable ideal para ajustes, directorios de usuarios o exploradores de archivos.",
    parameters: [
      { name: "title", type: "string", description: "Texto principal en negrita" },
      { name: "subtitle", type: "string", description: "Texto secundario en gris de descripción" },
      { name: "icon", type: "string", description: "Ícono Lucide a la izquierda" },
      { name: "goto", type: "string", description: "Destino de navegación al hacer clic" },
    ],
    examples: [
      'listitem "Javier Diaz" subtitle="javier@empresa.com" icon=user goto=@PerfilUsuario',
    ],
  },

  avatar: {
    name: "avatar",
    category: "Superficie",
    signature: 'avatar "Iniciales" [size=40] [icon=...] [src="..."]',
    summary: "Elemento circular de imagen o iniciales para representar usuarios o identidades.",
    description: "Renderiza avatares con iniciales estilizadas M3 o imagen de perfil con tamaño configurable.",
    parameters: [
      { name: "label", type: "string", description: "Iniciales del usuario (ej. \"JD\", \"AD\")" },
      { name: "size", type: "number", default: "40", description: "Diámetro en píxeles del círculo (ej. 32, 40, 48, 64)" },
      { name: "icon", type: "string", description: "Ícono de usuario si no hay iniciales (ej. icon=user)" },
      { name: "src", type: "string", description: "URL web directa de la foto de perfil" },
    ],
    examples: [
      'avatar "JD" size=44',
      'avatar "AD" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120" size=48',
    ],
  },

  badge: {
    name: "badge",
    category: "Feedback & Estado",
    signature: 'badge "Texto" [variant=primary|error|success|tonal] [size=sm|md]',
    summary: "Insignia compacta de estado o contador numérico de notificaciones.",
    description: "Resalta estados como 'Nuevo', 'Activo' o cantidades no leídas con color de acento.",
    parameters: [
      { name: "label", type: "string", description: "Texto o número dentro de la insignia" },
      { name: "variant", type: "string", default: "primary", description: "Variante cromática", values: ["primary", "error", "success", "tonal"] },
      { name: "size", type: "string", default: "md", description: "Tamaño", values: ["sm", "md"] },
    ],
    examples: [
      'badge "Nuevo" variant=primary',
      'badge "3" variant=error',
    ],
  },

  progress: {
    name: "progress",
    category: "Feedback & Estado",
    signature: 'progress [value=75] [variant=linear|circular] [indeterminate=true|false]',
    summary: "Barra o anillo de progreso Material 3 para estados de carga y porcentaje de avance.",
    description: "Visualiza avance numérico de 0 a 100 o animación continua de carga infinita.",
    parameters: [
      { name: "value", type: "number", default: "50", description: "Porcentaje completado de 0 a 100" },
      { name: "variant", type: "string", default: "linear", description: "Formato visual de la barra", values: ["linear", "circular"] },
      { name: "indeterminate", type: "boolean", default: "false", description: "Animación de carga continua sin valor fijo", values: ["true", "false"] },
    ],
    examples: [
      'progress value=85 variant=linear',
      'progress variant=circular indeterminate=true',
    ],
  },

  icon: {
    name: "icon",
    category: "Superficie",
    signature: 'icon name=settings [size=24] [color=primary|secondary|error|muted]',
    summary: "Ícono vectorial independiente del catálogo Lucide.",
    description: "Renderiza cualquier ícono de Lucide con control de tamaño en píxeles y color de tema.",
    parameters: [
      { name: "name", type: "string", description: "Nombre del ícono Lucide (ej. settings, heart, bell, user, shield)" },
      { name: "size", type: "number", default: "24", description: "Tamaño en píxeles del ícono (ej. 16, 20, 24, 32, 48)" },
      { name: "color", type: "string", default: "primary", description: "Color del tema", values: ["primary", "secondary", "error", "success", "warning", "muted"] },
    ],
    examples: [
      'icon name=shield-check size=32 color=success',
    ],
  },

  image: {
    name: "image",
    category: "Superficie",
    signature: 'image src="..." [alt="..."] [aspect=16/9|1/1|4/3] [rounded=true]',
    summary: "Componente de imagen con relación de aspecto fija y esquinas redondeadas.",
    description: "Carga imágenes externas asegurando proporciones estables sin salto de layout (CLS).",
    parameters: [
      { name: "src", type: "string", description: "URL pública de la imagen" },
      { name: "alt", type: "string", description: "Texto descriptivo para accesibilidad" },
      { name: "aspect", type: "string", default: "16/9", description: "Relación de aspecto", values: ["16/9", "1/1", "4/3", "21/9"] },
      { name: "rounded", type: "boolean", default: "true", description: "Aplica esquinas redondeadas", values: ["true", "false"] },
    ],
    examples: [
      'image src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600" aspect=16/9 rounded=true',
    ],
  },

  divider: {
    name: "divider",
    category: "Layout",
    signature: 'divider [spacing=16]',
    summary: "Línea separadora sutil horizontal para delimitar bloques y secciones.",
    description: "Crea una frontera visual limpia de 1px entre grupos de elementos.",
    parameters: [
      { name: "spacing", type: "number", default: "16", description: "Margen vertical en píxeles (ej. 8, 12, 16, 24, 32)" },
    ],
    examples: [
      'divider spacing=24',
    ],
  },

  spacer: {
    name: "spacer",
    category: "Layout",
    signature: 'spacer [size=16]',
    summary: "Espaciador vertical invisible para separar elementos.",
    description: "Añade un bloque de espacio en blanco transparente de altura controlada.",
    parameters: [
      { name: "size", type: "number", default: "16", description: "Altura en píxeles (ej. 8, 16, 24, 32, 48)" },
    ],
    examples: [
      'spacer size=24',
    ],
  },

  // --- SCREEN DECLARATIONS ---
  screen: {
    name: "@Pantalla:screen",
    category: "Navegación & Estructura",
    signature: '@NombrePantalla:screen [theme=material3|ios|fluent]',
    summary: "Declara una nueva pantalla independiente navegable en el documento Wisp.",
    description: "Cada pantalla actúa como una vista autónoma conectable mediante 'goto=@NombrePantalla'.",
    parameters: [
      { name: "theme", type: "string", default: "material3", description: "Esquema de diseño de la pantalla", values: ["material3", "ios", "fluent"] },
    ],
    examples: [
      '@Dashboard:screen\n  appbar "Panel Principal" icon=menu\n  card elevated\n    text "Bienvenido al Sistema" title',
    ],
  },

  wizard: {
    name: "@Flujo:wizard",
    category: "Navegación & Estructura",
    signature: '@NombreWizard:wizard\n  steps: N\n\n  step "Paso 1: ..."\n    ...',
    summary: "Declara un flujo guiado paso a paso (Wizard / Stepper) con indicador secuencial.",
    description: "Estructura formularios largos en pasos numerados con navegación fluida tipo 'goto=@Flujo(step=2)'.",
    parameters: [
      { name: "steps", type: "number", description: "Cantidad total de etapas del asistente" },
    ],
    examples: [
      '@RegistroFlow:wizard\n  steps: 2\n\n  step "Paso 1: Identificación"\n    textfield nombre label="Nombre"\n    button "Continuar" filled goto=@RegistroFlow(step=2)\n\n  step "Paso 2: Confirmación"\n    text "¿Confirmas los datos?" body\n    button "Finalizar" filled goto=@Home',
    ],
  },

  dialog: {
    name: "@Modal:dialog",
    category: "Navegación & Estructura",
    signature: '@NombreModal:dialog\n  text "Título" title\n  text "Mensaje..." body\n  button "Aceptar" filled',
    summary: "Declara una ventana modal centrada (Dialog Material 3) para alertas o confirmaciones.",
    description: "Aparece superpuesta con fondo atenuado para requerir atención inmediata del usuario.",
    examples: [
      '@ConfirmarEliminar:dialog\n  text "Eliminar Registro" title\n  text "¿Estás seguro de que deseas eliminar este elemento de forma permanente?" body\n  row spacing=8 justify=end\n    button "Cancelar" text goto=@Dashboard\n    button "Eliminar" filled snackbar-type=error goto=@Dashboard',
    ],
  },

  sheet: {
    name: "@Menu:sheet",
    category: "Navegación & Estructura",
    signature: '@NombreSheet:sheet\n  text "Opciones" title\n  listitem "Descargar" icon=download',
    summary: "Declara un panel inferior deslizable (Bottom Sheet Material 3) para móviles.",
    description: "Ideal para menús contextuales, selectores de compartir o paneles secundarios en smartphones.",
    examples: [
      '@OpcionesCompartir:sheet\n  text "Compartir Documento" title\n  listitem "Copiar enlace" icon=link\n  listitem "Enviar por correo" icon=mail',
    ],
  },
};

/**
 * Helper to get documentation for a keyword, modifier or parameter
 */
export function getWispHoverDoc(word: string, lineContext: string): { title: string; markdown: string } | null {
  const cleanWord = word.trim().replace(/^["']|["']$/g, "");
  if (!cleanWord) return null;

  const lowerWord = cleanWord.toLowerCase();

  // 1. Check if hovering a screen declaration or reference (@Screen)
  if (cleanWord.startsWith("@")) {
    const screenName = cleanWord.replace(/^@/, "").split(/[:(]/)[0];
    if (lineContext.includes(":screen")) {
      const entry = WISP_DOCS_DATABASE["screen"];
      return formatHoverEntry(`@${screenName}:screen`, entry);
    }
    if (lineContext.includes(":wizard")) {
      const entry = WISP_DOCS_DATABASE["wizard"];
      return formatHoverEntry(`@${screenName}:wizard`, entry);
    }
    if (lineContext.includes(":dialog") || lineContext.includes(":modal")) {
      const entry = WISP_DOCS_DATABASE["dialog"];
      return formatHoverEntry(`@${screenName}:dialog`, entry);
    }
    if (lineContext.includes(":sheet")) {
      const entry = WISP_DOCS_DATABASE["sheet"];
      return formatHoverEntry(`@${screenName}:sheet`, entry);
    }
    if (lineContext.includes(":snackbar") || lineContext.includes(":toast")) {
      const entry = WISP_DOCS_DATABASE["snackbar"];
      return formatHoverEntry(`@${screenName}:snackbar`, entry);
    }

    return {
      title: `@${screenName}`,
      markdown: [
        `### 🧭 Navegación: \`@${screenName}\``,
        "---",
        `Referencia a la pantalla **${screenName}** para navegación declarativa mediante \`goto=@${screenName}\` o disparadores de notificación \`snackbar=@${screenName}\`.`,
        "",
        "```wisp",
        `button "Ir a ${screenName}" filled goto=@${screenName}`,
        "```",
      ].join("\n"),
    };
  }

  // 2. Direct match in Wisp Component Database
  if (WISP_DOCS_DATABASE[lowerWord]) {
    const entry = WISP_DOCS_DATABASE[lowerWord];
    return formatHoverEntry(entry.name, entry);
  }

  // 3. Check if hovering a parameter key (e.g. `spacing=`, `label=`, `goto=`, `columns=`, `icon=`)
  const paramKey = lowerWord.replace(/[=:]$/, "");
  const matchingComponents = Object.values(WISP_DOCS_DATABASE).filter((comp) =>
    comp.parameters?.some((p) => p.name.toLowerCase() === paramKey || p.name.toLowerCase().startsWith(paramKey))
  );

  if (matchingComponents.length > 0) {
    // Find exact parameter definition from current line's component if possible
    const firstLineWord = lineContext.trim().split(/[\s("]/)[0].toLowerCase();
    const primaryComp = WISP_DOCS_DATABASE[firstLineWord] || matchingComponents[0];
    const paramDef = primaryComp.parameters?.find((p) => p.name.toLowerCase() === paramKey || p.name.toLowerCase().startsWith(paramKey))
      || matchingComponents[0].parameters?.find((p) => p.name.toLowerCase() === paramKey || p.name.toLowerCase().startsWith(paramKey));

    if (paramDef) {
      return {
        title: `${paramDef.name} (${paramDef.type})`,
        markdown: [
          `### ⚙️ Parámetro: \`${paramDef.name}\``,
          `**Tipo:** \`${paramDef.type}\`${paramDef.default ? ` · **Predeterminado:** \`${paramDef.default}\`` : ""}`,
          "---",
          paramDef.description,
          paramDef.values ? `\n**Valores válidos:** ${paramDef.values.map((v) => `\`${v}\``).join(", ")}` : "",
          "",
          `*Disponible en: ${matchingComponents.map((c) => `\`${c.name}\``).slice(0, 6).join(", ")}${matchingComponents.length > 6 ? ", ..." : ""}*`,
        ].filter(Boolean).join("\n"),
      };
    }
  }

  // 4. Check if hovering a modifier (e.g. `elevated`, `outlined`, `filled`, `striped`, `searchable`, `headline`, `title`, `body`)
  const matchingModifiers = Object.values(WISP_DOCS_DATABASE).filter((comp) =>
    comp.modifiers?.some((m) => m.name.toLowerCase() === lowerWord)
  );

  if (matchingModifiers.length > 0) {
    const firstLineWord = lineContext.trim().split(/[\s("]/)[0].toLowerCase();
    const primaryComp = WISP_DOCS_DATABASE[firstLineWord] || matchingModifiers[0];
    const modDef = primaryComp.modifiers?.find((m) => m.name.toLowerCase() === lowerWord)
      || matchingModifiers[0].modifiers?.find((m) => m.name.toLowerCase() === lowerWord);

    if (modDef) {
      return {
        title: `Modificador: ${modDef.name}`,
        markdown: [
          `### 🎨 Modificador: \`${modDef.name}\``,
          "---",
          modDef.description,
          "",
          `*Utilizable en: ${matchingModifiers.map((c) => `\`${c.name}\``).join(", ")}*`,
        ].join("\n"),
      };
    }
  }

  // 5. Special column types in table (e.g. `code`, `avatar`, `progress`, `status`, `action`, `dropdown`, `currency`, `date`)
  const tableColTypes: Record<string, string> = {
    code: "Formato monospace con caja sutil para IDs, hashes y códigos técnicos.",
    avatar: "Avatar circular con iniciales estilizadas Material 3 y nombre completo.",
    progress: "Barra de progreso horizontal interactiva con porcentaje numérico.",
    status: "Insignia de estado semántica (Activo / Pendiente / Inactivo) con indicador de pulso luminoso.",
    badge: "Insignia o chip tonal de estado.",
    action: "Botón interactivo de acción primaria de fila.",
    dropdown: "Menú contextual de 3 puntos (⋮) con opciones desplegables de fila (Editar, Duplicar, Eliminar).",
    currency: "Formato de moneda destacado en verde esmeralda para montos y precios.",
    date: "Fecha formateada con icono de calendario.",
    checkbox: "Casilla de selección por fila para operaciones en lote.",
    link: "Enlace web navegable.",
    rating: "Estrellas de valoración interactiva.",
    tags: "Etiquetas y chips múltiples por celda.",
  };

  if (tableColTypes[lowerWord]) {
    return {
      title: `Tipo de Columna de Tabla: :${lowerWord}`,
      markdown: [
        `### 📊 Tipo de Columna de Tabla: \`:${lowerWord}\``,
        "---",
        tableColTypes[lowerWord],
        "",
        "**Ejemplo de uso:**",
        "```wisp",
        `table columns=["ID:code", "Usuario:avatar", "Progreso:progress", "Estado:status", "Acción:action", "Opciones:dropdown"]`,
        "```",
      ].join("\n"),
    };
  }

  return null;
}

function formatHoverEntry(title: string, entry: WispDocEntry): { title: string; markdown: string } {
  const parts: string[] = [
    `### \`${entry.signature}\``,
    `*Categoría: ${entry.category}*`,
    "---",
    `**${entry.summary}**`,
    "",
    entry.description,
  ];

  if (entry.modifiers && entry.modifiers.length > 0) {
    parts.push("");
    parts.push("#### 🎨 Modificadores:");
    entry.modifiers.forEach((m) => {
      parts.push(`- **\`${m.name}\`**: ${m.description}`);
    });
  }

  if (entry.parameters && entry.parameters.length > 0) {
    parts.push("");
    parts.push("#### ⚙️ Parámetros:");
    entry.parameters.forEach((p) => {
      const valStr = p.values ? ` \`[${p.values.join(" | ")}]\`` : "";
      const defStr = p.default ? ` *(predeterminado: ${p.default})*` : "";
      parts.push(`- **\`${p.name}\`** (\`${p.type}\`)${valStr}${defStr}: ${p.description}`);
    });
  }

  if (entry.examples && entry.examples.length > 0) {
    parts.push("");
    parts.push("#### 💡 Ejemplo:");
    parts.push("```wisp");
    parts.push(entry.examples[0]);
    parts.push("```");
  }

  if (entry.tips && entry.tips.length > 0) {
    parts.push("");
    entry.tips.forEach((t) => parts.push(`> ℹ️ **Tip:** ${t}`));
  }

  return {
    title,
    markdown: parts.join("\n"),
  };
}
