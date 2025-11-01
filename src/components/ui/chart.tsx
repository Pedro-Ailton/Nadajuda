"use client"

import * as React from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  LabelList,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  Rectangle,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Sector,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  type AxisConfig,
  type ChartConfig,
  type ChartContainerProps,
  type ChartStyleConfig,
  type TooltipConfig,
} from "recharts/types/util/types"

import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"
import {
  type ChartConfig as ChartConfigPrimitive,
  ChartContainer as ChartContainerPrimitive,
  ChartLegend as ChartLegendPrimitive,
  ChartLegendContent as ChartLegendContentPrimitive,
  ChartStyle as ChartStylePrimitive,
  ChartTooltip as ChartTooltipPrimitive,
  ChartTooltipContent as ChartTooltipContentPrimitive,
} from "@/components/ui/drawer"

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  ChartContainerProps & {
    error?: React.ReactNode
    loading?: React.ReactNode
  }
>(({ error, loading, ...props }, ref) => {
  const name = ChartContainer.displayName
  const isError = !!error
  const isLoading = !!loading

  return (
    <ChartContainerPrimitive
      ref={ref}
      {...props}
      data-name={name}
      data-error={isError}
      data-loading={isLoading}
      className={cn(props.className, "relative")}
    >
      {props.children}
      {isError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/50 text-sm font-medium">
          {error}
        </div>
      )}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/50 text-sm font-medium">
          {loading}
        </div>
      )}
    </ChartContainerPrimitive>
  )
})
ChartContainer.displayName = "ChartContainer"

const ChartStyle = ({
  id,
  config,
}: {
  id: string
  config: ChartConfigPrimitive
}) => {
  const { resolvedTheme } = useTheme()
  const theme = resolvedTheme ?? "light"

  return (
    <ChartStylePrimitive id={id} config={config}>
      <style>{`
[data-chart=${id}] {
  --theme: ${theme};
}
`}</style>
    </ChartStylePrimitive>
  )
}

const ChartTooltip = ChartTooltipPrimitive
const ChartTooltipContent = ChartTooltipContentPrimitive
const ChartLegend = ChartLegendPrimitive
const ChartLegendContent = ChartLegendContentPrimitive

export {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
  Label,
  LabelList,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  Rectangle,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Sector,
  Tooltip,
  XAxis,
  YAxis,
  type AxisConfig,
  type ChartConfig,
  type ChartContainerProps,
  type ChartStyleConfig,
  type TooltipConfig,
}
