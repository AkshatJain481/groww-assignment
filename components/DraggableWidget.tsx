import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

import CardWidget from "./CardWidget";
import ChartWidget from "./ChartWidget";
import TableWidget from "./TableWidget";
import { WidgetProp } from "@/store/useWidgetsStore";

const widgetComponents = {
  card: CardWidget,
  chart: ChartWidget,
  table: TableWidget,
} as const;

const widgetTypeClasses: Record<WidgetProp["widgetType"], string> = {
  card: "max-w-2xl",
  chart: "max-w-7xl",
  table: "max-w-7xl",
};

const DraggableWidget = ({ widget }: { widget: WidgetProp }) => {
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

  const WidgetContent = useMemo(() => {
    const Component = widgetComponents[widget.widgetType];
    return <Component widget={widget} />;
  }, [widget]);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative flex-grow  min-w-[300px] md:min-w-[500px] gap-0 bg-background border transition-all duration-200 hover:shadow-md dark:border-zinc-700",
        isDragging && "opacity-50 shadow-lg scale-105",
        widgetTypeClasses[widget.widgetType]
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            {widget.widgetName}
            <span className="text-xs px-2 py-1 rounded-xl bg-gray-100 dark:bg-zinc-800">
              {widget.refreshInterval}s
            </span>
          </CardTitle>
          <div
            {...attributes}
            {...listeners}
            aria-label="Drag handle"
            className="cursor-grab active:cursor-grabbing p-1 rounded-sm hover:bg-accent"
          >
            <GripVertical size={16} />
          </div>
        </div>
      </CardHeader>
      <CardContent>{WidgetContent}</CardContent>
    </Card>
  );
};

export default DraggableWidget;
