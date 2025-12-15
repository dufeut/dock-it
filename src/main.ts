import { Docker } from "./bundle";
import "./style.css";

const EDITOR: WeakMap<any, any> = new WeakMap();

const dock = Docker.create({
  model: {
    editor: {
      created: (widget) => console.log(`[created] ${widget.id}`),
      deleted: (widget) => console.log(`[deleted] ${widget.id}`),
    },
  },
  // Widgets
  widgets: {
    editor: (args) => ({
      ...args,
      render: (ctx: any) =>
        `<div style="padding: 20px; color: #ccc; min-width: 200px;"><h2>${ctx.label}</h2></div>`,
    }),
  },
  onTabAdded: (config: any) => {
    if (config.view?.id && config.view.id) {
      console.log("[dock]", dock.count);
      if (!EDITOR[config.view.id]) {
        config.editor = null;
        EDITOR[config.view.id] = config;
      }
    }
  },
  onTabRemoved: (config: any) => {
    if (EDITOR[config.view.id]) {
      delete EDITOR[config.view.id];
    }
    console.log("[EDITOR]", EDITOR);
  },

  // Theme
  theme: {
    panelBg: "#1e1e1e",
    tabBarBg: "#1e1e1e",
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
  // Closer Icons & Handlers
  icons: {
    close: { text: "✕", fontSize: "20px", marginTop: "0" }, // × X ✕
    dirty: { text: "◉", fontSize: "24px", marginTop: "2px" }, // ● ◉
  },
  handlers: {
    onClose: ({ close }) => {
      close(); // Just close
    },
    onDirtyClose: ({ widgetId, close }) => {
      // Show confirm dialog for dirty tabs
      if (confirm(`"${widgetId}" has unsaved changes. Close anyway?`)) {
        close();
      }
    },
  },
});

const mocker = ({ id, label }: any) =>
  dock.widget("editor", {
    id: id,
    label: label,
    closable: true,
  });

// Create widgets
const widget1 = dock.widget("editor", {
  id: "file-1",
  label: "index.js",
  icon: "fa fa-car",
});
const widget2 = dock.widget("editor", {
  id: "file-2",
  label: "style.css",
});
const widget3 = mocker({
  id: "file-3",
  label: "index.html",
});
const widget4 = mocker({
  id: "file-4",
  label: "app.py",
});
const widget5 = mocker({
  id: "file-5",
  label: "lets.go",
});

// Attach to DOM
const container = document.getElementById("dock");
dock.attach(container);

// Add widgets
dock.add(widget1);
dock.add(widget2, { mode: "split-right", ref: widget1 });
dock.add(widget3, { mode: "tab-after", ref: widget2 });
dock.add(widget4, { mode: "tab-after", ref: widget3 });
dock.add(widget5, { mode: "tab-after", ref: widget1 });

// Handle resize
window.addEventListener("resize", () => dock.update());

console.log("Docker initialized!", dock);

setTimeout(() => {
  Docker.setDirty("file-1", true);
}, 1000);

/*
// Save
localStorage.setItem("dock-layout", dock.save());
dock.dispose();
// Restore
setTimeout(() => {
  const saved = localStorage.getItem("dock-layout");
  if (saved) dock.load(container, saved);
}, 3000);

*/
