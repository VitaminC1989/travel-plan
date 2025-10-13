import Link from "next/link"
import { PlaneIcon, UsersIcon, ShieldCheckIcon, Wand2Icon } from "lucide-react"

import { fetchTrips } from "@/lib/db"
import { featuredTripIds } from "@/data/mock-data"
import { TripCard } from "@/components/custom/TripCard"
import { TripForm } from "@/components/custom/TripForm"
import { TripSearch } from "@/components/home/trip-search"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export default async function Home() {
  const trips = await fetchTrips()
  const featuredTrips = trips.filter((trip) => featuredTripIds.includes(trip.id)).slice(0, 3)

  return (
    <div className="space-y-16">
      <section className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div className="space-y-6">
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs uppercase tracking-wide">
            协同旅行规划平台
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            智能行程日历、预算追踪与地图路线，一站式打造理想旅程
          </h1>
          <p className="text-base text-muted-foreground sm:text-lg">
            Voyager 帮你从灵感收集到最终出发全程掌控，实时协同、自动汇总开销、同步各类票务与准备工作，让每次出行都井然有序。
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <TripForm
              trigger={
                <Button size="lg" className="w-full sm:w-auto">
                  立即创建新行程
                </Button>
              }
            />
            <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
              <Link href="/calendar">查看团队日历</Link>
            </Button>
          </div>
          <TripSearch trips={trips} />
        </div>
        <div className="grid gap-4 rounded-3xl border border-border/60 bg-card/60 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <UsersIcon className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm font-semibold">多人协同编辑</p>
              <p className="text-xs text-muted-foreground">权限控制、评论讨论、任务指派一应俱全。</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <PlaneIcon className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm font-semibold">票务与路线整合</p>
              <p className="text-xs text-muted-foreground">同步机票、火车票与每日地点地图。</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheckIcon className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm font-semibold">预算实时监控</p>
              <p className="text-xs text-muted-foreground">分类预算与汇率换算，开销一目了然。</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">精选行程灵感</h2>
            <p className="text-sm text-muted-foreground">来自社区的高分行程模板，快速复制并二次创作。</p>
          </div>
          <TripForm
            trigger={
              <Button variant="secondary" size="sm" className="gap-2">
                <Wand2Icon className="h-4 w-4" />
                使用模板创建
              </Button>
            }
          />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredTrips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              footer={
                <TripForm
                  trip={trip}
                  trigger={<Button variant="ghost" size="sm">复制行程</Button>}
                />
              }
            />
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {featureCards.map((feature) => (
          <Card key={feature.title} className="border-border/60">
            <CardContent className="space-y-3 p-6">
              <feature.icon className="h-8 w-8 text-primary" />
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {feature.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="rounded-3xl border border-border/60 bg-gradient-to-r from-primary/10 via-background to-secondary/20 p-10">
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr] lg:items-center">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold">一键导出行程手册，离线也能查阅</h2>
            <p className="text-sm text-muted-foreground">
              支持 PDF、ICS、电子表格等多种导出格式，随时分享给旅伴或导入到日历工具。
            </p>
          </div>
          <div className="flex justify-end">
            <Button size="lg" asChild>
              <Link href="/trips">浏览全部行程</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

const featureCards = [
  {
    title: "团队协同",
    description: "支持分享链接设置查看或编辑权限，评论区与任务指派让协作更顺畅。",
    icon: UsersIcon,
    points: ["可编辑与仅查看权限区分", "针对活动的评论与讨论", "任务指派与通知提醒"],
  },
  {
    title: "预算与报销",
    description: "分类预算、实时记账与汇率换算，帮助团队控制花费。",
    icon: ShieldCheckIcon,
    points: ["分类预算上限设置", "快速录入花费并归档", "自动生成图表分析"],
  },
  {
    title: "智能模板",
    description: "将满意的行程保存为模板，一键套用并自动生成日程结构。",
    icon: Wand2Icon,
    points: ["社区精选模板库", "自定义模板共享", "一键复制并调整"],
  },
]
