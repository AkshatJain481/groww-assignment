import { useEffect, useState, useCallback, memo } from "react";
import LoadingSpinner from "./common/LoadingSpinner";
import ErrorMessage from "./common/ErrorMessage";

import { flattenJson } from "@/lib/utils";
import useWidgetsStore, { WidgetProp } from "@/store/useWidgetsStore";
import ActionButtons from "./common/ActionButtons";

function getValueFromPath(data: any, path: string): any {
  if (!data || !path) return null;
  const flattened = flattenJson(data);
  return flattened.find((item) => item.path === path)?.value ?? null;
}

function formatValue(value: any): string {
  if (value === null || value === undefined) return "N/A";
  if (typeof value === "number") return value.toLocaleString();
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

const DataList = ({ data }: { data: { label: string; value: any }[] }) => (
  <div className="space-y-3 sm:space-y-4">
    {data.length > 0 ? (
      data.map((item, index) => (
        <div
          key={index}
          className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 p-4 bg-muted/50 rounded-lg"
        >
          <span className="text-sm font-medium text-foreground break-words">
            {item.label}
          </span>
          <span className="text-sm text-primary break-all ml-4 sm:ml-0">
            {formatValue(item.value)}
          </span>
        </div>
      ))
    ) : (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm">No fields configured</p>
        <p className="text-xs mt-1">Add fields to display data</p>
      </div>
    )}
  </div>
);

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
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, widget.refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [fetchData, widget.refreshInterval]);

  return (
    <div className="w-full max-w-full overflow-hidden">
      <ActionButtons
        widget={widget}
        loading={loading}
        onRefresh={fetchData}
        onRemove={() => removeWidget(widget.id)}
      />

      {loading && !error && !data && <LoadingSpinner />}
      {error && <ErrorMessage error={error} />}
      {data && <DataList data={data} />}
      {!loading && !error && !data && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">No Data Available!</p>
        </div>
      )}
    </div>
  );
};

export default memo(CardWidget);
