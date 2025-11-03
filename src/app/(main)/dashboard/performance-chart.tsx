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

/**
 * Generates a consistent, unique color for a given string (e.g., event name).
 * @param str The string to hash into a color.
 * @returns An HSL color string.
 */
const generateColorFromString = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  // Using a fixed saturation and lightness for good visibility in both light/dark themes
  return `hsl(${hue}, 90%, 45%)`;
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
                       {entry.value.toFixed(2)}s
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
          {eventNames.map((eventName) => (
            <Line
              key={eventName}
              type="monotone"
              dataKey={eventName}
              stroke={generateColorFromString(eventName)}
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
