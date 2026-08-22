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
      return res.status(400).json({ error: "Prompt is required" });
    }

    if (!ai) {
      return res.status(503).json({
        error: "GEMINI_API_KEY is not configured in the environment.",
      });
    }

    const systemInstruction = `
You are the Official Agent and Principal Design System Architect of Wisp DSL (WDL).
Your mission is to generate and refine declarative UI specifications in Wisp DSL conforming strictly to Google Material Design 3 (M3 Expressive: https://m3.material.io/components).

WISP DSL (WDL) SYNTAX AND SPECIFICATION:

1. Screen and Top-Level View Declarations:
   @ScreenName:type   (valid types: screen, dialog, form, wizard, sheet, sidesheet, drawer, modal, snackbar, toast)
   Examples:
   @Login:screen
   @Profile:form
   @ConfirmDelete:dialog
   @SetupWizard:wizard
   @QuickFilter:sidesheet
   @MobileMenu:drawer
   @ActionSheet:sheet
   @InvoiceToast:snackbar "Invoice issued successfully" snackbar-action="Undo" icon=check-circle-2 snackbar-type=success

2. Material Design 3 Components supported in WDL:

   - STRUCTURE & NAVIGATION:
     * navigationrail (title="...", fab=plus|edit) -> Vertical navigation rail for desktop/tablet layouts with navitems.
       Example:
       navigationrail title="Studio" fab=plus
         navitem "Home" icon=home active
         navitem "Inbox" icon=inbox badge="5"
         navitem "Settings" icon=settings
     * drawer (title="...", subtitle="...", avatar="...") -> Navigation Drawer with user profiles and categorized sections.
       Example:
       drawer title="Admin Portal" subtitle="admin@company.com"
         draweritem "Dashboard" icon=layout active
         draweritem "Quotes" icon=file-text badge="8"
         section "Configuration"
         draweritem "Preferences" icon=settings
     * draweritem "Text" (icon=..., badge="...", active=true|false, goto=@Target)
     * sidesheet (title="...", position=right|left, variant=standard|modal) -> Side Sheet for secondary actions & filters.
     * bottomsheet (title="...", variant=standard|modal) -> Bottom sheet with drag handle.
     * appbar "Title" (subtitle="...", icon=arrow-left|menu, goto=back|@Screen, elevated=true)
     * bottomnav -> Bottom navigation bar with navitems.
     * navitem "Text" (icon=..., active=true, badge="...", goto=@Screen)
     * breadcrumbs items=["Home", "Events", "Billing"]
     * tabs items=["General", "Security", "Notifications"] or with nested 'tab "Name"' blocks.

   - SURFACE & CONTAINERS:
     * card (variant=elevated|filled|outlined, padding=16)
     * carousel -> Interactive horizontal slider with cards.
     * accordion "Title" (expanded=false|true, icon=..., variant=outlined|elevated|filled)
     * list -> List container with M3 dividers.
     * listitem "Title" (subtitle="...", icon=..., badge="...", goto=@Target, switch=true, checkbox=true)
     * section "Section Title" -> Uppercase divider header.
     * divider
     * spacer height=16

   - INPUTS & FORMS:
     * textfield name (label="...", placeholder="...", type=text|password|email|number, icon=..., helper="...", required=true)
     * searchbar name (placeholder="Search...", value="...")
     * textarea name (label="...", rows=3, placeholder="...")
     * select name (label="...", options=["Option 1", "Option 2"]) or with nested 'option "..."' blocks
     * autocomplete name (label="...", placeholder="...", options=["Option 1", "Option 2"])
     * datepicker name (label="...", value="YYYY-MM-DD")
     * timepicker name (label="...", value="14:30", format=12h|24h)
     * switch name (label="...", checked=true)
     * checkbox name (label="...", checked=true)
     * radio name (label="...", group="group1", checked=true)
     * slider name (min=0, max=100, value=50, label="...")
     * rating name (label="...", value=4, max=5, readonly=false)
     * segmentedbutton (options=["Daily", "Weekly", "Monthly"], selected="Daily")

   - ACTIONS & MENUS:
     * button "Text" (variant=filled|tonal|outlined|text|elevated, icon=..., goto=@Target, disabled=false, badge="...", snackbar="Message", snackbar-action="Undo", snackbar-type=success|info|warning|error)
     * iconbutton (icon=star|heart|bell|settings, variant=standard|filled|tonal|outlined, tooltip="...", badge="...", goto=@Screen)
     * menu "Actions" (icon=more-vertical) -> Contextual dropdown menu.
       Example:
       menu "Options" icon=more-vertical
         menuitem "Edit" icon=edit
         menuitem "Duplicate" icon=copy
         menuitem "Delete" icon=trash goto=@ConfirmDelete
     * menuitem "Text" (icon=..., shortcut="...", goto=@Screen)
     * fab "Text" (icon=plus, extended=true, goto=@Target, snackbar="...")

   - FEEDBACK, PROGRESS & TOOLTIPS:
     * loading "Message..." (variant=circular|linear, value=75)
     * circularprogress (value=80, message="...", size=40)
     * linearprogress (value=65, message="Uploading file...", height=8)
     * tooltip "Short helpful tooltip"
     * richtooltip (title="...", text="...", action="Learn More", action_goto=@Docs)
     * alert "Message" (type=info|warning|error|success, title="...")
     * snackbar "Message" (action="...", icon=..., type=info|warning|error|success, goto=@Target, duration=4000)

   - DATA, TABLES & TYPOGRAPHY:
     * table (columns=["ID:code", "User:avatar", "Progress:progress", "Total:currency", "Status:status", "Action:action", "Options:dropdown"], striped=true, searchable=true)
     * text "Message" (variant=display|headline|title|body|label|caption, color=primary|secondary|error|onSurface)
     * metric (label="Sales", value="$12,450", delta="+18%", icon=trending-up)
     * avatar (name="Jane Doe", src="...", size=sm|md|lg)
     * badge "New" (color=primary|error)
     * image src="..." (aspect=16/9, rounded=md)

3. Flexbox & Grid Layouts:
   - row (spacing=16, align=center|start|end, justify=between|start|center, wrap=true)
   - column (spacing=16, align=stretch|center|start)
   - grid (cols=2|3|4, gap=16)
   - split -> with nested 'left' and 'right' blocks
   - sidebar (width=260)
   - container (maxwidth=lg|xl|full, padding=24)

4. Interactive Navigation & Feedback:
   - goto=@Screen
   - goto=@Screen(step=2)
   - goto=back
   - goto=close
   - snackbar="Message" or snackbar=@ToastTemplate on buttons

OUTPUT RULES:
- Output ONLY valid Wisp DSL code inside a \`\`\`wisp ... \`\`\` code block or raw Wisp DSL text.
- Do not include conversational filler or external markdown explanations, only clean, properly indented (2 spaces) Wisp DSL code with complete, elegant Material Design 3 interfaces.
- Utilize the full suite of M3 components as appropriate (app rails, navigation drawers, side sheets, bottom sheets, loading indicators, carousels, menus, icon buttons, and tooltips).
`;

    const userPrompt =
      mode === "modify" && currentCode
        ? `Modify the following existing Wisp DSL code according to these instructions:\n\nCURRENT CODE:\n\`\`\`wisp\n${currentCode}\n\`\`\`\n\nMODIFICATION INSTRUCTIONS:\n${prompt}`
        : `Create a comprehensive Wisp DSL screen or multi-screen flow for the following requirement:\n\n${prompt}`;

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
      error: error.message || "Error generating Wisp code",
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
