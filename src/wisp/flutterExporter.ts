import { WispDocument, ScreenNode, WispNode } from "./types";

/**
 * Escapes Dart string literals
 */
function escapeDart(str: string): string {
  return String(str || "")
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\$/g, "\\$");
}

/**
 * Capitalizes a string to PascalCase for Flutter Widget names
 */
function toPascalCase(str: string): string {
  return (str || "Main")
    .replace(/[^a-zA-Z0-9]/g, " ")
    .split(" ")
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("") || "Screen";
}

/**
 * Maps icon name to Flutter Icons
 */
function mapFlutterIcon(name?: string): string {
  const n = (name || "star").toLowerCase();
  if (n.includes("user") || n.includes("person")) return "Icons.person";
  if (n.includes("home")) return "Icons.home";
  if (n.includes("search")) return "Icons.search";
  if (n.includes("setting")) return "Icons.settings";
  if (n.includes("bell") || n.includes("notif")) return "Icons.notifications";
  if (n.includes("mail") || n.includes("email")) return "Icons.email";
  if (n.includes("lock")) return "Icons.lock";
  if (n.includes("check")) return "Icons.check";
  if (n.includes("add") || n.includes("plus")) return "Icons.add";
  if (n.includes("arrow-right")) return "Icons.arrow_forward";
  if (n.includes("arrow-left")) return "Icons.arrow_back";
  if (n.includes("close") || n.includes("x")) return "Icons.close";
  if (n.includes("menu")) return "Icons.menu";
  if (n.includes("edit")) return "Icons.edit";
  if (n.includes("delete")) return "Icons.delete";
  if (n.includes("star")) return "Icons.star";
  return "Icons.star";
}

/**
 * Exports WispDocument AST to full Material 3 Flutter Dart code.
 */
export function exportToFlutterM3(doc: WispDocument): string {
  const standardScreens = doc.screens.filter(
    s => s.type !== "dialog" && s.type !== "modal" && s.type !== "sheet" && s.type !== "component"
  );
  const firstScreen = standardScreens[0]?.name || "Home";

  let out = `import 'package:flutter/material.dart';

void main() {
  runApp(const WispMaterialApp());
}

class WispMaterialApp extends StatelessWidget {
  const WispMaterialApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Wisp M3 Expressive',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF6750A4),
          brightness: Brightness.light,
        ),
      ),
      darkTheme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFFD0BCFF),
          brightness: Brightness.dark,
        ),
      ),
      home: const MainPrototypeHost(),
    );
  }
}

class MainPrototypeHost extends StatefulWidget {
  const MainPrototypeHost({super.key});

  @override
  State<MainPrototypeHost> createState() => _MainPrototypeHostState();
}

class _MainPrototypeHostState extends State<MainPrototypeHost> {
  String _currentScreen = '${escapeDart(firstScreen)}';
  int _wizardStep = 1;
  final Map<String, dynamic> _formData = {};

  void _navigateTo(String target) {
    if (target.startsWith('@')) {
      final clean = target.replaceAll('@', '');
      setState(() {
        _currentScreen = clean;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: _buildCurrentScreen(),
      ),
    );
  }

  Widget _buildCurrentScreen() {
    switch (_currentScreen) {
`;

  for (const s of standardScreens) {
    const fnName = `_${toPascalCase(s.name)}View`;
    out += `      case '${escapeDart(s.name)}':\n`;
    out += `        return ${fnName}(onNavigate: _navigateTo, wizardStep: _wizardStep, onStepChange: (s) => setState(() => _wizardStep = s));\n`;
  }

  out += `      default:
        return Center(child: Text('Pantalla \$_currentScreen no encontrada'));
    }
  }
}
\n`;

  for (const s of standardScreens) {
    out += generateFlutterScreenWidget(s);
  }

  return out;
}

function generateFlutterScreenWidget(screen: ScreenNode): string {
  const fnName = `_${toPascalCase(screen.name)}View`;
  let out = `class ${fnName} extends StatelessWidget {
  final Function(String) onNavigate;
  final int wizardStep;
  final Function(int) onStepChange;

  const ${fnName}({
    super.key,
    required this.onNavigate,
    this.wizardStep = 1,
    required this.onStepChange,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
`;
  out += renderFlutterNodes(screen.children, 5);
  out += `        ],
      ),
    );
  }
}
\n`;
  return out;
}

