const fallbackRates: Record<string, number> = {
  USD: 1,
  EUR: 0.94,
  CNY: 7.12,
  JPY: 150.1,
  GBP: 0.84,
  AUD: 1.48,
  HKD: 7.81,
  SGD: 1.34,
}

const parseRates = (): Record<string, number> => {
  try {
    if (!process.env.NEXT_PUBLIC_EXCHANGE_RATES) {
      return fallbackRates
    }

    const parsed = JSON.parse(process.env.NEXT_PUBLIC_EXCHANGE_RATES)

    return {
      ...fallbackRates,
      ...parsed,
    }
  } catch (error) {
    console.warn("Failed to parse exchange rates", error)
    return fallbackRates
  }
}

const rates = parseRates()

export function convertCurrency(amount: number, from: string, to: string) {
  const baseFrom = rates[from] ?? fallbackRates[from] ?? 1
  const baseTo = rates[to] ?? fallbackRates[to] ?? 1

  return (amount / baseFrom) * baseTo
}

export function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}
