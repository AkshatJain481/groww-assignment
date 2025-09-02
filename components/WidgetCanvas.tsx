"use client";

import React from "react";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { GripVertical } from "lucide-react";
import useWidgetsStore from "@/store/useWidgetsStore";

// Draggable Widget Card
function DraggableWidget({ widget }: { widget: any }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`relative transition-all duration-200 hover:shadow-md bg-background border ${
        isDragging ? "opacity-50 shadow-lg scale-105" : ""
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            {widget.widgetName}
          </CardTitle>
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 rounded-sm hover:bg-accent"
          >
            <GripVertical className="h-4 w-4" />
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Type: {widget.widgetType}
        </div>
      </CardHeader>
    </Card>
  );
}

// Main Canvas Component
export default function WidgetCanvas() {
  const { widgets, reorderWidgets } = useWidgetsStore();

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = widgets.findIndex((w) => w.id === active.id);
      const newIndex = widgets.findIndex((w) => w.id === over.id);

      const newWidgets = arrayMove(widgets, oldIndex, newIndex);
      reorderWidgets(newWidgets);
    }
  }

  if (widgets.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[200px] border-2 border-dashed border-muted-foreground/25 rounded-lg">
        <p className="text-muted-foreground">No widgets yet</p>
      </div>
    );
  }

  return (
    <div className="p-4 overflow-x-hidden h-[calc(100vh-60px)] overflow-y-auto">
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={widgets.map((w) => w.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {widgets.map((widget) => (
              <DraggableWidget key={widget.id} widget={widget} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
