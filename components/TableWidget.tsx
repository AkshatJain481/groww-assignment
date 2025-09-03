import { useEffect, useState, useCallback } from "react";
import { WidgetProp } from "@/store/useWidgetsStore";
import { AlertCircle, RefreshCcw, Trash2 } from "lucide-react";
import { ScaleLoader } from "react-spinners";
import { cn } from "@/lib/utils";
import useWidgetsStore from "@/store/useWidgetsStore";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ✅ Utility: walk through nested object by path
function getNested(obj: any, path: string[]): any {
  let current = obj;
  for (const key of path) {
    if (!current || typeof current !== "object") return null;
    current = current[key];
  }
  return current;
}

// ✅ Group fields by their base array path
function groupFieldsByArray(fields: WidgetProp["fields"]) {
  const grouped: Record<string, { label: string; keyPath: string[] }[]> = {};

  fields.forEach((f) => {
    const parts = f.path.split(" -> ").map((p) => p.trim());
    const basePath = parts.slice(0, -1).join(" -> ");
    const key = parts[parts.length - 1];

    if (!grouped[basePath]) grouped[basePath] = [];
    grouped[basePath].push({ label: f.label || "", keyPath: [key] });
  });

  return grouped;
}

const TableWidget = ({ widget }: { widget: WidgetProp }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tableStructures, setTableStructures] = useState<
    Record<
      string,
      {
        arrayData: any[];
        columns: { label: string; key: string }[];
      }
    >
  >({});
  const { removeWidget } = useWidgetsStore();

  // ✅ Fetch data
  const fetchData = useCallback(async () => {
    if (!widget.endpoint) return;
    setLoading(true);

    try {
      const response = await fetch(
        widget.endpoint,
        widget.headers && Object.keys(widget.headers).length
          ? { headers: widget.headers }
          : {}
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      setData(result);
      setError(null);

      const grouped = groupFieldsByArray(widget.fields);
      const newStructures: typeof tableStructures = {};

      Object.entries(grouped).forEach(([basePath, fields]) => {
        const parts = basePath.split(" -> ").map((p) => p.trim());
        const arrayData = getNested(result, parts);

        if (Array.isArray(arrayData)) {
          newStructures[basePath] = {
            arrayData,
            columns: fields.map((f) => ({
              label: f.label,
              key: f.keyPath[0],
            })),
          };
        }
      });

      setTableStructures(newStructures);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      setData(null);
      setTableStructures({});
    } finally {
      setLoading(false);
    }
  }, [widget.endpoint, widget.fields, widget.headers]);

  // ✅ Refresh interval
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, widget.refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [fetchData, widget.refreshInterval]);

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "number") return value.toLocaleString();
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* Controls - Touch Friendly */}
      <div className="flex items-center justify-end gap-2 sm:gap-4">
        <RefreshCcw
          size={18}
          className={cn(
            "cursor-pointer touch-manipulation min-w-[44px] min-h-[44px] p-3 rounded-full hover:bg-muted/50 transition-colors sm:min-w-auto sm:min-h-auto sm:p-0 hover:text-primary",
            loading ? "animate-spin" : ""
          )}
          onClick={fetchData}
        />
        <Trash2
          className="cursor-pointer touch-manipulation min-w-[44px] min-h-[44px] p-3 rounded-full hover:bg-muted/50 transition-colors sm:min-w-auto sm:min-h-auto sm:p-0 hover:text-destructive"
          size={18}
          onClick={() => removeWidget(widget.id)}
        />
      </div>

      {/* Loading State */}
      {loading && !error && !data && (
        <div className="flex items-center justify-center py-8 sm:py-12">
          <ScaleLoader className="h-12 w-12 sm:h-16 sm:w-16" color="#00fa19" />
        </div>
      )}

      {/* Error State */}
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

      {/* Tables with Horizontal Scroll */}
      {data && Object.keys(tableStructures).length > 0 && (
        <div className="space-y-4 sm:space-y-6">
          {Object.entries(tableStructures).map(([basePath, structure]) => (
            <div key={basePath} className="space-y-2 sm:space-y-3">
              {/* Table Title */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1">
                <h3 className="text-base sm:text-lg font-semibold text-foreground break-words">
                  {basePath || "Data Table"}
                </h3>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {structure.arrayData.length} items
                </span>
              </div>

              {/* Scrollable Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    {structure.columns.map((col) => (
                      <TableHead
                        key={col.key}
                        className="font-semibold whitespace-nowrap min-w-[120px] text-xs sm:text-sm"
                      >
                        {col.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {structure.arrayData.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {structure.columns.map((col) => (
                        <TableCell
                          key={col.key}
                          className="py-2 px-3 text-xs sm:text-sm min-w-[120px]"
                        >
                          <div
                            className="break-words max-w-[200px] sm:max-w-none"
                            title={formatValue(row[col.key])}
                          >
                            {formatValue(row[col.key])}
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Empty state */}
              {structure.arrayData.length === 0 && (
                <div className="text-center py-6 sm:py-8 text-muted-foreground border rounded-lg">
                  <div className="text-sm">No data in {basePath}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* No fields configured */}
      {data && Object.keys(tableStructures).length === 0 && (
        <div className="text-center py-8 sm:py-12 text-muted-foreground">
          <div className="text-sm">No table fields configured</div>
          <div className="text-xs mt-1">Add array fields to display tables</div>
        </div>
      )}

      {/* No data available */}
      {!loading && !error && !data && (
        <div className="text-center py-8 sm:py-12 text-muted-foreground">
          <div className="text-sm">No Data Available!</div>
        </div>
      )}
    </div>
  );
};

export default TableWidget;
