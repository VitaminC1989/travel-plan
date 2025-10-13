"use client"

import * as React from "react"
import {
  addMonths,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  isBefore,
  isSameDay,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns"
import { CalendarIcon, MapPinIcon } from "lucide-react"

import type { Trip } from "@/data/schema"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"

type CalendarViewProps = {
  trips: Trip[]
}

type CalendarViewMode = "day" | "week" | "month" | "year"

type CalendarEvent = {
  id: string
  tripId: string
  tripName: string
  destination: string
  date: Date
  title: string
  type: string
  assignee?: string | null
  notes?: string
  timeLabel?: string
}

export function CalendarView({ trips }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = React.useState(new Date())
  const [mode, setMode] = React.useState<CalendarViewMode>("month")
  const [activeEvent, setActiveEvent] = React.useState<CalendarEvent | null>(null)

  const events = React.useMemo(() => createEventsFromTrips(trips), [trips])

  const datesWithEvents = React.useMemo(() => {
    return events.reduce<Record<string, number>>((accumulator, event) => {
      const key = format(event.date, "yyyy-MM-dd")
      accumulator[key] = (accumulator[key] ?? 0) + 1
      return accumulator
    }, {})
  }, [events])

  const modifiers = React.useMemo(
    () => ({ withEvents: Object.keys(datesWithEvents).map((key) => parseISO(key)) }),
    [datesWithEvents]
  )

  const range = getRange(mode, selectedDate)
  const filteredEvents = events.filter((event) =>
    isWithinInterval(event.date, { start: range.start, end: range.end })
  )

  const upcomingTrips = trips
    .map((trip) => ({
      trip,
      start: parseISO(trip.startDate),
    }))
    .filter(({ start }) => !isBefore(start, new Date()))
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, 3)

  return (
    <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
      <Card className="self-start">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarIcon className="h-5 w-5" />
            行程总览
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="mx-auto rounded-xl border border-border/40 p-3"
            modifiers={modifiers}
            modifiersClassNames={{
              withEvents:
                "data-[range-middle=false]:border-primary data-[range-middle=false]:text-primary font-semibold bg-primary/10 text-primary",
            }}
            modifiersStyles={{
              withEvents: { boxShadow: "inset 0 0 0 1px hsl(var(--primary))" },
            }}
          />

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">即将开始的行程</h4>
            <div className="space-y-2">
              {upcomingTrips.length === 0 ? (
                <p className="text-sm text-muted-foreground">暂无新的行程安排。</p>
              ) : (
                upcomingTrips.map(({ trip, start }) => (
                  <Card key={trip.id} className="border-border/60">
                    <CardContent className="flex items-center justify-between p-3">
                      <div>
                        <p className="text-sm font-medium">{trip.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {trip.destination} · {format(start, "MM月dd日")}
                        </p>
                      </div>
                      <Badge variant="secondary">{trip.itinerary.length} 天</Badge>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-2 border-b border-border/60">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle>{formatRangeLabel(mode, range)}</CardTitle>
            <Tabs value={mode} onValueChange={(value) => setMode(value as CalendarViewMode)}>
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="day">日</TabsTrigger>
                <TabsTrigger value="week">周</TabsTrigger>
                <TabsTrigger value="month">月</TabsTrigger>
                <TabsTrigger value="year">年</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <p className="text-sm text-muted-foreground">
            点击某个活动即可快速查看详情或跳转到行程页进行编辑。
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={mode} className="w-full">
            <TabsContent value="day" className="p-6">
              <EventList
                events={filteredEvents.filter((event) => isSameDay(event.date, selectedDate))}
                onSelect={setActiveEvent}
              />
            </TabsContent>
            <TabsContent value="week" className="p-6">
              <EventList events={filteredEvents} onSelect={setActiveEvent} groupBy="date" />
            </TabsContent>
            <TabsContent value="month" className="p-6">
              <EventList events={filteredEvents} onSelect={setActiveEvent} />
            </TabsContent>
            <TabsContent value="year" className="p-6">
              <YearlyOverview trips={trips} onSelectDate={setSelectedDate} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Sheet open={!!activeEvent} onOpenChange={(open) => !open && setActiveEvent(null)}>
        <SheetContent side="right" className="sm:w-[420px]">
          {activeEvent ? (
            <EventDetails event={activeEvent} />
          ) : (
            <SheetHeader>
              <SheetTitle>活动详情</SheetTitle>
              <SheetDescription>选择日历中的具体活动以查看详情。</SheetDescription>
            </SheetHeader>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function createEventsFromTrips(trips: Trip[]): CalendarEvent[] {
  return trips.flatMap((trip) =>
    trip.itinerary.flatMap((day) => {
      const baseDate = parseISO(day.date)
      return day.activities.map((activity) => {
        let eventDate = baseDate
        let timeLabel: string | undefined

        if (activity.startTime) {
          const [hours, minutes] = activity.startTime.split(":")
          const withTime = new Date(baseDate)
          withTime.setHours(Number(hours) || 0, Number(minutes) || 0)
          eventDate = withTime
          timeLabel = `${activity.startTime}`
        }

        return {
        id: activity.id,
        tripId: trip.id,
        tripName: trip.name,
        destination: trip.destination,
          date: eventDate,
        title: activity.name,
        type: activity.type,
        assignee: activity.assigneeId,
        notes: activity.details,
          timeLabel,
        }
      }) as CalendarEvent[]
    })
  )
}

function getRange(mode: CalendarViewMode, date: Date) {
  switch (mode) {
    case "day":
      return { start: date, end: date }
    case "week":
      return { start: startOfWeek(date, { weekStartsOn: 1 }), end: endOfWeek(date, { weekStartsOn: 1 }) }
    case "year":
      return { start: startOfYear(date), end: endOfYear(date) }
    case "month":
    default:
      return { start: startOfMonth(date), end: endOfMonth(date) }
  }
}

function formatRangeLabel(mode: CalendarViewMode, range: { start: Date; end: Date }) {
  if (mode === "day") {
    return format(range.start, "yyyy 年 MM 月 dd 日")
  }

  if (mode === "week") {
    return `${format(range.start, "MM 月 dd 日")} - ${format(range.end, "MM 月 dd 日")}`
  }

  if (mode === "year") {
    return format(range.start, "yyyy 年")
  }

  return format(range.start, "yyyy 年 MM 月")
}

type EventListProps = {
  events: CalendarEvent[]
  onSelect: (event: CalendarEvent) => void
  groupBy?: "date"
}

function EventList({ events, onSelect, groupBy }: EventListProps) {
  if (events.length === 0) {
    return <p className="text-sm text-muted-foreground">此视图下暂无活动安排。</p>
  }

  const grouped = groupBy === "date" ? groupEventsByDate(events) : { all: events }

  return (
    <ScrollArea className="h-[420px] pr-4">
      <div className="space-y-6">
        {Object.entries(grouped).map(([key, group]) => (
          <div key={key} className="space-y-3">
            {groupBy === "date" ? (
              <h4 className="text-sm font-semibold">
                {format(parseISO(key), "MM 月 dd 日（EEE）")}
              </h4>
            ) : null}
            {group.map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() => onSelect(event)}
                className="w-full rounded-lg border border-border/60 p-4 text-left transition hover:border-primary"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.tripName} · {format(event.date, "MM 月 dd 日")}
                      {event.timeLabel ? ` ${event.timeLabel}` : " 全天"}
                    </p>
                  </div>
                  <Badge variant={event.type === "ticket" ? "secondary" : "outline"}>
                    {typeLabel(event.type)}
                  </Badge>
                </div>
                {event.notes ? (
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {event.notes}
                  </p>
                ) : null}
              </button>
            ))}
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

function groupEventsByDate(events: CalendarEvent[]) {
  return events.reduce<Record<string, CalendarEvent[]>>((accumulator, event) => {
    const key = format(event.date, "yyyy-MM-dd")
    accumulator[key] = accumulator[key] ?? []
    accumulator[key].push(event)
    return accumulator
  }, {})
}

function typeLabel(type: string) {
  if (type === "ticket") return "票务"
  if (type === "task") return "任务"
  return "活动"
}

type YearlyOverviewProps = {
  trips: Trip[]
  onSelectDate: (date: Date) => void
}

function YearlyOverview({ trips, onSelectDate }: YearlyOverviewProps) {
  const months = React.useMemo(() => {
    const start = startOfYear(new Date())
    return Array.from({ length: 12 }, (_, index) => addMonths(start, index))
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {months.map((month) => {
        const monthTrips = trips.filter((trip) => {
          const startDate = parseISO(trip.startDate)
          return startDate.getFullYear() === month.getFullYear() && startDate.getMonth() === month.getMonth()
        })

        return (
          <Card key={month.toISOString()} className="border-border/60">
            <CardContent className="space-y-2 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{format(month, "M 月")}</p>
                <Badge variant="outline">{monthTrips.length} 个</Badge>
              </div>
              <div className="space-y-2 text-sm">
                {monthTrips.length === 0 ? (
                  <p className="text-muted-foreground">暂无行程</p>
                ) : (
                  monthTrips.map((trip) => (
                    <button
                      key={trip.id}
                      type="button"
                      className="flex w-full flex-col rounded-md border border-border/40 p-2 text-left transition hover:border-primary"
                      onClick={() => onSelectDate(parseISO(trip.startDate))}
                    >
                      <span className="font-medium">{trip.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {trip.destination} · {format(parseISO(trip.startDate), "MM/dd")}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

type EventDetailsProps = {
  event: CalendarEvent
}

function EventDetails({ event }: EventDetailsProps) {
  const link = `/trips/${event.tripId}`

  return (
    <div className="flex h-full flex-col">
      <SheetHeader>
        <SheetTitle>{event.title}</SheetTitle>
        <SheetDescription>
          {format(event.date, "yyyy 年 MM 月 dd 日 HH:mm")}
        </SheetDescription>
      </SheetHeader>
      <div className="flex-1 space-y-4 py-6">
        <div>
          <p className="text-sm font-semibold">关联行程</p>
          <p className="text-sm text-muted-foreground">{event.tripName}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPinIcon className="h-4 w-4" />
          {event.destination}
        </div>
        {event.notes ? (
          <div>
            <p className="text-sm font-semibold">详细信息</p>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{event.notes}</p>
          </div>
        ) : null}
        {event.assignee ? (
          <p className="text-sm text-muted-foreground">负责人：{event.assignee}</p>
        ) : null}
      </div>
      <div className="flex gap-2">
        <Button asChild className="flex-1">
          <a href={link}>打开行程</a>
        </Button>
        <Button variant="outline" className="flex-1" asChild>
          <a href={`${link}?focus=${event.id}`}>查看详情</a>
        </Button>
      </div>
    </div>
  )
}
