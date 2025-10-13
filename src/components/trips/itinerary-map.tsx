"use client"

import { useState } from "react"

import type { DailyItinerary } from "@/data/schema"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapDisplay } from "@/components/custom/MapDisplay"

type ItineraryMapProps = {
  itinerary: DailyItinerary[]
}

export function ItineraryMap({ itinerary }: ItineraryMapProps) {
  const [activeDay, setActiveDay] = useState(String(itinerary[0]?.day ?? 1))

  return (
    <Tabs value={activeDay} onValueChange={setActiveDay} className="space-y-4">
      <TabsList className="flex w-full flex-wrap">
        {itinerary.map((day) => (
          <TabsTrigger key={day.day} value={String(day.day)} className="flex-1">
            第 {day.day} 天
          </TabsTrigger>
        ))}
      </TabsList>
      {itinerary.map((day) => (
        <TabsContent key={day.day} value={String(day.day)}>
          <MapDisplay activities={day.activities} />
        </TabsContent>
      ))}
    </Tabs>
  )
}
