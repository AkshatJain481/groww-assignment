import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WidgetProp {
  id: string;
  widgetName: string;
  endpoint: string;
  refreshInterval: number;
  widgetType: "card" | "chart" | "table";
  fields: { path: string; value: any; label?: string }[];
  headers: Record<string, string>;
  chartType: "line" | "bar";
}

interface WidgetsStore {
  widgets: WidgetProp[];
  addWidget: (widget: WidgetProp) => void;
  removeWidget: (widgetId: string) => void;
  clearWidgets: () => void;
  reorderWidgets: (widgets: WidgetProp[]) => void;
  updateWidget: (id: string, newWidget: WidgetProp) => void;
}

const useWidgetsStore = create<WidgetsStore>()(
  persist(
    (set) => ({
      widgets: [],
      addWidget: (widget) =>
        set((state) => ({ widgets: [...state.widgets, widget] })),
      removeWidget: (widgetId) =>
        set((state) => ({
          widgets: state.widgets.filter((w) => w.id !== widgetId),
        })),
      clearWidgets: () => set({ widgets: [] }),
      reorderWidgets: (widgets) => set({ widgets }),
      updateWidget: (id, newWidget) =>
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === id ? { ...w, ...newWidget } : w
          ),
        })),
    }),
    { name: "widgets-storage" }
  )
);

export default useWidgetsStore;
