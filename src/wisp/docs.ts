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
  category: "Layout" | "Inputs" | "Surfaces" | "Feedback & Status" | "Navigation & Structure" | "Data & Tables" | "Typography" | "Actions";
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
    category: "Surfaces",
    signature: 'card [elevated | outlined | filled] [padding=16]',
    summary: "Container surface with Material 3 rounded corners and elevation.",
    description: "Groups content blocks, form controls, stats, or charts within a panel featuring distinct visual hierarchy.",
    modifiers: [
      { name: "elevated", description: "Surface with soft elevation drop shadow (Default)." },
      { name: "outlined", description: "Flat surface with a subtle 1px border and no shadow." },
      { name: "filled", description: "Surface with tonal container fill color." },
    ],
    parameters: [
      { name: "padding", type: "number", default: "16", description: "Internal padding in pixels (e.g. padding=12, padding=20)" },
    ],
    examples: [
      'card elevated\n  text "Professional Plan" title\n  text "$29 / mo" headline\n  button "Choose Plan" filled',
      'card outlined padding=20\n  text "Account Overview" title',
    ],
    tips: [
      "You can nest any element inside a card adhering to the 2-space indentation rule.",
    ],
  },

  row: {
    name: "row",
    category: "Layout",
    signature: 'row [spacing=12] [align=center] [justify=between|center|start|end] [wrap=true]',
    summary: "Flexible horizontal container (Flexbox row) for side-by-side element layout.",
    description: "Arranges children horizontally with gap spacing control, vertical alignment, and cross-axis justification.",
    parameters: [
      { name: "spacing", type: "number", default: "12", description: "Horizontal gap in pixels between children (e.g. 8, 12, 16, 24)" },
      { name: "align", type: "string", default: "center", description: "Vertical alignment", values: ["start", "center", "end", "stretch"] },
      { name: "justify", type: "string", default: "start", description: "Horizontal distribution", values: ["start", "center", "end", "between", "around", "evenly"] },
      { name: "wrap", type: "boolean", default: "false", description: "Allows elements to wrap onto the next line on narrow viewports", values: ["true", "false"] },
    ],
    examples: [
      'row spacing=8\n  chip "Filter 1" selected=true\n  chip "Filter 2"',
      'row spacing=12 justify=between align=center\n  text "Total Due" title\n  text "$1,450.00" headline',
    ],
  },

  column: {
    name: "column",
    category: "Layout",
    signature: 'column [spacing=12] [align=center|start|end]',
    summary: "Flexible vertical container (Flexbox column) with uniform spacing between children.",
    description: "Stacks elements vertically while preserving constant gap margins without requiring manual spacers.",
    parameters: [
      { name: "spacing", type: "number", default: "12", description: "Vertical gap between children in pixels (e.g. 8, 12, 16, 24)" },
      { name: "align", type: "string", default: "start", description: "Horizontal alignment of children", values: ["start", "center", "end", "stretch"] },
    ],
    examples: [
      'column spacing=16\n  card elevated\n    text "Step 1" title\n  card elevated\n    text "Step 2" title',
    ],
  },

  grid: {
    name: "grid",
    category: "Layout",
    signature: 'grid [cols=2|3|4] [gap=16]',
    summary: "Responsive grid layout matrix for KPI dashboards, product catalogs, or bento grids.",
    description: "Automatically distributes child cards across uniform columns with responsive fluid spacing.",
    parameters: [
      { name: "cols", type: "number", default: "2", description: "Number of columns", values: ["1", "2", "3", "4", "5", "6"] },
      { name: "gap", type: "number", default: "16", description: "Grid cell gap spacing in pixels (e.g. 12, 16, 24)" },
    ],
    examples: [
      'grid cols=3 gap=16\n  stat label="Users" value="1,240" icon=users\n  stat label="Revenue" value="$48,500" icon=dollar-sign\n  stat label="Uptime" value="98.4%" icon=activity',
    ],
  },

  split: {
    name: "split",
    category: "Layout",
    signature: 'split\n  left\n    ...\n  right\n    ...',
    summary: "Two-panel split layout: left navigation sidebar and right main content canvas.",
    description: "Structures desktop and tablet master views with a persistent sidebar and primary workspace.",
    examples: [
      'split\n  left\n    text "Navigation" title\n    listitem "Dashboard" icon=layout\n    listitem "Settings" icon=settings\n  right\n    card elevated\n      text "Main Workspace" title',
    ],
  },

  // --- INTERACTIVE CONTROLS ---
  button: {
    name: "button",
    category: "Actions",
    signature: 'button "Text" [filled | outlined | tonal | elevated | text] [icon=...] [goto=@Screen] [snackbar="..."]',
    summary: "Standard Material 3 interactive button with full variant, icon, and navigation support.",
    description: "Triggers actions, form submissions, screen navigation transitions, and floating snackbar toasts.",
    modifiers: [
      { name: "filled", description: "High-emphasis variant with solid primary color background (Default)." },
      { name: "outlined", description: "Medium-emphasis variant with subtle 1px border and transparent fill." },
      { name: "tonal", description: "Low-emphasis surface variant with secondary container fill." },
      { name: "elevated", description: "Shadow-lifted surface variant for high contrast on light backgrounds." },
      { name: "text", description: "Borderless, flat variant ideal for tertiary or cancel actions." },
    ],
    parameters: [
      { name: "icon", type: "string", description: "Leading Lucide icon name (e.g. icon=save, icon=send, icon=plus)" },
      { name: "goto", type: "string", description: "Target screen for navigation (e.g. goto=@Settings, goto=@Wizard(step=2))" },
      { name: "snackbar", type: "string", description: "Message to trigger an instant snackbar toast (e.g. snackbar=\"Saved successfully\")" },
      { name: "snackbar-action", type: "string", description: "Action button label inside the snackbar (e.g. snackbar-action=\"Undo\")" },
      { name: "snackbar-type", type: "string", default: "success", description: "Chromatic alert tone", values: ["success", "info", "warning", "error"] },
      { name: "disabled", type: "boolean", default: "false", description: "Disables click interactions and visuals", values: ["true", "false"] },
      { name: "badge", type: "string", description: "Numeric or status badge overlay (e.g. badge=\"3\")" },
    ],
    examples: [
      'button "Save Changes" filled icon=save goto=@Home',
      'button "Issue Invoice" filled icon=send snackbar="Invoice #1024 created" snackbar-action="Undo" goto=@Dashboard',
      'button "Delete Account" outlined icon=trash snackbar-type=error',
    ],
  },

  textfield: {
    name: "textfield",
    category: "Inputs",
    signature: 'textfield <id> label="..." [placeholder="..."] [type=text|password|email|number] [icon=...] [helper="..."] [required=true]',
    summary: "Material 3 text input field with animated floating label and leading icon.",
    description: "Captures text, emails, passwords, and numeric input with built-in visual validation states.",
    parameters: [
      { name: "id", type: "identifier", description: "Unique variable identifier (e.g. email, password, fullName)" },
      { name: "label", type: "string", description: "Material 3 floating top label" },
      { name: "placeholder", type: "string", description: "Placeholder hint when empty" },
      { name: "type", type: "string", default: "text", description: "Input type", values: ["text", "password", "email", "number"] },
      { name: "icon", type: "string", description: "Leading Lucide icon (e.g. icon=mail, icon=lock, icon=user)" },
      { name: "helper", type: "string", description: "Supporting helper text underneath" },
      { name: "required", type: "boolean", default: "false", description: "Marks field as mandatory with asterisk", values: ["true", "false"] },
      { name: "disabled", type: "boolean", default: "false", description: "Disables field editing", values: ["true", "false"] },
      { name: "value", type: "string", description: "Pre-populated initial value" },
    ],
    examples: [
      'textfield email label="Email Address" placeholder="user@company.com" type=email icon=mail required=true',
      'textfield password label="Password" type=password icon=lock helper="Minimum 8 characters"',
    ],
  },

  textarea: {
    name: "textarea",
    category: "Inputs",
    signature: 'textarea <id> label="..." [rows=3] [placeholder="..."] [helper="..."] [required=true]',
    summary: "Multiline text area for comments, long descriptions, or notes.",
    description: "Allows fluid multiline text input with configurable initial row height.",
    parameters: [
      { name: "id", type: "identifier", description: "Unique field identifier" },
      { name: "label", type: "string", description: "Top descriptive label" },
      { name: "rows", type: "number", default: "3", description: "Initial visible line count" },
      { name: "placeholder", type: "string", description: "Placeholder hint text" },
      { name: "helper", type: "string", description: "Character limit or assistive note" },
      { name: "required", type: "boolean", default: "false", description: "Marks field as required", values: ["true", "false"] },
    ],
    examples: [
      'textarea notes label="Additional Remarks" rows=4 placeholder="Enter project observations here..."',
    ],
  },

  searchbar: {
    name: "searchbar",
    category: "Inputs",
    signature: 'searchbar <id> [placeholder="..."] [value="..."] [icon=search]',
    summary: "Material 3 styled search bar with magnifying glass icon and quick clear button.",
    description: "Streamlined search input optimized for real-time querying and filtering.",
    parameters: [
      { name: "id", type: "identifier", description: "Search field identifier" },
      { name: "placeholder", type: "string", description: "Placeholder prompt when empty (e.g. \"Search records...\")" },
      { name: "value", type: "string", description: "Preloaded search query" },
      { name: "icon", type: "string", default: "search", description: "Leading search icon (e.g. icon=search)" },
    ],
    examples: [
      'searchbar search placeholder="Search users, orders, or documents..."',
      'searchbar query placeholder="Filter by name or email..." icon=search',
    ],
  },

  search: {
    name: "search",
    category: "Inputs",
    signature: 'search <id> [placeholder="..."]',
    summary: "Alias for Material 3 search bar.",
    description: "Streamlined search input optimized for real-time querying and filtering.",
    parameters: [
      { name: "id", type: "identifier", description: "Search field identifier" },
      { name: "placeholder", type: "string", description: "Placeholder prompt" },
    ],
    examples: [
      'search query placeholder="Search catalog..."',
    ],
  },

  text: {
    name: "text",
    category: "Typography",
    signature: 'text "Message" [display | headline | title | body | label | caption] [color=primary|secondary|error|muted]',
    summary: "Typography element implementing the Material 3 type scale.",
    description: "Renders display headings, titles, body paragraphs, and captions with mathematically balanced scales and weights.",
    modifiers: [
      { name: "display", description: "Hero display headline for standout metrics and splash titles." },
      { name: "headline", description: "Primary section heading." },
      { name: "title", description: "Card, modal, and app bar title (Default)." },
      { name: "body", description: "Standard body copy for optimal reading." },
      { name: "label", description: "Compact label for buttons, tags, and badges." },
      { name: "caption", description: "Subtle metadata or caption text in muted gray." },
      { name: "bold", description: "Applies bold typographic weight (700)." },
    ],
    parameters: [
      { name: "color", type: "string", description: "Chromatic color tone", values: ["primary", "secondary", "tertiary", "error", "success", "warning", "muted"] },
    ],
    examples: [
      'text "Dashboard Overview" headline color=primary',
      'text "Financial quarterly summary report" body color=muted',
      'text "$124,500.00" display bold color=primary',
    ],
  },

  table: {
    name: "table",
    category: "Data & Tables",
    signature: 'table [title="..."] columns=["Col1:type", "Col2:type", ...] [striped=true] [searchable=true] [pageSize=5]',
    summary: "Interactive data table with typed columns (:code, :avatar, :progress, :status, :action, :dropdown), search, and pagination.",
    description: "Renders structured data collections with specialized cell renderers (badges, progress bars, kebab menus, etc.).",
    modifiers: [
      { name: "striped", description: "Applies alternating subtle background zebra striping." },
      { name: "searchable", description: "Adds a live search bar to filter table rows in real time." },
      { name: "bordered", description: "Adds explicit cell borders and gridlines." },
      { name: "compact", description: "Reduces vertical padding for high-density data display." },
    ],
    parameters: [
      { name: "title", type: "string", description: "Table header title" },
      { name: "columns", type: "array", description: "Column list with optional types: :code, :avatar, :progress, :status, :action, :dropdown, :currency, :date, :checkbox, :link, :rating" },
      { name: "pageSize", type: "number", default: "10", description: "Rows rendered per pagination page" },
    ],
    examples: [
      'table title="Services & Team Leads" columns=["ID:code", "Lead:avatar", "Progress:progress", "Amount:currency", "Status:status", "Actions:action", "Options:dropdown"] striped=true searchable=true\n  row ["#101", "Jane Cooper", "92%", "$4,250.00", "Active", "Configure", ""]\n  row ["#102", "Alex Morgan", "45%", "$1,800.00", "Pending", "Configure", ""]\n  row ["#103", "Javier Díaz Bolaños", "98%", "$15,200.00", "Active", "Configure", ""]',
    ],
    tips: [
      "Declare rows using 'row [\"val1\", \"val2\"]' or Markdown pipe syntax '| val1 | val2 |'.",
      "Supported column types include: :code, :avatar, :progress, :status, :action, :dropdown, :currency, :date, :checkbox, :link, :rating, :tags.",
    ],
  },

  select: {
    name: "select",
    category: "Inputs",
    signature: 'select <id> label="..." [value="..."]\n  option "Option 1"\n  option "Option 2"',
    summary: "Single-choice dropdown menu with Material 3 styling.",
    description: "Allows selecting one value from a collapsible list of options.",
    parameters: [
      { name: "id", type: "identifier", description: "Field identifier" },
      { name: "label", type: "string", description: "Top descriptive label" },
      { name: "value", type: "string", description: "Default selected option" },
      { name: "disabled", type: "boolean", default: "false", description: "Prevents selection changes", values: ["true", "false"] },
    ],
    examples: [
      'select role label="User Role" value="Administrator"\n  option "Administrator"\n  option "Editor"\n  option "Viewer"',
    ],
  },

  autocomplete: {
    name: "autocomplete",
    category: "Inputs",
    signature: 'autocomplete <id> label="..." [placeholder="..."]\n  option "Option 1"\n  option "Option 2"',
    summary: "Predictive search autocomplete dropdown with live option filtering.",
    description: "Interactive input that dynamically filters options as the user types.",
    parameters: [
      { name: "id", type: "identifier", description: "Field identifier" },
      { name: "label", type: "string", description: "Floating search label" },
      { name: "placeholder", type: "string", description: "Placeholder hint" },
    ],
    examples: [
      'autocomplete country label="Country of Residence" placeholder="Type to search..."\n  option "Canada"\n  option "Colombia"\n  option "Germany"\n  option "United Kingdom"\n  option "United States"\n  option "Venezuela"',
    ],
  },

  datepicker: {
    name: "datepicker",
    category: "Inputs",
    signature: 'datepicker <id> label="..." [value="2026-08-20"] [required=true]',
    summary: "Native date picker input with Material 3 calendar icon.",
    description: "Allows accessible date selection with initial value and required flags.",
    parameters: [
      { name: "id", type: "identifier", description: "Field identifier" },
      { name: "label", type: "string", description: "Date picker label" },
      { name: "value", type: "string", description: "Initial date in YYYY-MM-DD format" },
      { name: "required", type: "boolean", default: "false", description: "Mandatory input flag", values: ["true", "false"] },
    ],
    examples: [
      'datepicker birthDate label="Date of Birth" value="2000-01-15"',
    ],
  },

  switch: {
    name: "switch",
    category: "Inputs",
    signature: 'switch <id> label="..." [checked=true|false] [disabled=true]',
    summary: "Interactive toggle switch with label and on/off state.",
    description: "Ideal for immediate boolean settings (e.g. dark mode, push notifications).",
    parameters: [
      { name: "id", type: "identifier", description: "Setting identifier" },
      { name: "label", type: "string", description: "Label next to the switch" },
      { name: "checked", type: "boolean", default: "false", description: "Initial on (true) or off (false) state", values: ["true", "false"] },
      { name: "disabled", type: "boolean", default: "false", description: "Disables toggle interaction", values: ["true", "false"] },
    ],
    examples: [
      'switch emailAlerts label="Receive email notifications" checked=true',
      'switch twoFactor label="Enforce two-factor authentication" checked=false',
    ],
  },

  checkbox: {
    name: "checkbox",
    category: "Inputs",
    signature: 'checkbox <id> label="..." [checked=true|false] [disabled=true]',
    summary: "Material 3 checkbox for boolean selections and terms agreements.",
    description: "Allows accepting terms, selecting multiple items, or toggling features.",
    parameters: [
      { name: "id", type: "identifier", description: "Field identifier" },
      { name: "label", type: "string", description: "Descriptive label text" },
      { name: "checked", type: "boolean", default: "false", description: "Initial checked state", values: ["true", "false"] },
      { name: "disabled", type: "boolean", default: "false", description: "Disables interaction", values: ["true", "false"] },
    ],
    examples: [
      'checkbox terms label="I accept the Terms of Service and Privacy Policy" checked=false',
    ],
  },

  slider: {
    name: "slider",
    category: "Inputs",
    signature: 'slider <id> label="..." [min=0] [max=100] [step=1] [value=50]',
    summary: "Continuous or stepped range slider for numeric adjustments.",
    description: "Enables smooth adjustment of volume, brightness, budget, percentages, or thresholds.",
    parameters: [
      { name: "id", type: "identifier", description: "Control identifier" },
      { name: "label", type: "string", description: "Top descriptive label" },
      { name: "min", type: "number", default: "0", description: "Minimum value" },
      { name: "max", type: "number", default: "100", description: "Maximum value" },
      { name: "step", type: "number", default: "1", description: "Step increment" },
      { name: "value", type: "number", default: "50", description: "Initial numeric value" },
    ],
    examples: [
      'slider volume label="Audio Volume" min=0 max=100 value=75',
      'slider budget label="Monthly Budget ($)" min=500 max=10000 step=500 value=2500',
    ],
  },

  chip: {
    name: "chip",
    category: "Actions",
    signature: 'chip "Text" [selected=true|false] [icon=...] [dismissible=true]',
    summary: "Compact interactive pill (Filter/Action Chip) for filters, tags, and categories.",
    description: "Material 3 chip with selected active state and optional dismissal button.",
    parameters: [
      { name: "selected", type: "boolean", default: "false", description: "Shows chip as selected/active", values: ["true", "false"] },
      { name: "icon", type: "string", description: "Leading Lucide icon (e.g. icon=check, icon=clock)" },
      { name: "dismissible", type: "boolean", default: "false", description: "Shows X button to dismiss chip", values: ["true", "false"] },
    ],
    examples: [
      'chip "All" selected=true\nchip "In Progress" icon=clock\nchip "Completed" icon=check',
    ],
  },

  segmentedbutton: {
    name: "segmentedbutton",
    category: "Inputs",
    signature: 'segmentedbutton options=["Option 1", "Option 2", ...] [selected=0]',
    summary: "Segmented button group for toggling between mutually exclusive options.",
    description: "Unified horizontal selector control in Material 3 with highlighted active segment.",
    parameters: [
      { name: "options", type: "array", description: "Array of option labels (e.g. [\"Day\", \"Week\", \"Month\"])" },
      { name: "selected", type: "number", default: "0", description: "0-based index of initially selected option" },
    ],
    examples: [
      'segmentedbutton options=["Daily", "Weekly", "Monthly", "Yearly"] selected=1',
    ],
  },

  accordion: {
    name: "accordion",
    category: "Surfaces",
    signature: 'accordion "Title" [expanded=true|false] [icon=...] [variant=elevated|outlined|filled] [badge="..."]',
    summary: "Material 3 collapsible expansion panel / accordion.",
    description: "Organizes secondary content and optional workflow steps behind a clickable header with animated chevron.",
    parameters: [
      { name: "expanded", type: "boolean", default: "false", description: "Initial expanded (true) or collapsed (false) state", values: ["true", "false"] },
      { name: "icon", type: "string", description: "Header Lucide icon" },
      { name: "variant", type: "string", default: "elevated", description: "Surface variant", values: ["elevated", "outlined", "filled"] },
      { name: "badge", type: "string", description: "Status badge displayed in header" },
    ],
    examples: [
      'accordion "Billing Details (Optional)" expanded=false icon=file-text\n  textfield taxId label="Tax ID / EIN"\n  textfield companyName label="Legal Company Name"',
    ],
  },

  tabs: {
    name: "tabs",
    category: "Navigation & Structure",
    signature: 'tabs items=["Tab 1", "Tab 2"]\n  tab "Tab 1"\n    ...\n  tab "Tab 2"\n    ...',
    summary: "Interactive tab bar container for fluid multi-panel navigation.",
    description: "Organizes subviews within the same viewport using animated indicator tabs.",
    parameters: [
      { name: "items", type: "array", description: "List of tab names (optional if nested tab blocks are defined)" },
    ],
    examples: [
      'tabs items=["General", "Security"]\n  tab "General"\n    card elevated\n      text "General Preferences" title\n  tab "Security"\n    card elevated\n      text "Two-Factor Auth" title',
    ],
  },

  metric: {
    name: "metric",
    category: "Data & Tables",
    signature: 'metric label="..." value="..." [delta="..."] [icon=...] [trend=up|down]',
    summary: "Key performance indicator (KPI) metric card with prominent figure and trend indicator.",
    description: "Displays core business metrics with delta percentages and directional growth indicators.",
    parameters: [
      { name: "label", type: "string", description: "Metric title or description" },
      { name: "value", type: "string", description: "Prominent value figure (e.g. \"$48,250\")" },
      { name: "delta", type: "string", description: "Percentage variation or status change (e.g. \"+24.5%\")" },
      { name: "trend", type: "string", default: "up", description: "Trend direction", values: ["up", "down"] },
      { name: "icon", type: "string", description: "Corner Lucide thematic icon" },
    ],
    examples: [
      'metric label="Total Revenue" value="$48,250" delta="+24.5%" trend=up icon=dollar-sign',
      'metric label="Bounce Rate" value="2.1%" delta="-0.8%" trend=down icon=trending-down',
    ],
  },

  stat: {
    name: "stat",
    category: "Data & Tables",
    signature: 'stat label="..." value="..." [icon=...]',
    summary: "Compact statistic card for concise data summaries.",
    description: "Streamlined metric display without trend calculation, ideal for dense bento grids.",
    parameters: [
      { name: "label", type: "string", description: "Descriptive metric label" },
      { name: "value", type: "string", description: "Count or value string" },
      { name: "icon", type: "string", description: "Thematic Lucide icon" },
    ],
    examples: [
      'stat label="Registered Users" value="1,240" icon=users',
    ],
  },

  alert: {
    name: "alert",
    category: "Feedback & Status",
    signature: 'alert "Message" [variant=info|success|warning|error] [title="..."] [icon=...] [dismissible=true]',
    summary: "Contextual banner alert (info, success, warning, or error).",
    description: "Communicates system notifications, confirmations, or warnings with full accessibility.",
    parameters: [
      { name: "variant", type: "string", default: "info", description: "Severity color tone", values: ["info", "success", "warning", "error"] },
      { name: "title", type: "string", description: "Bold header title" },
      { name: "icon", type: "string", description: "Custom alert icon" },
      { name: "dismissible", type: "boolean", default: "false", description: "Displays dismiss X button", values: ["true", "false"] },
    ],
    examples: [
      'alert "Your subscription expires in 3 days." variant=warning title="Pending Renewal" dismissible=true',
      'alert "Changes saved successfully." variant=success',
    ],
  },

  snackbar: {
    name: "snackbar",
    category: "Feedback & Status",
    signature: 'snackbar "Message" [action="..."] [icon=...] [type=info|success|warning|error] [goto=@Screen]',
    summary: "Transient post-action toast notification (Material 3 Snackbar).",
    description: "Provides instant feedback after saving, deleting, or submitting records with optional action button.",
    parameters: [
      { name: "message", type: "string", description: "Toast notification message" },
      { name: "action", type: "string", description: "Action button label (e.g. \"Undo\", \"View\")" },
      { name: "icon", type: "string", description: "Leading Lucide icon" },
      { name: "type", type: "string", default: "info", description: "Severity tone", values: ["info", "success", "warning", "error"] },
      { name: "goto", type: "string", description: "Navigation target on action click" },
    ],
    examples: [
      'snackbar "Invoice sent via email" action="Undo" icon=check-circle-2 type=success',
    ],
  },

  fab: {
    name: "fab",
    category: "Actions",
    signature: 'fab "Text" [icon=plus] [extended=true|false] [goto=@Screen] [variant=primary|secondary|tertiary|surface]',
    summary: "Floating Action Button (FAB / Extended FAB) for the primary action of the screen.",
    description: "Positioned in the lower right corner for key actions like creating, adding, or initiating chat.",
    parameters: [
      { name: "label", type: "string", description: "Descriptive label for Extended FAB" },
      { name: "icon", type: "string", default: "plus", description: "Center icon" },
      { name: "extended", type: "boolean", default: "true", description: "Displays text label alongside icon", values: ["true", "false"] },
      { name: "goto", type: "string", description: "Navigation destination" },
      { name: "variant", type: "string", default: "primary", description: "Color variant", values: ["primary", "secondary", "tertiary", "surface"] },
    ],
    examples: [
      'fab "New Document" icon=plus extended=true goto=@CreateDocumentModal',
    ],
  },

  appbar: {
    name: "appbar",
    category: "Navigation & Structure",
    signature: 'appbar "Title" [icon=arrow-left|menu] [variant=center|small|medium|large|bottom] [goto=@Screen] [action="..."] [subtitle="..."]',
    summary: "Material 3 Expressive Top or Bottom App Bar with variants.",
    description: "Header navigation container adhering to Material 3 Expressive typography and scroll elevation with action buttons, back/menu buttons, and optional bottom FAB slot.",
    parameters: [
      { name: "title", type: "string", description: "Main title displayed in the bar" },
      { name: "subtitle", type: "string", description: "Secondary descriptive subtitle" },
      { name: "variant", type: "string", default: "small", values: ["small", "center", "medium", "large", "bottom"], description: "M3 App Bar visual variant" },
      { name: "icon", type: "string", default: "arrow-left", description: "Left navigation icon (e.g. arrow-left, menu)" },
      { name: "goto", type: "string", description: "Target screen on clicking leading icon" },
      { name: "action", type: "string", description: "Right action button label" },
    ],
    examples: [
      'appbar "Master Console" icon=menu variant=center\n  button icon=bell text badge="3"\n  button icon=more-vertical text',
      'appbar "Analytics & Growth" icon=arrow-left variant=large goto=@Dashboard\n  button icon=share-2 text\n  button icon=download text',
    ],
  },

  topappbar: {
    name: "topappbar",
    category: "Navigation & Structure",
    signature: 'topappbar "Title" [icon=menu] [goto=@Screen] [action="..."]',
    summary: "Standard Material 3 Top App Bar alias.",
    description: "Equivalent to appbar in Material Design 3 specifications.",
    examples: [
      'topappbar "Order Management" icon=arrow-left goto=@Dashboard',
    ],
  },

  navbar: {
    name: "navbar",
    category: "Navigation & Structure",
    signature: 'navbar "Title" [icon=menu] [goto=@Screen]',
    summary: "Top navigation header bar with brand title and quick action items.",
    description: "Header navigation bar compatible with appbar.",
    examples: [
      'navbar "Acme Enterprise" icon=menu\n  button "Sign Out" text goto=@Login',
    ],
  },

  bottomnav: {
    name: "bottomnav",
    category: "Navigation & Structure",
    signature: 'bottomnav\n  navitem "Home" icon=home goto=@Home active=true\n  navitem "Search" icon=search goto=@Search',
    summary: "Fixed bottom navigation bar for mobile touch interfaces.",
    description: "Allows rapid switching between 3 to 5 top-level destinations on mobile devices.",
    examples: [
      'bottomnav\n  navitem "Home" icon=home goto=@Home active=true\n  navitem "Explore" icon=compass goto=@Explore\n  navitem "Profile" icon=user goto=@Profile',
    ],
  },

  navitem: {
    name: "navitem",
    category: "Navigation & Structure",
    signature: 'navitem "Title" [icon=home] [goto=@Screen] [active=true|false]',
    summary: "Navigation tab item for bottom navigation bars (bottomnav) or navigation rails.",
    description: "Interactive tab with icon, label, and navigation link.",
    parameters: [
      { name: "label", type: "string", description: "Tab label" },
      { name: "icon", type: "string", description: "Lucide icon" },
      { name: "goto", type: "string", description: "Navigation target screen" },
      { name: "active", type: "boolean", default: "false", description: "Indicates active tab state", values: ["true", "false"] },
    ],
    examples: [
      'navitem "Messages" icon=mail goto=@Inbox active=true',
    ],
  },

  breadcrumbs: {
    name: "breadcrumbs",
    category: "Navigation & Structure",
    signature: 'breadcrumbs items=["Home", "Clients", "Details"] [separator=chevron|slash]',
    summary: "Hierarchical breadcrumb trail with visual separators.",
    description: "Shows user location within the application structural hierarchy.",
    parameters: [
      { name: "items", type: "array", description: "Array of hierarchy step labels" },
      { name: "separator", type: "string", default: "chevron", description: "Visual separator style", values: ["chevron", "slash"] },
    ],
    examples: [
      'breadcrumbs items=["Dashboard", "Organization", "Members"]',
    ],
  },

  rating: {
    name: "rating",
    category: "Inputs",
    signature: 'rating <id> label="..." [value=4] [max=5] [readonly=true|false] [size=sm|md|lg]',
    summary: "Interactive star rating control (Material 3 Rating Bar).",
    description: "Allows users to rate services or review items with animated stars.",
    parameters: [
      { name: "id", type: "identifier", description: "Control identifier" },
      { name: "label", type: "string", description: "Top descriptive label" },
      { name: "value", type: "number", default: "4", description: "Initial rating score" },
      { name: "max", type: "number", default: "5", description: "Total star count" },
      { name: "readonly", type: "boolean", default: "false", description: "Read-only display mode without clicks", values: ["false", "true"] },
      { name: "size", type: "string", default: "md", description: "Visual star size", values: ["sm", "md", "lg"] },
    ],
    examples: [
      'rating satisfaction label="How satisfied are you with our service?" value=5 readonly=false',
    ],
  },

  listitem: {
    name: "listitem",
    category: "Surfaces",
    signature: 'listitem "Title" [subtitle="..."] [icon=...] [goto=@Screen]',
    summary: "Structured Material 3 list item with title, subtitle, leading icon, and navigation.",
    description: "Clickable list row ideal for settings panels, user directories, or document lists.",
    parameters: [
      { name: "title", type: "string", description: "Primary title text" },
      { name: "subtitle", type: "string", description: "Secondary descriptive text" },
      { name: "icon", type: "string", description: "Leading Lucide icon" },
      { name: "goto", type: "string", description: "Navigation target on click" },
    ],
    examples: [
      'listitem "Jane Cooper" subtitle="jane@enterprise.com" icon=user goto=@UserProfile',
    ],
  },

  avatar: {
    name: "avatar",
    category: "Surfaces",
    signature: 'avatar "Initials" [size=40] [icon=...] [src="..."]',
    summary: "Circular image or initials avatar representing users or entities.",
    description: "Renders avatars with styled Material 3 initials or image URL with configurable diameter.",
    parameters: [
      { name: "label", type: "string", description: "User initials (e.g. \"JD\", \"AD\")" },
      { name: "size", type: "number", default: "40", description: "Pixel diameter of circle (e.g. 32, 40, 48, 64)" },
      { name: "icon", type: "string", description: "Fallback user icon (e.g. icon=user)" },
      { name: "src", type: "string", description: "Direct profile photo image URL" },
    ],
    examples: [
      'avatar "JD" size=44',
      'avatar "AD" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120" size=48',
    ],
  },

  badge: {
    name: "badge",
    category: "Feedback & Status",
    signature: 'badge "Text" [variant=primary|error|success|tonal] [size=sm|md]',
    summary: "Compact status badge or numeric notification count pill.",
    description: "Highlights statuses like 'New', 'Active', or unread count with accent color fill.",
    parameters: [
      { name: "label", type: "string", description: "Text or number inside the badge" },
      { name: "variant", type: "string", default: "primary", description: "Color palette", values: ["primary", "error", "success", "tonal"] },
      { name: "size", type: "string", default: "md", description: "Size", values: ["sm", "md"] },
    ],
    examples: [
      'badge "New" variant=primary',
      'badge "3" variant=error',
    ],
  },

  progress: {
    name: "progress",
    category: "Feedback & Status",
    signature: 'progress [value=75] [variant=linear|circular] [indeterminate=true|false]',
    summary: "Material 3 progress bar or ring for loading states and completion percentages.",
    description: "Visualizes numeric progress from 0 to 100 or smooth continuous loading animation.",
    parameters: [
      { name: "value", type: "number", default: "50", description: "Completion percentage from 0 to 100" },
      { name: "variant", type: "string", default: "linear", description: "Visual shape format", values: ["linear", "circular"] },
      { name: "indeterminate", type: "boolean", default: "false", description: "Continuous indeterminate loading state", values: ["true", "false"] },
    ],
    examples: [
      'progress value=85 variant=linear',
      'progress variant=circular indeterminate=true',
    ],
  },

  icon: {
    name: "icon",
    category: "Surfaces",
    signature: 'icon name=settings [size=24] [color=primary|secondary|error|muted]',
    summary: "Standalone vector icon from the Lucide catalog.",
    description: "Renders any Lucide icon with pixel size and theme color controls.",
    parameters: [
      { name: "name", type: "string", description: "Lucide icon name (e.g. settings, heart, bell, user, shield)" },
      { name: "size", type: "number", default: "24", description: "Icon size in pixels (e.g. 16, 20, 24, 32, 48)" },
      { name: "color", type: "string", default: "primary", description: "Theme color", values: ["primary", "secondary", "error", "success", "warning", "muted"] },
    ],
    examples: [
      'icon name=shield-check size=32 color=success',
    ],
  },

  image: {
    name: "image",
    category: "Surfaces",
    signature: 'image src="..." [alt="..."] [aspect=16/9|1/1|4/3] [rounded=true]',
    summary: "Image container with aspect ratio preservation and rounded corners.",
    description: "Loads external images safely preventing cumulative layout shift (CLS).",
    parameters: [
      { name: "src", type: "string", description: "Public image URL" },
      { name: "alt", type: "string", description: "Accessibility description" },
      { name: "aspect", type: "string", default: "16/9", description: "Aspect ratio", values: ["16/9", "1/1", "4/3", "21/9"] },
      { name: "rounded", type: "boolean", default: "true", description: "Applies rounded corners", values: ["true", "false"] },
    ],
    examples: [
      'image src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600" aspect=16/9 rounded=true',
    ],
  },

  divider: {
    name: "divider",
    category: "Layout",
    signature: 'divider [spacing=16]',
    summary: "Subtle 1px horizontal divider line to separate sections.",
    description: "Creates a clean boundary between UI groups.",
    parameters: [
      { name: "spacing", type: "number", default: "16", description: "Vertical margin in pixels (e.g. 8, 12, 16, 24, 32)" },
    ],
    examples: [
      'divider spacing=24',
    ],
  },

  spacer: {
    name: "spacer",
    category: "Layout",
    signature: 'spacer [size=16]',
    summary: "Invisible vertical spacer block to separate elements.",
    description: "Adds controlled transparent white space.",
    parameters: [
      { name: "size", type: "number", default: "16", description: "Height in pixels (e.g. 8, 16, 24, 32, 48)" },
    ],
    examples: [
      'spacer size=24',
    ],
  },

  // --- SCREEN DECLARATIONS ---
  screen: {
    name: "@Screen:screen",
    category: "Navigation & Structure",
    signature: '@ScreenName:screen [theme=material3|ios|fluent]',
    summary: "Declares a new navigable top-level screen in the Wisp document.",
    description: "Each screen acts as an autonomous view reachable via 'goto=@ScreenName'.",
    parameters: [
      { name: "theme", type: "string", default: "material3", description: "Screen visual theme", values: ["material3", "ios", "fluent"] },
    ],
    examples: [
      '@Dashboard:screen\n  appbar "Main Dashboard" icon=menu\n  card elevated\n    text "Welcome to the Platform" title',
    ],
  },

  wizard: {
    name: "@Flow:wizard",
    category: "Navigation & Structure",
    signature: '@WizardName:wizard\n  steps: N\n\n  step "Step 1: ..."\n    ...',
    summary: "Declares a guided step-by-step assistant (Wizard / Stepper) with sequential indicators.",
    description: "Structures multi-step flows with direct navigation via 'goto=@WizardName(step=2)'.",
    parameters: [
      { name: "steps", type: "number", description: "Total number of wizard steps" },
    ],
    examples: [
      '@OnboardingFlow:wizard\n  steps: 2\n\n  step "Step 1: Identity"\n    textfield name label="Full Name"\n    button "Continue" filled goto=@OnboardingFlow(step=2)\n\n  step "Step 2: Confirmation"\n    text "Confirm information?" body\n    button "Finish" filled goto=@Home',
    ],
  },

  dialog: {
    name: "@Modal:dialog",
    category: "Navigation & Structure",
    signature: '@ModalName:dialog\n  text "Title" title\n  text "Message..." body\n  button "OK" filled',
    summary: "Declares a centered modal dialog (Material 3 Dialog) for confirmations and alerts.",
    description: "Appears overlaid with a backdrop to request immediate user attention.",
    examples: [
      '@ConfirmDelete:dialog\n  text "Delete Record" title\n  text "Are you sure you want to permanently delete this item?" body\n  row spacing=8 justify=end\n    button "Cancel" text goto=@Dashboard\n    button "Delete" filled snackbar-type=error goto=@Dashboard',
    ],
  },

  sheet: {
    name: "@Menu:sheet",
    category: "Navigation & Structure",
    signature: '@SheetName:sheet\n  text "Options" title\n  listitem "Download" icon=download',
    summary: "Declares a slide-up bottom sheet (Material 3 Bottom Sheet) for mobile viewports.",
    description: "Ideal for contextual actions, share dialogs, or supplementary menus on mobile screens.",
    examples: [
      '@ShareSheet:sheet\n  text "Share Document" title\n  listitem "Copy Link" icon=link\n  listitem "Send via Email" icon=mail',
    ],
  },

  drawer: {
    name: "drawer",
    category: "Navigation & Structure",
    signature: 'drawer [title="..."] [subtitle="..."] [avatar="..."]',
    summary: "Material 3 Navigation Drawer panel.",
    description: "Provides accessible navigation to primary app destinations with profile headers, sections, and badge items.",
    parameters: [
      { name: "title", type: "string", description: "Drawer header title" },
      { name: "subtitle", type: "string", description: "User email or subtitle" },
      { name: "avatar", type: "string", description: "User initials or avatar" },
    ],
    examples: [
      'drawer title="Admin Console" subtitle="admin@enterprise.com"\n  draweritem "Dashboard" icon=layout active\n  draweritem "Events" icon=calendar badge="4"\n  section "Settings"\n  draweritem "Preferences" icon=settings',
    ],
  },

  draweritem: {
    name: "draweritem",
    category: "Navigation & Structure",
    signature: 'draweritem "Text" [icon=...] [badge="..."] [active=true|false] [goto=@Screen]',
    summary: "Navigation item within a Navigation Drawer.",
    description: "Pill-shaped item with full corner rounding, icon, and numeric badge support.",
    examples: [
      'draweritem "Proposals" icon=file-text badge="12" active goto=@Quotes',
    ],
  },

  sidesheet: {
    name: "sidesheet",
    category: "Surfaces",
    signature: 'sidesheet [title="..."] [position=right|left] [variant=standard|modal]',
    summary: "Material 3 Side Sheet panel for filters and inspection details.",
    description: "Displays supplementary content on medium and large screens, anchored to the window side.",
    parameters: [
      { name: "title", type: "string", description: "Side sheet title" },
      { name: "position", type: "string", default: "right", values: ["right", "left"], description: "Anchor side" },
      { name: "variant", type: "string", default: "standard", values: ["standard", "modal"], description: "Embedded standard or modal overlay mode" },
    ],
    examples: [
      'sidesheet title="Filter Criteria"\n  select category label="Category" options=["Weddings", "Conferences", "Parties"]\n  slider budget label="Budget ($)" min=1000 max=50000 value=15000\n  button "Apply Filters" filled',
    ],
  },

  bottomsheet: {
    name: "bottomsheet",
    category: "Surfaces",
    signature: 'bottomsheet [title="..."] [variant=standard|modal]',
    summary: "Material 3 Bottom Sheet with drag handle and rounded top container.",
    description: "Surfaces from the bottom edge to present quick workflows, forms, or actions.",
    parameters: [
      { name: "title", type: "string", description: "Optional bottom sheet title" },
    ],
    examples: [
      'bottomsheet title="Booking Actions"\n  button "Confirm Date" filled icon=check\n  button "Download PDF" tonal icon=download\n  button "Cancel" text goto=close',
    ],
  },

  navigationrail: {
    name: "navigationrail",
    category: "Navigation & Structure",
    signature: 'navigationrail [title="..."] [subtitle="..."] [fab=plus|edit] [fabLabel="..."] [fabGoto=@Screen] [user="..."] [role="..."] [expanded=true|false]\n  railitem "Item 1" icon=home active\n    # Panel 1 content...\n  railitem "Item 2" icon=inbox badge="5"\n    # Panel 2 content...',
    summary: "Compact or expandable vertical Navigation Rail with integrated Panel Switching in Material 3.",
    description: "Designed for tablet and desktop viewports with a collapsible sidebar, top FAB action, badge counters, user profile footer, and dynamic panel switching between nested child content.",
    parameters: [
      { name: "title", type: "string", description: "Rail brand or header title (e.g. title=\"Workspace\")" },
      { name: "subtitle", type: "string", description: "Supporting subtitle in expanded mode (e.g. subtitle=\"v2.0 Pro\")" },
      { name: "fab", type: "string", description: "Top Floating Action Button icon (e.g. fab=plus)" },
      { name: "fabLabel", type: "string", description: "Text label for FAB button (e.g. fabLabel=\"Create\")" },
      { name: "fabGoto", type: "string", description: "Screen or dialog target when FAB is clicked (e.g. fabGoto=@NewItemDialog)" },
      { name: "user", type: "string", description: "User name shown in the footer profile (e.g. user=\"Carlos Dev\")" },
      { name: "role", type: "string", description: "Role or team shown in footer profile (e.g. role=\"Admin\")" },
      { name: "expanded", type: "boolean", default: "false", description: "Initial expanded state", values: ["true", "false"] },
      { name: "collapsible", type: "boolean", default: "true", description: "Shows toggle button to expand/collapse rail", values: ["true", "false"] },
    ],
    examples: [
      'navigationrail title="Dashboard" subtitle="Enterprise" fab=plus fabLabel="Create" user="Admin"\n  railitem "Overview" icon=home active\n    appbar "General Overview" icon=layout\n    metric label="Sales" value="$14,200" delta="+12%" icon=dollar-sign\n  railitem "Messages" icon=inbox badge="3"\n    appbar "Inbox" icon=mail\n    list\n      listitem "System Notification" subtitle="All systems normal" icon=bell\n  railitem "Settings" icon=settings\n    appbar "Settings" icon=settings\n    switch dark label="Dark Mode" checked=true',
    ],
  },

  railitem: {
    name: "railitem",
    category: "Navigation & Structure",
    signature: 'railitem "Label" [icon=icon-name] [active] [badge="..."] [goto=@Screen]\n  # Nested panel content...',
    summary: "Destination item and nested content panel for 'navigationrail'.",
    description: "Defines an individual navigation destination and its corresponding panel inside a Navigation Rail container. Switching between railitems displays their nested children dynamically.",
    parameters: [
      { name: "label", type: "string", description: "Destination title/label shown next to or below icon (e.g. \"Overview\")" },
      { name: "icon", type: "string", description: "Lucide / Material icon name (e.g. icon=home, icon=bar-chart-2)" },
      { name: "active", type: "boolean", default: "false", description: "Marks this destination as initially selected" },
      { name: "badge", type: "string", description: "Numeric or text badge counter shown on the destination (e.g. badge=\"5\")" },
      { name: "goto", type: "string", description: "Optional screen target navigation when clicked (e.g. goto=@Detail)" },
      { name: "snackbar", type: "string", description: "Optional toast message triggered when clicked" },
    ],
    examples: [
      'railitem "Overview" icon=home active\n  appbar "Main Panel" icon=home\n  card elevated\n    text "Panel Content" title',
      'railitem "Inbox" icon=inbox badge="4"\n  appbar "Messages" icon=mail\n  list\n    listitem "New Message" subtitle="From: Team"',
    ],
  },

  loading: {
    name: "loading",
    category: "Feedback & Status",
    signature: 'loading "Message..." [variant=circular|linear] [value=75]',
    summary: "Material 3 loading and progress indicator (Circular or Linear).",
    description: "Renders an animated circular spinner or continuous/determinate progress track.",
    parameters: [
      { name: "variant", type: "string", default: "circular", values: ["circular", "linear"], description: "Visual shape indicator" },
      { name: "value", type: "number", description: "0-100 percentage for determinate mode (omit for indeterminate)" },
      { name: "message", type: "string", description: "Supporting message beside indicator" },
    ],
    examples: [
      'loading "Loading event details..."',
      'loading variant=linear value=80 message="Processing payment..."',
    ],
  },

  circularprogress: {
    name: "circularprogress",
    category: "Feedback & Status",
    signature: 'circularprogress [value=75] [message="..."] [size=40]',
    summary: "Material 3 circular progress ring indicator.",
    description: "Interactive circular spinner with optional center percentage count.",
    examples: [
      'circularprogress value=75 message="Venue Capacity"',
    ],
  },

  linearprogress: {
    name: "linearprogress",
    category: "Feedback & Status",
    signature: 'linearprogress [value=60] [message="..."] [height=8]',
    summary: "Material 3 linear progress bar.",
    description: "Horizontal progress bar with rounded tonal tracks and smooth progress animation.",
    examples: [
      'linearprogress value=65 message="Profile Completion"',
    ],
  },

  wavyprogress: {
    name: "wavyprogress",
    category: "Feedback & Status",
    signature: 'wavyprogress [value=75] [variant=linear|circular] [message="..."] [color=primary|secondary|tertiary|error] [size=sm|md|lg]',
    summary: "Material 3 Expressive organic wavy progress indicator (Sinusoidal or Rosette).",
    description: "Renders Google's new expressive wavy progress with harmonic sine wave tracks or 8-petal circular rosette loops with animated phase shifts and stop dots.",
    parameters: [
      { name: "value", type: "number", description: "0-100 percentage for determinate progress (omit for continuous harmonic wave)" },
      { name: "variant", type: "string", default: "linear", values: ["linear", "circular"], description: "Wave geometry shape (linear horizontal sine wave or circular rosette petals)" },
      { name: "message", type: "string", description: "Supporting label text" },
      { name: "color", type: "string", default: "primary", values: ["primary", "secondary", "tertiary", "error"], description: "Material 3 tonal palette" },
      { name: "size", type: "string", default: "md", values: ["sm", "md", "lg"], description: "Indicator dimensions and amplitude" },
    ],
    examples: [
      'wavyprogress value=84 message="Harmonizing M3 tokens (84%)"',
      'wavyprogress variant=circular value=92 message="Syncing Cluster"',
      'wavyprogress color=tertiary size=lg message="Connecting to real-time feed..."',
    ],
  },

  fabmenu: {
    name: "fabmenu",
    category: "Actions",
    signature: 'fabmenu [label="..."] [icon=plus] [variant=primary|secondary|tertiary|surface] [position=inline|bottom-right|bottom-left]\n  fabitem "Item 1" icon=edit-3 goto=@Screen\n  fabitem "Item 2" icon=share-2 snackbar="..."',
    summary: "Material 3 Expressive Floating Action Menu (Speed Dial).",
    description: "High-emphasis floating action trigger that rotates to expand an animated cascading stack of mini FAB speed dial actions with pill capsules.",
    parameters: [
      { name: "label", type: "string", description: "Optional extended FAB label" },
      { name: "icon", type: "string", default: "plus", description: "Center icon name that rotates on expand" },
      { name: "variant", type: "string", default: "primary", values: ["primary", "secondary", "tertiary", "surface"], description: "Color palette emphasis" },
      { name: "position", type: "string", default: "inline", values: ["inline", "bottom-right", "bottom-left"], description: "Placement layout" },
    ],
    examples: [
      'fabmenu icon=plus\n  fabitem "Create Proposal" icon=file-text goto=@NewProposal\n  fabitem "Quick Note" icon=edit-3 snackbar="Note drafted"\n  fabitem "Share Workspace" icon=share-2 snackbar="Link copied"',
    ],
  },

  fabitem: {
    name: "fabitem",
    category: "Actions",
    signature: 'fabitem "Label" [icon=...] [goto=@Screen] [snackbar="..."] [variant=surface|primary|secondary]',
    summary: "Speed dial action item inside a 'fabmenu'.",
    description: "Renders a circular mini FAB paired with a high-contrast label capsule and animated spring transition.",
    parameters: [
      { name: "label", type: "string", description: "Capsule text label" },
      { name: "icon", type: "string", description: "Action icon name" },
      { name: "goto", type: "string", description: "Target screen for navigation" },
      { name: "snackbar", type: "string", description: "Toast notification on click" },
    ],
    examples: [
      'fabitem "Export PDF" icon=download snackbar="Document generated"',
    ],
  },

  splitbutton: {
    name: "splitbutton",
    category: "Actions",
    signature: 'splitbutton "Primary Action" [icon=...] [variant=filled|tonal|outlined|elevated] [goto=@Screen]\n  menuitem "Action 2" icon=...\n  menuitem "Action 3" icon=...',
    summary: "Material 3 Expressive Split Button (Conjoined dual-action control with dropdown menu).",
    description: "Combines a primary direct action button on the leading edge with a conjoined chevron toggle that reveals a contextual action menu.",
    parameters: [
      { name: "label", type: "string", description: "Primary action label text" },
      { name: "icon", type: "string", description: "Leading icon for primary action" },
      { name: "variant", type: "string", default: "filled", values: ["filled", "tonal", "outlined", "elevated"], description: "Visual emphasis tier" },
      { name: "goto", type: "string", description: "Screen target for primary click" },
      { name: "snackbar", type: "string", description: "Toast triggered on primary click" },
    ],
    examples: [
      'splitbutton "Publish Event" icon=send filled goto=@Overview\n  menuitem "Save Draft" icon=save shortcut="Ctrl+S"\n  menuitem "Schedule Release" icon=clock\n  menuitem "Export JSON" icon=download',
    ],
  },

  buttongroup: {
    name: "buttongroup",
    category: "Actions",
    signature: 'buttongroup [variant=outlined|tonal|filled] [orientation=horizontal|vertical]\n  button "Option 1" icon=...\n  button "Option 2" icon=...\n  button "Option 3" icon=...',
    summary: "Material 3 Expressive Connected Button Group.",
    description: "Groups multiple related buttons into a seamless conjoined segmented unit with continuous shared borders and corner radii.",
    parameters: [
      { name: "variant", type: "string", default: "outlined", values: ["outlined", "tonal", "filled"], description: "Group container style" },
      { name: "orientation", type: "string", default: "horizontal", values: ["horizontal", "vertical"], description: "Layout orientation" },
    ],
    examples: [
      'buttongroup outlined\n  button "Day" active\n  button "Week"\n  button "Month"\n  button "Year"',
    ],
  },

  tooltip: {
    name: "tooltip",
    category: "Feedback & Status",
    signature: 'tooltip "Descriptive text..."',
    summary: "Quick floating Plain Tooltip pill.",
    description: "Brief label describing the action of a button or icon on hover.",
    examples: [
      'tooltip "Download report in Excel spreadsheet format"',
    ],
  },

  richtooltip: {
    name: "richtooltip",
    category: "Feedback & Status",
    signature: 'richtooltip [title="..."] [text="..."] [action="..."] [action_goto=@Screen]',
    summary: "Rich floating information card (Rich Tooltip).",
    description: "Provides extended context with a title, paragraph body, and direct action link.",
    examples: [
      'richtooltip title="Auto-Sync Enabled" text="Changes are automatically synchronized every 5 minutes." action="Settings" action_goto=@Settings',
    ],
  },

  carousel: {
    name: "carousel",
    category: "Surfaces",
    signature: 'carousel\n  card ...\n  card ...',
    summary: "Material 3 horizontal sliding carousel container.",
    description: "Browse cards, venue photos, or packages using navigation buttons and pagination dots.",
    examples: [
      'carousel\n  card elevated\n    text "Emerald Hall" title\n    text "Capacity: 250 guests" body\n  card elevated\n    text "Grand Garden" title\n    text "Capacity: 400 guests outdoor" body',
    ],
  },

  iconbutton: {
    name: "iconbutton",
    category: "Actions",
    signature: 'iconbutton icon=... [variant=standard|filled|tonal|outlined] [tooltip="..."] [goto=@Screen]',
    summary: "Compact circular Material 3 icon button.",
    description: "Action button for toolbars, cards, and tables.",
    parameters: [
      { name: "icon", type: "string", description: "Lucide icon name (e.g. star, heart, bell, share)" },
      { name: "variant", type: "string", default: "standard", values: ["standard", "filled", "tonal", "outlined"], description: "Visual style" },
      { name: "tooltip", type: "string", description: "Hover tooltip text" },
      { name: "badge", type: "string", description: "Badge overlay text or count" },
    ],
    examples: [
      'iconbutton icon=star variant=tonal tooltip="Favorite"',
      'iconbutton icon=bell variant=filled badge="4" goto=@Notifications',
    ],
  },

  timepicker: {
    name: "timepicker",
    category: "Inputs",
    signature: 'timepicker id label="..." [value="14:30"] [format=12h|24h]',
    summary: "Interactive Material 3 time picker.",
    description: "Allows selecting hours and minutes with clock dial or formatted input.",
    examples: [
      'timepicker startTime label="Reception Start Time" value="19:00"',
    ],
  },

  menu: {
    name: "menu",
    category: "Actions",
    signature: 'menu [label="..."] [icon=more-vertical]\n  menuitem "Option 1" icon=edit\n  menuitem "Option 2" icon=trash',
    summary: "Material 3 contextual dropdown menu.",
    description: "Displays a list of options or commands on an elevated surface.",
    examples: [
      'menu "Quote Actions" icon=more-vertical\n  menuitem "Edit" icon=edit\n  menuitem "Duplicate" icon=copy\n  menuitem "Download PDF" icon=download\n  menuitem "Delete" icon=trash goto=@ConfirmDelete',
    ],
  },

  menuitem: {
    name: "menuitem",
    category: "Actions",
    signature: 'menuitem "Text" [icon=...] [shortcut="..."] [goto=@Screen]',
    summary: "Option item within a contextual dropdown menu.",
    description: "Interactive menu item supporting leading icons, keyboard shortcuts, and navigation links.",
    examples: [
      'menuitem "Export to Excel" icon=file-spreadsheet shortcut="Ctrl+E"',
    ],
  },

  section: {
    name: "section",
    category: "Navigation & Structure",
    signature: 'section "Section Title"',
    summary: "Uppercase section header separator for Drawers and Lists.",
    description: "Subtle divider header grouping items in navigation panels.",
    examples: [
      'section "Account Settings"',
    ],
  },

  list: {
    name: "list",
    category: "Surfaces",
    signature: 'list\n  listitem "Item 1" icon=...\n  listitem "Item 2" icon=...',
    summary: "Material 3 list container with continuous dividers and rounded borders.",
    description: "Visual structured container grouping multiple listitems with border separation.",
    examples: [
      'list\n  listitem "Email Notifications" subtitle="Receive daily summaries" switch checked\n  listitem "Dark Mode" subtitle="Application theme" switch',
    ],
  },

  component: {
    name: "@Name:component",
    category: "Navigation & Structure",
    signature: '@ComponentName:component\n  ...\n\n# In any screen:\ncomponent @ComponentName [prop=value]',
    summary: "Declares a reusable UI block / component in WDL.",
    description: "Define a reusable interface element once (such as address fields or payment selectors) and reuse it across multiple screens with `component @Name` or `@Name`.",
    parameters: [
      { name: "id", type: "string", description: "Reference to the reusable component (e.g. @Countries, id=@Countries)" },
    ],
    examples: [
      '@Countries:component\n  autocomplete country label="Country of Residence" placeholder="Search country..."\n    option "United States"\n    option "United Kingdom"\n    option "Canada"\n\n@Checkout:screen\n  card elevated\n    text "Shipping Address" title\n    component @Countries',
    ],
    tips: [
      "Declare as many reusable components as needed anywhere in your .wdsl file.",
      "The screen navigator allows previewing and inspecting each component in isolation.",
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
    if (lineContext.includes(":component")) {
      const entry = WISP_DOCS_DATABASE["component"];
      return formatHoverEntry(`@${screenName}:component`, entry);
    }
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
        `### 🧭 Navigation: \`@${screenName}\``,
        "---",
        `Reference to screen **${screenName}** for declarative navigation via \`goto=@${screenName}\` or toast notification triggers \`snackbar=@${screenName}\`.`,
        "",
        "```wisp",
        `button "Go to ${screenName}" filled goto=@${screenName}`,
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
          `### ⚙️ Parameter: \`${paramDef.name}\``,
          `**Type:** \`${paramDef.type}\`${paramDef.default ? ` · **Default:** \`${paramDef.default}\`` : ""}`,
          "---",
          paramDef.description,
          paramDef.values ? `\n**Valid values:** ${paramDef.values.map((v) => `\`${v}\``).join(", ")}` : "",
          "",
          `*Available in: ${matchingComponents.map((c) => `\`${c.name}\``).slice(0, 6).join(", ")}${matchingComponents.length > 6 ? ", ..." : ""}*`,
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
        title: `Modifier: ${modDef.name}`,
        markdown: [
          `### 🎨 Modifier: \`${modDef.name}\``,
          "---",
          modDef.description,
          "",
          `*Usable in: ${matchingModifiers.map((c) => `\`${c.name}\``).join(", ")}*`,
        ].join("\n"),
      };
    }
  }

  // 5. Special column types in table (e.g. `code`, `avatar`, `progress`, `status`, `action`, `dropdown`, `currency`, `date`)
  const tableColTypes: Record<string, string> = {
    code: "Monospace font pill for IDs, hashes, and technical keys.",
    avatar: "Circular avatar with Material 3 styled initials and full name.",
    progress: "Interactive horizontal progress track with numeric percentage.",
    status: "Semantic status badge (Active / Pending / Inactive) with pulse dot.",
    badge: "Tonal status pill badge.",
    action: "Interactive primary row action button.",
    dropdown: "3-dots contextual kebab menu (⋮) with dropdown actions (Edit, Duplicate, Delete).",
    currency: "Highlighted monetary format for prices and amounts.",
    date: "Formatted calendar date with icon.",
    checkbox: "Row selection checkbox for bulk batch operations.",
    link: "Navigable clickable hyperlink.",
    rating: "Interactive star rating score.",
    tags: "Multiple category chips per cell.",
  };

  if (tableColTypes[lowerWord]) {
    return {
      title: `Table Column Type: :${lowerWord}`,
      markdown: [
        `### 📊 Table Column Type: \`:${lowerWord}\``,
        "---",
        tableColTypes[lowerWord],
        "",
        "**Usage example:**",
        "```wisp",
        `table columns=["ID:code", "User:avatar", "Progress:progress", "Status:status", "Action:action", "Options:dropdown"]`,
        "```",
      ].join("\n"),
    };
  }

  return null;
}

function formatHoverEntry(title: string, entry: WispDocEntry): { title: string; markdown: string } {
  const parts: string[] = [
    `### \`${entry.signature}\``,
    `*Category: ${entry.category}*`,
    "---",
    `**${entry.summary}**`,
    "",
    entry.description,
  ];

  if (entry.modifiers && entry.modifiers.length > 0) {
    parts.push("");
    parts.push("#### 🎨 Modifiers:");
    entry.modifiers.forEach((m) => {
      parts.push(`- **\`${m.name}\`**: ${m.description}`);
    });
  }

  if (entry.parameters && entry.parameters.length > 0) {
    parts.push("");
    parts.push("#### ⚙️ Parameters:");
    entry.parameters.forEach((p) => {
      const valStr = p.values ? ` \`[${p.values.join(" | ")}]\`` : "";
      const defStr = p.default ? ` *(default: ${p.default})*` : "";
      parts.push(`- **\`${p.name}\`** (\`${p.type}\`)${valStr}${defStr}: ${p.description}`);
    });
  }

  if (entry.examples && entry.examples.length > 0) {
    parts.push("");
    parts.push("#### 💡 Example:");
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
