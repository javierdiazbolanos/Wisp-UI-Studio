# Wisp UI Studio & WDL (Wisp Design Language)

> **Visual Interface Prototyping for Vibe Coding Software Architecture**  
> Formulate, validate, and converge technical architecture with user expectations *before* writing code.

---

## 🌟 The Wisp Vision: Vibe Coding Software Architecture

Building software with AI and modern frameworks requires fast alignment between stakeholders, engineers, and product designers. **Wisp** is a software architecture methodology and tooling suite designed to capture intent across 4 core architectural pillars:

1. **📊 ERD Diagrams**: Data modeling, entity relations, and database schemas.
2. **🔄 BPMN Diagrams**: Business workflows, state machines, and lifecycle transitions.
3. **🏛️ Architecture (C4/Cloud)**: System topologies, microservices, and infrastructure.
4. **🎨 WDL UI Screens (Wisp UI Studio)**: Declarative, human-readable screen definitions rendering live Google Material 3 Expressive interfaces.

By defining the user interface in **WDL** first, teams eliminate ambiguity, validate functional requirements, and generate clean target code (**React/TypeScript**, **Flutter**, **JSON AST**) seamlessly.

---

## ⚡ Quick Start: WDL in 30 Seconds

WDL (*Wisp Design Language*) is an indentation-based declarative format (2 spaces per level). No closing tags, no brackets, no boilerplate.

```wdl
@Facturacion:screen
  appbar "Facturación Electrónica" icon=receipt-text goto=@Home
  breadcrumbs items=["Finanzas", "Facturación", "Nueva Factura"]

  card elevated
    text "Nueva Factura Corporativa" headline color=primary
    text "Completa los datos fiscales del cliente" body

    grid cols=2 gap=16
      textfield correo label="Correo Electrónico" placeholder="cliente@empresa.com" icon=mail
      autocomplete pais label="País Fiscal" placeholder="Buscar país..."
        option "México"
        option "España"
        option "Colombia"
        option "Chile"

    datepicker fechaEmision label="Fecha de Emisión"
    textarea concepto label="Concepto / Observaciones" rows=2

    text "Método de Pago:" label
    row spacing=16
      radio transferencia label="Transferencia Bancaria" group="pago" checked=true
      radio tarjeta label="Tarjeta Corporativa" group="pago"

    row spacing=12
      chip "Desglose IVA" selected=true
      chip "Retención ISR"
      switch timbradoAutomatico label="Timbrado automático" checked=true

    accordion "Datos Fiscales Avanzados" expanded=false icon=building-2
      textfield rfc label="RFC / Tax ID" placeholder="XAXX010101000"
      textfield razon label="Razón Social" placeholder="Empresa S.A. de C.V."

    row spacing=12
      button "Emitir Factura" filled icon=send snackbar="Factura enviada al cliente" goto=@Resumen
      button "Guardar Borrador" tonal icon=save snackbar="Borrador guardado"
      button "Cancelar" text goto=back
```

---

## 📐 WDL Grammar & Syntax Rules

- **Indentation**: Exactly **2 spaces** per hierarchy level.
- **Top-Level Screens**: `@ScreenName:type`
  - `screen`: Full application page / viewport.
  - `form`: Focused data entry page.
  - `dialog`: Centered modal with backdrop overlay.
  - `wizard`: Multi-step interactive flow with linear progression.
  - `sheet`: Bottom-sheet modal (mobile-first).
  - `snackbar`: Standalone reusable toast notification template.
- **Strings**: Values with spaces must be enclosed in double quotes (`text "Hola Mundo"`).
- **Booleans**: `true` or `false`.
- **Numbers**: `cols=3`, `padding=16`, `spacing=12`, `step=2`.

---

## 🧩 Comprehensive Component Reference (+35 Components)

### 1. Structure & Navigation
- `appbar "<title>" [subtitle="..."] [icon=<icon>] [actionIcon=<icon>] [goto=@Screen|back]`
- `breadcrumbs items=["Item1", "Item2", "Item3"] [separator=chevron|slash]`
- `tabs items=["Pestaña 1", "Pestaña 2"]`
- `accordion "<title>" [expanded=false|true] [icon=<icon>] [badge="..."]`
- `wizard` / `step "<Title>"`: Multi-step guided assistants with step routing (`goto=@Wizard(step=N)`).

