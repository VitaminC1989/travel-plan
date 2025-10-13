import { notFound } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { CalendarIcon, MapPinIcon } from "lucide-react"

import { fetchTripById } from "@/lib/db"
import { formatCurrency } from "@/lib/currency"
import { TripForm } from "@/components/custom/TripForm"
import { BudgetChart } from "@/components/custom/BudgetChart"
import { ShareDialog } from "@/components/trips/share-dialog"
import { ExpenseDrawer } from "@/components/trips/expense-drawer"
import { ActivityComments } from "@/components/trips/activity-comments"
import { ChecklistBoard } from "@/components/trips/checklist-board"
import { CurrencyConverter } from "@/components/trips/currency-converter"
import { ItineraryMap } from "@/components/trips/itinerary-map"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type TripDetailPageProps = {
  params: { tripId: string }
}

export default async function TripDetailPage({ params }: TripDetailPageProps) {
  const trip = await fetchTripById(params.tripId)

  if (!trip) {
    notFound()
  }

  const totalExpenses = trip.expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const dateRange = `${format(new Date(trip.startDate), "yyyy.MM.dd")} - ${format(new Date(trip.endDate), "yyyy.MM.dd")}`

  return (
    <div className="space-y-10">
      <section className="space-y-6 rounded-3xl border border-border/60 bg-card/60 p-8 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs uppercase tracking-wide">
              行程详情
            </Badge>
            <h1 className="text-3xl font-semibold">{trip.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <MapPinIcon className="h-4 w-4" />
                {trip.destination}
              </span>
              <span className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                {dateRange}
              </span>
              <Badge variant="outline">{trip.itinerary.length} 天行程</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {trip.participants.map((participant) => (
                <div key={participant.userId} className="flex items-center gap-2 rounded-full border border-border/40 px-3 py-1 text-xs">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={participant.avatarUrl} alt={participant.name ?? participant.userId} />
                    <AvatarFallback>{participant.name?.slice(0, 2).toUpperCase() ?? participant.userId.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span>{participant.name ?? participant.email ?? participant.userId}</span>
                  <Badge variant="secondary" className="rounded-full text-[10px]">
                    {roleLabel(participant.role)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <ShareDialog shareLinks={trip.shareLinks ?? []} tripId={trip.id} />
            <ExpenseDrawer currency={trip.budget.currency} />
            <TripForm
              trip={trip}
              trigger={
                <Button variant="default">编辑行程</Button>
              }
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard title="预算总额" value={formatCurrency(trip.budget.total, trip.budget.currency)} description="包含交通、住宿、餐饮等分类预算" />
          <MetricCard title="已记录开销" value={formatCurrency(totalExpenses, trip.budget.currency)} description={`目前共 ${trip.expenses.length} 笔`} />
          <MetricCard title="收藏地点" value={`${trip.favoritePlaces?.length ?? 0} 个`} description="提前标记的兴趣点" />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <BudgetChart trip={trip} />
        <ItineraryMap itinerary={trip.itinerary} />
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">每日行程安排</h2>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/calendar?focus=${trip.id}`}>在日历中查看</Link>
          </Button>
        </div>
        <Accordion type="multiple" className="space-y-4">
          {trip.itinerary.map((day) => (
            <AccordionItem key={day.day} value={`day-${day.day}`} className="border border-border/60 rounded-xl bg-card/60">
              <AccordionTrigger className="px-6 py-4 text-left">
                <div className="flex flex-col gap-1 text-left">
                  <span className="text-sm text-muted-foreground">第 {day.day} 天 · {format(new Date(day.date), "MM 月 dd 日")}</span>
                  <span className="text-lg font-semibold">{day.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 px-6 pb-6">
                {day.notes ? <p className="text-sm text-muted-foreground">{day.notes}</p> : null}
                <div className="space-y-4">
                  {day.activities.map((activity) => (
                    <Card key={activity.id} className="border-border/60">
                      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <CardTitle className="text-lg">{activity.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{activity.details}</p>
                        </div>
                        <Badge variant={activity.type === "ticket" ? "secondary" : "outline"}>
                          {typeLabel(activity.type)}
                        </Badge>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          {activity.startTime ? <span>开始 {activity.startTime}</span> : null}
                          {activity.endTime ? <span>结束 {activity.endTime}</span> : null}
                          {activity.assigneeId ? <span>负责人 {activity.assigneeId}</span> : null}
                          {activity.budgetEstimate ? <span>预算 ≈ {activity.budgetEstimate}</span> : null}
                        </div>
                        <ActivityComments activity={activity} />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">开销明细</h2>
        <Card className="border-border/60">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>日期</TableHead>
                  <TableHead>分类</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead className="text-right">金额</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trip.expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{format(new Date(expense.date), "MM-dd")}</TableCell>
                    <TableCell>{mapCategory(expense.category)}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell className="text-right">{formatCurrency(expense.amount, expense.currency ?? trip.budget.currency)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <ChecklistBoard checklist={trip.checklists} />

      <CurrencyConverter />
    </div>
  )
}

type MetricCardProps = {
  title: string
  value: string
  description: string
}

function MetricCard({ title, value, description }: MetricCardProps) {
  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">{value}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function mapCategory(category: string) {
  switch (category) {
    case "transport":
      return "交通"
    case "accommodation":
      return "住宿"
    case "food":
      return "餐饮"
    case "activities":
      return "活动"
    case "shopping":
      return "购物"
    default:
      return "其他"
  }
}

function typeLabel(type: string) {
  if (type === "ticket") return "票务"
  if (type === "task") return "任务"
  return "活动"
}

function roleLabel(role: string) {
  if (role === "owner") return "所有者"
  if (role === "editor") return "编辑"
  return "访客"
}
