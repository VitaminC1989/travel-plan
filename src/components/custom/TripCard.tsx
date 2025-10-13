import Link from "next/link"
import { format } from "date-fns"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Trip } from "@/data/schema"
import { formatCurrency } from "@/lib/currency"

type TripCardProps = {
  trip: Trip
  footer?: React.ReactNode
}

const formatDateRange = (start: string, end: string) => {
  try {
    return `${format(new Date(start), "yyyy.MM.dd")} - ${format(new Date(end), "yyyy.MM.dd")}`
  } catch (error) {
    console.warn("Invalid date range", error)
    return `${start} - ${end}`
  }
}

export function TripCard({ trip, footer }: TripCardProps) {
  const { participants, budget } = trip
  const editors = participants.filter((participant) => participant.role !== "viewer")

  return (
    <Card className="h-full border-border/60">
      <CardHeader>
        <CardDescription className="text-xs uppercase tracking-wide text-muted-foreground">
          {formatDateRange(trip.startDate, trip.endDate)}
        </CardDescription>
        <CardTitle className="text-xl font-semibold">{trip.name}</CardTitle>
        <p className="text-sm text-muted-foreground">{trip.destination}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="secondary">预算</Badge>
          <span className="font-medium">{formatCurrency(budget.total, budget.currency)}</span>
          <span className="text-muted-foreground">/ 总预算</span>
        </div>

        <div className="flex items-center gap-3">
          {editors.slice(0, 3).map((participant) => (
            <Avatar key={participant.userId} className="h-8 w-8">
              <AvatarImage src={participant.avatarUrl} alt={participant.name ?? participant.userId} />
              <AvatarFallback>{participant.name?.slice(0, 2).toUpperCase() ?? "NA"}</AvatarFallback>
            </Avatar>
          ))}
          {editors.length > 3 ? (
            <Badge variant="outline" className="rounded-full px-2 text-xs text-muted-foreground">
              +{editors.length - 3}
            </Badge>
          ) : null}
        </div>

        <ul className="grid gap-2 text-sm text-muted-foreground">
          <li>活动日程：{trip.itinerary.length} 天</li>
          <li>费用记录：{trip.expenses.length} 笔</li>
          <li>参与成员：{participants.length} 人</li>
        </ul>
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-4">
        <Link
          href={`/trips/${trip.id}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          查看详情
        </Link>
        {footer}
      </CardFooter>
    </Card>
  )
}
