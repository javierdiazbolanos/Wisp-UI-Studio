export type CompletionKind =
  | "keyword"
  | "screen"
  | "modifier"
  | "parameter"
  | "icon"
  | "snippet";

export interface ParamDoc {
  name: string;
  type: string;
  description: string;
  values?: string[];
  example?: string;
}

export interface WispCompletionItem {
  label: string;
  kind: CompletionKind;
  detail: string;
  insertText: string;
  documentation: string;
  parameters?: ParamDoc[];
  example?: string;
  cursorOffset?: number; // Cursor position relative to end of insertText
}

// ==========================================
// 1. TOP-LEVEL STATEMENTS & DECLARATIONS
// (Shown when cursor is at the START of a line/statement)
// ==========================================

export const TOP_LEVEL_COMPLETIONS: WispCompletionItem[] = [
  {
    label: "navigationrail",
    kind: "keyword",
    detail: 'navigationrail title="..." fab=plus',
    insertText: `navigationrail title="App" fab=plus\n  navitem "Inicio" icon=home active\n  navitem "Bandeja" icon=inbox badge="5"\n  navitem "Ajustes" icon=settings`,
    documentation: "Barra de navegación vertical Material 3 (Rail) para pantallas medianas y grandes, con soporte de FAB e items con indicadores activos y badges.",
    example: `navigationrail title="Portal" fab=plus\n  navitem "Inicio" icon=home active\n  navitem "Proyectos" icon=folder\n  navitem "Ajustes" icon=settings`,
  },
  {
    label: "drawer",
    kind: "keyword",
    detail: 'drawer title="..." subtitle="..." avatar="..."',
    insertText: `drawer title="Mi Aplicación" subtitle="usuario@empresa.com"\n  draweritem "Panel Principal" icon=layout active\n  draweritem "Clientes" icon=users badge="12"\n  section "Configuración"\n  draweritem "Ajustes" icon=settings`,
    documentation: "Panel de navegación lateral / Drawer Material 3 con cabecera de perfil, secciones y elementos de menú con píldoras activas.",
    example: `drawer title="Gestión de Eventos"\n  draweritem "Eventos" icon=calendar active\n  draweritem "Salones" icon=map-pin\n  draweritem "Presupuestos" icon=dollar-sign`,
  },
  {
    label: "sidesheet",
    kind: "keyword",
    detail: 'sidesheet title="Detalles & Filtros"',
    insertText: `sidesheet title="Filtros Avanzados"\n  select categoria label="Categoría" options=["Todas", "Eventos", "Bodas", "Empresariales"]\n  slider precio label="Presupuesto Máximo" min=500 max=20000 value=5000\n  button "Aplicar Filtros" filled`,
    documentation: "Panel lateral emergente (Side Sheet) de Material 3 para filtros secundarios, edición complementaria o inspección de detalles.",
    example: `sidesheet title="Filtros"\n  textfield search label="Buscar"\n  button "Filtrar" filled`,
  },
  {
    label: "bottomsheet",
    kind: "keyword",
    detail: 'bottomsheet title="Acciones Rápidas"',
    insertText: `bottomsheet title="Compartir & Exportar"\n  button "Exportar a PDF" filled icon=download\n  button "Enviar por Correo" tonal icon=mail\n  button "Cancelar" text goto=back`,
    documentation: "Hoja inferior emergente (Bottom Sheet) con tirador táctil de arrastre, título y lista de acciones.",
    example: `bottomsheet title="Opciones"\n  button "Descargar" filled icon=download`,
  },
  {
    label: "loading",
    kind: "keyword",
    detail: 'loading "Mensaje..." [variant=circular|linear] [value=75]',
    insertText: `loading "Cargando datos del sistema..."`,
    documentation: "Indicador de progreso y carga Material 3 (circular progress, linear progress, spinner indeterminate o determinate).",
    example: `loading "Procesando cotización..."\nlinearprogress value=65 message="Subiendo comprobante..."`,
  },
  {
    label: "linearprogress",
    kind: "keyword",
    detail: 'linearprogress value=75 [message="..."]',
    insertText: `linearprogress value=75 message="Progreso de sincronización"`,
    documentation: "Barra de progreso lineal Material 3 con indicador de porcentaje o modo indeterminado.",
    example: `linearprogress value=80 message="Completado"`,
  },
  {
    label: "circularprogress",
    kind: "keyword",
    detail: 'circularprogress value=75 [message="..."]',
    insertText: `circularprogress value=75 message="Capacidad utilizada"`,
    documentation: "Indicador de progreso circular Material 3 con porcentaje central y trazo animado.",
    example: `circularprogress value=90`,
  },
  {
    label: "tooltip",
    kind: "keyword",
    detail: 'tooltip "Mensaje de ayuda"',
    insertText: `tooltip "Haga clic para sincronizar con la nube"`,
    documentation: "Píldora o globo flotante de ayuda contextual rápida (Plain Tooltip).",
    example: `tooltip "Copiar identificador al portapapeles"`,
  },
  {
    label: "richtooltip",
    kind: "keyword",
    detail: 'richtooltip title="..." text="..." [action="..."]',
    insertText: `richtooltip title="Permisos de Edición" text="Los administradores pueden modificar precios y contratos directamente." action="Saber más" action_goto=@Docs`,
    documentation: "Tarjeta emergente de información enriquecida Material 3 con subtítulo, cuerpo descriptivo y botón de acción opcional.",
    example: `richtooltip title="Seguridad" text="Autenticación de dos pasos requerida." action="Configurar"`,
  },
  {
    label: "carousel",
    kind: "keyword",
    detail: "carousel con múltiples tarjetas / elementos",
    insertText: `carousel\n  card elevated\n    text "Salón Real" title\n    text "Capacidad para 350 personas con pista de baile." body\n  card elevated\n    text "Terraza Jardín" title\n    text "Espacio al aire libre con vista panorámica." body`,
    documentation: "Contenedor carrusel horizontal interactivo Material 3 con controles de navegación previa/siguiente y puntos indicadores.",
    example: `carousel\n  card\n    text "Opción 1" title\n  card\n    text "Opción 2" title`,
  },
  {
    label: "iconbutton",
    kind: "keyword",
    detail: 'iconbutton icon=star [variant=filled|tonal|outlined] [tooltip="..."]',
    insertText: `iconbutton icon=heart variant=tonal tooltip="Marcar como favorito"`,
    documentation: "Botón de ícono interactivo Material 3 compacto (standard, filled, tonal, outlined) con badge y tooltip.",
    example: `iconbutton icon=bell variant=filled badge="3"`,
  },
  {
    label: "timepicker",
    kind: "keyword",
    detail: 'timepicker id label="..." [value="14:30"]',
    insertText: `timepicker hora label="Hora del Evento" value="18:00"`,
    documentation: "Selector de hora interactivo Material 3 con reloj selector, formato y accesos rápidos.",
    example: `timepicker hora_inicio label="Inicio" value="10:00"`,
  },
  {
    label: "menu",
    kind: "keyword",
    detail: 'menu "Opciones" [icon=more-vertical]',
    insertText: `menu "Acciones" icon=more-vertical\n  menuitem "Editar" icon=edit\n  menuitem "Duplicar" icon=copy\n  menuitem "Eliminar" icon=trash`,
    documentation: "Menú desplegable contextual Material 3 con lista emergente de acciones, íconos y atajos.",
    example: `menu "Opciones"\n  menuitem "Ver detalles" icon=eye\n  menuitem "Descargar" icon=download`,
  },
  // Core Layout Containers (High Priority)
  {
    label: "row",
    kind: "keyword",
    detail: "row [spacing=12] [align=center] [justify=between]",
    insertText: `row spacing=12\n  `,
    documentation: "Contenedor horizontal flexible (Flexbox row) para alinear elementos lado a lado.",
    example: `row spacing=8\n  chip "Filtro 1"\n  chip "Filtro 2"`,
  },
  {
    label: "column",
    kind: "keyword",
    detail: "column [spacing=12]",
    insertText: `column spacing=12\n  `,
    documentation: "Contenedor vertical flexible (Flexbox column) con espaciado constante entre hijos.",
    example: `column spacing=16\n  card elevated\n    text "Tarjeta A" title`,
  },
  {
    label: "card",
    kind: "keyword",
    detail: "card [elevated|outlined|filled] [padding=16]",
    insertText: `card elevated\n  text "Título de Tarjeta" title\n  text "Descripción o contenido de la tarjeta." body\n  button "Ver más" filled`,
    documentation:
      "Contenedor estructurado de superficie Material 3 con esquinas redondeadas y elevación para agrupar contenido.",
    example: `card outlined\n  text "Plan Pro" title\n  text "$29 / mes" headline`,
  },
  {
    label: "grid",
    kind: "keyword",
    detail: "grid cols=3 gap=16",
    insertText: `grid cols=2 gap=12\n  card\n    text "Elemento 1" title\n  card\n    text "Elemento 2" title`,
    documentation: "Matriz adaptable de columnas para tableros, indicadores KPI, tarjetas de productos o listados.",
    example: `grid cols=2 gap=12\n  card\n    text "A" title\n  card\n    text "B" title`,
  },
  {
    label: "split",
    kind: "keyword",
    detail: "split -> left / right",
    insertText: `split\n  left\n    text "Menú" title\n    listitem "Inicio" icon=home\n    listitem "Ajustes" icon=settings\n  right\n    card\n      text "Contenido Principal" title`,
    documentation: "Diseño dividido en 2 columnas: panel izquierdo (sidebar) y área derecha principal.",
    example: `split\n  left\n    listitem "Dashboard" icon=layout\n  right\n    text "Bienvenido" title`,
  },
  {
    label: "tabs",
    kind: "keyword",
    detail: 'tabs columns/items o con bloques tab "Nombre"',
    insertText: `tabs items=["General", "Seguridad", "Notificaciones"]\n  tab "General"\n    card\n      text "Configuración General" title\n  tab "Seguridad"\n    card\n      text "Ajustes de Seguridad" title\n  tab "Notificaciones"\n    card\n      text "Preferencias de Alertas" title`,
    documentation: "Pestañas / Tabuladores interactivos con contenido por panel o lista de items.",
    example: `tabs\n  tab "Resumen"\n    text "Contenido A"\n  tab "Historial"\n    text "Contenido B"`,
  },
  {
    label: "tab",
    kind: "keyword",
    detail: 'tab "Nombre de Pestaña"',
    insertText: `tab "Pestaña"\n  card\n    text "Contenido" title`,
    documentation: "Panel de contenido para una pestaña específica dentro de un bloque 'tabs'.",
    example: `tab "General"\n  text "Datos generales" title`,
  },
  {
    label: "table",
    kind: "keyword",
    detail: 'table columns=["ID:code", "Usuario:avatar", "Progreso:progress", "Estado:status", "Acción:action", "Opciones:dropdown"]',
    insertText: `table title="Servicios y Miembros" columns=["ID:code", "Responsable:avatar", "Progreso:progress", "Estado:status", "Acciones:action", "Opciones:dropdown"] striped searchable\n  row ["#101", "Javier Diaz", "85%", "Activo", "Configurar", ""]\n  row ["#102", "Elena Gomez", "40%", "Pendiente", "Configurar", ""]\n  row ["#103", "Carlos Vera", "100%", "Completado", "Configurar", ""]`,
    documentation: "Tabla de datos interactiva con tipos de columnas enriquecidas (code, avatar, progress, status, action, dropdown, currency, date, checkbox) con búsqueda y paginación.",
    example: `table columns=["ID:code", "Usuario:avatar", "Progreso:progress", "Monto:currency", "Estado:status", "Acciones:action"] striped searchable\n  row ["#101", "Javier Diaz", "75%", "$1,200.00", "Activo", "Editar"]`,
  },
  {
    label: "table-row",
    kind: "keyword",
    detail: 'row ["dato1", "dato2", "dato3"] o | col1 | col2 |',
    insertText: `row ["#101", "Javier Diaz", "85%", "Activo", "Configurar", ""]`,
    documentation: "Fila de datos dentro de una tabla. Admite sintaxis de array o pipes de markdown.",
    example: `row ["#101", "Auth Gateway", "90%", "Activo", "Configurar", ""]`,
  },
  {
    label: "accordion",
    kind: "keyword",
    detail: 'accordion "Título" [expanded=false] [icon=...]',
    insertText: `accordion "Datos de Facturación" expanded=false\n  textfield rfc label="RFC / Tax ID"\n  textfield razon label="Razón Social"`,
    documentation:
      "Panel de expansión / acordeón plegable Material 3 para agrupar contenido colapsable con chevron animado.",
    parameters: [
      { name: "title", type: "string", description: "Título del encabezado del panel" },
      { name: "expanded", type: "boolean", description: "Estado inicial desplegado (true) o plegado (false)", values: ["true", "false"] },
      { name: "icon", type: "string", description: "Ícono Lucide a la izquierda del encabezado" },
      { name: "variant", type: "string", description: "Variante de superficie", values: ["elevated", "outlined", "filled"] },
    ],
    example: `accordion "Datos Fiscales (Opcional)" expanded=false\n  textfield rfc label="RFC / Tax ID"\n  textfield razon label="Razón Social"`,
  },

  // Interactive Widgets & Controls
  {
    label: "button",
    kind: "keyword",
    detail: 'button "Texto" [filled|outlined|tonal|text] [icon=...] [goto=...]',
    insertText: `button "Acción" filled icon=save goto=@Home`,
    documentation:
      "Botón interactivo Material 3 estándar con soporte de variantes (filled, outlined, tonal, elevated, text), íconos y navegación.",
    example: `button "Guardar Cambios" filled icon=save goto=@Config`,
  },
  {
    label: "button (con Snackbar y Goto)",
    kind: "keyword",
    detail: 'button "Facturar" filled icon=send snackbar="Mensaje" snackbar-action="Deshacer" goto=@Screen',
    insertText: `button "Facturar" filled icon=send snackbar="Factura #1024 enviada" snackbar-action="Deshacer" goto=@KiroSetup`,
    documentation:
      "Botón interactivo que ejecuta simultáneamente una notificación emergente (Snackbar / Toast) y la navegación fluida a otra pantalla de destino.",
    example: `button "Facturar" filled icon=send snackbar="Factura #1024 enviada" snackbar-action="Deshacer" goto=@KiroSetup`,
  },
  {
    label: "button (con Toast Template @Nombre)",
    kind: "keyword",
    detail: 'button "Guardar" filled icon=save goto=@Destino snackbar=@PlantillaToast',
    insertText: `button "Guardar" filled icon=save goto=@ListaClientes snackbar=@FacturaToast`,
    documentation:
      "Botón que dispara una plantilla de notificación @Toast declarada previamente en el documento y navega al destino indicado.",
    example: `@FacturaToast:snackbar "Factura procesada con éxito" snackbar-action="Ver PDF" snackbar-type=success\n\nbutton "Guardar" filled icon=save goto=@ListaClientes snackbar=@FacturaToast`,
  },
  {
    label: "textfield",
    kind: "keyword",
    detail: 'textfield id label="..." placeholder="..." [icon=...] [type=...]',
    insertText: `textfield email label="Correo Electrónico" placeholder="usuario@correo.com" icon=mail`,
    documentation:
      "Campo de entrada de texto Material 3 con etiqueta flotante animada, ícono y soporte para contraseñas/emails.",
    example: `textfield password label="Contraseña" type=password icon=lock`,
  },
  {
    label: "searchbar",
    kind: "keyword",
    detail: 'searchbar id [placeholder="..."] [value="..."]',
    insertText: `searchbar busqueda placeholder="Buscar usuarios, productos o registros..."`,
    documentation:
      "Barra de búsqueda con estilo Material 3, ícono de lupa integrado y botón de borrado rápido.",
    example: `searchbar query placeholder="Buscar en el sistema..."`,
  },
  {
    label: "search",
    kind: "keyword",
    detail: 'search id [placeholder="..."]',
    insertText: `search query placeholder="Buscar..."`,
    documentation:
      "Alias para barra de búsqueda 'searchbar' con ícono de lupa integrado.",
    example: `search busqueda placeholder="Filtrar datos..."`,
  },
  {
    label: "textarea",
    kind: "keyword",
    detail: 'textarea id label="..." rows=3 placeholder="..."',
    insertText: `textarea comentarios label="Comentarios" rows=3 placeholder="Escribe aquí..."`,
    documentation: "Área de texto multilínea para comentarios o descripciones largas.",
    example: `textarea notas label="Notas adicionales" rows=4`,
  },
  {
    label: "text",
    kind: "keyword",
    detail: 'text "Mensaje" [title|headline|body|label|display|caption] [color=...]',
    insertText: `text "Título Principal" title`,
    documentation:
      "Elemento tipográfico con soporte para la escala de tipos de Material 3 (display, headline, title, body, label, caption).",
    example: `text "Panel de Control" headline color=primary`,
  },
  {
    label: "select",
    kind: "keyword",
    detail: 'select id label="..." value="..."',
    insertText: `select categoria label="Categoría" value="Tecnología"\n  option "Tecnología"\n  option "Finanzas"\n  option "Diseño"`,
    documentation:
      "Menú desplegable de selección única con estilo Material 3 y lista de opciones anidadas.",
    example: `select rol label="Rol de Usuario" value="Admin"\n  option "Admin"\n  option "Editor"`,
  },
  {
    label: "autocomplete",
    kind: "keyword",
    detail: 'autocomplete id label="..." placeholder="..." [options=[...]]',
    insertText: `autocomplete pais label="País de Residencia" placeholder="Escribe para buscar..."\n  option "Argentina"\n  option "Chile"\n  option "Colombia"\n  option "Costa Rica"\n  option "España"\n  option "México"\n  option "Perú"`,
    documentation:
      "Menú desplegable con campo de búsqueda predictiva / filtro dinámico en tiempo real (Material 3 Exposed Dropdown Menu Filterable).",
    example: `autocomplete pais label="País" placeholder="Buscar país..."\n  option "México"\n  option "España"`,
  },
  {
    label: "datepicker",
    kind: "keyword",
    detail: 'datepicker id label="..." value="2026-08-20"',
    insertText: `datepicker fecha_inicio label="Fecha de Inicio"`,
    documentation: "Selector de fechas nativo con estilo Material 3 e ícono de calendario integrado.",
    example: `datepicker fecha_nacimiento label="Fecha de Nacimiento"`,
  },
  {
    label: "radio",
    kind: "keyword",
    detail: 'radio id label="..." group="..." [checked=true]',
    insertText: `radio opcion1 label="Envío Estándar (3-5 días)" group="envio" checked=true`,
    documentation: "Botón de radio individual o en grupo para selección mutuamente exclusiva.",
    example: `radio express label="Envío Express 24h" group="envio"`,
  },
  {
    label: "option",
    kind: "keyword",
    detail: 'option "Valor"',
    insertText: 'option "Nueva Opción"',
    documentation: "Opción individual para un menú desplegable 'select' en Wisp DSL.",
    example: `option "Administrador"`,
  },
  {
    label: "switch",
    kind: "keyword",
    detail: 'switch id label="..." [checked=true]',
    insertText: `switch notificaciones label="Habilitar notificaciones" checked=true`,
    documentation: "Interruptor toggle interactivo con soporte de etiqueta y estado activado/desactivado.",
    example: `switch darkMode label="Modo Oscuro" checked=true`,
  },
  {
    label: "checkbox",
    kind: "keyword",
    detail: 'checkbox id label="..." [checked=true]',
    insertText: `checkbox terminos label="Acepto los términos y condiciones" checked=false`,
    documentation: "Casilla de verificación Material 3 para selecciones booleanas o múltiples.",
    example: `checkbox recordarme label="Recordar mi sesión" checked=true`,
  },
  {
    label: "slider",
    kind: "keyword",
    detail: 'slider id label="..." min=0 max=100 value=50',
    insertText: `slider volumen label="Nivel de Volumen" min=0 max=100 value=75`,
    documentation: "Control deslizante para selección continua o por pasos de valores numéricos.",
    example: `slider brillo label="Brillo" min=0 max=100 value=50`,
  },
  {
    label: "chip",
    kind: "keyword",
    detail: 'chip "Texto" [selected=true] [icon=...] [dismissible=true]',
    insertText: `chip "Filtro Activo" selected=true icon=check`,
    documentation: "Pastilla compacta interactiva (Filter/Action Chip) para etiquetas, filtros o selecciones dinámicas.",
    example: `chip "En Curso" selected=true icon=clock`,
  },
  {
    label: "segmentedbutton",
    kind: "keyword",
    detail: 'segmentedbutton options=["Diario", "Semanal", "Mensual"] selected=0',
    insertText: `segmentedbutton options=["Día", "Semana", "Mes"] selected=0`,
    documentation: "Grupo de botones segmentados para alternar vistas o filtros exclusivos.",
    example: `segmentedbutton options=["Activos", "Pendientes", "Todos"] selected=0`,
  },
  {
    label: "listitem",
    kind: "keyword",
    detail: 'listitem "Título" [subtitle="..."] [icon=...] [goto=...]',
    insertText: `listitem "Elemento de lista" subtitle="Descripción secundaria" icon=folder goto=@Detalle`,
    documentation: "Fila estructurada de lista Material 3 con soporte de ícono inicial, título, subtítulo y navegación.",
    example: `listitem "Juan Pérez" subtitle="juan@correo.com" icon=user goto=@Perfil`,
  },
  {
    label: "avatar",
    kind: "keyword",
    detail: 'avatar "JP" [size=40] [icon=user]',
    insertText: `avatar "JD" icon=user size=40`,
    documentation: "Elemento circular de imagen o iniciales para representar usuarios o perfiles.",
    example: `avatar "AD" size=48`,
  },
  {
    label: "badge",
    kind: "keyword",
    detail: 'badge "Nuevo" [variant=primary|error|tonal|success]',
    insertText: `badge "Nuevo" variant=primary`,
    documentation: "Insignia compacta de estado o contador numérico de notificaciones.",
    example: `badge "3" variant=error`,
  },
  {
    label: "icon",
    kind: "keyword",
    detail: "icon name=settings [size=24] [color=primary]",
    insertText: `icon name=settings size=24`,
    documentation: "Ícono vectorial independiente renderizado a partir del catálogo Lucide.",
    example: `icon name=heart size=20 color=error`,
  },
  {
    label: "image",
    kind: "keyword",
    detail: 'image src="..." [alt="..."] [aspect=16/9] [rounded=true]',
    insertText: `image src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600" aspect=16/9 rounded=true`,
    documentation: "Componente de imagen con proporción fija y bordes redondeados.",
    example: `image src="https://picsum.photos/400/250" aspect=16/9 rounded=true`,
  },
  {
    label: "progress",
    kind: "keyword",
    detail: "progress value=75 [variant=linear|circular]",
    insertText: `progress value=75 variant=linear`,
    documentation: "Barra de progreso lineal o circular Material 3 para estados de carga y avance.",
    example: `progress value=60 variant=linear`,
  },
  {
    label: "metric",
    kind: "keyword",
    detail: 'metric label="..." value="..." delta="..." [icon=...]',
    insertText: `metric label="Ingresos Totales" value="$48,250" delta="+24.5%" icon=dollar-sign`,
    documentation: "Tarjeta de indicador clave (KPI) con valor numérico grande, etiqueta explicativa e indicador de tendencia.",
    example: `metric label="Conversión" value="4.8%" delta="+0.6%" icon=trending-up`,
  },
  {
    label: "stat",
    kind: "keyword",
    detail: 'stat label="..." value="..." [icon=...]',
    insertText: `stat label="Usuarios" value="1,240" icon=users`,
    documentation: "Tarjeta de estadística compacta para resúmenes de datos.",
    example: `stat label="Ventas" value="450" icon=shopping-bag`,
  },
  {
    label: "alert",
    kind: "keyword",
    detail: 'alert "Mensaje" [variant=info|success|warning|error] [title="..."]',
    insertText: `alert "Operación realizada correctamente." variant=success title="Éxito"`,
    documentation: "Mensaje de banner contextual (informativo, éxito, advertencia o error).",
    example: `alert "Revisa tu conexión a internet" variant=warning title="Sin Conexión"`,
  },
  {
    label: "divider",
    kind: "keyword",
    detail: "divider [spacing=16]",
    insertText: `divider spacing=16`,
    documentation: "Línea separadora sutil horizontal para delimitar secciones en listas y tarjetas.",
    example: `divider spacing=12`,
  },
  {
    label: "spacer",
    kind: "keyword",
    detail: "spacer size=16",
    insertText: `spacer size=16`,
    documentation: "Espaciador vertical invisible para separar elementos.",
    example: `spacer size=24`,
  },
  {
    label: "appbar",
    kind: "keyword",
    detail: 'appbar "Título" [icon=arrow-left] [goto=@Home] [action="..."]',
    insertText: `appbar "Título de la Barra" icon=arrow-left goto=@Home`,
    documentation: "Barra superior de aplicación (Top App Bar Material 3) con título e ícono de navegación/menú.",
    example: `appbar "Ajustes de Cuenta" icon=arrow-left goto=@Dashboard`,
  },
  {
    label: "topappbar",
    kind: "keyword",
    detail: 'topappbar "Título" [icon=menu] [goto=@Home] [action="..."]',
    insertText: `topappbar "Título de la Barra" icon=menu goto=@Home`,
    documentation: "Alias estándar de barra superior de aplicación Material 3.",
    example: `topappbar "Gestión de Pedidos" icon=arrow-left goto=@Dashboard`,
  },
  {
    label: "navbar",
    kind: "keyword",
    detail: 'navbar "Título" [icon=menu] [goto=@Home]',
    insertText: `navbar "Mi Aplicación" icon=menu goto=@Home`,
    documentation: "Barra de navegación y encabezado superior.",
    example: `navbar "Mi Empresa" icon=menu\n  button "Salir" text goto=@Login`,
  },
  {
    label: "bottomnav",
    kind: "keyword",
    detail: "bottomnav -> navitem ...",
    insertText: `bottomnav\n  navitem "Inicio" icon=home goto=@Home active=true\n  navitem "Explorar" icon=search goto=@Explorar\n  navitem "Perfil" icon=user goto=@Perfil`,
    documentation: "Barra de navegación inferior fija para móviles con pestañas interactivas e íconos.",
    example: `bottomnav\n  navitem "Feed" icon=home goto=@Feed active=true\n  navitem "Mensajes" icon=mail goto=@Inbox`,
  },
  {
    label: "navigationrail",
    kind: "keyword",
    detail: 'navigationrail title="..." fab=plus user="..." [expanded=true|false]',
    insertText: `navigationrail title="Espacio" fab=plus fabLabel="Nuevo"\n  railitem "Inicio" icon=home active\n    appbar "Panel Principal" icon=home\n    card elevated\n      text "Bienvenido al Panel" title\n  railitem "Analíticas" icon=bar-chart-2 badge="8"\n    appbar "Métricas" icon=bar-chart-2\n  railitem "Ajustes" icon=settings\n    appbar "Ajustes" icon=settings`,
    documentation:
      "Barra de navegación vertical Material 3 (Navigation Rail) para desktop y tablet con cambio dinámico de paneles, botón FAB, badges y modo expandible.",
    example: `navigationrail title="Workspace" fab=plus\n  railitem "Inicio" icon=home active\n    text "Contenido Inicio"\n  railitem "Mensajes" icon=mail badge="4"\n    text "Bandeja de Entrada"`,
  },
  {
    label: "railitem",
    kind: "keyword",
    detail: 'railitem "Título" icon=home [active] [badge="..."]',
    insertText: `railitem "Destino" icon=home active\n  `,
    documentation:
      "Destino o panel individual dentro de un contenedor 'navigationrail' con contenido anidado conmutable.",
    example: `railitem "Resumen" icon=home active\n  appbar "Panel Principal" icon=home`,
  },
  {
    label: "navitem",
    kind: "keyword",
    detail: 'navitem "Título" icon=home goto=@Home [active=true]',
    insertText: `navitem "Inicio" icon=home goto=@Home active=true`,
    documentation: "Pestaña individual dentro de una barra de navegación inferior (bottomnav) o navigationrail.",
    example: `navitem "Ajustes" icon=settings goto=@Config`,
  },
  {
    label: "fab",
    kind: "keyword",
    detail: 'fab "Texto" [icon=plus] [extended=true] [goto=@Nuevo] [variant=primary]',
    insertText: `fab "Nueva Venta" icon=plus extended=true goto=@NuevaVentaModal`,
    documentation:
      "Botón de acción flotante (Floating Action Button / Extended FAB Material 3) para la acción primordial de la pantalla.",
    parameters: [
      { name: "label", type: "string", description: "Texto descriptivo para Extended FAB" },
      { name: "icon", type: "string", description: "Ícono del FAB (ej. plus, edit, message-square, send)" },
      { name: "extended", type: "boolean", description: "Muestra FAB extendido con texto e ícono", values: ["true", "false"] },
      { name: "goto", type: "string", description: "Pantalla destino de navegación (ej. @NuevaVentaModal)" },
      { name: "variant", type: "string", description: "Esquema cromático Material 3", values: ["primary", "secondary", "tertiary", "surface"] },
    ],
    example: `fab "Nueva Venta" icon=plus extended=true goto=@NuevaVentaModal`,
  },
  {
    label: "snackbar",
    kind: "keyword",
    detail: 'snackbar "Mensaje" [action="Deshacer"] [icon=...] [type=info|success|warning|error]',
    insertText: `snackbar "Factura #1024 enviada por correo" action="Deshacer" icon=check-circle-2`,
    documentation:
      "Mensaje flotante de feedback temporal o permanente post-acción (Snackbar / Toast Material 3) con soporte para botón de acción.",
    parameters: [
      { name: "message", type: "string", description: "Texto del mensaje de feedback" },
      { name: "action", type: "string", description: "Texto del botón de acción (ej. 'Deshacer', 'Ver', 'Reintentar')" },
      { name: "icon", type: "string", description: "Ícono contextual (ej. check-circle-2, alert-circle, info)" },
      { name: "type", type: "string", description: "Tipo o severidad del mensaje", values: ["info", "success", "warning", "error"] },
      { name: "goto", type: "string", description: "Destino al pulsar la acción" },
    ],
    example: `snackbar "Factura #1024 enviada por correo" action="Deshacer" icon=check-circle-2`,
  },
  {
    label: "breadcrumbs",
    kind: "keyword",
    detail: 'breadcrumbs items=["Nivel 1", "Nivel 2", "Actual"] [separator=chevron]',
    insertText: `breadcrumbs items=["Clientes", "Acme Corporation", "Facturas"]`,
    documentation:
      "Línea de navegación jerárquica con separadores que indica la ruta de navegación actual en la aplicación.",
    parameters: [
      { name: "items", type: "array", description: "Lista de elementos o niveles jerárquicos" },
      { name: "separator", type: "string", description: "Tipo de separador visual", values: ["chevron", "slash"] },
    ],
    example: `breadcrumbs items=["Clientes", "Acme Corporation", "Facturas"]`,
  },
  {
    label: "rating",
    kind: "keyword",
    detail: 'rating id label="..." value=4 max=5 [readonly=false]',
    insertText: `rating satisfaccion label="Califica tu experiencia" value=4 max=5 readonly=false`,
    documentation:
      "Control de estrellas interactivo de calificación y feedback (Material 3 Rating Bar / Stars) con soporte para valor editable o de sólo lectura.",
    parameters: [
      { name: "label", type: "string", description: "Etiqueta descriptiva sobre las estrellas" },
      { name: "value", type: "number", description: "Valor inicial de calificación (ej. 4)" },
      { name: "max", type: "number", description: "Número total de estrellas (por defecto 5)" },
      { name: "readonly", type: "boolean", description: "Deshabilita interacción para solo lectura", values: ["false", "true"] },
      { name: "size", type: "string", description: "Tamaño de las estrellas", values: ["sm", "md", "lg"] },
    ],
    example: `rating satisfaccion label="Califica tu experiencia" value=4 max=5 readonly=false`,
  },
  {
    label: "splitbutton",
    kind: "keyword",
    detail: 'splitbutton "Acción Principal" icon=download goto=@Target',
    insertText: `splitbutton "Exportar" icon=download goto=@ExportModal\n  menuitem "Descargar PDF" icon=file-text goto=@ExportPDF\n  menuitem "Exportar CSV" icon=table goto=@ExportCSV`,
    documentation: "Botón dividido Material 3 Expressive (Split Button) que combina un gatillo de acción principal con un menú desplegable de acciones secundarias.",
    parameters: [
      { name: "label", type: "string", description: "Texto del botón de acción principal" },
      { name: "icon", type: "string", description: "Ícono Lucide del botón principal" },
      { name: "goto", type: "string", description: "Destino al pulsar el botón principal" },
      { name: "variant", type: "string", description: "Variante cromática", values: ["filled", "tonal", "outlined", "elevated"] },
    ],
    example: `splitbutton "Guardar" icon=save goto=@Save\n  menuitem "Guardar como borrador" icon=file-text\n  menuitem "Publicar inmediatamente" icon=send`,
  },
  {
    label: "buttongroup",
    kind: "keyword",
    detail: 'buttongroup [variant=outlined|filled]',
    insertText: `buttongroup\n  button "Vista 1" active=true\n  button "Vista 2"\n  button "Vista 3"`,
    documentation: "Grupo de botones conectados Material 3 Expressive con bordes unificados, división integrada y soporte para estados activos/segmentados.",
    parameters: [
      { name: "variant", type: "string", description: "Variante visual del grupo", values: ["outlined", "filled", "tonal"] },
    ],
    example: `buttongroup\n  button "Mensual" active=true\n  button "Anual"\n  button "Vitalicio"`,
  },
  {
    label: "fabmenu",
    kind: "keyword",
    detail: 'fabmenu "Acciones" icon=plus',
    insertText: `fabmenu "Crear" icon=plus\n  fabitem "Nuevo Usuario" icon=user-plus goto=@CreateUser\n  fabitem "Subir Archivo" icon=upload goto=@UploadModal`,
    documentation: "Menú flotante Speed-Dial Material 3 Expressive (FAB Menu) con gatillo central y botones de acción secundaria expandibles con etiquetas animadas.",
    parameters: [
      { name: "label", type: "string", description: "Etiqueta opcional para el gatillo FAB principal" },
      { name: "icon", type: "string", description: "Ícono principal del FAB (ej. plus, sparkles, layers)" },
      { name: "variant", type: "string", description: "Variante cromática", values: ["primary", "secondary", "tertiary", "surface"] },
    ],
    example: `fabmenu "Acciones" icon=plus\n  fabitem "Crear Evento" icon=calendar goto=@NewEvent\n  fabitem "Enviar Mensaje" icon=mail goto=@NewMsg`,
  },
  {
    label: "fabitem",
    kind: "keyword",
    detail: 'fabitem "Título" icon=plus goto=@Target',
    insertText: `fabitem "Nueva Tarea" icon=check-square goto=@NewTask`,
    documentation: "Elemento de acción secundaria dentro de un contenedor 'fabmenu' flotante.",
    parameters: [
      { name: "label", type: "string", description: "Etiqueta emergente del elemento" },
      { name: "icon", type: "string", description: "Ícono del botón de acción secundario" },
      { name: "goto", type: "string", description: "Destino de navegación" },
    ],
    example: `fabitem "Descargar Reporte" icon=download goto=@DownloadReport`,
  },
  {
    label: "wavyprogress",
    kind: "keyword",
    detail: 'wavyprogress label="..." value=65 [variant=linear|circular]',
    insertText: `wavyprogress label="Sincronizando..." value=70 variant=linear`,
    documentation: "Indicador de progreso orgánico sinusoidal Material 3 Expressive (Wavy Progress) con onda armónica continua o roseta circular animada.",
    parameters: [
      { name: "value", type: "number", description: "Porcentaje de avance (0 a 100)" },
      { name: "label", type: "string", description: "Etiqueta descriptiva sobre el indicador" },
      { name: "variant", type: "string", description: "Variante geométrica", values: ["linear", "circular"] },
      { name: "amplitude", type: "number", description: "Amplitud de la onda sinusoidal" },
    ],
    example: `wavyprogress label="Compilando diseño..." value=85 variant=linear`,
  },

  // Screens & Declarations
  {
    label: "@Toast:snackbar",
    kind: "screen",
    detail: '@Nombre:snackbar "Mensaje" snackbar-action="Deshacer" icon=check-circle-2',
    insertText: `@NotificacionExito:snackbar "Operación realizada con éxito" snackbar-action="Deshacer" icon=check-circle-2 snackbar-type=success`,
    documentation:
      "Declara una plantilla de notificación Snackbar / Toast reutilizable vinculable a cualquier botón con snackbar=@NotificacionExito.",
    example: `@FacturaToast:snackbar "Factura #1024 enviada" snackbar-action="Deshacer" icon=check-circle-2\n\n@Main:screen\n  button "Enviar Factura" filled snackbar=@FacturaToast`,
  },
  {
    label: "@Screen:screen",
    kind: "screen",
    detail: "@Nombre:screen [theme=material3]",
    insertText: `@NuevaPantalla:screen\n  appbar "Título de Pantalla" icon=arrow-left\n  `,
    documentation:
      "Declara una nueva pantalla independiente en el documento Wisp. Cada pantalla actúa como una vista navegable.",
    example: `@Dashboard:screen\n  appbar "Panel Principal" icon=menu\n  card elevated\n    text "Bienvenido" title`,
  },
  {
    label: "@Wizard:wizard",
    kind: "screen",
    detail: "@Nombre:wizard steps: N",
    insertText: `@RegistroFlow:wizard\n  steps: 3\n\n  step "Paso 1: Datos Personales"\n    textfield nombre label="Nombre Completo"\n    button "Siguiente" filled goto=@RegistroFlow(step=2)\n\n  step "Paso 2: Confirmación"\n    text "Revisa tus datos" body\n    button "Finalizar" filled goto=@Home\n`,
    documentation:
      "Declara un flujo guiado paso a paso (Wizard / Stepper) con navegación secuencial automática.",
    example: `@Onboarding:wizard\n  steps: 2\n  step "Paso 1"\n    button "Continuar" filled goto=@Onboarding(step=2)`,
  },
  {
    label: "@Dialog:dialog",
    kind: "screen",
    detail: "@Nombre:dialog",
    insertText: `@ConfirmarModal:dialog\n  text "Confirmar Acción" title\n  text "¿Estás seguro de continuar?" body\n  row spacing=8\n    button "Cancelar" text\n    button "Aceptar" filled goto=@Home\n`,
    documentation:
      "Declara una ventana modal centrada (Dialog Material 3) para confirmaciones, alertas o formularios breves.",
    example: `@Alerta:dialog\n  text "Atención" title\n  button "Entendido" filled`,
  },
  {
    label: "@Sheet:sheet",
    kind: "screen",
    detail: "@Nombre:sheet",
    insertText: `@OpcionesSheet:sheet\n  text "Opciones Avanzadas" title\n  listitem "Descargar archivo" icon=download\n  listitem "Compartir enlace" icon=share\n`,
    documentation:
      "Declara un panel inferior deslizable (Bottom Sheet Material 3) ideal para acciones contextuales en móvil.",
    example: `@MenuInferior:sheet\n  listitem "Configuración" icon=settings`,
  },
  {
    label: "@Component:component",
    kind: "screen",
    detail: "@Nombre:component (Bloque de UI reutilizable)",
    insertText: `@SelectorPais:component\n  autocomplete pais label="País de Residencia" placeholder="Selecciona un país..."\n    option "México"\n    option "España"\n    option "Colombia"\n    option "Chile"\n`,
    documentation:
      "Declara un bloque o componente modular reutilizable en WDL que puede incrustarse en múltiples pantallas mediante 'component @Nombre'.",
    example: `@DireccionFiscal:component\n  grid cols=2 gap=12\n    textfield calle label="Calle y Número"\n    textfield cp label="Código Postal"\n\n@Checkout:screen\n  component @DireccionFiscal`,
  },
  {
    label: "component",
    kind: "keyword",
    detail: "component @Nombre [prop=valor]",
    insertText: `component @`,
    documentation:
      "Incrusta un componente reutilizable declarado previamente con @Nombre:component en la pantalla actual.",
    example: `component @DireccionFiscal`,
  },
  {
    label: "include",
    kind: "keyword",
    detail: "include @Nombre",
    insertText: `include @`,
    documentation:
      "Alias para incrustar un componente reutilizable declarado con @Nombre:component.",
    example: `include @SelectorPais`,
  },
  {
    label: "step",
    kind: "keyword",
    detail: 'step "Paso N: Nombre"',
    insertText: `step "Paso 1: Información Básica"`,
    documentation: "Declara un paso individual dentro de un contenedor '@Nombre:wizard'.",
    example: `step "Paso 2: Confirmación"`,
  },
  {
    label: "data",
    kind: "keyword",
    detail: "data nombre -> clave: valor",
    insertText: `data usuario\n  nombre: "Juan Pérez"\n  email: "juan@ejemplo.com"\n  rol: "Administrador"`,
    documentation: "Declara un modelo de datos local con pares clave-valor para vincular a la interfaz.",
    example: `data configuracion\n  notificaciones: true\n  tema: "oscuro"`,
  },
];

