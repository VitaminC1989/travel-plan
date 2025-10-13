"use client"

import { useMemo } from "react"
import {
  APIProvider,
  AdvancedMarker,
  Map,
} from "@vis.gl/react-google-maps"
import { MapPinIcon } from "lucide-react"

import type { Activity } from "@/data/schema"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

type MapDisplayProps = {
  activities: Activity[]
}

export function MapDisplay({ activities }: MapDisplayProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const markers = useMemo(
    () =>
      activities
        .filter((activity) => activity.location && typeof activity.location.lat === "number")
        .map((activity) => ({
          id: activity.id,
          position: {
            lat: activity.location!.lat,
            lng: activity.location!.lng,
          },
          title: activity.name,
          description: activity.details,
          type: activity.type,
        })),
    [activities]
  )

  const center = markers[0]?.position ?? { lat: 48.8566, lng: 2.3522 }

  if (!apiKey) {
    return (
      <Card className="border-dashed border-border/60">
        <CardHeader>
          <CardTitle>每日路线地图</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>未检测到地图服务 API Key。请在环境变量中配置 NEXT_PUBLIC_GOOGLE_MAPS_API_KEY。</p>
          <p>仍可在下方查看地点列表与活动详情。</p>
          <LocationList activities={activities} />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/60">
      <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <CardTitle className="text-lg font-semibold">每日路线地图</CardTitle>
          <p className="text-sm text-muted-foreground">
            可视化当天所有活动地点，并快速查看票务与任务标记。
          </p>
        </div>
        <Badge variant="outline">{markers.length} 个地点</Badge>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="h-80 overflow-hidden rounded-lg border border-border/60">
          <APIProvider apiKey={apiKey}>
            <Map
              defaultCenter={center}
              defaultZoom={12}
              gestureHandling="greedy"
              style={{ width: "100%", height: "100%" }}
              disableDefaultUI
            >
              {markers.map((marker) => (
                <AdvancedMarker key={marker.id} position={marker.position} title={marker.title}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                    <MapPinIcon className="h-4 w-4" />
                  </div>
                </AdvancedMarker>
              ))}
            </Map>
          </APIProvider>
        </div>

        <LocationList activities={activities} />
      </CardContent>
    </Card>
  )
}

function LocationList({ activities }: { activities: Activity[] }) {
  const list = activities.filter((activity) => activity.location)

  return (
    <ScrollArea className="h-80 rounded-lg border border-border/40">
      <div className="space-y-3 p-4">
        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground">暂无地点信息。</p>
        ) : (
          list.map((activity) => (
            <div key={activity.id} className="rounded-md border border-border/40 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{activity.location?.name ?? activity.name}</p>
                <Badge variant={activity.type === "ticket" ? "secondary" : "outline"}>
                  {activity.type === "ticket" ? "票务" : "活动"}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{activity.details}</p>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  )
}
