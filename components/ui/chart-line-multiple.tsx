"use client";

import { useState, useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  LineProps,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
];

interface ChartLineMultipleProps {
  chartData: Record<string, any>[];
  title?: string;
  xAxisKey?: string;
  excludeKeys?: string[];
  lineProps?: Partial<LineProps>;
}

export function ChartLineMultiple({
  chartData,
  title = "Line Chart",
  xAxisKey,
  excludeKeys = [],
  lineProps = {},
}: ChartLineMultipleProps) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState(0);

  const { chartConfig, dataKeys, detectedXAxisKey, visibleData } =
    useMemo(() => {
      if (!chartData || chartData.length === 0) {
        return {
          chartConfig: {},
          dataKeys: [],
          detectedXAxisKey: "",
          visibleData: [],
        };
      }

      const firstItem = chartData[0];
      const allKeys = Object.keys(firstItem);

      const xKey =
        xAxisKey ||
        allKeys.find(
          (key) =>
            typeof firstItem[key] === "string" ||
            key.toLowerCase().includes("date") ||
            key.toLowerCase().includes("month") ||
            key.toLowerCase().includes("time") ||
            key.toLowerCase().includes("category") ||
            key.toLowerCase().includes("name")
        ) ||
        allKeys[0];

      const yKeys = allKeys.filter(
        (key) =>
          key !== xKey &&
          !excludeKeys.includes(key) &&
          typeof firstItem[key] === "number"
      );

      const config: ChartConfig = {};
      yKeys.forEach((key, index) => {
        config[key] = {
          label:
            key.charAt(0).toUpperCase() +
            key.slice(1).replace(/([A-Z])/g, " $1"),
          color: CHART_COLORS[index % CHART_COLORS.length],
        };
      });

      // Zoom logic
      const sliceSize = Math.max(Math.floor(chartData.length / zoom), 5);
      const start = Math.min(offset, Math.max(chartData.length - sliceSize, 0));
      const visibleData = chartData.slice(start, start + sliceSize);

      return {
        chartConfig: config,
        dataKeys: yKeys,
        detectedXAxisKey: xKey,
        visibleData,
      };
    }, [chartData, xAxisKey, excludeKeys, zoom, offset]);

  const renderLines = () =>
    dataKeys.map((key, index) => {
      const { ref, ...restLineProps } = lineProps;
      return (
        <Line
          key={key}
          dataKey={key}
          type="monotone"
          stroke={CHART_COLORS[index % CHART_COLORS.length]}
          strokeWidth={2}
          dot={false}
          {...restLineProps}
        />
      );
    });

  if (!chartData || chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <ZoomIn
          className="cursor-pointer"
          onClick={() => {
            if (zoom * 2 > 5) return;
            setZoom(zoom * 2);
          }}
        />
        <ZoomOut
          className="cursor-pointer"
          onClick={() => {
            if (zoom / 2 < 1) return;
            setZoom(zoom / 2);
          }}
        />
        <ChevronLeft
          className="cursor-pointer"
          onClick={() => {
            setOffset((prev) => Math.max(prev - 5, 0));
          }}
        />
        <ChevronRight
          className="cursor-pointer"
          onClick={() => {
            setOffset((prev) =>
              Math.min(prev + 5, Math.max(chartData.length - 10, 0))
            );
          }}
        />
        <RotateCcw
          className="cursor-pointer"
          onClick={() => {
            setZoom(1);
            setOffset(0);
          }}
        />
      </div>
      <ChartContainer config={chartConfig}>
        <LineChart
          accessibilityLayer
          data={visibleData}
        >
          <CartesianGrid />
          <XAxis dataKey={detectedXAxisKey} tickMargin={8} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          {renderLines()}
        </LineChart>
      </ChartContainer>
    </div>
  );
}
