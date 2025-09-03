"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
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

// Define color palette for dynamic bars
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
  description?: string;
  xAxisKey?: string;
}

export function ChartBarMultiple({
  chartData,
  title = "Bar Chart",
  xAxisKey,
}: ChartBarMultipleProps) {
  // Generate dynamic chart configuration
  const { chartConfig, dataKeys, detectedXAxisKey } = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return { chartConfig: {}, dataKeys: [], detectedXAxisKey: "" };
    }

    const firstItem = chartData[0];
    const allKeys = Object.keys(firstItem);

    // Always respect provided xAxisKey, else auto-pick first
    const xKey = xAxisKey || allKeys[0];

    // Everything else is Y-axis (numeric only)
    const dataKeys = allKeys.filter(
      (key) => key !== xKey && typeof firstItem[key] === "number"
    );

    // Dynamic config
    const config: ChartConfig = {};
    dataKeys.forEach((key, index) => {
      config[key] = {
        label:
          key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1"),
        color: CHART_COLORS[index % CHART_COLORS.length],
      };
    });

    return { chartConfig: config, dataKeys, detectedXAxisKey: xKey };
  }, [chartData, xAxisKey]);

  // Generate dynamic Bar components
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
    <ChartContainer config={chartConfig}>
      <BarChart accessibilityLayer data={chartData}>
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
  );
}
