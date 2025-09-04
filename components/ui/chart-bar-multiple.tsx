"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
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

interface ChartBarMultipleProps {
  chartData: Record<string, any>[];
  title?: string;
  xAxisKey?: string;
}

export function ChartBarMultiple({
  chartData,
  title = "Bar Chart",
  xAxisKey,
}: ChartBarMultipleProps) {
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

      const xKey = xAxisKey || allKeys[0];
      const dataKeys = allKeys.filter(
        (key) => key !== xKey && typeof firstItem[key] === "number"
      );

      const config: ChartConfig = {};
      dataKeys.forEach((key, index) => {
        config[key] = {
          label:
            key.charAt(0).toUpperCase() +
            key.slice(1).replace(/([A-Z])/g, " $1"),
          color: CHART_COLORS[index % CHART_COLORS.length],
        };
      });

      const sliceSize = Math.max(Math.floor(chartData.length / zoom), 5);
      const start = Math.min(offset, Math.max(chartData.length - sliceSize, 0));
      const visibleData = chartData.slice(start, start + sliceSize);

      return {
        chartConfig: config,
        dataKeys,
        detectedXAxisKey: xKey,
        visibleData,
      };
    }, [chartData, xAxisKey, zoom, offset]);

  const renderBars = () =>
    dataKeys.map((key, index) => (
      <Bar
        key={key}
        dataKey={key}
        fill={CHART_COLORS[index % CHART_COLORS.length]}
        radius={4}
      />
    ));

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
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <div className="flex gap-4">
          <ZoomIn
            className="cursor-pointer"
            onClick={() => {
              if (zoom * 2 > 5) {
                return;
              }
              setZoom(zoom * 2);
            }}
          />
          <ZoomOut
            className="cursor-pointer"
            onClick={() => {
              if (zoom / 2 < 1) {
                return;
              }
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
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={visibleData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={detectedXAxisKey}
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            {renderBars()}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
