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
import { ChartColumnBig, Grid3x3, RefreshCcw, Table, X } from "lucide-react";
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
import ApiDataTable from "./ApiDataTable";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import useDebounce from "@/hooks/useDebounce";
import useWidgetsStore, { WidgetProp } from "@/store/useWidgetsStore";

type SelectedField = { path: string; value: any; label?: string };

const AddWidgetDialog = memo(({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [widgetName, setWidgetName] = useState<string>("");
  const [endpoint, setEndpoint] = useState<string>("");
  const [refreshInterval, setRefreshInterval] = useState<number>(30);
  const [widgetType, setWidgetType] = useState<"card" | "table" | "chart">(
    "card"
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [apiData, setApiData] = useState<any>(null);
  const [selectedFields, setSelectedFields] = useState<SelectedField[]>([]);
  const [searchField, setSearchField] = useState<string>("");
  const debouncedSearch = useDebounce(searchField, 1500);
  const { addWidget } = useWidgetsStore();

  const handleTest = async () => {
    try {
      setLoading(true);
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      setApiData(json);
      toast.success("API connected successfully!");
    } catch (e) {
      console.error("API error", e);
      toast.error("Error connecting API!");
      setApiData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddField = useCallback(
    (path: string, value: any) => {
      setSelectedFields((prev) => {
        if (widgetType === "chart" && prev.length > 1) {
          toast.info(
            "Chart type only supports two values, one for x-axis and one for y-axis!"
          );
          return prev;
        }
        return prev.find((f) => f.path === path)
          ? prev
          : [...prev, { path, value }];
      });
    },
    [widgetType, toast]
  );

  const handleRemoveField = (path: string) => {
    setSelectedFields(selectedFields.filter((f) => f.path !== path));
  };

  const handleWidgetType = (widget: "card" | "chart" | "table") => {
    setWidgetType(widget);
    setSelectedFields([]);
  };

  const widgetValidation = () => {
    if (!widgetName) {
      toast.warning("Widget Name is mandatory!");
      return;
    } else if (!endpoint) {
      toast.warning("API URL is mandatory!");
      return;
    } else if (selectedFields?.length == 0) {
      toast.warning("Please select some fields so we can display them!");
      return;
    } else if (!hasValidLabels(selectedFields)) {
      toast.warning(
        "Please fill all labels for each field in selected fields!"
      );
      return;
    } else if (widgetType == "chart" && selectedFields.length != 2) {
      toast.warning("Please select 2 fields for chart widget!");
      return;
    } else if (widgetType == "chart" && !hasXYLabels(selectedFields)) {
      toast.warning(
        "Please select a unique axis for each field. Both fields should have there own axis!"
      );
      return;
    }
    const newWidget: WidgetProp = {
      id: new Date().toISOString(),
      widgetName,
      endpoint,
      refreshInterval,
      widgetType,
      fields: selectedFields,
    };
    addWidget(newWidget);
    resetForm();
    toast.success("Widget Saved successfully!");
  };

  const resetForm = () => {
    setWidgetName("");
    setSearchField("");
    setApiData("");
    setEndpoint("");
    setSelectedFields([]);
    setRefreshInterval(30);
    setWidgetType("card");
    setOpen(false);
  };

  const hasXYLabels = (arr: { label?: string }[]) =>
    arr.length === 2 &&
    arr.some((item) => item.label === "x-axis") &&
    arr.some((item) => item.label === "y-axis");

  const hasValidLabels = (arr: SelectedField[]) =>
    arr.every(
      (item) => typeof item.label === "string" && item.label.trim() !== ""
    );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="md:max-w-2xl lg:max-w-5xl dark:bg-slate-800 h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Add New Widget
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
              className={cn(
                "cursor-pointer",
                `${loading ? "animate-spin" : ""}`
              )}
            />
            Connect
          </Button>
        </div>

        <Label>
          Refresh Interval (seconds) (should be in the range 1 to 1800)
        </Label>
        <Input
          type="number"
          value={refreshInterval}
          onChange={(e) => {
            if (Number(e.target.value) > 0 && Number(e.target.value) <= 1800) {
              setRefreshInterval(Number(e.target.value));
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
            <Grid3x3 className="mr-1 h-4 w-4" /> Card
          </Button>
          <Button
            size="sm"
            variant={widgetType === "table" ? "default" : "outline"}
            onClick={() => handleWidgetType("table")}
          >
            <Table className="mr-1 h-4 w-4" /> Table
          </Button>
          <Button
            size="sm"
            variant={widgetType === "chart" ? "default" : "outline"}
            onClick={() => handleWidgetType("chart")}
          >
            <ChartColumnBig className="mr-1 h-4 w-4" /> Chart
          </Button>
        </div>

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
            {selectedFields.map((f, id) => (
              <Card key={f.path} className="dark:bg-slate-700 gap-2">
                <CardHeader>
                  <CardTitle>{f.path}</CardTitle>
                  <CardDescription>
                    {typeof f.value} : "{String(f.value)}"
                  </CardDescription>
                  <CardAction>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => handleRemoveField(f.path)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  {widgetType != "chart" ? (
                    <Input
                      placeholder="label for this value..."
                      value={selectedFields[id]?.label}
                      onChange={(e) => {
                        setSelectedFields((prev) => {
                          const newFields = prev;
                          newFields[id].label = e.target.value;
                          return newFields;
                        });
                      }}
                    />
                  ) : (
                    <Select
                      value={selectedFields[id]?.label}
                      onValueChange={(value) => {
                        if (
                          value === "y-axis" &&
                          typeof selectedFields[id].value !== "number"
                        ) {
                          toast.warning(
                            "This Field might not work for y-axis if it isn't a number, please try to use numeric data type"
                          );
                        }
                        setSelectedFields((prev) => {
                          const newFields = prev;
                          newFields[id].label = value;
                          return newFields;
                        });
                      }}
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
            ))}
          </>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button onClick={widgetValidation}>Add Widget</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});

export default AddWidgetDialog;
