import type { ReactNode } from "react"

import { TrendingUpIcon, UsersIcon, MapIcon } from "lucide-react"

import { fetchTrips } from "@/lib/db"
import { CalendarView } from "@/components/custom/CalendarView"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function CalendarPage() {
  const trips = await fetchTrips()
  const totalDays = trips.reduce((sum, trip) => sum + trip.itinerary.length, 0)
  const totalParticipants = trips.reduce((sum, trip) => sum + trip.participants.length, 0)

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs uppercase tracking-wide">
          行程日历
        </Badge>
        <h1 className="text-3xl font-semibold">所有行程一览无遗</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          使用 react-day-picker 打造的多视图行程日历，根据日、周、月、年四种视角切换，配合弹出的详情面板快速查看活动、票务与负责人信息。
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={<UsersIcon className="h-6 w-6 text-primary" />}
          title="参与成员"
          value={`${totalParticipants} 位`}
          description="已邀请的行程协作伙伴总数"
        />
        <StatCard
          icon={<MapIcon className="h-6 w-6 text-primary" />}
          title="行程天数"
          value={`${totalDays} 天`}
          description="所有行程覆盖的总日数"
        />
        <StatCard
          icon={<TrendingUpIcon className="h-6 w-6 text-primary" />}
          title="当前行程"
          value={`${trips.length} 个`}
          description="包含正在规划与进行中的行程"
        />
      </div>

      <CalendarView trips={trips} />
    </div>
  )
}

type StatCardProps = {
  icon: ReactNode
  title: string
  value: string
  description: string
}

function StatCard({ icon, title, value, description }: StatCardProps) {
  return (
    <Card className="border-border/60">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
