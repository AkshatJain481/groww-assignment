"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { useMemo } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

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
}

export function ChartLineMultiple({
  chartData,
  title = "Line Chart",
  xAxisKey,
  excludeKeys = [],
}: ChartLineMultipleProps) {
  const { chartConfig, dataKeys, detectedXAxisKey } = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return { chartConfig: {}, dataKeys: [], detectedXAxisKey: "" };
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
          key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1"),
        color: CHART_COLORS[index % CHART_COLORS.length],
      };
    });

    return { chartConfig: config, dataKeys: yKeys, detectedXAxisKey: xKey };
  }, [chartData, xAxisKey, excludeKeys]);

  const renderLines = () =>
    dataKeys.map((key) => (
      <Line
        key={key}
        dataKey={key}
        type="monotone"
        stroke={`var(--color-${key})`}
        strokeWidth={2}
        dot={false}
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
    <ChartContainer config={chartConfig}>
      <LineChart
        accessibilityLayer
        data={chartData}
        margin={{ left: 40, right: 12 }}
      >
        <CartesianGrid />
        <XAxis dataKey={detectedXAxisKey} tickMargin={8} />
        <YAxis tickMargin={8} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        {renderLines()}
      </LineChart>
    </ChartContainer>
  );
}