function renderFlutterNodes(nodes: WispNode[], indentLevel: number): string {
  let out = "";
  const pad = "  ".repeat(indentLevel);

  for (const node of nodes) {
    switch (node.type) {
      case "text": {
        const val = escapeDart(node.props.value || "");
        out += `${pad}Text(\n`;
        out += `${pad}  '${val}',\n`;
        out += `${pad}  style: theme.textTheme.${node.props.variant === "headline" ? "headlineMedium" : "bodyLarge"},\n`;
        out += `${pad}),\n`;
        out += `${pad}const SizedBox(height: 8),\n`;
        break;
      }

      case "button": {
        const label = escapeDart(node.props.label || "Botón");
        const goto = node.props.goto ? `onNavigate('${escapeDart(node.props.goto)}')` : "() {}";
        out += `${pad}FilledButton(\n`;
        out += `${pad}  onPressed: ${goto},\n`;
        out += `${pad}  child: Text('${label}'),\n`;
        out += `${pad}),\n`;
        out += `${pad}const SizedBox(height: 8),\n`;
        break;
      }

      case "card": {
        out += `${pad}Card(\n`;
        out += `${pad}  elevation: 2,\n`;
        out += `${pad}  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),\n`;
        out += `${pad}  child: Padding(\n`;
        out += `${pad}    padding: const EdgeInsets.all(16.0),\n`;
        out += `${pad}    child: Column(\n`;
        out += `${pad}      crossAxisAlignment: CrossAxisAlignment.stretch,\n`;
        out += `${pad}      children: [\n`;
        out += renderFlutterNodes(node.children, indentLevel + 4);
        out += `${pad}      ],\n`;
        out += `${pad}    ),\n`;
        out += `${pad}  ),\n`;
        out += `${pad}),\n`;
        out += `${pad}const SizedBox(height: 12),\n`;
        break;
      }

      case "progress":
      case "loading":
      case "linearprogress": {
        const val = node.props.value !== undefined ? Number(node.props.value) / 100 : 0.7;
        out += `${pad}ClipRRect(\n`;
        out += `${pad}  borderRadius: BorderRadius.circular(4),\n`;
        out += `${pad}  child: LinearProgressIndicator(value: ${val}, minHeight: 8),\n`;
        out += `${pad}),\n`;
        out += `${pad}const SizedBox(height: 12),\n`;
        break;
      }

      case "circularprogress": {
        out += `${pad}const Center(child: CircularProgressIndicator()),\n`;
        out += `${pad}const SizedBox(height: 12),\n`;
        break;
      }

      case "textfield": {
        const label = escapeDart(node.props.label || "Entrada");
        out += `${pad}TextField(\n`;
        out += `${pad}  decoration: InputDecoration(\n`;
        out += `${pad}    labelText: '${label}',\n`;
        out += `${pad}    border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),\n`;
        out += `${pad}  ),\n`;
        out += `${pad}),\n`;
        out += `${pad}const SizedBox(height: 12),\n`;
        break;
      }

      case "switch": {
        const label = escapeDart(node.props.label || "Activar");
        out += `${pad}SwitchListTile(\n`;
        out += `${pad}  title: Text('${label}'),\n`;
        out += `${pad}  value: ${node.props.checked === true},\n`;
        out += `${pad}  onChanged: (v) {},\n`;
        out += `${pad}),\n`;
        break;
      }

      case "navigationrail":
      case "apprail":
      case "navrail": {
        const hasChildren = node.children && node.children.length > 0;
        const items = hasChildren
          ? node.children
          : [
              { type: "railitem", props: { label: "Inicio", icon: "home" }, children: [] },
              { type: "railitem", props: { label: "Analíticas", icon: "search" }, children: [] },
              { type: "railitem", props: { label: "Ajustes", icon: "settings" }, children: [] },
            ];

        out += `${pad}SizedBox(\n`;
        out += `${pad}  height: 500,\n`;
        out += `${pad}  child: Row(\n`;
        out += `${pad}    crossAxisAlignment: CrossAxisAlignment.stretch,\n`;
        out += `${pad}    children: [\n`;
        out += `${pad}      NavigationRail(\n`;
        out += `${pad}        selectedIndex: 0,\n`;
        out += `${pad}        onDestinationSelected: (int index) {},\n`;
        out += `${pad}        labelType: NavigationRailLabelType.all,\n`;
        out += `${pad}        destinations: const [\n`;
        items.forEach((item: any, idx: number) => {
          const itemLabel = escapeDart(item.props.label || item.props.title || `Item ${idx + 1}`);
          const itemIcon = mapFlutterIcon(item.props.icon);
          out += `${pad}          NavigationRailDestination(\n`;
          out += `${pad}            icon: Icon(${itemIcon}),\n`;
          out += `${pad}            label: Text('${itemLabel}'),\n`;
          out += `${pad}          ),\n`;
        });
        out += `${pad}        ],\n`;
        out += `${pad}      ),\n`;
        out += `${pad}      const VerticalDivider(thickness: 1, width: 1),\n`;
        out += `${pad}      Expanded(\n`;
        out += `${pad}        child: Padding(\n`;
        out += `${pad}          padding: const EdgeInsets.all(16.0),\n`;
        out += `${pad}          child: Column(\n`;
        out += `${pad}            crossAxisAlignment: CrossAxisAlignment.stretch,\n`;
        out += `${pad}            children: [\n`;
        if (hasChildren && node.children[0]?.children?.length) {
          out += renderFlutterNodes(node.children[0].children, indentLevel + 7);
        } else {
          out += `${pad}              const Text('Panel de Navegación M3', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),\n`;
        }
        out += `${pad}            ],\n`;
        out += `${pad}          ),\n`;
        out += `${pad}        ),\n`;
        out += `${pad}      ),\n`;
        out += `${pad}    ],\n`;
        out += `${pad}  ),\n`;
        out += `${pad}),\n`;
        out += `${pad}const SizedBox(height: 12),\n`;
        break;
      }

      default: {
        if (node.children && node.children.length > 0) {
          out += `${pad}Column(children: [\n`;
          out += renderFlutterNodes(node.children, indentLevel + 1);
          out += `${pad}]),\n`;
        }
        break;
      }
    }
  }

  return out;
}
