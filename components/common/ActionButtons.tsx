import { RefreshCcw, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const ActionButtons = ({
  loading,
  onRefresh,
  onRemove,
}: {
  loading: boolean;
  onRefresh: () => void;
  onRemove: () => void;
}) => (
  <div className="flex items-center justify-end gap-2 sm:gap-4 mb-4">
    <RefreshCcw
      size={18}
      onClick={onRefresh}
      aria-label="Refresh widget data"
      className={cn(
        "cursor-pointer touch-manipulation p-3 rounded-full transition-colors hover:bg-muted/50 sm:p-0",
        loading && "animate-spin"
      )}
    />
    <Trash2
      size={18}
      onClick={onRemove}
      aria-label="Remove widget"
      className="cursor-pointer touch-manipulation p-3 rounded-full transition-colors hover:bg-muted/50 sm:p-0"
    />
  </div>
);

export default ActionButtons;
