"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Format: { [key: string]: { label: string, color?: string, icon?: React.ComponentType } }
export type ChartConfig = {
    [key: string]: {
        label: React.ReactNode
        icon?: React.ComponentType
        color?: string
    }
}

type ChartContextProps = {
    config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
    const context = React.useContext(ChartContext)
    if (!context) {
        throw new Error("useChart must be used within a ChartContainer")
    }
    return context
}

function ChartContainer({
    id,
    className,
    config,
    children,
    ...props
}: React.ComponentProps<"div"> & {
    config: ChartConfig
    children: React.ReactNode
}) {
    const chartId = React.useId()
    const idToUse = id || `chart-${chartId.replace(/:/g, "")}`

    return (
        <ChartContext.Provider value={{ config }}>
            <div
                data-slot="chart-container"
                data-chart={idToUse}
                className={cn(
                    "flex aspect-video justify-center text-xs [&_.recharts-cartesian-grid-horizontal_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-cartesian-grid-vertical_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-area]:fill-opacity-80 [&_.recharts-grid-line]:stroke-border/50 [&_.recharts-label]:fill-foreground [&_.recharts-sector.recharts-pie-sector]:stroke-background [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none [&_.recharts-tooltip-cursor]:fill-border/20 [&_.recharts-reference-line-line]:stroke-border [&_.recharts-reference-line-label]:fill-muted-foreground [&_.recharts-active-dot]:stroke-background [&_.recharts-dot]:stroke-border",
                    className
                )}
                {...props}
            >
                <ChartStyle id={idToUse} config={config} />
                <RechartsPrimitive.ResponsiveContainer>
                    {children}
                </RechartsPrimitive.ResponsiveContainer>
            </div>
        </ChartContext.Provider>
    )
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
    const colorConfig = Object.entries(config).filter(
        ([_, config]) => config.color
    )

    if (colorConfig.length === 0) {
        return null
    }

    return (
        <style
            dangerouslySetInnerHTML={{
                __html: Object.entries(config)
                    .map(([key, config]) => {
                        const color = config.color
                        return color
                            ? `[data-chart=${id}] { --color-${key}: ${color}; }`
                            : null
                    })
                    .join("\n"),
            }}
        />
    )
}

const ChartTooltip = RechartsPrimitive.Tooltip

function ChartTooltipContent({
    active,
    payload,
    className,
    indicator = "dot",
    hideLabel = false,
    hideIndicator = false,
    label,
    labelFormatter,
    labelClassName,
    formatter,
    color,
    nameKey,
    labelKey,
}: {
    active?: boolean
    payload?: readonly any[]
    className?: string
    indicator?: "line" | "dot" | "dashed"
    hideLabel?: boolean
    hideIndicator?: boolean
    label?: any
    labelFormatter?: (value: any, payload: any) => React.ReactNode
    labelClassName?: string
    formatter?: any
    color?: string
    nameKey?: string
    labelKey?: string
}) {
    const { config } = useChart()

    const tooltipLabel = React.useMemo(() => {
        if (hideLabel || !payload?.length) {
            return null
        }

        const [item] = payload
        const key = `${labelKey || item.dataKey || item.name || "value"}`
        const itemConfig = getChartConfig(config, key)
        const value =
            !labelKey && typeof label === "string"
                ? config[label as keyof typeof config]?.label || label
                : itemConfig?.label || label

        if (labelFormatter) {
            return (
                <div className={cn("font-medium", labelClassName)}>
                    {labelFormatter(value, payload)}
                </div>
            )
        }

        if (!value) {
            return null
        }

        return <div className={cn("font-medium", labelClassName)}>{value}</div>
    }, [
        label,
        labelFormatter,
        payload,
        hideLabel,
        labelClassName,
        config,
        labelKey,
    ])

    if (!active || !payload?.length) {
        return null
    }

    const nestLabel = payload.length === 1 && indicator !== "dot"

    return (
        <div
            className={cn(
                "grid min-w-32 items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl backdrop-blur-md",
                className
            )}
        >
            {!nestLabel ? tooltipLabel : null}
            <div className="grid gap-1.5">
                {payload.map((item, index) => {
                    const key = `${nameKey || item.dataKey || item.name || "value"}`
                    const itemConfig = getChartConfig(config, key)
                    const indicatorColor = color || item.payload.fill || item.color

                    return (
                        <div
                            key={item.dataKey}
                            className={cn(
                                "flex w-full items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                                indicator === "dot" && "items-center"
                            )}
                        >
                            {itemConfig?.icon ? (
                                <itemConfig.icon />
                            ) : (
                                !hideIndicator && (
                                    <div
                                        className={cn(
                                            "shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]",
                                            {
                                                "h-2.5 w-2.5": indicator === "dot",
                                                "w-1": indicator === "line",
                                                "w-0 border-l-2 border-dashed bg-transparent":
                                                    indicator === "dashed",
                                                "my-0.5": nestLabel && indicator === "dashed",
                                            }
                                        )}
                                        style={
                                            {
                                                "--color-bg": indicatorColor,
                                                "--color-border": indicatorColor,
                                            } as React.CSSProperties
                                        }
                                    />
                                )
                            )}
                            <div
                                className={cn(
                                    "flex flex-1 justify-between leading-none",
                                    nestLabel ? "items-end" : "items-center"
                                )}
                            >
                                <div className="grid gap-1.5">
                                    {nestLabel ? tooltipLabel : null}
                                    <span className="text-muted-foreground">
                                        {itemConfig?.label || item.name}
                                    </span>
                                </div>
                                {item.value && (
                                    <span className="font-mono font-medium tabular-nums text-foreground">
                                        {item.value.toLocaleString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

const ChartLegend = RechartsPrimitive.Legend

function ChartLegendContent({
    className,
    hideIcon = false,
    payload,
    verticalAlign,
    nameKey,
}: {
    className?: string
    hideIcon?: boolean
    payload?: readonly any[]
    verticalAlign?: "top" | "bottom" | string
    nameKey?: string
}) {
    const { config } = useChart()

    if (!payload?.length) {
        return null
    }

    return (
        <div
            className={cn(
                "flex items-center justify-center gap-4",
                verticalAlign === "top" ? "pb-3" : "pt-3",
                className
            )}
        >
            {payload?.map((item) => {
                const key = `${nameKey || item.dataKey || item.name || "value"}`
                const itemConfig = getChartConfig(config, key)

                return (
                    <div
                        key={item.value}
                        className={cn(
                            "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
                        )}
                    >
                        {itemConfig?.icon && !hideIcon ? (
                            <itemConfig.icon />
                        ) : (
                            <div
                                className="h-2 w-2 shrink-0 rounded-[2px]"
                                style={{
                                    backgroundColor: item.color,
                                }}
                            />
                        )}
                        {itemConfig?.label}
                    </div>
                )
            })}
        </div>
    )
}

// Helper to extract item config from a chart config.
function getChartConfig(config: ChartConfig, key: string) {
    if (typeof key !== "string") {
        return undefined
    }

    const role = "role" in config ? config.role : undefined
    const configKey = role && key in config ? key : key

    if (configKey in config) {
        return config[configKey]
    }

    return undefined
}

export {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
    ChartStyle,
}
