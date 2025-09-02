import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WidgetProp {
  id: string;
  widgetName: string;
  endpoint: string;
  refreshInterval: number;
  widgetType: "card" | "chart" | "table";
  fields: { path: string; value: any; label?: string }[];
}

interface WidgetsStore {
  widgets: WidgetProp[];
  addWidget: (widget: WidgetProp) => void;
  removeWidget: (widgetName: string) => void;
  clearWidgets: () => void;
  reorderWidgets: (widgets: WidgetProp[]) => void;
}

const useWidgetsStore = create<WidgetsStore>()(
  persist(
    (set) => ({
      widgets: [],
      addWidget: (widget) =>
        set((state) => ({ widgets: [...state.widgets, widget] })),
      removeWidget: (widgetName) =>
        set((state) => ({
          widgets: state.widgets.filter((w) => w.widgetName !== widgetName),
        })),
      clearWidgets: () => set({ widgets: [] }),
      reorderWidgets: (widgets) => set({ widgets }),
    }),
    { name: "widgets-storage" }
  )
);

export default useWidgetsStore;
