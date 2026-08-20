import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent header as required
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

// Health endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", geminiAvailable: !!ai });
});

// Wisp AI Generator / Refiner Endpoint
app.post("/api/gemini/generate-wisp", async (req, res) => {
  try {
    const { prompt, currentCode, mode = "generate" } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "El prompt es requerido" });
    }

    if (!ai) {
      return res.status(503).json({
        error: "GEMINI_API_KEY no está configurada en el entorno.",
      });
    }

    const systemInstruction = `
Eres el Agente Oficial de Wisp DSL.
Tu trabajo es generar o modificar especificaciones de interfaces en Wisp DSL fieles al sistema de diseño Material 3 Expressive.

SINTAXIS DE WISP DSL:
1. Declaración de pantallas:
   @NombrePantalla:tipo   (tipos: screen, dialog, form, wizard, sheet, modal, snackbar, toast)
   Ejemplos:
   @Login:screen
   @Profile:form
   @ConfirmDelete:dialog
   @SetupWizard:wizard
   @QuickFilter:sheet
   @FacturaToast:snackbar "Factura emitida con éxito" snackbar-action="Deshacer" icon=check-circle-2 snackbar-type=success

2. Componentes y propiedades:
   - Componentes se escriben por línea con indentación de 2 espacios para anidar hijos.
   - Parámetros inline o indentados (propiedad: valor).
   - Componentes soportados:
     * appbar "Título" (subtitle="...", icon=arrow-left|menu, goto=back|@Screen)
     * breadcrumbs (items=["Inicio", "Clientes", "Facturación"])
     * card (variant=elevated|filled|outlined)
     * accordion "Título" (expanded=false|true, icon=..., variant=outlined|elevated|filled)
     * text "Mensaje" (variant=display|headline|title|body|label|caption, color=primary|secondary|error|onSurface)
     * textfield nombre (label="...", placeholder="...", type=text|password|email|number, icon=..., helper="...", required=true)
     * textarea nombre (label="...", rows=3, placeholder="...")
     * autocomplete nombre (label="...", placeholder="...", options=["Opción 1", "Opción 2"]) o con bloques 'option "..."' anidados
     * datepicker nombre (label="...", value="YYYY-MM-DD")
     * rating nombre (label="...", value=4, max=5, readonly=false, size=sm|md|lg)
     * button "Texto" (variant=filled|tonal|outlined|text|elevated, icon=..., goto=@Destino, disabled=false, badge="...", snackbar="Mensaje", snackbar-action="Deshacer", snackbar-icon=..., snackbar-type=success|info|warning|error, snackbar-goto=@Destino, snackbar-duration=4000)
       Ejemplo: button "Facturar" filled icon=send snackbar="Factura #1024 enviada" snackbar-action="Deshacer" goto=@KiroSetup
     * fab "Texto" (icon=plus, extended=true, goto=@Destino, snackbar="...")
     * chip "Etiqueta" (variant=assist|filter|input|suggestion, selected=true, icon=...)
     * switch nombre (label="...", checked=true)
     * checkbox nombre (label="...", checked=true)
     * radio nombre (label="...", group="grupo1", checked=true)
     * slider nombre (min=0, max=100, value=50, label="...")
     * select nombre (label="...", options=["Opción 1", "Opción 2"])
     * segmentedbutton (options=["Diario", "Semanal", "Mensual"], selected="Diario")
     * listitem "Título" (subtitle="...", icon=..., badge="...", goto=@Destino, snackbar="...")
     * snackbar "Mensaje" (action="...", icon=..., type=info|warning|error|success, goto=@Destino, duration=4000)
     * avatar (src="..." o name="Juan Perez", size=sm|md|lg)
     * badge "Nuevo" (color=primary|error)
     * icon nombre (size=sm|md|lg, color=primary)
     * image src="..." (aspect=16/9, rounded=md)
     * progress (value=60, type=linear|circular)
     * metric (label="Ventas", value="$12,450", delta="+18%", icon=trending-up)
     * divider
     * spacer height=16
     * alert "Mensaje" (type=info|warning|error|success, title="...")
     * tabs (tabs=["General", "Seguridad", "Facturación"], active=0)
     * table (columns=["ID", "Nombre", "Estado", "Acciones"], striped=true, hover=true)

3. Layouts:
   - row (spacing=16, align=center|start|end, justify=between|start|center)
   - column (spacing=16, align=stretch|center|start)
   - grid (cols=2|3|4, gap=16)
   - sidebar (width=260)
   - split (con slots 'left' y 'right')
   - container (maxwidth=lg|xl|full, padding=24)

4. Wizards (@Nombre:wizard):
   steps: 3
   step "Paso 1: Bienvenida"
     text "..."
     button "Siguiente" goto=@Nombre(step=2)
   step "Paso 2: Datos"
     textfield ...
     button "Continuar" goto=@Nombre(step=3)

5. Navegación interactiva y Snackbars:
   - goto=@Screen
   - goto=@Screen(step=2)
   - modal=@Screen
   - back
   - close
   - snackbar="Mensaje" o snackbar=@ToastTemplate en botones

REGLAS DE SALIDA:
- Genera ÚNICAMENTE código Wisp DSL válido dentro de un bloque \`\`\`wisp ... \`\`\` o texto plano Wisp DSL.
- No agregues explicaciones extensas, solo el código Wisp DSL limpio, bien indentado y con interfaces elegantes y completas.
- Diseña interfaces ricas y visualmente atractivas con Material 3 Expressive, asegurando que todos los campos requeridos para el negocio estén presentes para evitar "el campito faltante".
`;

    const userPrompt =
      mode === "modify" && currentCode
        ? `Modifica el siguiente código Wisp DSL existente según las siguientes instrucciones:\n\nCÓDIGO ACTUAL:\n\`\`\`wisp\n${currentCode}\n\`\`\`\n\nINSTRUCCIONES DE MODIFICACIÓN:\n${prompt}`
        : `Crea una pantalla o flujo de pantallas completas en Wisp DSL para el siguiente requerimiento:\n\n${prompt}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    let generatedText = response.text || "";

    // Clean markdown code blocks if wrapped
    if (generatedText.includes("```wisp")) {
      generatedText = generatedText
        .split("```wisp")[1]
        .split("```")[0]
        .trim();
    } else if (generatedText.includes("```")) {
      generatedText = generatedText
        .split("```")[1]
        .split("```")[0]
        .trim();
    }

    res.json({
      wispCode: generatedText,
    });
  } catch (error: any) {
    console.error("Gemini Wisp Generation Error:", error);
    res.status(500).json({
      error: error.message || "Error al generar código Wisp",
    });
  }
});

// Vite dev or production static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Wisp UI Studio running on http://localhost:${PORT}`);
  });
}

startServer();
