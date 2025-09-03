import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import CardWidget from "./CardWidget";
import { WidgetProp } from "@/store/useWidgetsStore";
import ChartWidget from "./ChartWidget";
import TableWidget from "./TableWidget";
import { cn } from "@/lib/utils";

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

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "gap-0 relative transition-all duration-200 hover:shadow-md bg-background border dark:border-zinc-700 flex-grow min-w-[300px]",
        isDragging ? "opacity-50 shadow-lg scale-105" : "",
        widget.widgetType === "card" && "max-w-2xl",
        widget.widgetType === "chart" && "max-w-7xl",
        widget.widgetType === "table" && "max-w-7xl"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">
            {widget.widgetName}
            <span className="text-xs p-2 ml-4 dark:bg-zinc-800 bg-gray-100 rounded-xl">
              {widget.refreshInterval}s
            </span>
          </CardTitle>
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 rounded-sm hover:bg-accent"
          >
            <GripVertical size={16} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {widget.widgetType === "card" && <CardWidget widget={widget} />}
        {widget.widgetType === "chart" && <ChartWidget widget={widget} />}
        {widget.widgetType === "table" && <TableWidget widget={widget} />}
      </CardContent>
    </Card>
  );
};

export default DraggableWidget;