// ==========================================
// 2. COMPONENT-SPECIFIC PROPERTIES & ATTRIBUTES
// (Shown ONLY when cursor is INSIDE an element/statement)
// ==========================================

export const COMPONENT_PROPERTIES: Record<string, WispCompletionItem[]> = {
  // Button
  button: [
    {
      label: "filled",
      kind: "modifier",
      detail: "Variante de alto énfasis (Fondo relleno sólido)",
      insertText: "filled",
      documentation: "Estilo estándar de botón primario Material 3 con color de acento relleno.",
    },
    {
      label: "outlined",
      kind: "modifier",
      detail: "Variante de énfasis medio (Borde sutil, fondo transparente)",
      insertText: "outlined",
      documentation: "Botón con contorno de 1px ideal para acciones secundarias.",
    },
    {
      label: "tonal",
      kind: "modifier",
      detail: "Variante tonal secundaria (Fondo tenue con contraste)",
      insertText: "tonal",
      documentation: "Botón con fondo tenue de superficie secundaria para énfasis medio-alto.",
    },
    {
      label: "elevated",
      kind: "modifier",
      detail: "Variante elevada (Sombra y relieve superficial)",
      insertText: "elevated",
      documentation: "Botón con sombra de elevación sobre superficies planas.",
    },
    {
      label: "text",
      kind: "modifier",
      detail: "Variante plana de texto (Sin borde ni fondo)",
      insertText: "text",
      documentation: "Botón plano y discreto sin marco, ideal para cancelar o acciones terciarias.",
    },
    {
      label: "icon=...",
      kind: "parameter",
      detail: "Ícono Lucide inicial (ej. icon=save)",
      insertText: "icon=",
      documentation: "Inserta un ícono decorativo antes del texto del botón.",
    },
    {
      label: "goto=@...",
      kind: "parameter",
      detail: "Destino de navegación a otra pantalla",
      insertText: "goto=@",
      documentation: "Permite navegar fluidamente a otra pantalla (@Pantalla) al hacer clic.",
    },
    {
      label: "disabled=true",
      kind: "parameter",
      detail: "Deshabilita la interacción y atenúa el botón",
      insertText: "disabled=true",
      documentation: "Bloquea los clics e indica visualmente estado inactivo.",
    },
    {
      label: 'badge="..."',
      kind: "parameter",
      detail: 'Insignia o contador en el botón (ej. badge="3")',
      insertText: 'badge="1"',
      documentation: "Muestra una pequeña burbuja numérica o de estado sobre el botón.",
    },
    {
      label: 'snackbar="..."',
      kind: "parameter",
      detail: 'Mensaje o @Toast para mostrar notificación emergente',
      insertText: 'snackbar="Factura enviada con éxito"',
      documentation: "Dispara un Snackbar / Toast emergente de confirmación al hacer clic. Puede ser texto o una referencia @Toast.",
    },
    {
      label: 'snackbar-action="..."',
      kind: "parameter",
      detail: 'Texto del botón de acción del snackbar (ej. "Deshacer")',
      insertText: 'snackbar-action="Deshacer"',
      documentation: "Añade un botón de acción interactivo a la notificación emergente.",
    },
    {
      label: "snackbar-icon=...",
      kind: "parameter",
      detail: "Ícono Lucide del snackbar (ej. check-circle-2, bell)",
      insertText: "snackbar-icon=check-circle-2",
      documentation: "Ícono gráfico que acompaña el mensaje del snackbar.",
    },
    {
      label: "snackbar-type=success|info|warning|error",
      kind: "parameter",
      detail: "Tipo o severidad del snackbar",
      insertText: "snackbar-type=success",
      documentation: "Establece el estilo cromático y severidad de la notificación.",
    },
    {
      label: "snackbar-goto=@...",
      kind: "parameter",
      detail: "Destino al pulsar la acción del snackbar",
      insertText: "snackbar-goto=@",
      documentation: "Navega a otra pantalla cuando el usuario pulsa la acción del snackbar.",
    },
    {
      label: "snackbar-duration=4000",
      kind: "parameter",
      detail: "Duración en ms antes del auto-cierre (ej. snackbar-duration = 400)",
      insertText: "snackbar-duration=4000",
      documentation: "Tiempo en milisegundos durante el cual el snackbar permanece visible.",
    },
  ],

  // TextField
  textfield: [
    {
      label: 'label="..."',
      kind: "parameter",
      detail: 'Etiqueta flotante animada (ej. label="Nombre")',
      insertText: 'label="Etiqueta"',
      documentation: "Texto de la etiqueta Material 3 que flota al enfocar el campo.",
    },
    {
      label: 'placeholder="..."',
      kind: "parameter",
      detail: 'Texto guía interno (ej. placeholder="Ej. Juan")',
      insertText: 'placeholder="Texto guía..."',
      documentation: "Texto visible en gris cuando el campo está vacío.",
    },
    {
      label: "type=text",
      kind: "parameter",
      detail: "Tipo de entrada estándar (Texto normal)",
      insertText: "type=text",
      documentation: "Campo de texto regular de una línea.",
    },
    {
      label: "type=password",
      kind: "parameter",
      detail: "Tipo contraseña con caracteres ocultos",
      insertText: "type=password",
      documentation: "Oculta el texto ingresado con puntos y botón para alternar visibilidad.",
    },
    {
      label: "type=email",
      kind: "parameter",
      detail: "Tipo correo electrónico",
      insertText: "type=email",
      documentation: "Valida formato de correo y optimiza teclado móvil.",
    },
    {
      label: "type=number",
      kind: "parameter",
      detail: "Tipo numérico",
      insertText: "type=number",
      documentation: "Abre teclado numérico y restringe caracteres a números.",
    },
    {
      label: "icon=...",
      kind: "parameter",
      detail: "Ícono inicial integrado en el campo (ej. icon=mail)",
      insertText: "icon=",
      documentation: "Ícono situado al inicio del campo de entrada.",
    },
    {
      label: 'helper="..."',
      kind: "parameter",
      detail: 'Mensaje de ayuda inferior (ej. helper="Mínimo 8 caracteres")',
      insertText: 'helper="Texto de ayuda"',
      documentation: "Texto explicativo pequeño debajo del campo.",
    },
    {
      label: "required=true",
      kind: "parameter",
      detail: "Marca el campo con asterisco obligatorio",
      insertText: "required=true",
      documentation: "Indica obligatoriedad visual en el formulario.",
    },
    {
      label: "disabled=true",
      kind: "parameter",
      detail: "Deshabilita la edición del campo",
      insertText: "disabled=true",
      documentation: "Bloquea la entrada de texto y aplica estilo atenuado.",
    },
    {
      label: 'value="..."',
      kind: "parameter",
      detail: "Valor inicial predeterminado",
      insertText: 'value=""',
      documentation: "Contenido de texto pre-cargado en el campo.",
    },
  ],

  // SearchBar
  searchbar: [
    {
      label: 'placeholder="..."',
      kind: "parameter",
      detail: 'Texto guía tenue de búsqueda (ej. placeholder="Buscar...")',
      insertText: 'placeholder="Buscar..."',
      documentation: "Texto de ejemplo visible cuando la barra de búsqueda está vacía.",
    },
    {
      label: 'value="..."',
      kind: "parameter",
      detail: 'Valor de búsqueda inicial',
      insertText: 'value=""',
      documentation: "Término de búsqueda inicial precargado.",
    },
    {
      label: "icon=...",
      kind: "parameter",
      detail: "Ícono Lucide personalizado (predeterminado: search)",
      insertText: "icon=search",
      documentation: "Ícono temático situado al inicio de la barra de búsqueda.",
    },
  ],
  search: [
    {
      label: 'placeholder="..."',
      kind: "parameter",
      detail: 'Texto guía tenue de búsqueda (ej. placeholder="Buscar...")',
      insertText: 'placeholder="Buscar..."',
      documentation: "Texto de ejemplo visible cuando la barra de búsqueda está vacía.",
    },
  ],

  // Textarea
  textarea: [
    {
      label: 'label="..."',
      kind: "parameter",
      detail: "Etiqueta flotante superior",
      insertText: 'label="Comentarios"',
      documentation: "Etiqueta descriptiva del área de texto.",
    },
    {
      label: 'placeholder="..."',
      kind: "parameter",
      detail: "Texto guía de ejemplo",
      insertText: 'placeholder="Escribe aquí tu mensaje..."',
      documentation: "Texto tenue cuando el área está vacía.",
    },
    {
      label: "rows=3",
      kind: "parameter",
      detail: "Número de filas de altura (ej. rows=3)",
      insertText: "rows=3",
      documentation: "Altura vertical en cantidad de líneas visibles.",
    },
    {
      label: 'helper="..."',
      kind: "parameter",
      detail: "Mensaje de ayuda inferior",
      insertText: 'helper="Máximo 500 caracteres"',
      documentation: "Texto de asistencia o límite de caracteres.",
    },
    {
      label: "required=true",
      kind: "parameter",
      detail: "Campo de texto obligatorio",
      insertText: "required=true",
      documentation: "Marca obligatoria para formularios.",
    },
  ],

  // Card
  card: [
    {
      label: "elevated",
      kind: "modifier",
      detail: "Tarjeta elevada con sombra superficial (Predeterminado)",
      insertText: "elevated",
      documentation: "Superficie Material 3 con sombra y elevación suave.",
    },
    {
      label: "outlined",
      kind: "modifier",
      detail: "Tarjeta con borde sutil de 1px sin sombra",
      insertText: "outlined",
      documentation: "Diseño limpio delimitado por un borde fino.",
    },
    {
      label: "filled",
      kind: "modifier",
      detail: "Tarjeta con fondo sólido de contraste medio",
      insertText: "filled",
      documentation: "Superficie de fondo sólido diferenciado.",
    },
    {
      label: "padding=16",
      kind: "parameter",
      detail: "Espaciado interno estándar de 16px",
      insertText: "padding=16",
      documentation: "Define el padding interno del contenedor.",
    },
    {
      label: "padding=8",
      kind: "parameter",
      detail: "Espaciado interno compacto de 8px",
      insertText: "padding=8",
      documentation: "Padding compacto para tarjetas densas.",
    },
    {
      label: "padding=24",
      kind: "parameter",
      detail: "Espaciado interno generoso de 24px",
      insertText: "padding=24",
      documentation: "Padding amplio para tarjetas destacadas.",
    },
    {
      label: "interactive=true",
      kind: "parameter",
      detail: "Habilita efecto hover interactivo al pasar el cursor",
      insertText: "interactive=true",
      documentation: "Añade animación de realce y cursor pointer.",
    },
    {
      label: "goto=@...",
      kind: "parameter",
      detail: "Navegar a otra pantalla al pulsar la tarjeta",
      insertText: "goto=@",
      documentation: "Convierte toda la tarjeta en un enlace interactivo.",
    },
  ],

  // Text
  text: [
    {
      label: "title",
      kind: "modifier",
      detail: "Estilo Título (18-20px, negrita moderada)",
      insertText: "title",
      documentation: "Título estándar para tarjetas, modales y secciones.",
    },
    {
      label: "headline",
      kind: "modifier",
      detail: "Estilo Encabezado grande (24px)",
      insertText: "headline",
      documentation: "Encabezado principal para vistas y paneles.",
    },
    {
      label: "display",
      kind: "modifier",
      detail: "Estilo Display extra grande (32px+)",
      insertText: "display",
      documentation: "Texto de alto impacto para números o portadas.",
    },
    {
      label: "body",
      kind: "modifier",
      detail: "Estilo Cuerpo de texto (14-16px estándar)",
      insertText: "body",
      documentation: "Texto estándar legible para párrafos y descripciones.",
    },
    {
      label: "label",
      kind: "modifier",
      detail: "Estilo Etiqueta pequeña (11-12px)",
      insertText: "label",
      documentation: "Texto pequeño para detalles o metadatos.",
    },
    {
      label: "caption",
      kind: "modifier",
      detail: "Estilo Pie de foto / Nota tenue",
      insertText: "caption",
      documentation: "Texto tenue y reducido para notas secundarias.",
    },
    {
      label: "color=primary",
      kind: "parameter",
      detail: "Color primario de acento",
      insertText: "color=primary",
      documentation: "Aplica el color principal del tema activo.",
    },
    {
      label: "color=secondary",
      kind: "parameter",
      detail: "Color secundario tenue",
      insertText: "color=secondary",
      documentation: "Aplica el color secundario del tema.",
    },
    {
      label: "color=muted",
      kind: "parameter",
      detail: "Color gris atenuado para texto secundario",
      insertText: "color=muted",
      documentation: "Texto gris de bajo contraste para descripciones.",
    },
    {
      label: "color=error",
      kind: "parameter",
      detail: "Color rojo de error",
      insertText: "color=error",
      documentation: "Texto rojo para alertas o mensajes de error.",
    },
    {
      label: "color=success",
      kind: "parameter",
      detail: "Color verde de éxito",
      insertText: "color=success",
      documentation: "Texto verde para estados positivos y completados.",
    },
    {
      label: "bold=true",
      kind: "parameter",
      detail: "Aplica grosor negrita (bold)",
      insertText: "bold=true",
      documentation: "Resalta el texto con peso de fuente 600.",
    },
    {
      label: "align=center",
      kind: "parameter",
      detail: "Alineación centrada",
      insertText: "align=center",
      documentation: "Centra el texto horizontalmente.",
    },
    {
      label: "align=left",
      kind: "parameter",
      detail: "Alineación a la izquierda",
      insertText: "align=left",
      documentation: "Alinea el texto a la izquierda.",
    },
    {
      label: "align=right",
      kind: "parameter",
      detail: "Alineación a la derecha",
      insertText: "align=right",
      documentation: "Alinea el texto a la derecha.",
    },
  ],

  // Select
  select: [
    {
      label: 'label="..."',
      kind: "parameter",
      detail: 'Etiqueta flotante del selector (ej. label="País")',
      insertText: 'label="Selecciona una opción"',
      documentation: "Etiqueta superior animada para el menú desplegable.",
    },
    {
      label: 'value="..."',
      kind: "parameter",
      detail: "Opción seleccionada por defecto",
      insertText: 'value=""',
      documentation: "Valor inicial predeterminado del selector.",
    },
    {
      label: 'helper="..."',
      kind: "parameter",
      detail: "Texto de ayuda inferior",
      insertText: 'helper="Selecciona un elemento"',
      documentation: "Mensaje aclaratorio debajo del selector.",
    },
    {
      label: "disabled=true",
      kind: "parameter",
      detail: "Deshabilita el menú desplegable",
      insertText: "disabled=true",
      documentation: "Bloquea la apertura del menú.",
    },
  ],

  // Option
  option: [
    {
      label: 'value="..."',
      kind: "parameter",
      detail: 'Valor interno asociado a la opción (ej. value="admin")',
      insertText: 'value="valor"',
      documentation: "Valor subyacente que se guarda al elegir esta opción.",
    },
  ],

  // Chip
  chip: [
    {
      label: "selected=true",
      kind: "parameter",
      detail: "Estado seleccionado activo (resaltado)",
      insertText: "selected=true",
      documentation: "Aplica el fondo activo y color de énfasis.",
    },
    {
      label: "selected=false",
      kind: "parameter",
      detail: "Estado deseleccionado",
      insertText: "selected=false",
      documentation: "Mantiene el chip en estado neutro no seleccionado.",
    },
    {
      label: "icon=...",
      kind: "parameter",
      detail: "Ícono inicial integrado en el chip (ej. icon=check)",
      insertText: "icon=",
      documentation: "Ícono decorativo antes del texto de la pastilla.",
    },
    {
      label: "dismissible=true",
      kind: "parameter",
      detail: "Muestra botón de cierre (X) para descartar o eliminar",
      insertText: "dismissible=true",
      documentation: "Añade un botón de cruz para remover la etiqueta.",
    },
    {
      label: "variant=outlined",
      kind: "parameter",
      detail: "Variante con borde sutil",
      insertText: "variant=outlined",
      documentation: "Chip con contorno de 1px.",
    },
    {
      label: "variant=filled",
      kind: "parameter",
      detail: "Variante rellena sólida",
      insertText: "variant=filled",
      documentation: "Chip con fondo sólido.",
    },
    {
      label: "goto=@...",
      kind: "parameter",
      detail: "Navegación al pulsar el chip",
      insertText: "goto=@",
      documentation: "Navega a otra pantalla al hacer clic.",
    },
  ],

  // Switch & Checkbox
  switch: [
    {
      label: 'label="..."',
      kind: "parameter",
      detail: 'Texto descriptivo del interruptor (ej. label="Modo Oscuro")',
      insertText: 'label="Activar opción"',
      documentation: "Etiqueta visible al lado del switch.",
    },
    {
      label: "checked=true",
      kind: "parameter",
      detail: "Estado activado por defecto (On)",
      insertText: "checked=true",
      documentation: "Inicializa el interruptor en estado encendido.",
    },
    {
      label: "checked=false",
      kind: "parameter",
      detail: "Estado desactivado por defecto (Off)",
      insertText: "checked=false",
      documentation: "Inicializa el interruptor en estado apagado.",
    },
    {
      label: "disabled=true",
      kind: "parameter",
      detail: "Deshabilita la interacción con el interruptor",
      insertText: "disabled=true",
      documentation: "Bloquea cambios de estado por parte del usuario.",
    },
  ],

  checkbox: [
    {
      label: 'label="..."',
      kind: "parameter",
      detail: 'Texto junto a la casilla (ej. label="Acepto términos")',
      insertText: 'label="Opción"',
      documentation: "Etiqueta descriptiva de la casilla de verificación.",
    },
    {
      label: "checked=true",
      kind: "parameter",
      detail: "Casilla marcada por defecto",
      insertText: "checked=true",
      documentation: "Inicializa la casilla como seleccionada.",
    },
    {
      label: "checked=false",
      kind: "parameter",
      detail: "Casilla desmarcada por defecto",
      insertText: "checked=false",
      documentation: "Inicializa la casilla vacía.",
    },
    {
      label: "disabled=true",
      kind: "parameter",
      detail: "Deshabilita la casilla",
      insertText: "disabled=true",
      documentation: "Impide marcar o desmarcar la casilla.",
    },
  ],

  // Slider
  slider: [
    {
      label: 'label="..."',
      kind: "parameter",
      detail: 'Etiqueta del slider (ej. label="Volumen")',
      insertText: 'label="Nivel"',
      documentation: "Título descriptivo sobre el control deslizante.",
    },
    {
      label: "min=0",
      kind: "parameter",
      detail: "Valor numérico mínimo",
      insertText: "min=0",
      documentation: "Límite inferior del rango de valores.",
    },
    {
      label: "max=100",
      kind: "parameter",
      detail: "Valor numérico máximo",
      insertText: "max=100",
      documentation: "Límite superior del rango de valores.",
    },
    {
      label: "step=1",
      kind: "parameter",
      detail: "Incremento por paso (ej. step=5 o step=1)",
      insertText: "step=1",
      documentation: "Intervalo de cambio de cada paso al deslizar.",
    },
    {
      label: "value=50",
      kind: "parameter",
      detail: "Valor numérico inicial",
      insertText: "value=50",
      documentation: "Posición inicial del deslizador.",
    },
    {
      label: "disabled=true",
      kind: "parameter",
      detail: "Deshabilita el control deslizante",
      insertText: "disabled=true",
      documentation: "Bloquea el arrastre del slider.",
    },
  ],

  // ListItem
  listitem: [
    {
      label: 'subtitle="..."',
      kind: "parameter",
      detail: 'Texto secundario inferior (ej. subtitle="juan@correo.com")',
      insertText: 'subtitle="Descripción secundaria"',
      documentation: "Texto secundario de menor tamaño debajo del título.",
    },
    {
      label: "icon=...",
      kind: "parameter",
      detail: "Ícono inicial representativo (ej. icon=user)",
      insertText: "icon=",
      documentation: "Ícono posicionado a la izquierda del elemento de lista.",
    },
    {
      label: "goto=@...",
      kind: "parameter",
      detail: "Pantalla destino de navegación",
      insertText: "goto=@",
      documentation: "Navega a otra vista al pulsar la fila de la lista.",
    },
    {
      label: 'trailing="..."',
      kind: "parameter",
      detail: 'Texto o indicador final a la derecha (ej. trailing="$25.00")',
      insertText: 'trailing="Ver más"',
      documentation: "Elemento de texto o valor situado al extremo derecho.",
    },
    {
      label: 'badge="..."',
      kind: "parameter",
      detail: 'Insignia o etiqueta destacada (ej. badge="Nuevo")',
      insertText: 'badge="Nuevo"',
      documentation: "Insignia de color sobre el elemento.",
    },
    {
      label: "divider=true",
      kind: "parameter",
      detail: "Muestra línea separadora inferior de 1px",
      insertText: "divider=true",
      documentation: "Inserta un divisor sutil al final de la fila.",
    },
  ],

  // Avatar
  avatar: [
    {
      label: 'name="..."',
      kind: "parameter",
      detail: 'Nombre para generar iniciales automáticas (ej. name="Juan Pérez")',
      insertText: 'name="Juan Pérez"',
      documentation: "Genera iniciales circulares en base al nombre.",
    },
    {
      label: "icon=...",
      kind: "parameter",
      detail: "Ícono central representativo (ej. icon=user)",
      insertText: "icon=user",
      documentation: "Muestra un ícono en lugar de iniciales.",
    },
    {
      label: "size=40",
      kind: "parameter",
      detail: "Tamaño mediano estándar (40px)",
      insertText: "size=40",
      documentation: "Diámetro en píxeles del avatar.",
    },
    {
      label: "size=32",
      kind: "parameter",
      detail: "Tamaño compacto (32px)",
      insertText: "size=32",
      documentation: "Avatar pequeño para listas densas o barras.",
    },
    {
      label: "size=48",
      kind: "parameter",
      detail: "Tamaño grande (48px)",
      insertText: "size=48",
      documentation: "Avatar grande para tarjetas de perfil.",
    },
    {
      label: 'src="..."',
      kind: "parameter",
      detail: "URL directa de imagen de perfil",
      insertText: 'src="https://..."',
      documentation: "Carga una foto de perfil externa.",
    },
  ],

  // Badge
  badge: [
    {
      label: "variant=primary",
      kind: "parameter",
      detail: "Variante color primario (Púrpura/Azul)",
      insertText: "variant=primary",
      documentation: "Color de acento principal del tema.",
    },
    {
      label: "variant=error",
      kind: "parameter",
      detail: "Variante color rojo de error/alerta",
      insertText: "variant=error",
      documentation: "Insignia roja para notificaciones urgentes o contadores.",
    },
    {
      label: "variant=success",
      kind: "parameter",
      detail: "Variante color verde de éxito",
      insertText: "variant=success",
      documentation: "Insignia verde para estados completados o activos.",
    },
    {
      label: "variant=tonal",
      kind: "parameter",
      detail: "Variante color neutro atenuado",
      insertText: "variant=tonal",
      documentation: "Insignia sutil para categorías o etiquetas generales.",
    },
    {
      label: "size=sm",
      kind: "parameter",
      detail: "Tamaño pequeño compacto",
      insertText: "size=sm",
      documentation: "Insignia pequeña para chips o barras.",
    },
    {
      label: "size=md",
      kind: "parameter",
      detail: "Tamaño mediano",
      insertText: "size=md",
      documentation: "Insignia estándar.",
    },
  ],

  // Icon
  icon: [
    {
      label: "name=...",
      kind: "parameter",
      detail: "Nombre del ícono Lucide (ej. name=settings)",
      insertText: "name=settings",
      documentation: "Especifica el nombre del ícono a renderizar.",
    },
    {
      label: "size=24",
      kind: "parameter",
      detail: "Tamaño estándar de 24px",
      insertText: "size=24",
      documentation: "Dimensiones en píxeles del ícono.",
    },
    {
      label: "size=16",
      kind: "parameter",
      detail: "Tamaño pequeño de 16px",
      insertText: "size=16",
      documentation: "Ícono compacto para botones pequeños o chips.",
    },
    {
      label: "size=32",
      kind: "parameter",
      detail: "Tamaño grande de 32px",
      insertText: "size=32",
      documentation: "Ícono destacado para cabeceras o métricas.",
    },
    {
      label: "color=primary",
      kind: "parameter",
      detail: "Color de acento primario",
      insertText: "color=primary",
      documentation: "Aplica el color primario del tema activo.",
    },
    {
      label: "color=muted",
      kind: "parameter",
      detail: "Color gris atenuado",
      insertText: "color=muted",
      documentation: "Aplica color gris secundario.",
    },
  ],

  // Image
  image: [
    {
      label: 'src="..."',
      kind: "parameter",
      detail: "URL de la imagen",
      insertText: 'src="https://..."',
      documentation: "Ruta web de la imagen a mostrar.",
    },
    {
      label: 'alt="..."',
      kind: "parameter",
      detail: "Texto alternativo accesible",
      insertText: 'alt="Descripción de la imagen"',
      documentation: "Descripción para accesibilidad y lectores de pantalla.",
    },
    {
      label: "aspect=16/9",
      kind: "parameter",
      detail: "Proporción panorámica 16:9",
      insertText: "aspect=16/9",
      documentation: "Fija el aspect ratio en formato panorámico estándar.",
    },
    {
      label: "aspect=1/1",
      kind: "parameter",
      detail: "Proporción cuadrada 1:1",
      insertText: "aspect=1/1",
      documentation: "Fija el aspect ratio en formato cuadrado perfecto.",
    },
    {
      label: "aspect=4/3",
      kind: "parameter",
      detail: "Proporción estándar 4:3",
      insertText: "aspect=4/3",
      documentation: "Formato clásico para fotografías.",
    },
    {
      label: "rounded=true",
      kind: "parameter",
      detail: "Bordes redondeados suaves",
      insertText: "rounded=true",
      documentation: "Aplica esquinas redondeadas modernas a la imagen.",
    },
  ],

  // Progress
  progress: [
    {
      label: "value=50",
      kind: "parameter",
      detail: "Porcentaje de avance numérico de 0 a 100",
      insertText: "value=50",
      documentation: "Porcentaje actual completado.",
    },
    {
      label: "variant=linear",
      kind: "parameter",
      detail: "Variante barra horizontal lineal",
      insertText: "variant=linear",
      documentation: "Barra horizontal de progreso continuo.",
    },
    {
      label: "variant=circular",
      kind: "parameter",
      detail: "Variante anillo circular de carga",
      insertText: "variant=circular",
      documentation: "Indicador circular de progreso.",
    },
    {
      label: "indeterminate=true",
      kind: "parameter",
      detail: "Animación continua de carga infinita",
      insertText: "indeterminate=true",
      documentation: "Muestra animación fluida sin valor fijo definido.",
    },
  ],

  // Metric / Stat
  metric: [
    {
      label: 'label="..."',
      kind: "parameter",
      detail: 'Título de la métrica (ej. label="Ingresos")',
      insertText: 'label="Métrica"',
      documentation: "Nombre o descripción superior del indicador.",
    },
    {
      label: 'value="..."',
      kind: "parameter",
      detail: 'Valor destacado grande (ej. value="$12,500")',
      insertText: 'value="0"',
      documentation: "Cifra o dato numérico principal en tipografía grande.",
    },
    {
      label: 'delta="..."',
      kind: "parameter",
      detail: 'Indicador de cambio o porcentaje (ej. delta="+15%")',
      insertText: 'delta="+12%"',
      documentation: "Tasa de variación respecto al periodo anterior.",
    },
    {
      label: "icon=...",
      kind: "parameter",
      detail: "Ícono temático representativo (ej. icon=dollar-sign)",
      insertText: "icon=",
      documentation: "Ícono decorativo en la esquina de la tarjeta KPI.",
    },
    {
      label: "trend=up",
      kind: "parameter",
      detail: "Tendencia alcista positiva (Verde con flecha arriba)",
      insertText: "trend=up",
      documentation: "Marca la métrica con flecha verde de crecimiento.",
    },
    {
      label: "trend=down",
      kind: "parameter",
      detail: "Tendencia bajista (Roja con flecha abajo)",
      insertText: "trend=down",
      documentation: "Marca la métrica con flecha roja de disminución.",
    },
  ],

  stat: [
    {
      label: 'label="..."',
      kind: "parameter",
      detail: 'Título descriptivo (ej. label="Usuarios Activos")',
      insertText: 'label="Estadística"',
      documentation: "Nombre del dato estadístico.",
    },
    {
      label: 'value="..."',
      kind: "parameter",
      detail: 'Valor numérico (ej. value="1,240")',
      insertText: 'value="0"',
      documentation: "Número o resultado de la estadística.",
    },
    {
      label: "icon=...",
      kind: "parameter",
      detail: "Ícono representativo (ej. icon=users)",
      insertText: "icon=",
      documentation: "Ícono Lucide temático.",
    },
  ],

  // Alert
  alert: [
    {
      label: "variant=info",
      kind: "parameter",
      detail: "Variante informativa azul",
      insertText: "variant=info",
      documentation: "Mensaje informativo neutral.",
    },
    {
      label: "variant=success",
      kind: "parameter",
      detail: "Variante de éxito verde",
      insertText: "variant=success",
      documentation: "Mensaje de confirmación o acción exitosa.",
    },
    {
      label: "variant=warning",
      kind: "parameter",
      detail: "Variante de advertencia amarilla/ámbar",
      insertText: "variant=warning",
      documentation: "Alerta de precaución o acción sensible.",
    },
    {
      label: "variant=error",
      kind: "parameter",
      detail: "Variante de error crítica roja",
      insertText: "variant=error",
      documentation: "Mensaje de fallo, error o bloqueo.",
    },
    {
      label: 'title="..."',
      kind: "parameter",
      detail: 'Título destacado del mensaje (ej. title="Atención")',
      insertText: 'title="Título"',
      documentation: "Encabezado en negrita dentro del banner de alerta.",
    },
    {
      label: "icon=...",
      kind: "parameter",
      detail: "Ícono inicial personalizado",
      insertText: "icon=",
      documentation: "Reemplaza el ícono por defecto de la alerta.",
    },
    {
      label: "dismissible=true",
      kind: "parameter",
      detail: "Permite cerrar la alerta con botón X",
      insertText: "dismissible=true",
      documentation: "Añade botón de descarte en la esquina derecha.",
    },
  ],

  // Divider
  divider: [
    {
      label: "spacing=16",
      kind: "parameter",
      detail: "Margen vertical estándar de 16px",
      insertText: "spacing=16",
      documentation: "Espacio de separación vertical superior e inferior.",
    },
    {
      label: "spacing=8",
      kind: "parameter",
      detail: "Margen vertical compacto de 8px",
      insertText: "spacing=8",
      documentation: "Separación compacta.",
    },
    {
      label: "spacing=24",
      kind: "parameter",
      detail: "Margen vertical amplio de 24px",
      insertText: "spacing=24",
      documentation: "Separación generosa entre secciones mayores.",
    },
  ],

  // Spacer
  spacer: [
    {
      label: "size=16",
      kind: "parameter",
      detail: "Espacio vertical de 16px",
      insertText: "size=16",
      documentation: "Separador invisible estándar.",
    },
    {
      label: "size=24",
      kind: "parameter",
      detail: "Espacio vertical de 24px",
      insertText: "size=24",
      documentation: "Separador invisible medio.",
    },
    {
      label: "size=32",
      kind: "parameter",
      detail: "Espacio vertical generoso de 32px",
      insertText: "size=32",
      documentation: "Separador invisible amplio.",
    },
    {
      label: "size=8",
      kind: "parameter",
      detail: "Espacio vertical compacto de 8px",
      insertText: "size=8",
      documentation: "Separador invisible pequeño.",
    },
  ],

  // Row & Column
  row: [
    {
      label: "spacing=8",
      kind: "parameter",
      detail: "Espacio compacto entre elementos (8px)",
      insertText: "spacing=8",
      documentation: "Gap horizontal de 8px entre hijos.",
    },
    {
      label: "spacing=12",
      kind: "parameter",
      detail: "Espacio estándar entre elementos (12px)",
      insertText: "spacing=12",
      documentation: "Gap horizontal estándar.",
    },
    {
      label: "spacing=16",
      kind: "parameter",
      detail: "Espacio generoso entre elementos (16px)",
      insertText: "spacing=16",
      documentation: "Gap horizontal de 16px.",
    },
    {
      label: "align=center",
      kind: "parameter",
      detail: "Alineación vertical centrada (align-items: center)",
      insertText: "align=center",
      documentation: "Centra los elementos a lo largo del eje transversal.",
    },
    {
      label: "justify=between",
      kind: "parameter",
      detail: "Distribución en extremos (justify-content: space-between)",
      insertText: "justify=between",
      documentation: "Empuja el primer elemento a la izquierda y el último a la derecha.",
    },
    {
      label: "justify=center",
      kind: "parameter",
      detail: "Centrado horizontal (justify-content: center)",
      insertText: "justify=center",
      documentation: "Centra los elementos en el contenedor.",
    },
    {
      label: "wrap=true",
      kind: "parameter",
      detail: "Permite salto de línea automático si no hay espacio (flex-wrap)",
      insertText: "wrap=true",
      documentation: "Los elementos saltan a la siguiente fila en pantallas pequeñas.",
    },
  ],

  column: [
    {
      label: "spacing=8",
      kind: "parameter",
      detail: "Espacio compacto de 8px entre filas",
      insertText: "spacing=8",
      documentation: "Gap vertical compacto.",
    },
    {
      label: "spacing=12",
      kind: "parameter",
      detail: "Espacio estándar de 12px entre filas",
      insertText: "spacing=12",
      documentation: "Gap vertical estándar.",
    },
    {
      label: "spacing=16",
      kind: "parameter",
      detail: "Espacio generoso de 16px entre filas",
      insertText: "spacing=16",
      documentation: "Gap vertical amplio.",
    },
    {
      label: "spacing=24",
      kind: "parameter",
      detail: "Espacio amplio de 24px entre secciones",
      insertText: "spacing=24",
      documentation: "Gap vertical para grandes módulos.",
    },
    {
      label: "align=center",
      kind: "parameter",
      detail: "Centrado horizontal de los hijos",
      insertText: "align=center",
      documentation: "Centra los elementos verticalmente apilados.",
    },
  ],

  // Grid
  grid: [
    {
      label: "cols=2",
      kind: "parameter",
      detail: "Cuadrícula de 2 columnas",
      insertText: "cols=2",
      documentation: "Diseño de 2 columnas de ancho uniforme.",
    },
    {
      label: "cols=3",
      kind: "parameter",
      detail: "Cuadrícula de 3 columnas",
      insertText: "cols=3",
      documentation: "Diseño estándar para tableros KPI y tarjetas.",
    },
    {
      label: "cols=4",
      kind: "parameter",
      detail: "Cuadrícula de 4 columnas",
      insertText: "cols=4",
      documentation: "Diseño para métricas densas o productos.",
    },
    {
      label: "gap=16",
      kind: "parameter",
      detail: "Separación de 16px entre celdas",
      insertText: "gap=16",
      documentation: "Espaciado uniforme en filas y columnas.",
    },
    {
      label: "gap=12",
      kind: "parameter",
      detail: "Separación compacta de 12px",
      insertText: "gap=12",
      documentation: "Espaciado compacto entre celdas.",
    },
    {
      label: "gap=24",
      kind: "parameter",
      detail: "Separación amplia de 24px",
      insertText: "gap=24",
      documentation: "Espaciado generoso entre celdas.",
    },
  ],

  // AppBar
  appbar: [
    {
      label: "icon=arrow-left",
      kind: "parameter",
      detail: "Ícono de flecha atrás para navegación",
      insertText: "icon=arrow-left",
      documentation: "Botón de retorno a la pantalla anterior.",
    },
    {
      label: "icon=menu",
      kind: "parameter",
      detail: "Ícono de menú hamburguesa",
      insertText: "icon=menu",
      documentation: "Botón para abrir panel lateral de navegación.",
    },
    {
      label: "goto=@...",
      kind: "parameter",
      detail: "Destino al hacer clic en el ícono de la barra",
      insertText: "goto=@",
      documentation: "Pantalla destino de navegación.",
    },
    {
      label: 'action="..."',
      kind: "parameter",
      detail: 'Texto o botón de acción a la derecha (ej. action="Guardar")',
      insertText: 'action="Guardar"',
      documentation: "Botón de acción secundario en la esquina superior derecha.",
    },
  ],

  // FAB
  fab: [
    {
      label: 'label="..."',
      kind: "parameter",
      detail: 'Texto descriptivo para Extended FAB (ej. label="Nueva Venta")',
      insertText: 'label="Nueva Venta"',
      documentation: "Muestra el texto junto al ícono en un botón flotante extendido.",
    },
    {
      label: "icon=plus",
      kind: "parameter",
      detail: "Ícono de agregar/crear",
      insertText: "icon=plus",
      documentation: "Ícono central del botón flotante.",
    },
    {
      label: "extended=true",
      kind: "parameter",
      detail: "FAB extendido con texto e ícono en formato píldora",
      insertText: "extended=true",
      documentation: "Muestra un botón flotante más ancho con texto explicativo.",
    },
    {
      label: "extended=false",
      kind: "parameter",
      detail: "FAB circular compacto estándar solo con ícono",
      insertText: "extended=false",
      documentation: "Botón circular flotante de 56x56px.",
    },
    {
      label: "goto=@...",
      kind: "parameter",
      detail: "Pantalla a abrir al pulsar el FAB",
      insertText: "goto=@",
      documentation: "Destino de navegación de la acción principal.",
    },
    {
      label: "variant=primary",
      kind: "parameter",
      detail: "Color primario de acento Material 3",
      insertText: "variant=primary",
      documentation: "Color de alto contraste para el botón flotante.",
    },
    {
      label: "variant=secondary",
      kind: "parameter",
      detail: "Color secundario tonal",
      insertText: "variant=secondary",
      documentation: "Variante tonal secundaria.",
    },
    {
      label: "variant=tertiary",
      kind: "parameter",
      detail: "Color terciario de énfasis alternativo",
      insertText: "variant=tertiary",
      documentation: "Variante de color terciario.",
    },
    {
      label: "variant=surface",
      kind: "parameter",
      detail: "Color de superficie elevado con sombra",
      insertText: "variant=surface",
      documentation: "Variante sutil sobre la superficie de la app.",
    },
  ],

  // Accordion / Expansion Panel
  accordion: [
    {
      label: "expanded=true",
      kind: "parameter",
      detail: "Panel desplegado por defecto al cargar",
      insertText: "expanded=true",
      documentation: "Mantiene el acordeón abierto inicialmente.",
    },
    {
      label: "expanded=false",
      kind: "parameter",
      detail: "Panel colapsado por defecto al cargar",
      insertText: "expanded=false",
      documentation: "Mantiene el acordeón cerrado inicialmente.",
    },
    {
      label: "icon=...",
      kind: "parameter",
      detail: "Ícono Lucide en el encabezado del panel",
      insertText: "icon=",
      documentation: "Ícono que acompaña al título del panel colapsable.",
    },
    {
      label: "variant=elevated",
      kind: "parameter",
      detail: "Variante elevada con sombra sutil",
      insertText: "variant=elevated",
      documentation: "Panel de acordeón elevado sobre el fondo.",
    },
    {
      label: "variant=outlined",
      kind: "parameter",
      detail: "Variante contorneada con borde de 1px",
      insertText: "variant=outlined",
      documentation: "Panel de acordeón con borde delimitador fino.",
    },
    {
      label: "variant=filled",
      kind: "parameter",
      detail: "Variante con fondo de superficie tonal",
      insertText: "variant=filled",
      documentation: "Panel con fondo sólido de contenedor.",
    },
    {
      label: 'badge="..."',
      kind: "parameter",
      detail: 'Insignia en el encabezado (ej. badge="Opcional")',
      insertText: 'badge="Opcional"',
      documentation: "Insignia informativa visible en el encabezado del acordeón.",
    },
  ],

  // Snackbar / Toast
  snackbar: [
    {
      label: 'action="..."',
      kind: "parameter",
      detail: 'Texto del botón de acción (ej. action="Deshacer")',
      insertText: 'action="Deshacer"',
      documentation: "Botón interactivo en el extremo derecho del snackbar.",
    },
    {
      label: "icon=...",
      kind: "parameter",
      detail: "Ícono Lucide del mensaje (ej. icon=check-circle-2)",
      insertText: "icon=check-circle-2",
      documentation: "Ícono que antecede al mensaje de notificación.",
    },
    {
      label: "type=info",
      kind: "parameter",
      detail: "Tipo informativo neutro",
      insertText: "type=info",
      documentation: "Notificación estándar con tema inverso.",
    },
    {
      label: "type=success",
      kind: "parameter",
      detail: "Tipo de confirmación o éxito verde",
      insertText: "type=success",
      documentation: "Notificación de operación completada con éxito.",
    },
    {
      label: "type=warning",
      kind: "parameter",
      detail: "Tipo de alerta o precaución ámbar",
      insertText: "type=warning",
      documentation: "Notificación de advertencia.",
    },
    {
      label: "type=error",
      kind: "parameter",
      detail: "Tipo de error o fallo crítico rojo",
      insertText: "type=error",
      documentation: "Notificación de error en la operación.",
    },
    {
      label: "goto=@...",
      kind: "parameter",
      detail: "Destino al pulsar la acción del snackbar",
      insertText: "goto=@",
      documentation: "Navega a otra pantalla al pulsar el botón del snackbar.",
    },
  ],

  // Breadcrumbs
  breadcrumbs: [
    {
      label: 'items=["..."]',
      kind: "parameter",
      detail: 'Lista de niveles jerárquicos (ej. items=["Inicio", "Clientes", "Detalle"])',
      insertText: 'items=["Inicio", "Sección", "Detalle"]',
      documentation: "Ruta de navegación representada como arreglo de textos.",
    },
    {
      label: "separator=chevron",
      kind: "parameter",
      detail: "Separador visual de flecha chevron (>)",
      insertText: "separator=chevron",
      documentation: "Utiliza el ícono ChevronRight de Material 3 entre ítems.",
    },
    {
      label: "separator=slash",
      kind: "parameter",
      detail: "Separador visual de barra inclinada (/)",
      insertText: "separator=slash",
      documentation: "Utiliza una barra inclinada / entre ítems.",
    },
  ],

  // Rating
  rating: [
    {
      label: 'label="..."',
      kind: "parameter",
      detail: 'Texto descriptivo (ej. label="Califica tu experiencia")',
      insertText: 'label="Calificación"',
      documentation: "Etiqueta sobre la barra de estrellas.",
    },
    {
      label: "value=4",
      kind: "parameter",
      detail: "Calificación numérica seleccionada",
      insertText: "value=4",
      documentation: "Número de estrellas activas inicialmente.",
    },
    {
      label: "max=5",
      kind: "parameter",
      detail: "Total máximo de estrellas (ej. max=5)",
      insertText: "max=5",
      documentation: "Escala máxima de calificación.",
    },
    {
      label: "readonly=false",
      kind: "parameter",
      detail: "Permite al usuario hacer clic para calificar",
      insertText: "readonly=false",
      documentation: "Estrellas interactivas con hover y click.",
    },
    {
      label: "readonly=true",
      kind: "parameter",
      detail: "Modo de solo lectura sin interacción",
      insertText: "readonly=true",
      documentation: "Muestra la puntuación fija sin permitir cambios.",
    },
    {
      label: "size=sm",
      kind: "parameter",
      detail: "Tamaño compacto de estrellas (16px)",
      insertText: "size=sm",
      documentation: "Estrellas pequeñas para tablas o tarjetas densas.",
    },
    {
      label: "size=md",
      kind: "parameter",
      detail: "Tamaño estándar de estrellas (22px)",
      insertText: "size=md",
      documentation: "Tamaño regular de calificación.",
    },
    {
      label: "size=lg",
      kind: "parameter",
      detail: "Tamaño grande destacado de estrellas (30px)",
      insertText: "size=lg",
      documentation: "Estrellas grandes para encuestas o pantallas de feedback.",
    },
  ],

  // NavItem
  navitem: [
    {
      label: "icon=...",
      kind: "parameter",
      detail: "Ícono de la pestaña (ej. icon=home)",
      insertText: "icon=home",
      documentation: "Ícono representativo de la vista.",
    },
    {
      label: "goto=@...",
      kind: "parameter",
      detail: "Pantalla a la que navega esta pestaña",
      insertText: "goto=@",
      documentation: "Destino de navegación al seleccionar el ítem.",
    },
    {
      label: "active=true",
      kind: "parameter",
      detail: "Marca la pestaña como activa por defecto",
      insertText: "active=true",
      documentation: "Aplica estado resaltado inicial.",
    },
  ],

  // Screen declarations
  screen: [
    {
      label: "theme=material3",
      kind: "parameter",
      detail: "Tema visual Material Design 3 (Predeterminado)",
      insertText: "theme=material3",
      documentation: "Aplica componentes y esquinas redondeadas de Material 3.",
    },
    {
      label: "theme=ios",
      kind: "parameter",
      detail: "Tema visual inspirado en iOS Human Interface",
      insertText: "theme=ios",
      documentation: "Estilo limpio con barras y fuentes nativas de iOS.",
    },
    {
      label: "theme=fluent",
      kind: "parameter",
      detail: "Tema visual Microsoft Fluent Design",
      insertText: "theme=fluent",
      documentation: "Superficies acrílicas y esquinas sutiles de Fluent.",
    },
  ],

  wizard: [
    {
      label: "steps: 3",
      kind: "parameter",
      detail: "Número total de pasos en el flujo",
      insertText: "steps: 3",
      documentation: "Cantidad total de etapas del asistente guiado.",
    },
    {
      label: "theme=material3",
      kind: "parameter",
      detail: "Tema visual",
      insertText: "theme=material3",
      documentation: "Esquema visual para el wizard.",
    },
  ],

  dialog: [
    {
      label: "theme=material3",
      kind: "parameter",
      detail: "Tema visual",
      insertText: "theme=material3",
      documentation: "Esquema visual para la ventana modal.",
    },
  ],

  sheet: [
    {
      label: "theme=material3",
      kind: "parameter",
      detail: "Tema visual",
      insertText: "theme=material3",
      documentation: "Esquema visual para el panel inferior.",
    },
  ],
};

