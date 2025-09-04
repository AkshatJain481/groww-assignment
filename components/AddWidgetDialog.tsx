"use client";

import { useState, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChartColumnBig,
  ChartLine,
  Grid3x3,
  RefreshCcw,
  Table,
  X,
} from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "./ui/switch";
import ApiDataTable from "./ApiDataTable";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import useDebounce from "@/hooks/useDebounce";
import useWidgetsStore, { WidgetProp } from "@/store/useWidgetsStore";
import { v4 as uuidv4 } from "uuid";

type SelectedField = { path: string; value: unknown; label?: string };

type SelectedFieldCardProps = {
  field: SelectedField;
  index: number;
  widgetType: "card" | "table" | "chart";
  onRemove: (path: string) => void;
  onUpdate: (index: number, label: string) => void;
};

const SelectedFieldCard = memo(
  ({
    field,
    index,
    widgetType,
    onRemove,
    onUpdate,
  }: SelectedFieldCardProps) => {
    return (
      <Card className="dark:bg-slate-700 gap-2">
        <CardHeader>
          <CardTitle>{field.path}</CardTitle>
          <CardDescription>
            {typeof field.value} : "{String(field.value)}"
          </CardDescription>
          <CardAction>
            <Button
              size="icon"
              variant="destructive"
              onClick={() => onRemove(field.path)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {widgetType !== "chart" ? (
            <Input
              placeholder="label for this value..."
              value={field.label || ""}
              onChange={(e) => onUpdate(index, e.target.value)}
            />
          ) : (
            <Select
              value={field.label}
              onValueChange={(value) => onUpdate(index, value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="select axis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="x-axis">X-Axis</SelectItem>
                <SelectItem value="y-axis">Y-Axis</SelectItem>
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>
    );
  }
);

const HeaderConfig = memo(
  ({
    isOpen,
    headerKey,
    headerValue,
    onToggle,
    onKeyChange,
    onValueChange,
  }: {
    isOpen: boolean;
    headerKey: string;
    headerValue: string;
    onToggle: (v: boolean) => void;
    onKeyChange: (v: string) => void;
    onValueChange: (v: string) => void;
  }) => (
    <>
      <Label htmlFor="header-key">Header config for API key</Label>
      <Switch
        id="header-key"
        checked={isOpen}
        onCheckedChange={onToggle}
        className="cursor-pointer"
      />
      <div
        className={cn(
          "flex items-center justify-between gap-4",
          !isOpen && "hidden"
        )}
      >
        <Input
          type="text"
          value={headerKey}
          placeholder="header key (for ex:- X-Api-Key)"
          onChange={(e) => onKeyChange(e.target.value)}
        />
        <Input
          type="text"
          value={headerValue}
          placeholder="header value (for ex:- your-api-key-xyz)"
          onChange={(e) => onValueChange(e.target.value)}
        />
      </div>
    </>
  )
);

const AddWidgetDialog = memo(
  ({
    children,
    widgetData,
  }: {
    children: React.ReactNode;
    widgetData?: WidgetProp;
  }) => {
    const [open, setOpen] = useState<boolean>(false);
    const [widgetName, setWidgetName] = useState<string>("");
    const [endpoint, setEndpoint] = useState<string>("");
    const [refreshInterval, setRefreshInterval] = useState<number | "">(30);
    const [widgetType, setWidgetType] = useState<"card" | "table" | "chart">(
      "card"
    );
    const [isHeadersOpen, setIsHeadersOpen] = useState<boolean>(false);
    const [headerKey, setHeaderKey] = useState<string>("");
    const [headerValue, setHeaderValue] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [apiData, setApiData] = useState<any>(null);
    const [selectedFields, setSelectedFields] = useState<SelectedField[]>([]);
    const [searchField, setSearchField] = useState<string>("");
    const [chartType, setChartType] = useState<"line" | "bar">("line");

    const debouncedSearch = useDebounce(searchField, 800);
    const { addWidget, updateWidget } = useWidgetsStore();

    const handleTest = useCallback(async () => {
      try {
        setLoading(true);
        const headers: Record<string, string> = {};
        if (headerKey && headerValue && isHeadersOpen) {
          headers[headerKey] = headerValue;
        }
        const res = await fetch(
          endpoint,
          Object.keys(headers).length ? { headers } : {}
        );
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const json = await res.json();
        setApiData(json);
        toast.success("API connected successfully!");
      } catch (e) {
        console.error("API error", e);
        toast.error("Some error occurred connecting API!");
        setApiData(null);
      } finally {
        setLoading(false);
      }
    }, [endpoint, headerKey, headerValue, isHeadersOpen]);

    const handleAddField = useCallback((path: string, value: unknown) => {
      setSelectedFields((prev) =>
        prev.some((f) => f.path === path) ? prev : [...prev, { path, value }]
      );
    }, []);

    const handleRemoveField = useCallback((path: string) => {
      setSelectedFields((prev) => prev.filter((f) => f.path !== path));
    }, []);

    const handleUpdateFieldLabel = useCallback(
      (index: number, label: string) => {
        setSelectedFields((prev) => {
          const newFields = [...prev];
          newFields[index] = { ...newFields[index], label };
          return newFields;
        });
      },
      []
    );

    const handleWidgetType = useCallback(
      (widget: "card" | "chart" | "table") => {
        setWidgetType(widget);
        setSelectedFields([]);
      },
      []
    );

    const hasXYLabels = (arr: { label?: string }[]) => {
      const xCount = arr.filter((item) => item.label === "x-axis").length;
      const yCount = arr.filter((item) => item.label === "y-axis").length;
      return xCount === 1 && yCount >= 1;
    };

    const hasValidLabels = (arr: SelectedField[]) =>
      arr.every((item) => item.label?.trim());

    const widgetValidation = () => {
      if (!widgetName) return toast.warning("Widget Name is mandatory!");
      if (!endpoint) return toast.warning("API URL is mandatory!");
      if (selectedFields.length === 0)
        return toast.warning("Please select some fields!");
      if (!hasValidLabels(selectedFields))
        return toast.warning("Please fill all labels!");
      if (widgetType === "chart" && !hasXYLabels(selectedFields))
        return toast.warning("Please select 1 x-axis and >=1 y-axis!");
      if (!refreshInterval || typeof refreshInterval !== "number")
        return toast.warning("Refresh interval is mandatory!");
      if (refreshInterval < 1 && refreshInterval > 3600)
        return toast.warning("Refresh interval should be in range 1 to 3600!");
      const headers: Record<string, string> = {};
      if (headerKey && headerValue && isHeadersOpen) {
        headers[headerKey] = headerValue;
      }

      const newWidget: WidgetProp = {
        id: widgetData?.id || uuidv4(),
        widgetName,
        endpoint,
        refreshInterval,
        widgetType,
        fields: selectedFields,
        headers,
        chartType,
      };
      if (widgetData) {
        updateWidget(widgetData.id, newWidget);
      } else {
        addWidget(newWidget);
      }
      resetForm();
      toast.success("Widget Saved successfully!");
    };

    const resetForm = () => {
      setWidgetName("");
      setSearchField("");
      setApiData(null);
      setEndpoint("");
      setSelectedFields([]);
      setRefreshInterval(30);
      setWidgetType("card");
      setHeaderKey("");
      setHeaderValue("");
      setOpen(false);
    };

    return (
      <Dialog
        open={open}
        onOpenChange={(val) => {
          setOpen(val);
          if (val && widgetData) {
            setWidgetName(widgetData?.widgetName);
            setEndpoint(widgetData?.endpoint);
            setRefreshInterval(widgetData?.refreshInterval);
            setWidgetType(widgetData?.widgetType);
            setSelectedFields(widgetData?.fields);
            setHeaderKey(Object.keys(widgetData?.headers || {})[0] || "");
            setHeaderValue(Object.values(widgetData?.headers || {})[0] || "");
            setChartType(widgetData?.chartType || "line");
            if (
              Object.keys(widgetData?.headers || {})[0] &&
              Object.values(widgetData?.headers || {})[0]
            ) {
              setIsHeadersOpen(true);
            }
          } else if (!val) {
            resetForm();
          }
        }}
      >
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="md:max-w-2xl lg:max-w-5xl dark:bg-slate-800 h-[80vh] sm:h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {widgetData ? "Edit Widget" : "Add New Widget"}
            </DialogTitle>
          </DialogHeader>

          <Label>Widget Name</Label>
          <Input
            value={widgetName}
            onChange={(e) => setWidgetName(e.target.value)}
            placeholder="Bitcoin"
          />

          <Label htmlFor="api-endpoint">API Endpoint</Label>
          <div className="flex gap-2">
            <Input
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="https://api.example.com/data"
              id="api-endpoint"
            />
            <Button disabled={loading} size="sm" onClick={handleTest}>
              <RefreshCcw
                className={cn("cursor-pointer", loading && "animate-spin")}
              />
              Connect
            </Button>
          </div>

          <HeaderConfig
            isOpen={isHeadersOpen}
            headerKey={headerKey}
            headerValue={headerValue}
            onToggle={setIsHeadersOpen}
            onKeyChange={setHeaderKey}
            onValueChange={setHeaderValue}
          />

          <Label>Refresh Interval (1–3600s)</Label>
          <Input
            type="text"
            value={refreshInterval === 0 ? "" : refreshInterval.toString()}
            onChange={(e) => {
              const val = e.target.value;
              if (/^\d*$/.test(val)) {
                setRefreshInterval(val === "" ? "" : Number(val));
              }
            }}
          />

          <Label>Display Mode</Label>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={widgetType === "card" ? "default" : "outline"}
              onClick={() => handleWidgetType("card")}
            >
              <Grid3x3 /> Card
            </Button>
            <Button
              size="sm"
              variant={widgetType === "table" ? "default" : "outline"}
              onClick={() => handleWidgetType("table")}
            >
              <Table /> Table
            </Button>
            <Button
              size="sm"
              variant={widgetType === "chart" ? "default" : "outline"}
              onClick={() => handleWidgetType("chart")}
            >
              <ChartColumnBig /> Chart
            </Button>
          </div>

          {widgetType === "chart" && (
            <>
              <Label>Chart Type</Label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={chartType === "line" ? "default" : "outline"}
                  onClick={() => setChartType("line")}
                >
                  <ChartLine /> Line Chart
                </Button>
                <Button
                  size="sm"
                  variant={chartType === "bar" ? "default" : "outline"}
                  onClick={() => setChartType("bar")}
                >
                  <Table /> Bar Chart
                </Button>
              </div>
            </>
          )}

          <Label>Search Fields</Label>
          <Input
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
            placeholder="search fields..."
            type="search"
          />

          <Label>Available Fields</Label>
          <ApiDataTable
            type={widgetType}
            filterFields={debouncedSearch}
            apiData={apiData}
            handleAddField={handleAddField}
          />

          {selectedFields.length > 0 && (
            <>
              <Label>Selected Fields</Label>
              {selectedFields.map((f, i) => (
                <SelectedFieldCard
                  key={f.path}
                  field={f}
                  index={i}
                  widgetType={widgetType}
                  onRemove={handleRemoveField}
                  onUpdate={handleUpdateFieldLabel}
                />
              ))}
            </>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button onClick={widgetValidation}>
              {widgetData ? "Edit Widget" : "Add Widget"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

export default AddWidgetDialog;
