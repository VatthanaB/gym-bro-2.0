"use client"

import { useMemo } from "react"
import type { WeightEntry } from "@/lib/types"

interface ProgressChartProps {
  data: WeightEntry[]
  targetWeight: number
  height?: number
}

export function ProgressChart({
  data,
  targetWeight,
  height = 200,
}: ProgressChartProps) {
  const chartData = useMemo(() => {
    if (data.length === 0) return null

    const sortedData = [...data].sort((a, b) => a.date.localeCompare(b.date))
    const weights = sortedData.map((d) => d.weight)
    const minWeight = Math.min(...weights, targetWeight) - 5
    const maxWeight = Math.max(...weights) + 5
    const range = maxWeight - minWeight

    return {
      points: sortedData.map((d, i) => ({
        x: (i / Math.max(sortedData.length - 1, 1)) * 100,
        y: ((maxWeight - d.weight) / range) * 100,
        weight: d.weight,
        date: d.date,
      })),
      targetY: ((maxWeight - targetWeight) / range) * 100,
      minWeight,
      maxWeight,
    }
  }, [data, targetWeight])

  if (!chartData || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl bg-secondary/50"
        style={{ height }}
      >
        <p className="text-sm text-muted-foreground">
          No weight data yet. Start logging to see your progress.
        </p>
      </div>
    )
  }

  // Create SVG path
  const pathD = chartData.points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ")

  // Create area path (for gradient fill)
  const areaD = `${pathD} L ${chartData.points[chartData.points.length - 1].x} 100 L 0 100 Z`

  return (
    <div className="rounded-2xl bg-secondary/30 p-4">
      {/* Weight labels */}
      <div className="mb-2 flex justify-between text-xs text-muted-foreground">
        <span>{chartData.maxWeight} kg</span>
        <span>Target: {targetWeight} kg</span>
      </div>

      {/* Chart */}
      <svg
        viewBox="0 0 100 100"
        className="w-full"
        style={{ height }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Target line */}
        <line
          x1="0"
          y1={chartData.targetY}
          x2="100"
          y2={chartData.targetY}
          stroke="hsl(var(--success))"
          strokeWidth="0.5"
          strokeDasharray="2,2"
        />

        {/* Area fill */}
        <path d={areaD} fill="url(#chartGradient)" />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points */}
        {chartData.points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="2"
            fill="hsl(var(--background))"
            stroke="hsl(var(--primary))"
            strokeWidth="1"
          />
        ))}
      </svg>

      {/* Min weight label */}
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>{chartData.minWeight} kg</span>
        <span>{data.length} entries</span>
      </div>
    </div>
  )
}

