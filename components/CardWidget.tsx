import { useEffect, useState, useCallback } from "react";
import { WidgetProp } from "@/store/useWidgetsStore";
import { AlertCircle, RefreshCcw, Trash2 } from "lucide-react";
import { flattenJson } from "@/lib/utils";
import { ScaleLoader } from "react-spinners";
import { cn } from "@/lib/utils";
import useWidgetsStore from "@/store/useWidgetsStore";

function getValueFromPath(data: any, path: string): any {
  if (!data || !path) return null;
  const flattened = flattenJson(data);
  const match = flattened.find((item) => item.path === path);
  return match ? match.value : null;
}

const CardWidget = ({ widget }: { widget: WidgetProp }) => {
  const [data, setData] = useState<{ label: string; value: any }[] | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { removeWidget } = useWidgetsStore();

  const fetchData = useCallback(async () => {
    if (!widget.endpoint) return;

    setLoading(true);

    try {
      const response = await fetch(widget.endpoint);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      const widgetData = widget.fields.map((field) => ({
        label: field.label || field.path,
        value: result ? getValueFromPath(result, field.path) : null,
      }));
      setData(widgetData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [widget.endpoint, widget.fields]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, widget.refreshInterval * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "number") return value.toLocaleString();
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return String(value);
  };

  return (
    <div className="w-full max-w-full overflow-hidden">
      {/* Action buttons - responsive positioning */}
      <div className="flex items-center justify-end gap-2 sm:gap-4 mb-3 sm:mb-4">
        <RefreshCcw
          size={18}
          className={cn(
            "cursor-pointer touch-manipulation min-w-[44px] min-h-[44px] p-3 rounded-full hover:bg-muted/50 transition-colors sm:min-w-auto sm:min-h-auto sm:p-0",
            `${loading ? "animate-spin" : ""}`
          )}
          onClick={fetchData}
        />
        <Trash2
          className="cursor-pointer touch-manipulation min-w-[44px] min-h-[44px] p-3 rounded-full hover:bg-muted/50 transition-colors sm:min-w-auto sm:min-h-auto sm:p-0"
          size={18}
          onClick={() => {
            removeWidget(widget.id);
          }}
        />
      </div>

      {/* Loading state */}
      {loading && !error && !data && (
        <div className="flex items-center justify-center py-8 sm:py-12">
          <ScaleLoader className="h-12 w-12 sm:h-16 sm:w-16" color="#00fa19" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <AlertCircle
            size={16}
            className="text-red-500 flex-shrink-0 mt-0.5"
          />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-red-700 dark:text-red-400 break-words">
              Error fetching data
            </div>
            <div className="text-xs text-red-600 dark:text-red-300 mt-1 break-words">
              {error}
            </div>
          </div>
        </div>
      )}

      {/* Data display */}
      {data && (
        <div className="space-y-2 sm:space-y-4">
          {data.length > 0 ? (
            data.map((item, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 gap-2 sm:gap-4 bg-muted/50 rounded-lg"
              >
                <div className="text-sm text-foreground font-medium sm:font-normal break-words min-w-0 flex-shrink-0">
                  {item.label}
                </div>
                <div className="text-sm text-primary break-all sm:truncate sm:max-w-[60%] ml-4 sm:ml-0">
                  {formatValue(item.value)}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 sm:py-12 text-muted-foreground">
              <div className="text-sm">No fields configured</div>
              <div className="text-xs mt-1">Add fields to display data</div>
            </div>
          )}
        </div>
      )}

      {/* No data state */}
      {!loading && !error && !data && (
        <div className="text-center py-8 sm:py-12 text-muted-foreground">
          <div className="text-sm">No Data Available!</div>
        </div>
      )}
    </div>
  );
};

export default CardWidget;