// Aliases for component properties
COMPONENT_PROPERTIES["modal"] = COMPONENT_PROPERTIES["dialog"];
COMPONENT_PROPERTIES["form"] = COMPONENT_PROPERTIES["screen"];

// ==========================================
// 3. COMMON ICONS LIST
// (Shown when typing icon=...)
// ==========================================

export const WISP_ICONS: WispCompletionItem[] = [
  { label: "icon=save", kind: "icon", detail: "Ícono guardar / disco", insertText: "icon=save", documentation: "Acciones de guardado de formularios." },
  { label: "icon=home", kind: "icon", detail: "Ícono inicio / casa", insertText: "icon=home", documentation: "Navegación principal a la pantalla de inicio." },
  { label: "icon=user", kind: "icon", detail: "Ícono usuario / perfil", insertText: "icon=user", documentation: "Cuentas de usuario, avatares o perfiles." },
  { label: "icon=settings", kind: "icon", detail: "Ícono ajustes / configuración", insertText: "icon=settings", documentation: "Pantallas de preferencias y opciones del sistema." },
  { label: "icon=search", kind: "icon", detail: "Ícono lupa / búsqueda", insertText: "icon=search", documentation: "Barras de búsqueda y filtros de contenido." },
  { label: "icon=plus", kind: "icon", detail: "Ícono agregar / crear (+)", insertText: "icon=plus", documentation: "Creación de nuevos registros o elementos." },
  { label: "icon=trash", kind: "icon", detail: "Ícono papelera / eliminar", insertText: "icon=trash", documentation: "Acciones de borrado o descarte." },
  { label: "icon=mail", kind: "icon", detail: "Ícono correo / email", insertText: "icon=mail", documentation: "Campos de correo y mensajería." },
  { label: "icon=lock", kind: "icon", detail: "Ícono candado / contraseña", insertText: "icon=lock", documentation: "Campos de seguridad y autenticación." },
  { label: "icon=check", kind: "icon", detail: "Ícono verificación / check", insertText: "icon=check", documentation: "Confirmaciones y selecciones activas." },
  { label: "icon=check-circle", kind: "icon", detail: "Ícono círculo verificado", insertText: "icon=check-circle", documentation: "Estados de éxito y completitud." },
  { label: "icon=x", kind: "icon", detail: "Ícono cerrar / cancelar (X)", insertText: "icon=x", documentation: "Cierre de modales y descarte de chips." },
  { label: "icon=x-circle", kind: "icon", detail: "Ícono círculo error / rechazo", insertText: "icon=x-circle", documentation: "Estados de error o fallo." },
  { label: "icon=arrow-left", kind: "icon", detail: "Ícono flecha atrás", insertText: "icon=arrow-left", documentation: "Retroceso en barras de aplicación." },
  { label: "icon=arrow-right", kind: "icon", detail: "Ícono flecha siguiente", insertText: "icon=arrow-right", documentation: "Avance al siguiente paso o detalle." },
  { label: "icon=dollar-sign", kind: "icon", detail: "Ícono finanzas / dinero ($)", insertText: "icon=dollar-sign", documentation: "Precios, transacciones y balances." },
  { label: "icon=bell", kind: "icon", detail: "Ícono campana / notificaciones", insertText: "icon=bell", documentation: "Alertas y centro de notificaciones." },
  { label: "icon=edit", kind: "icon", detail: "Ícono lápiz / editar", insertText: "icon=edit", documentation: "Modificación de datos existentes." },
  { label: "icon=calendar", kind: "icon", detail: "Ícono calendario / fecha", insertText: "icon=calendar", documentation: "Fechas, agendas y citas." },
  { label: "icon=clock", kind: "icon", detail: "Ícono reloj / tiempo", insertText: "icon=clock", documentation: "Horarios, duraciones y temporizadores." },
  { label: "icon=folder", kind: "icon", detail: "Ícono carpeta / categorías", insertText: "icon=folder", documentation: "Agrupación de archivos o elementos." },
  { label: "icon=download", kind: "icon", detail: "Ícono descargar", insertText: "icon=download", documentation: "Descarga de archivos y reportes." },
  { label: "icon=share", kind: "icon", detail: "Ícono compartir", insertText: "icon=share", documentation: "Compartir enlaces o contenido." },
  { label: "icon=filter", kind: "icon", detail: "Ícono filtro", insertText: "icon=filter", documentation: "Filtros de listas y tablas." },
  { label: "icon=star", kind: "icon", detail: "Ícono estrella / favorito", insertText: "icon=star", documentation: "Calificaciones y elementos destacados." },
  { label: "icon=heart", kind: "icon", detail: "Ícono corazón / me gusta", insertText: "icon=heart", documentation: "Favoritos y acciones de aprecio." },
  { label: "icon=info", kind: "icon", detail: "Ícono información (i)", insertText: "icon=info", documentation: "Ayudas contextuales y detalles." },
  { label: "icon=alert-triangle", kind: "icon", detail: "Ícono advertencia / alerta", insertText: "icon=alert-triangle", documentation: "Avisos de precaución y riesgo." },
  { label: "icon=menu", kind: "icon", detail: "Ícono menú hamburguesa", insertText: "icon=menu", documentation: "Apertura de menús laterales." },
  { label: "icon=refresh-cw", kind: "icon", detail: "Ícono actualizar / recargar", insertText: "icon=refresh-cw", documentation: "Recarga de datos y sincronización." },
];

