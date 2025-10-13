import { fetchTrips } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TripForm } from "@/components/custom/TripForm"

export default async function TemplatesPage() {
  const trips = await fetchTrips()
  const templates = trips.flatMap((trip) => trip.templates?.map((template) => ({ template, trip })) ?? [])

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs uppercase tracking-wide">
          行程模板库
        </Badge>
        <h1 className="text-3xl font-semibold">快速复用高分行程</h1>
        <p className="text-sm text-muted-foreground">
          从社区精选模板中寻找灵感，一键复制后可在 TripForm 中继续调整日期、预算与活动安排。
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map(({ template, trip }) => (
          <Card key={`${trip.id}-${template}`} className="border-border/60">
            <CardHeader>
              <CardTitle className="text-lg">{template}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>关联行程：{trip.name}</p>
              <p>目的地：{trip.destination}</p>
              <TripForm
                trip={trip}
                trigger={<Button variant="outline" size="sm">基于此模板创建</Button>}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
