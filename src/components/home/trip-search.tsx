"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { SearchIcon } from "lucide-react"

import type { Trip } from "@/data/schema"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

type TripSearchProps = {
  trips: Trip[]
}

export function TripSearch({ trips }: TripSearchProps) {
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const [isFocused, setIsFocused] = React.useState(false)

  const results = React.useMemo(() => {
    if (!query) return trips.slice(0, 5)
    return trips
      .filter((trip) =>
        [trip.name, trip.destination]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase())
      )
      .slice(0, 6)
  }, [trips, query])

  return (
    <div className="relative max-w-2xl">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索目的地或行程主题"
            className="pl-10"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 150)}
          />
        </div>
        <Button variant="secondary">探索灵感</Button>
      </div>

      {isFocused && results.length > 0 ? (
        <Card className="absolute left-0 right-0 top-14 z-20 border-border/60">
          <CardContent className="p-0">
            <ScrollArea className="max-h-64">
              <div className="divide-y">
                {results.map((trip) => (
                  <button
                    key={trip.id}
                    type="button"
                    className="block w-full px-4 py-3 text-left text-sm hover:bg-muted"
                    onClick={() => router.push(`/trips/${trip.id}`)}
                  >
                    <p className="font-medium text-foreground">{trip.name}</p>
                    <p className="text-xs text-muted-foreground">{trip.destination}</p>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
