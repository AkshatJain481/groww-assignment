import { useEffect, useState, useCallback } from "react";
import { WidgetProp } from "@/store/useWidgetsStore";
import useWidgetsStore from "@/store/useWidgetsStore";

import ActionButtons from "@/components/common/ActionButtons";
import ErrorMessage from "@/components/common/ErrorMessage";
import LoadingSpinner from "@/components/common/LoadingSpinner";

import { ChartBarMultiple } from "./ui/chart-bar-multiple";
import { ChartLineMultiple } from "./ui/chart-line-multiple";
import { getNested } from "@/lib/utils";

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

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

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

      if (!Array.isArray(arrayData)) {
        throw new Error("Expected array in response");
      }

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
  }, [widget]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, widget.refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [fetchData, widget.refreshInterval , widget]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <ActionButtons
        widget={widget}
        onRefresh={fetchData}
        onRemove={() => removeWidget(widget.id)}
        loading={loading}
      />

      {/* Loading */}
      {loading && !error && chartData.length === 0 && <LoadingSpinner />}

      {/* Error */}
      {error && <ErrorMessage error={error} />}

      {/* Chart */}
      {chartData.length > 0 && (
        <>
          {widget.chartType === "bar" ? (
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
