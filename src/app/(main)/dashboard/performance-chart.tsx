'use client';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import type { Competition } from '@/lib/types';
import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { ChartConfig } from '@/components/ui/chart';

type PerformanceChartProps = {
  competitions: Competition[];
};

function parseTimeToSeconds(time: string): number {
  const parts = time.replace('s', '').split(':');
  let seconds = 0;
  if (parts.length === 2) {
    seconds = parseInt(parts[0], 10) * 60 + parseFloat(parts[1]);
  } else {
    seconds = parseFloat(parts[0]);
  }
  return seconds;
}

export function PerformanceChart({ competitions }: PerformanceChartProps) {
  const { chartData, events } = useMemo(() => {
    const dataByDate: Record<
      string,
      Record<string, number | string>
    > = {};
    const eventSet = new Set<string>();

    competitions.forEach((comp) => {
      const date = new Date(comp.date).toLocaleDateString('en-CA');
      if (!dataByDate[date]) {
        dataByDate[date] = { date };
      }
      const timeInSeconds = parseTimeToSeconds(comp.time);
      dataByDate[date][comp.event] = timeInSeconds;
      eventSet.add(comp.event);
    });

    const sortedData = Object.values(dataByDate).sort((a, b) => {
        return new Date(a.date as string).getTime() - new Date(b.date as string).getTime();
    });

    return { chartData: sortedData, events: Array.from(eventSet) };
  }, [competitions]);

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {};
    events.forEach((event, index) => {
      config[event] = {
        label: event,
        color: `hsl(var(--chart-${(index % 5) + 1}))`,
      };
    });
    return config;
  }, [events]);

  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <LineChart
        data={chartData}
        margin={{
          top: 5,
          right: 20,
          left: 10,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        />
        <YAxis
          tickFormatter={(value) => `${value}s`}
          axisLine={false}
          tickLine={false}
          tickMargin={8}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <ChartLegend content={<ChartLegendContent />} />
        {events.map((event, index) => (
          <Line
            key={event}
            dataKey={event}
            type="monotone"
            stroke={`hsl(var(--chart-${(index % 5) + 1}))`}
            strokeWidth={2}
            dot={{
              fill: `hsl(var(--chart-${(index % 5) + 1}))`,
            }}
            activeDot={{
              r: 6,
            }}
            connectNulls
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
}
