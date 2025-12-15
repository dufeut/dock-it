# @dufeut/dock-it

A powerful, resizable docking system built on [Lumino](https://github.com/jupyterlab/lumino) that enables IDE-like layouts with draggable tabs, splittable panels, and persistent layout serialization.

## Features

- **Tab Management** - Draggable, reorderable, closable tabs with dirty state indicators
- **Split Panels** - Divide the dock horizontally or vertically with resizable handles
- **Layout Serialization** - Save and restore layouts as JSON
- **Drag & Drop** - Drag tabs between areas dynamically
- **Theme Customization** - Full CSS variable support
- **Widget Lifecycle** - Creation/deletion hooks for each widget type
- **Close Handlers** - Custom handlers for clean and dirty tab closing
- **TypeScript** - Full type definitions included
- **Zero CSS Dependencies** - Styles injected automatically

## Installation

```bash
npm install @dufeut/dock-it
# or
pnpm add @dufeut/dock-it
```

## Quick Start

```typescript
import { Docker } from "@dufeut/dock-it";

const dock = Docker.create({
  // Widget lifecycle hooks (optional)
  model: {
    editor: {
      created: (widget) => console.log(`[created] ${widget.id}`),
      deleted: (widget) => console.log(`[deleted] ${widget.id}`),
    },
  },
  // Widget factories (required)
  widgets: {
    editor: (cfg) => ({
      ...cfg,
      render: (ctx) =>
        `<div style="padding: 20px; color: #ccc;"><h2>${ctx.label}</h2></div>`,
    }),
  },
  // Tab events (optional)
  onTabAdded: (config) => console.log("[tab added]", config.view?.id),
  onTabRemoved: (config) => console.log("[tab removed]", config.view?.id),
});

// Attach to DOM
dock.attach(document.getElementById("app"));

// Create and add widgets
const widget1 = dock.widget("editor", { id: "file-1", label: "index.js" });
const widget2 = dock.widget("editor", { id: "file-2", label: "style.css" });
const widget3 = dock.widget("editor", {
  id: "file-3",
  label: "index.html",
  closable: false,
});

dock.add(widget1);
dock.add(widget2, { mode: "split-right", ref: widget1 });
dock.add(widget3, { mode: "tab-after", ref: widget2 });

// Handle resize
window.addEventListener("resize", () => dock.update());
```

### IIFE (Script Tag)

```html
<script src="./dist/dock-it.iife.js"></script>
<script>
  const { Docker } = window.DockIt;
  // ... same usage as above
</script>
```

## Full Example with All Options

```typescript
import { Docker } from "@dufeut/dock-it";

const dock = Docker.create({
  // Widget lifecycle hooks
  model: {
    editor: {
      created: (widget) => console.log(`[created] ${widget.id}`),
      deleted: (widget) => console.log(`[deleted] ${widget.id}`),
    },
  },
  // Widget factories
  widgets: {
    editor: (cfg) => ({
      ...cfg,
      render: (ctx) =>
        `<div style="padding: 20px; color: #ccc;"><h2>${ctx.label}</h2></div>`,
    }),
  },
  // Tab events
  onTabAdded: (config) => console.log("[tab added]", config.view?.id),
  onTabRemoved: (config) => console.log("[tab removed]", config.view?.id),
  // Theme
  theme: {
    panelBg: "#1e1e1e",
    tabBarBg: "#252526",
    tabBg: "#2d2d2d",
    tabBgActive: "#1e1e1e",
    tabTextColor: "#ccc",
    tabPaddingX: "8px",
    tabBarMinHeight: "30px",
    tabBarGap: "2px",
    resizerBg: "#ccc",
    resizerHv: "#00ccccff",
    overlayBg: "#007acc",
    overlayOpacity: "0.3",
    iconLeftMargin: "10px",
    iconRightMargin: "20px",
    iconRightOpacity: "0.1",
  },
  // Close button icons
  icons: {
    close: { text: "✕", fontSize: "20px", marginTop: "0" }, // × X ✕
    dirty: { text: "◉", fontSize: "24px", marginTop: "2px" }, // ● ◉
  },
  // Close handlers
  handlers: {
    onClose: ({ close }) => {
      close(); // Just close
    },
    onDirtyClose: ({ widgetId, close }) => {
      if (confirm(`"${widgetId}" has unsaved changes. Close anyway?`)) {
        close();
      }
    },
  },
});
```

## API Reference

### Docker Static Methods

```typescript
Docker.create(config: DockerConfig): Docker             // Create a new Docker instance
Docker.setDirty(widgetId: string, dirty: boolean): void // Mark widget as dirty
Docker.isDirty(widgetId: string): boolean               // Check if widget is dirty
```

### Docker Instance Methods

```typescript
dock.attach(el: HTMLElement): this             // Attach to DOM
dock.widget(kind: string, options): Widget     // Create a widget
dock.add(widget, options?): this               // Add widget to dock
dock.activate(widget): this                    // Bring widget to front
dock.update(): this                            // Update layout (call on resize)
dock.save(): string                            // Save layout as JSON string
dock.load(el, json: string): this              // Load layout from JSON string
dock.dispose(): this                           // Clean up and destroy
dock.nodes: TabNodeConfig[]                    // Get all tracked tab nodes
dock.isDisposed: boolean                       // Check if disposed
dock.panel: DockPanel | null                   // Get underlying Lumino panel
```

### Add Options

```typescript
interface AddOptions {
  mode?:
    | "split-top"
    | "split-left"
    | "split-right"
    | "split-bottom"
    | "tab-before"
    | "tab-after";
  ref?: Widget; // Reference widget for positioning
}
```

### Widget Options

```typescript
interface WidgetOptions {
  id?: string; // Widget ID (auto-generated if not provided)
  label?: string; // Tab label
  icon?: string; // CSS class for icon (e.g., "fa fa-file")
  closable?: boolean; // Allow closing the tab (default: true)
  render?: (ctx: RenderContext) => HTMLElement | string | void;
}
```

### Docker Config

```typescript
interface DockerConfig {
  // Widget lifecycle hooks per kind
  model?: Record<
    string,
    {
      created?: (widget: Widget) => void;
      deleted?: (widget: Widget) => void;
    }
  >;
  // Widget factories (required)
  widgets: Record<string, (config) => WidgetOptions | Widget>;
  // Tab behavior
  tabsMovable?: boolean; // Allow dragging tabs (default: true)
  tabsConstrained?: boolean; // Constrain tabs to their panel (default: false)
  addButtonEnabled?: boolean; // Show add button in tab bar (default: false)
  // Tab events
  onTabAdded?: (config: TabNodeConfig) => void;
  onTabRemoved?: (config: TabNodeConfig) => void;
  // Theming
  theme?: DockTheme;
  // Icon customization
  icons?: {
    close?: { text?: string; fontSize?: string; marginTop?: string };
    dirty?: { text?: string; fontSize?: string; marginTop?: string };
  };
  // Close handlers
  handlers?: {
    onClose?: (ctx: { widgetId: string; close: () => void }) => void;
    onDirtyClose?: (ctx: { widgetId: string; close: () => void }) => void;
  };
}
```

## Dirty State Management

Mark tabs as having unsaved changes:

```typescript
// Mark a widget as dirty (shows dirty indicator instead of close button)
Docker.setDirty("file-1", true);

// Check if a widget is dirty
const isDirty = Docker.isDirty("file-1");

// Clear dirty state
Docker.setDirty("file-1", false);
```

When a dirty tab is closed, `handlers.onDirtyClose` is called instead of `handlers.onClose`.

## Docker (Panels & Widgets)

Mark tabs as having unsaved changes:

```typescript
const dock = Docker.create(...)

console.log(dock.count); // {panels: 2, widgets: 5}
```

## Theming

Pass theme options directly to `Docker.create()`:

```typescript
const dock = Docker.create({
  widgets: {
    /* ... */
  },
  theme: {
    panelBg: "#1e1e1e",
    tabBarBg: "#252526",
    tabBg: "#2d2d2d",
    tabBgActive: "#1e1e1e",
    tabTextColor: "#ccc",
    tabPaddingX: "8px",
    tabBarMinHeight: "30px",
    tabBarGap: "2px",
    resizerBg: "#ccc",
    resizerHv: "#00ccccff",
    overlayBg: "#007acc",
    overlayOpacity: "0.3",
    iconLeftMargin: "10px",
    iconRightMargin: "20px",
    iconRightOpacity: "0.1",
  },
});
```

Or use `setTheme` separately:

### Current Tab (Custom Theme)

```css
.code-editor-widget-tab-class {
  border-bottom: 3px transparent solid;
}
.code-editor-widget-tab-class[aria-selected="true"] {
  border-color: var(--dock-focus);
}
```

```typescript
import { setTheme } from "@dufeut/dock-it";

setTheme({
  panelBg: "#1e1e1e",
  // ... other options
});
```

## Layout Persistence

```typescript
// Save layout
localStorage.setItem("dock-layout", dock.save());
dock.dispose();

// Restore layout later
const saved = localStorage.getItem("dock-layout");
if (saved) {
  dock.load(container, saved);
}
```

## License

BSD-3-Clause
