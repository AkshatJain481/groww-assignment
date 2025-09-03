"use client";

import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { useState } from "react";
import useWidgetsStore, { WidgetProp } from "@/store/useWidgetsStore";
import DraggableWidget from "./DraggableWidget";

const WidgetCanvas = () => {
  const { widgets, reorderWidgets } = useWidgetsStore();
  const [activeWidget, setActiveWidget] = useState<WidgetProp | null>(null);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = widgets.findIndex((w) => w.id === active.id);
      const newIndex = widgets.findIndex((w) => w.id === over.id);

      const newWidgets = arrayMove(widgets, oldIndex, newIndex);
      reorderWidgets(newWidgets);
    }
    setActiveWidget(null);
  }

  if (widgets.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[200px] border-2 border-dashed border-muted-foreground/25 rounded-lg m-4">
        <p className="text-muted-foreground">No widgets yet</p>
      </div>
    );
  }

  return (
    <div className="p-4 overflow-x-hidden h-[calc(100vh-60px)] overflow-y-auto">
      <DndContext
        collisionDetection={closestCenter}
        onDragStart={(event) => {
          const widget = widgets.find((w) => w.id === event.active.id);
          if (widget) setActiveWidget(widget);
        }}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={widgets.map((w) => w.id)}
          strategy={rectSortingStrategy}
        >
          <div className="flex flex-wrap gap-4">
            {widgets.map((widget) => (
              <DraggableWidget key={widget.id} widget={widget} />
            ))}
          </div>
        </SortableContext>

        {/* Overlay ensures no distortion */}
        <DragOverlay>
          {activeWidget ? <DraggableWidget widget={activeWidget} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default WidgetCanvas;
