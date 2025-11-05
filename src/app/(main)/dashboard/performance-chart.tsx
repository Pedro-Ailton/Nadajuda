'use client';

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { CompetitionTime } from '@/lib/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type ChartDataPoint = {
  date: string;
  [eventName: string]: number | string; // Allows for dynamic event names as keys
};

type PerformanceChartProps = {
  data: CompetitionTime[];
};

// A predefined palette of visually distinct HSL colors.
const DISTINCT_COLORS: string[] = [
    'hsl(210, 90%, 45%)', // Blue
    'hsl(160, 90%, 35%)', // Green-Cyan
    'hsl(350, 90%, 55%)', // Red
    'hsl(45, 100%, 45%)', // Yellow-Orange
    'hsl(280, 80%, 55%)', // Purple
    'hsl(20, 100%, 50%)', // Orange
    'hsl(310, 80%, 50%)', // Magenta
    'hsl(180, 70%, 40%)', // Teal
];

/**
 * Gets a distinct color for an event based on its index.
 * @param index The index of the event name.
 * @returns An HSL color string.
 */
const getColorForEvent = (index: number): string => {
  return DISTINCT_COLORS[index % DISTINCT_COLORS.length];
};

/**
 * Formats total seconds into a mm:ss.SS or ss.SS string.
 * @param totalSeconds The time in seconds.
 * @returns A formatted time string.
 */
const formatChartTime = (totalSeconds: number): string => {
    if (isNaN(totalSeconds) || totalSeconds === null) return 'N/A';
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = (totalSeconds % 60).toFixed(2);
    if (minutes > 0) {
      return `${minutes}:${seconds.padStart(5, '0')}`;
    }
    return `${seconds}`;
};


export function PerformanceChart({ data }: PerformanceChartProps) {
  const { chartData, eventNames } = useMemo(() => {
    if (!data || data.length === 0) {
      return { chartData: [], eventNames: [] };
    }

    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const uniqueEventNames = [...new Set(sortedData.map(item => item.eventName))];

    const dataByDate: { [date: string]: { date: string, [key: string]: any } } = {};

    sortedData.forEach(item => {
      const formattedDate = format(new Date(item.date), 'dd/MM/yy', { locale: ptBR });
      if (!dataByDate[formattedDate]) {
        dataByDate[formattedDate] = { date: formattedDate };
      }
      dataByDate[formattedDate][item.eventName] = item.time;
    });

    return { chartData: Object.values(dataByDate), eventNames: uniqueEventNames };
  }, [data]);

  if (chartData.length === 0) {
    return (
      <div className="flex h-[350px] w-full items-center justify-center text-center text-muted-foreground">
        <p>Dados insuficientes para gerar o gráfico.<br/>Continue a registar os seus tempos!</p>
      </div>
    );
  }
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col space-y-1">
                <span className="text-[0.70rem] uppercase text-muted-foreground">
                    Data
                </span>
                <span className="font-bold text-muted-foreground">
                    {label}
                </span>
            </div>
            {payload.map((entry: any, index: number) => (
                <div key={`item-${index}`} className="flex flex-col space-y-1">
                    <span className="text-[0.70rem] uppercase text-muted-foreground" style={{ color: entry.color }}>
                        {entry.name}
                    </span>
                    <span className="font-bold" style={{ color: entry.color }}>
                       {formatChartTime(entry.value)}
                    </span>
                </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 20,
            left: -10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="date" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
           />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}s`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {eventNames.map((eventName, index) => (
            <Line
              key={eventName}
              type="monotone"
              dataKey={eventName}
              stroke={getColorForEvent(index)}
              strokeWidth={2}
              activeDot={{ r: 8 }}
              connectNulls // This will connect points across missing data points
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
