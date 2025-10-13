import { fetchTrips } from "@/lib/db"
import { TripCard } from "@/components/custom/TripCard"
import { TripForm } from "@/components/custom/TripForm"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default async function TripsPage() {
  const trips = await fetchTrips()

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs uppercase tracking-wide">
            我的行程
          </Badge>
          <h1 className="mt-2 text-3xl font-semibold">已规划的全部旅行</h1>
          <p className="text-sm text-muted-foreground">管理、编辑及复制你的行程模板，继续完善即将出发的旅行。</p>
        </div>
        <TripForm trigger={<Button>新建行程</Button>} />
      </header>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {trips.map((trip) => (
          <TripCard key={trip.id} trip={trip} />
        ))}
      </div>
    </div>
  )
}
