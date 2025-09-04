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

  const normalizeArrayData = (data: any): any[] => {
    if (Array.isArray(data)) return data;
    if (
      data &&
      typeof data === "object" &&
      Object.values(data).every((v) => typeof v === "object" && v !== null)
    ) {
      return Object.entries(data).map(([key, value]) => ({
        _key: key,
        ...(value as object),
      }));
    }
    return [];
  };

  const fetchData = useCallback(async () => {
    if (!widget.endpoint) return;
    setLoading(true);

    try {
      const response = await fetch(widget.endpoint, {
        headers:
          widget.headers && Object.keys(widget.headers).length
            ? widget.headers
            : undefined,
      });

      if (!response.ok)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);

      const result = await response.json();
      setError(null);

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

      const parts = xField.path.split(" -> ").map((p) => p.trim());
      const arrayData =
        parts.length === 1
          ? result[parts[0]]
          : getNested(result, parts.slice(0, -1));

      const normalized = normalizeArrayData(arrayData);
      if (!Array.isArray(normalized) || normalized.length === 0) {
        throw new Error("Expected array or array-like object in response");
      }

      // Transform into chart-ready data
      const transformed = normalized.map((row) => {
        const point: Record<string, any> = {};

        // Handle x-axis
        point[xField.label || "x-axis"] =
          "_key" in row ? row._key : row[parts[parts.length - 1]];

        // Handle y-axis
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
  }, [fetchData, widget.refreshInterval, widget]);

  return (
    <div className="space-y-6">
      <ActionButtons
        widget={widget}
        onRefresh={fetchData}
        onRemove={() => removeWidget(widget.id)}
        loading={loading}
      />

      {loading && !error && chartData.length === 0 && <LoadingSpinner />}
      {error && <ErrorMessage error={error} />}
      {chartData.length > 0 &&
        (widget.chartType === "bar" ? (
          <ChartBarMultiple chartData={chartData} />
        ) : (
          <ChartLineMultiple chartData={chartData} />
        ))}
      {!loading && !error && chartData.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No Data Available
        </div>
      )}
    </div>
  );
};

export default ChartWidget;