// Fallback all completions list for backward compatibility
export const WISP_COMPLETIONS: WispCompletionItem[] = [
  ...TOP_LEVEL_COMPLETIONS,
  ...WISP_ICONS,
];

// ==========================================
// 4. SMART CONTEXTUAL COMPLETION ENGINE
// ==========================================

/**
 * Intelligent completion analyzer:
 * 1. If at the start of a statement/line -> Returns top-level components & screens.
 * 2. If inside a component statement -> Returns ONLY the properties & modifiers for that component!
 * 3. If typing a sub-property like `goto=@...` or `icon=...` -> Returns specific target values!
 */
export function getWispCompletions(
  lineTextBeforeCursor: string,
  screenNames: string[] = []
): { items: WispCompletionItem[]; replaceRange: { start: number; end: number } } {
  // Extract leading spaces / indentation
  const leadingSpaces = lineTextBeforeCursor.match(/^\s*/)?.[0] || "";
  const trimmedLine = lineTextBeforeCursor.substring(leadingSpaces.length);

  // Extract the current word prefix right before cursor
  const wordMatch = lineTextBeforeCursor.match(/([@#\w\-:=]+)$/);
  const word = wordMatch ? wordMatch[1] : "";
  const lowerWord = word.toLowerCase();

  const replaceRange = {
    start: lineTextBeforeCursor.length - word.length,
    end: lineTextBeforeCursor.length,
  };

  // -------------------------------------------------------------
  // SPECIAL CONTEXT 1: Sub-property `goto=@...`, `goto=...`, `snackbar-goto=@...`
  // -------------------------------------------------------------
  const isGotoContext =
    lowerWord.startsWith("goto=@") ||
    lowerWord.startsWith("goto=") ||
    lowerWord.startsWith("snackbar-goto=@") ||
    lowerWord.startsWith("snackbar-goto=") ||
    lowerWord.startsWith("snackbar_goto=@") ||
    lowerWord.startsWith("snackbar_goto=") ||
    (lowerWord.startsWith("@") && (trimmedLine.includes("goto=") || trimmedLine.includes("snackbar-goto=") || trimmedLine.includes("snackbar_goto=")));

  if (isGotoContext) {
    const isSnackbarGoto = lowerWord.includes("snackbar-goto") || lowerWord.includes("snackbar_goto");
    const prefix = isSnackbarGoto
      ? lowerWord.includes("_") ? "snackbar_goto=@" : "snackbar-goto=@"
      : "goto=@";

    const dynamicScreenCompletions: WispCompletionItem[] = screenNames.map((name) => ({
      label: `${prefix}${name}`,
      kind: "screen",
      detail: `Navegar a @${name}`,
      insertText: `${prefix}${name}`,
      documentation: `Navega de forma fluida a la pantalla @${name} definida en este documento Wisp.`,
      example: `button "Ir a ${name}" filled ${prefix}${name}`,
    }));

    if (dynamicScreenCompletions.length === 0) {
      dynamicScreenCompletions.push({
        label: `${prefix}Home`,
        kind: "screen",
        detail: "Navegar a @Home",
        insertText: `${prefix}Home`,
        documentation: "Navegación fluida a la pantalla @Home.",
      });
    }

    if (!isSnackbarGoto) {
      dynamicScreenCompletions.push(
        {
          label: "goto=back",
          kind: "screen",
          detail: "Retroceder en el historial de navegación",
          insertText: "goto=back",
          documentation: "Vuelve a la pantalla visitada anteriormente.",
        },
        {
          label: "goto=close",
          kind: "screen",
          detail: "Cerrar modal o diálogo activo",
          insertText: "goto=close",
          documentation: "Cierra el modal, diálogo o vista emergente actual.",
        }
      );
    }

    const filtered = dynamicScreenCompletions.filter((it) => {
      const l = it.label.toLowerCase();
      const ins = it.insertText.toLowerCase();
      return (
        l.includes(lowerWord) ||
        ins.includes(lowerWord) ||
        l.replace(/^(goto=|snackbar-goto=|snackbar_goto=)/, "").includes(lowerWord)
      );
    });

    return {
      items: filtered.length > 0 ? filtered : dynamicScreenCompletions,
      replaceRange,
    };
  }

  // -------------------------------------------------------------
  // SPECIAL CONTEXT 1.5: Toast / Snackbar template reference `snackbar=@...`
  // -------------------------------------------------------------
  if (lowerWord.startsWith("snackbar=@") || (lowerWord.startsWith("@") && trimmedLine.includes("snackbar="))) {
    const toastCompletions: WispCompletionItem[] = screenNames.map((name) => ({
      label: `snackbar=@${name}`,
      kind: "screen",
      detail: `Vincular notificación @${name}`,
      insertText: `snackbar=@${name}`,
      documentation: `Dispara la plantilla de notificación emergente @${name} al interactuar.`,
    }));

    if (toastCompletions.length === 0) {
      toastCompletions.push({
        label: "snackbar=@Toast",
        kind: "screen",
        detail: "Vincular notificación @Toast",
        insertText: "snackbar=@Toast",
        documentation: "Dispara la plantilla de notificación @Toast al hacer clic.",
      });
    }

    const filtered = toastCompletions.filter((it) =>
      it.label.toLowerCase().includes(lowerWord) || it.insertText.toLowerCase().includes(lowerWord)
    );

    return {
      items: filtered.length > 0 ? filtered : toastCompletions,
      replaceRange,
    };
  }

  // -------------------------------------------------------------
  // SPECIAL CONTEXT 1.6: Component reference `component @...`, `include @...`, `use @...`
  // -------------------------------------------------------------
  if (
    trimmedLine.startsWith("component") ||
    trimmedLine.startsWith("include") ||
    trimmedLine.startsWith("use") ||
    (leadingSpaces.length > 0 && lowerWord.startsWith("@"))
  ) {
    if (lowerWord.startsWith("@") || trimmedLine.endsWith(" ")) {
      const compCompletions: WispCompletionItem[] = screenNames.map((name) => ({
        label: `@${name}`,
        kind: "screen",
        detail: `Incrustar componente/pantalla @${name}`,
        insertText: lowerWord.startsWith("@") ? `@${name}` : `@${name}`,
        documentation: `Inserta e incrusta el contenido del componente @${name} reutilizable aquí.`,
      }));

      if (compCompletions.length > 0) {
        const filtered = compCompletions.filter((it) =>
          it.label.toLowerCase().includes(lowerWord) || it.insertText.toLowerCase().includes(lowerWord)
        );
        return {
          items: filtered.length > 0 ? filtered : compCompletions,
          replaceRange,
        };
      }
    }
  }

  // -------------------------------------------------------------
  // SPECIAL CONTEXT 2: Sub-property `icon=...` or `snackbar-icon=...`
  // -------------------------------------------------------------
  if (
    lowerWord.startsWith("icon=") ||
    lowerWord.startsWith("snackbar-icon=") ||
    lowerWord.startsWith("snackbar_icon=")
  ) {
    const isSnackbarIcon = lowerWord.startsWith("snackbar-icon=") || lowerWord.startsWith("snackbar_icon=");
    const prefix = isSnackbarIcon ? (lowerWord.includes("_") ? "snackbar_icon=" : "snackbar-icon=") : "icon=";
    const iconPrefix = lowerWord.substring(prefix.length);

    const filteredIcons = WISP_ICONS.map((it) => {
      const rawName = it.insertText.replace(/^icon=/, "");
      return {
        ...it,
        label: `${prefix}${rawName}`,
        insertText: `${prefix}${rawName}`,
      };
    }).filter((it) => {
      const rawName = it.insertText.replace(prefix, "").toLowerCase();
      return it.label.toLowerCase().includes(lowerWord) || rawName.includes(iconPrefix);
    });

    return {
      items: filteredIcons,
      replaceRange,
    };
  }

  // -------------------------------------------------------------
  // Analyze current line tokens to identify the Component & Statement position
  // -------------------------------------------------------------
  // Match the first token on the line: component name, directive, or declaration
  const firstTokenMatch = trimmedLine.match(/^([@#\w\-:=]+|\"[^\"]*\")/);
  const firstToken = firstTokenMatch ? firstTokenMatch[1] : "";

  // Check if cursor is still writing the FIRST token on the line
  const isAtFirstToken =
    trimmedLine.length === 0 ||
    trimmedLine === firstToken ||
    !trimmedLine.substring(firstToken.length).startsWith(" ");

  // =============================================================
  // CONTEXT A: AT THE BEGINNING OF THE STATEMENT / LINE
  // (Cursor is declaring a new element, container or screen)
  // =============================================================
  if (isAtFirstToken) {
    let pool = [...TOP_LEVEL_COMPLETIONS];

    // If user is typing `@...` at the start of the line, show screen types
    if (lowerWord.startsWith("@")) {
      pool = TOP_LEVEL_COMPLETIONS.filter((it) => it.kind === "screen");
    }

    if (!word) {
      return {
        items: pool,
        replaceRange,
      };
    }

    const filtered = pool.filter((item) => {
      const label = item.label.toLowerCase();
      const insert = item.insertText.toLowerCase();
      return label.includes(lowerWord) || insert.includes(lowerWord);
    });

    filtered.sort((a, b) => {
      const aStarts = a.label.toLowerCase().startsWith(lowerWord);
      const bStarts = b.label.toLowerCase().startsWith(lowerWord);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.label.localeCompare(b.label);
    });

    return {
      items: filtered,
      replaceRange,
    };
  }

  // =============================================================
  // CONTEXT B: INSIDE AN ELEMENT / STATEMENT
  // (Cursor is AFTER the element keyword -> SHOW ONLY ITS PROPERTIES)
  // =============================================================
  // Extract normalized component name
  let compKey = firstToken.toLowerCase();
  if (compKey.startsWith("@")) {
    if (compKey.includes(":")) {
      compKey = compKey.split(":")[1];
    } else {
      compKey = "screen";
    }
  }

  // Look up properties registered for this component
  const componentProps = COMPONENT_PROPERTIES[compKey];

  if (componentProps && componentProps.length > 0) {
    // Collect properties that have already been typed on this line to avoid duplicate suggestions
    const existingTokens = trimmedLine.split(/\s+/).map((t) => t.toLowerCase());

    // Filter properties for this element
    let propsPool = componentProps;

    // If user is currently typing a property prefix (e.g. `p` in `card p|`)
    if (word) {
      propsPool = propsPool.filter((item) => {
        const label = item.label.toLowerCase();
        const insert = item.insertText.toLowerCase();
        return (
          label.includes(lowerWord) ||
          insert.includes(lowerWord) ||
          (lowerWord.startsWith("icon") && item.label.startsWith("icon")) ||
          (lowerWord.startsWith("goto") && item.label.startsWith("goto"))
        );
      });

      propsPool.sort((a, b) => {
        const aStarts = a.label.toLowerCase().startsWith(lowerWord);
        const bStarts = b.label.toLowerCase().startsWith(lowerWord);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.label.localeCompare(b.label);
      });
    } else {
      // Prioritize unused properties
      propsPool = propsPool.filter((p) => {
        const pKey = p.insertText.split(/[:=\s]/)[0].toLowerCase();
        return !existingTokens.includes(pKey);
      });
      if (propsPool.length === 0) {
        propsPool = componentProps; // Fallback to all if all used
      }
    }

    return {
      items: propsPool,
      replaceRange,
    };
  }

  // If component is not specifically recognized, offer generic common properties
  const genericProps: WispCompletionItem[] = [
    { label: "icon=...", kind: "parameter", detail: "Ícono representativo", insertText: "icon=", documentation: "Nombre del ícono Lucide." },
    { label: "goto=@...", kind: "parameter", detail: "Destino de navegación", insertText: "goto=@", documentation: "Pantalla destino." },
    { label: "color=primary", kind: "parameter", detail: "Color primario", insertText: "color=primary", documentation: "Color principal." },
    { label: "disabled=true", kind: "parameter", detail: "Deshabilitar control", insertText: "disabled=true", documentation: "Estado inactivo." },
  ];

  const filteredGeneric = word
    ? genericProps.filter((it) => it.label.toLowerCase().includes(lowerWord))
    : genericProps;

  return {
    items: filteredGeneric,
    replaceRange,
  };
}
