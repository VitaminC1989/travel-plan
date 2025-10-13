"use client"

import { useMemo } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { Trip } from "@/data/schema"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/currency"

const chartPalette = [
  "#2563eb",
  "#16a34a",
  "#f97316",
  "#a855f7",
  "#eab308",
  "#ec4899",
]

type BudgetChartProps = {
  trip: Trip
}

export function BudgetChart({ trip }: BudgetChartProps) {
  const categoryData = useMemo(() => {
    const entries = Object.entries(trip.budget.categories)
    return entries.map(([key, value]) => ({
      category: key,
      label: mapCategoryLabel(key),
      planned: value,
    }))
  }, [trip.budget.categories])

  const expenseData = useMemo(() => {
    const grouped = trip.expenses.reduce<Record<string, number>>((accumulator, expense) => {
      accumulator[expense.category] = (accumulator[expense.category] ?? 0) + expense.amount
      return accumulator
    }, {})

    return categoryData.map((item) => ({
      ...item,
      actual: grouped[item.category] ?? 0,
    }))
  }, [trip.expenses, categoryData])

  const totalSpent = expenseData.reduce((sum, item) => sum + item.actual, 0)
  const remaining = Math.max(trip.budget.total - totalSpent, 0)

  return (
    <Card className="border-border/60">
      <CardHeader className="flex items-center justify-between gap-4">
        <CardTitle className="text-lg font-semibold">预算与开销分析</CardTitle>
        <Badge variant="outline">
          已使用 {formatCurrency(totalSpent, trip.budget.currency)} / 总预算 {formatCurrency(trip.budget.total, trip.budget.currency)}
        </Badge>
      </CardHeader>
      <CardContent className="grid gap-8 lg:grid-cols-2">
        <div className="h-72">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={expenseData}
                dataKey="actual"
                nameKey="label"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
              >
                {expenseData.map((entry, index) => (
                  <Cell key={entry.category} fill={chartPalette[index % chartPalette.length]} />
                ))}
              </Pie>
              <RechartsTooltip
                formatter={(value: number, _name, entry) =>
                  `${formatCurrency(value, trip.budget.currency)} / 预算 ${formatCurrency(entry.payload.planned, trip.budget.currency)}`
                }
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span>剩余预算</span>
              <span className={remaining === 0 ? "text-destructive font-medium" : "font-medium"}>
                {formatCurrency(remaining, trip.budget.currency)}
              </span>
            </div>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={expenseData}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <RechartsTooltip formatter={(value: number) => formatCurrency(value, trip.budget.currency)} />
              <Legend />
              <Bar dataKey="planned" name="预算" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" name="实际" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

function mapCategoryLabel(key: string) {
  switch (key) {
    case "transport":
      return "交通"
    case "accommodation":
      return "住宿"
    case "food":
      return "餐饮"
    case "activities":
      return "活动"
    case "shopping":
      return "购物"
    default:
      return "其他"
  }
}
