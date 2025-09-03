"use client";

import { useEffect, useState, useCallback } from "react";
import { WidgetProp } from "@/store/useWidgetsStore";
import { AlertCircle, RefreshCcw, Trash2 } from "lucide-react";
import { ScaleLoader } from "react-spinners";
import { cn } from "@/lib/utils";
import useWidgetsStore from "@/store/useWidgetsStore";
import { ChartBarMultiple } from "./ui/chart-bar-multiple";
import { ChartLineMultiple } from "./ui/chart-line-multiple";

// ✅ Walk through nested object by path
function getNested(obj: any, path: string[]): any {
  let current = obj;
  for (const key of path) {
    if (!current || typeof current !== "object") return null;
    current = current[key];
  }
  return current;
}

const ChartWidget = ({ widget }: { widget: WidgetProp }) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { removeWidget } = useWidgetsStore();

  // ✅ Fetch + transform data
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
      if (!response.ok)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const result = await response.json();
      setError(null);

      // ✅ Separate x-axis and y-axis fields
      const xField = widget.fields.find(
        (f) => f.label?.toLowerCase() === "x-axis"
      );
      const yFields = widget.fields.filter(
        (f) => f.label?.toLowerCase() !== "x-axis"
      );

      if (!xField || yFields.length === 0) {
        throw new Error(
          "You must configure 1 x-axis and at least 1 y-axis field"
        );
      }

      // ✅ Get array data from API
      const parts = xField.path.split(" -> ").map((p) => p.trim());
      const basePath = parts.slice(0, -1);
      const arrayData = getNested(result, basePath);

      if (!Array.isArray(arrayData))
        throw new Error("Expected array in response");

      const xKey = parts[parts.length - 1];

      // ✅ Build chart data
      const transformed = arrayData.map((row: any) => {
        const point: Record<string, any> = {};
        point[xField.label || xKey] = row[xKey];

        yFields.forEach((f) => {
          const yKey = f.path.split(" -> ").pop()!;
          point[yKey] = Number(row[yKey]) || 0;
        });

        return point;
      });

      setChartData(transformed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      setChartData([]);
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

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-end gap-4">
        <RefreshCcw
          size={20}
          className={cn(
            "cursor-pointer hover:text-primary transition-colors",
            loading ? "animate-spin" : ""
          )}
          onClick={fetchData}
        />
        <Trash2
          className="cursor-pointer hover:text-destructive transition-colors"
          size={20}
          onClick={() => removeWidget(widget.id)}
        />
      </div>

      {/* Loading */}
      {loading && !error && chartData.length === 0 && (
        <div className="flex items-center justify-center py-8">
          <ScaleLoader className="h-16 w-16" color="#00fa19" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <AlertCircle size={16} className="text-red-500" />
          <div className="text-sm text-red-600 dark:text-red-300">{error}</div>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 && (
        <>
          {widget.chartType == "bar" ? (
            <ChartBarMultiple chartData={chartData} />
          ) : (
            <ChartLineMultiple chartData={chartData} />
          )}
        </>
      )}

      {/* Empty state */}
      {!loading && !error && chartData.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No Data Available
        </div>
      )}
    </div>
  );
};

export default ChartWidget;
