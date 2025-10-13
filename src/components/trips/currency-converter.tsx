"use client"

import { useMemo, useState } from "react"

import { convertCurrency, formatCurrency } from "@/lib/currency"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const currencies = ["USD", "EUR", "CNY", "JPY", "GBP", "HKD", "SGD", "AUD"]

export function CurrencyConverter() {
  const [amount, setAmount] = useState(1000)
  const [from, setFrom] = useState("USD")
  const [to, setTo] = useState("CNY")

  const result = useMemo(() => convertCurrency(amount, from, to), [amount, from, to])

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base">汇率换算工具</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">金额</label>
          <Input
            type="number"
            min={0}
            value={amount}
            onChange={(event) => setAmount(Number(event.target.value))}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">原币种</label>
          <Select value={from} onValueChange={setFrom}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((currency) => (
                <SelectItem key={currency} value={currency}>
                  {currency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">目标币种</label>
          <Select value={to} onValueChange={setTo}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((currency) => (
                <SelectItem key={currency} value={currency}>
                  {currency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-3 rounded-lg bg-muted/40 p-4 text-sm">
          {formatCurrency(amount, from)} ≈ {formatCurrency(result, to)}
        </div>
      </CardContent>
    </Card>
  )
}
