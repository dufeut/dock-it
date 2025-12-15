import type { DockPanel, Widget } from "@lumino/widgets";

/** Widget configuration stored in serialized layout */
export interface WidgetConfig {
  readonly id: string;
  readonly kind: string;
  readonly label?: string;
  readonly icon?: string;
  readonly closable?: boolean;
}

/** Tab area in serialized layout */
export interface SerializedTabArea {
  readonly type: "tab-area";
  readonly widgets: readonly WidgetConfig[];
  readonly currentIndex: number;
}

/** Split area in serialized layout */
export interface SerializedSplitArea {
  readonly type: "split-area";
  readonly orientation: "horizontal" | "vertical";
  readonly sizes: readonly number[];
  readonly children: readonly SerializedArea[];
}

export type SerializedArea = SerializedTabArea | SerializedSplitArea;

export interface SerializedLayout {
  readonly main: SerializedArea | null;
}

type AreaConfig = NonNullable<DockPanel.ILayoutConfig["main"]>;

/** Extract widget config from Lumino widget */
const extractWidgetConfig = (widget: unknown): WidgetConfig => {
  const w = widget as {
    id?: string;
    kind?: string;
    node?: { id?: string };
    title?: { label?: string; iconClass?: string; className?: string };
  };

  return {
    id: w.id ?? w.node?.id ?? "",
    kind: w.kind ?? "UNKNOWN",
    label: w.title?.label,
    icon: w.title?.iconClass,
    closable: w.title?.className?.includes("closable") ?? false,
  };
};

/** Serialize Lumino DockPanel layout to JSON-safe format */
export const serializeLayout = (
  layout: DockPanel.ILayoutConfig
): SerializedLayout => {
  if (!layout.main) return { main: null };

  const traverseArea = (area: AreaConfig): SerializedArea => {
    if (area.type === "tab-area") {
      return {
        type: "tab-area",
        widgets: area.widgets.map(extractWidgetConfig),
        currentIndex: area.currentIndex,
      };
    }

    return {
      type: "split-area",
      orientation: area.orientation,
      sizes: [...area.sizes],
      children: area.children.map(traverseArea),
    };
  };

  return { main: traverseArea(layout.main) };
};

/** Widget factory function type */
export type WidgetFactory = (config: WidgetConfig) => Widget;

/** Deserialize JSON layout back to Lumino-compatible format */
export const deserializeLayout = (
  serialized: SerializedLayout,
  widgetFactory: WidgetFactory
): DockPanel.ILayoutConfig => {
  if (!serialized.main) return { main: null };

  const restoreArea = (area: SerializedArea): AreaConfig => {
    if (area.type === "tab-area") {
      return {
        type: "tab-area",
        widgets: area.widgets.map(widgetFactory),
        currentIndex: area.currentIndex,
      };
    }

    return {
      type: "split-area",
      orientation: area.orientation,
      sizes: [...area.sizes],
      children: area.children.map(restoreArea),
    };
  };

  return { main: restoreArea(serialized.main) };
};

/** Convert layout to JSON string */
export const layoutToJSON = (layout: DockPanel.ILayoutConfig): string =>
  JSON.stringify(serializeLayout(layout), null, 2);

/** Parse JSON string to serialized layout */
export const jsonToSerializedLayout = (json: string): SerializedLayout =>
  JSON.parse(json) as SerializedLayout;

/** Count the number of splits in a layout (N panels = N-1 splits) */
export const countSplits = (layout: SerializedLayout): number => {
  if (!layout.main) return 0;

  const count = (area: SerializedArea): number => {
    if (area.type === "tab-area") return 0;
    // Each split-area with N children contributes (N-1) splits + recurse into children
    const thisSplit = area.children.length - 1;
    const childSplits = area.children.reduce(
      (sum, child) => sum + count(child),
      0
    );
    return thisSplit + childSplits;
  };

  return count(layout.main);
};

/** Count the number of panels (tab areas) in a layout */
export const countPanels = (layout: SerializedLayout): number => {
  if (!layout.main) return 0;

  const count = (area: SerializedArea): number => {
    if (area.type === "tab-area") return 1;
    return area.children.reduce((sum, child) => sum + count(child), 0);
  };

  return count(layout.main);
};