### 2. Layout & Surfaces
- `card [elevated | outlined | filled] [padding=16]`
- `split`: Split-pane layout with `left` and `right` slot blocks.
- `grid [cols=1..6] [gap=16]`: Responsive column grid.
- `row [spacing=12] [align=center|start|end] [justify=start|center|between|end] [wrap=true]`
- `column [spacing=12] [align=start|center|end]`
- `divider`
- `spacer [height=16]`

### 3. Inputs & Forms
- `textfield <name> [label="..."] [placeholder="..."] [type=text|email|password|number] [icon=<icon>] [required=true]`
- `textarea <name> [label="..."] [placeholder="..."] [rows=3]`
- `select <name> [label="..."] [options=["A", "B"]]` (supports nested `option "<Name>"`)
- `autocomplete <name> [label="..."]` (supports nested `option "<Name>"`)
- `datepicker <name> [label="..."] [value="YYYY-MM-DD"]`
- `checkbox <name> [label="..."] [checked=true|false]`
- `radio <name> [label="..."] [group="..."] [checked=true|false]`
- `switch <name> [label="..."] [checked=true|false]`
- `slider <name> [label="..."] [min=0] [max=100] [value=50]`
- `rating <name> [label="..."] [value=4] [max=5]`

### 4. Actions & Controls
- `button "<label>" [filled | tonal | outlined | text | elevated] [icon=<icon>] [goto=@Screen] [snackbar="..."]`
- `fab "<label>" [icon=<icon>] [extended=true|false] [goto=@Screen]`
- `segmentedbutton [options=["A", "B", "C"]] [selected="A"]`
- `chip "<label>" [icon=<icon>] [selected=true|false]`

### 5. Data & Visualization
- `metric [label="..."] [value="..."] [delta="+12%"] [icon=<icon>]`
- `table [title="..."] [columns=["ID:code", "Usuario:avatar", "Monto:currency", "Estado:status", "Acción:action", "Menú:dropdown"]] [striped=true] [searchable=true]`
  - Rows: `row ["#101", "Javier Díaz", "$1,450.00", "Activo", "Configurar", ""]`
  - Markdown pipe rows supported: `| #102 | Elena Gómez | $890.00 | Pendiente | Ver | |`
- `listitem "<label>" [subtitle="..."] [icon=<icon>] [badge="..."] [goto=@Screen]`
- `progress [value=75]`
- `avatar [name="Nombre"] [src="..."]`
- `badge [value="Nuevo"]`

### 6. Feedback & Notifications
- `alert "<message>" [title="..."] [type=info|success|warning|error]`
- `snackbar "<message>" [action="Deshacer"] [type=success] [goto=@Screen]`

---

## 🚀 Navigation Directives

| Directive | Description | Example |
| :--- | :--- | :--- |
| `goto=@ScreenName` | Navigates to a declared screen | `button "Ver Reporte" goto=@Reportes` |
| `goto=@Wizard(step=N)` | Jumps to a specific step in a wizard | `button "Siguiente" goto=@Setup(step=2)` |
| `modal=@DialogName` | Opens a dialog modal overlay | `button "Eliminar" modal=@ConfirmDelete` |
| `goto=back` | Returns to the previous screen | `button "Atrás" text goto=back` |
| `goto=close` | Closes active modal/dialog/sheet | `button "Cerrar" text goto=close` |
| `snackbar="Mensaje"` | Triggers a Material 3 snackbar toast | `button "Guardar" snackbar="Guardado con éxito"` |

---

## 📦 Export Targets

Wisp UI Studio transpiles WDL in real time into:
1. **React 18 + TypeScript + Tailwind CSS** (Ready for production web apps).
2. **Flutter / Dart** (Material 3 widgets for Android & iOS).
3. **JSON AST (Abstract Syntax Tree)** (Structured tree for custom code generators and CLI pipelines).
4. **Clean WDL Source** (Single-file shareable prototype).
