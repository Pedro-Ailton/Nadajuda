"use client"

import * as React from "react"
import { MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const ChartStyleContext = React.createContext<{
  id: string
  config: ChartConfig
} | null>(null)

function useChart() {
  const context = React.useContext(ChartStyleContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartStyle />")
  }

  return context
}

type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | {
        color?: string
        theme?: never
      }
    | {
        color?: never
        theme: {
          light: string
          dark: string
        }
      }
  )
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps>({
  config: {},
})

const ChartProvider: React.FC<
  ChartContextProps & { children: React.ReactNode }
> = ({ config, children }) => {
  return (
    <ChartContext.Provider value={{ config }}>{children}</ChartContext.Provider>
  )
}

const ChartStyle = ({
  id,
  config,
  children,
}: {
  id: string
  config: ChartConfig
  children: React.ReactNode
}) => {
  return (
    <ChartStyleContext.Provider value={{ id, config }}>
      {children}
    </ChartStyleContext.Provider>
  )
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig
    children: React.ReactNode
  }
>(({ id, className, children, config, ...props }, ref) => {
  const chartId = `chart-${id}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center gap-4 text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/50 [&_.recharts-surface]:overflow-visible",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        {children}
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "Chart"

const ChartLegendContext = React.createContext<{
  getLabel?: (key: string) => React.ReactNode
} | null>(null)

const ChartLegend = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  const { config } = React.useContext(ChartContext)

  const getLabel = React.useCallback(
    (key: string) => {
      return config[key]?.label
    },
    [config]
  )

  return (
    <ChartLegendContext.Provider value={{ getLabel }}>
      <div
        ref={ref}
        className={cn("flex items-center justify-end gap-4", className)}
        {...props}
      />
    </ChartLegendContext.Provider>
  )
})
ChartLegend.displayName = "ChartLegend"

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    // TODO: This should be render prop
    payload?: any[]
    nameKey?: string
  }
>(({ className, payload, nameKey = "name", ...props }, ref) => {
  const { getLabel } = React.useContext(ChartLegendContext) ?? {}

  if (!payload?.length) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-1.5 whitespace-nowrap",
        className
      )}
      {...props}
    >
      {payload.map((item) => {
        const key = `${nameKey ? item.payload[nameKey] : item.value}`
        const label = getLabel?.(key) ?? key

        return (
          <div
            key={item.value}
            className="flex items-center gap-1.5 [&>svg]:size-3.5 [&>svg]:text-muted-foreground"
          >
            {item.payload.icon ? (
              <item.payload.icon />
            ) : (
              <div
                className="size-2 shrink-0 rounded-[2px]"
                style={{
                  backgroundColor: item.color,
                }}
              />
            )}
            {label}
          </div>
        )
      })}
    </div>
  )
})
ChartLegendContent.displayName = "ChartLegendContent"

const ChartTooltipContext = React.createContext<{
  showIndicator?: boolean
  labelKey?: string
  nameKey?: string
  unit?: string
  getLabel?: (key: string) => React.ReactNode
} | null>(null)

const ChartTooltip = ({
  showIndicator = true,
  ...props
}: React.ComponentProps<"div"> & {
  showIndicator?: boolean
  labelKey?: string
  nameKey?: string
  unit?: string
}) => {
  return (
    <ChartTooltipContext.Provider value={{ showIndicator, ...props }}>
      <div {...props} />
    </ChartTooltipContext.Provider>
  )
}
ChartTooltip.displayName = "ChartTooltip"

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: "line" | "dot"
    label?: string
    payload?: any[]
    labelFormatter?: (value: any, payload: any) => React.ReactNode
    valueFormatter?: (value: any) => React.ReactNode
  }
>(
  (
    {
      className,
      hideLabel,
      label,
      payload,
      indicator = "dot",
      labelFormatter,
      valueFormatter,
      hideIndicator,
      ...props
    },
    ref
  ) => {
    const {
      getLabel,
      showIndicator,
      labelKey,
      nameKey = "name",
      unit,
    } = React.useContext(ChartTooltipContext) ?? {}

    const renderLabel = React.useCallback(() => {
      if (hideLabel || !payload?.length) {
        return null
      }

      if (label) {
        return label
      }

      const item = payload[0]
      const value = item.payload[labelKey ?? item.dataKey]

      if (labelFormatter) {
        return labelFormatter(value, payload)
      }

      return value
    }, [label, payload, hideLabel, labelKey, labelFormatter])

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-32 items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className
        )}
        {...props}
      >
        {!hideLabel && (
          <div className="font-medium text-muted-foreground">
            {renderLabel()}
          </div>
        )}
        <div className="grid gap-1.5">
          {payload?.map((item, i) => {
            const key = `${nameKey ? item.payload[nameKey] : item.name}`
            const itemLabel = getLabel?.(key) ?? item.name
            const indicatorColor = item.color

            return (
              <div
                key={item.dataKey}
                className="flex w-full items-stretch gap-2 [&>svg]:size-2.5 [&>svg]:text-muted-foreground"
              >
                {!hideIndicator && showIndicator && (
                  <div
                    className={cn(
                      "shrink-0",
                      indicator === "line" && "h-2.5 w-px self-stretch",
                      indicator === "dot" &&
                        "mt-1 size-2.5 rounded-full self-start"
                    )}
                    style={{
                      backgroundColor: indicatorColor,
                    }}
                  />
                )}
                <div className="flex flex-1 justify-between leading-none">
                  <div className="grid gap-1.5">
                    <span className="text-muted-foreground">{itemLabel}</span>
                    {/* {item.payload.extra ? (
                    <span className="text-muted-foreground/70">
                      {item.payload.extra}
                    </span>
                  ) : null} */}
                  </div>
                  {item.value ? (
                    <span className="font-medium text-foreground">
                      {valueFormatter
                        ? valueFormatter(item.value)
                        : `${item.value}${unit ?? ""}`}
                    </span>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartDrawerContext = React.createContext<{
  config?: ChartConfig
  activeChart?: string
  setActiveChart: (chart: string | undefined) => void
} | null>(null)

function useChartDrawer() {
  const context = React.useContext(ChartDrawerContext)

  if (!context) {
    throw new Error("useChartDrawer must be used within a <ChartDrawer />")
  }

  return context
}

const ChartDrawer = ({
  config,
  children,
  ...props
}: {
  config: ChartConfig
  children: React.ReactNode
}) => {
  const [activeChart, setActiveChart] = React.useState<string | undefined>(
    Object.keys(config)[0]
  )
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <ChartDrawerContext.Provider
      value={{ config, activeChart, setActiveChart }}
    >
      {/* <Drawer.Root open={isOpen} onOpenChange={setIsOpen}>
        {children}
        <Drawer.Overlay />
        <Drawer.Portal>
          <Drawer.Content className="grid gap-4 p-4">
            <ChartDrawerContent />
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root> */}
    </ChartDrawerContext.Provider>
  )
}
ChartDrawer.displayName = "ChartDrawer"

const ChartDrawerTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ ...props }, ref) => {
  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className="size-8"
      {...props}
    >
      <MoreHorizontal className="size-4" />
    </Button>
  )
})
ChartDrawerTrigger.displayName = "ChartDrawerTrigger"

const ChartDrawerContent = ({ ...props }: React.ComponentProps<"div">) => {
  const { config, activeChart, setActiveChart } = useChartDrawer()

  return (
    <div className="grid gap-4" {...props}>
      <div className="grid gap-1">
        <div className="text-lg font-medium leading-none">
          {config[activeChart!]?.label}
        </div>
        {/* <div className="text-sm text-muted-foreground">
          {config[activeChart!].description}
        </div> */}
      </div>
      <div className="grid gap-2">
        {Object.entries(config).map(([key, D]) => {
          return (
            <Button
              key={key}
              variant={activeChart === key ? "secondary" : "ghost"}
              className="justify-start"
              onClick={() => setActiveChart(key)}
            >
              <div className="mr-2.5">
                {D.icon ? (
                  <D.icon className="size-4" />
                ) : (
                  <div className="size-4" />
                )}
              </div>
              <div className="flex-1 text-left">{D.label}</div>
              <div
                className="size-2.5 rounded-full"
                style={{
                  backgroundColor: `var(--color-${key})`,
                }}
              />
            </Button>
          )
        })}
      </div>
    </div>
  )
}

export {
  ChartContainer,
  ChartProvider,
  ChartStyle,
  useChart,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartDrawer,
  ChartDrawerTrigger,
  ChartDrawerContent,
  type ChartConfig,
}
