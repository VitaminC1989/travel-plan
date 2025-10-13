"use client"

import * as React from "react"
import { addDays, formatISO, parseISO } from "date-fns"
import { DateRange } from "react-day-picker"
import { v4 as uuid } from "uuid"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  useFieldArray,
  useForm,
  type Control,
  type FieldPath,
  type Resolver,
} from "react-hook-form"

import { saveTripAction } from "@/app/actions/trips"
import { TripFormSchema, type Trip, type TripFormValues } from "@/data/schema"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

type TripFormProps = {
  trip?: Trip
  trigger: React.ReactNode
  onCompleted?: (trip: Trip) => void
}

const currencyOptions = ["USD", "EUR", "CNY", "JPY", "GBP", "HKD", "AUD", "SGD"]

const createEmptyTrip = (): TripFormValues => {
  const start = addDays(new Date(), 7)
  const end = addDays(new Date(), 10)

  return {
    id: undefined,
    name: "",
    destination: "",
    startDate: formatISO(start, { representation: "date" }),
    endDate: formatISO(end, { representation: "date" }),
    ownerId: "user-1",
    participants: [],
    budget: {
      total: 0,
      currency: "USD",
      categories: {
        transport: 0,
        accommodation: 0,
        food: 0,
        activities: 0,
        shopping: 0,
        other: 0,
      },
    },
    expenses: [],
    itinerary: [
      {
        day: 1,
        date: formatISO(start, { representation: "date" }),
        title: "行程第一天",
        notes: "",
        activities: [],
      },
    ],
    checklists: {
      packing: [],
      todos: [],
    },
    shareLinks: [],
    favoritePlaces: [],
    templates: [],
  }
}

const normalizeTrip = (trip: Trip): TripFormValues => ({
  ...trip,
  shareLinks: trip.shareLinks ?? [],
  favoritePlaces: trip.favoritePlaces ?? [],
  templates: trip.templates ?? [],
})

export function TripForm({ trip, trigger, onCompleted }: TripFormProps) {
  const [open, setOpen] = React.useState(false)
  const [isPending, startTransition] = React.useTransition()
  const [message, setMessage] = React.useState<string | null>(null)

  const initialValues = React.useMemo<TripFormValues>(
    () => (trip ? normalizeTrip(trip) : createEmptyTrip()),
    [trip]
  )

  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(() => ({
    from: parseISO(initialValues.startDate),
    to: parseISO(initialValues.endDate),
  }))

  const form = useForm<TripFormValues>({
    resolver: zodResolver(TripFormSchema) as unknown as Resolver<TripFormValues>,
    defaultValues: initialValues,
  })

  const itineraryArray = useFieldArray({
    control: form.control,
    name: "itinerary",
  })

  React.useEffect(() => {
    form.reset(initialValues)
    setDateRange({
      from: parseISO(initialValues.startDate),
      to: parseISO(initialValues.endDate),
    })
  }, [initialValues, form])

  React.useEffect(() => {
    if (!dateRange?.from) {
      return
    }

    const from = dateRange.from
    const to = dateRange.to ?? dateRange.from

    form.setValue("startDate", formatISO(from, { representation: "date" }))
    form.setValue("endDate", formatISO(to, { representation: "date" }))
  }, [dateRange, form])

  const handleAddDay = () => {
    const nextIndex = itineraryArray.fields.length + 1
    const baseDate = parseISO(form.getValues("startDate"))

    itineraryArray.append({
      day: nextIndex,
      date: formatISO(addDays(baseDate, nextIndex - 1), { representation: "date" }),
      title: `行程第 ${nextIndex} 天`,
      notes: "",
      activities: [],
    })
  }

  const handleSubmit = form.handleSubmit((values) => {
    setMessage(null)
    startTransition(async () => {
      try {
        const saved = await saveTripAction(values)
        const normalized = normalizeTrip(saved)
        form.reset(normalized)
        setDateRange({
          from: parseISO(normalized.startDate),
          to: parseISO(normalized.endDate),
        })
        setOpen(false)
        setMessage("行程已保存")
        onCompleted?.(saved)
      } catch (error) {
        console.error(error)
        setMessage("保存行程时出现问题，请稍后再试")
      }
    })
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-[95vw] overflow-hidden p-0 md:max-w-4xl">
        <Form {...form}>
          <form onSubmit={handleSubmit} className="flex max-h-[82vh] flex-col">
            <DialogHeader className="px-6 pt-6">
              <DialogTitle>{trip ? "编辑行程" : "创建新行程"}</DialogTitle>
              <DialogDescription>
                完善行程信息，邀请伙伴一起协同规划。
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="flex-1 px-6">
              <div className="space-y-6 pb-6 pr-1 md:pr-2">
                <section className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>行程名称</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="欧洲冒险之旅"
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="destination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>目的地</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="巴黎, 法国"
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="md:col-span-2">
                    <FormLabel>行程日期</FormLabel>
                    <div className="mt-2 space-y-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !dateRange && "text-muted-foreground"
                            )}
                          >
                            {dateRange?.from && dateRange?.to
                              ? `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
                              : "选择起止日期"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="range"
                            selected={dateRange}
                            onSelect={setDateRange}
                            numberOfMonths={2}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        支持跨越多城市或多国家的长线行程。
                      </FormDescription>
                    </div>
                  </div>
                </section>

                <section className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="budget.total"
                    render={({ field }) => {
                      const value = (field.value as number | undefined) ?? 0

                      return (
                        <FormItem>
                          <FormLabel>预算总额</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              step={100}
                              value={value}
                              onChange={(event) =>
                                field.onChange(
                                  event.target.value ? Number(event.target.value) : 0
                                )
                              }
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )
                    }}
                  />
                  <FormField
                    control={form.control}
                    name="budget.currency"
                    render={({ field }) => {
                      const value = (field.value as string | undefined) ?? "USD"

                      return (
                        <FormItem>
                          <FormLabel>预算币种</FormLabel>
                          <Select onValueChange={field.onChange} value={value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="选择币种" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-60">
                              {currencyOptions.map((currency) => (
                                <SelectItem key={currency} value={currency}>
                                  {currency}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )
                    }}
                  />
                </section>

                <Tabs defaultValue="categories">
                  <TabsList>
                    <TabsTrigger value="categories">预算分类</TabsTrigger>
                    <TabsTrigger value="collaboration">协同设置</TabsTrigger>
                  </TabsList>
                  <TabsContent value="categories" className="space-y-4 pt-4">
                    <BudgetCategoryFields control={form.control} />
                  </TabsContent>
                  <TabsContent value="collaboration" className="space-y-4 pt-4">
                    <FormDescription>
                      邀请伙伴一起协同规划，支持查看或编辑权限。
                    </FormDescription>
                    <FormField
                      control={form.control}
                      name="participants"
                      render={({ field }) => {
                        const participants = field.value as TripFormValues["participants"] | undefined
                        const value = participants
                          ?.map((item) => item.email ?? item.userId)
                          .join(", ")
                          ?? ""

                        return (
                          <FormItem>
                            <FormLabel>参与成员（以逗号分隔邮箱）</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="alex@example.com, jamie@example.com"
                                value={value}
                                onChange={(event) => {
                                  const emails = event.target.value
                                    .split(",")
                                    .map((item) => item.trim())
                                    .filter(Boolean)

                                  field.onChange(
                                    emails.map((email) => ({
                                      userId: email,
                                      email,
                                      role: "editor" as const,
                                    }))
                                  )
                                }}
                                onBlur={field.onBlur}
                                name={field.name}
                                ref={field.ref}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )
                      }}
                    />
                  </TabsContent>
                </Tabs>

                <section className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-semibold">每日行程</h3>
                      <p className="text-sm text-muted-foreground">
                        为每天安排活动，支持常规活动与票务信息。
                      </p>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddDay}>
                      添加行程日
                    </Button>
                  </div>
                  <div className="space-y-6">
                    {itineraryArray.fields.map((item, index) => (
                      <DayEditor
                        key={`${item.id}-${index}`}
                        dayIndex={index}
                        control={form.control}
                        onRemove={() => itineraryArray.remove(index)}
                      />
                    ))}
                  </div>
                </section>

                {message ? (
                  <p className="text-sm text-muted-foreground">{message}</p>
                ) : null}
              </div>
            </ScrollArea>

            <DialogFooter className="gap-2 border-t border-border/60 bg-background px-6 py-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                取消
              </Button>
              <Button type="submit" disabled={isPending || form.formState.isSubmitting}>
                {isPending ? "保存中..." : "保存行程"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

type BudgetCategoryFieldsProps = {
  control: Control<TripFormValues>
}

function BudgetCategoryFields({ control }: BudgetCategoryFieldsProps) {
  const categories: Array<{
    key: keyof TripFormValues["budget"]["categories"]
    label: string
  }> = [
    { key: "transport", label: "交通" },
    { key: "accommodation", label: "住宿" },
    { key: "food", label: "餐饮" },
    { key: "activities", label: "活动" },
    { key: "shopping", label: "购物" },
    { key: "other", label: "其他" },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {categories.map(({ key, label }) => (
        <FormField
          key={key}
          control={control}
          name={`budget.categories.${key}` as FieldPath<TripFormValues>}
          render={({ field }) => {
            const numericValue = (field.value as number | undefined) ?? 0

            return (
              <FormItem>
                <FormLabel>{label}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step={50}
                    value={numericValue}
                    onChange={(event) =>
                      field.onChange(
                        event.target.value ? Number(event.target.value) : 0
                      )
                    }
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )
          }}
        />
      ))}
    </div>
  )
}

type DayEditorProps = {
  dayIndex: number
  control: Control<TripFormValues>
  onRemove: () => void
}

function DayEditor({ dayIndex, control, onRemove }: DayEditorProps) {
  const activitiesArray = useFieldArray({
    control,
    name: `itinerary.${dayIndex}.activities` as const,
  })

  const titleField = `itinerary.${dayIndex}.title` as FieldPath<TripFormValues>
  const dateField = `itinerary.${dayIndex}.date` as FieldPath<TripFormValues>
  const notesField = `itinerary.${dayIndex}.notes` as FieldPath<TripFormValues>

  const handleAddActivity = () => {
    activitiesArray.append({
      id: uuid(),
      type: "activity",
      name: "",
      details: "",
      startTime: "",
      endTime: "",
      location: null,
      assigneeId: null,
      status: "planned",
      comments: [],
    })
  }

  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <FormField
          control={control}
          name={titleField}
          render={({ field }) => {
            const value = (field.value as string | undefined) ?? ""

            return (
              <FormItem className="flex-1">
                <FormLabel>第 {dayIndex + 1} 天标题</FormLabel>
                <FormControl>
                  <Input
                    placeholder="抵达与入住"
                    value={value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )
          }}
        />
        <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
          ✕
        </Button>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <FormField
          control={control}
          name={dateField}
          render={({ field }) => {
            const value = (field.value as string | undefined) ?? ""

            return (
              <FormItem>
                <FormLabel>日期</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )
          }}
        />
        <FormField
          control={control}
          name={notesField}
          render={({ field }) => {
            const value = (field.value as string | undefined) ?? ""

            return (
              <FormItem>
                <FormLabel>备注</FormLabel>
                <FormControl>
                  <Textarea
                    rows={2}
                    value={value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )
          }}
        />
      </div>

      <div className="mt-4 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">活动安排</h4>
          <Button type="button" variant="outline" size="sm" onClick={handleAddActivity}>
            添加活动
          </Button>
        </div>

        <div className="space-y-4">
          {activitiesArray.fields.map((activity, activityIndex) => (
            <ActivityEditor
              key={`${activity.id}-${activityIndex}`}
              control={control}
              dayIndex={dayIndex}
              activityIndex={activityIndex}
              onRemove={() => activitiesArray.remove(activityIndex)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

type ActivityFieldName<Suffix extends string> = `itinerary.${number}.activities.${number}.${Suffix}`

type ActivityEditorProps = {
  control: Control<TripFormValues>
  dayIndex: number
  activityIndex: number
  onRemove: () => void
}

function ActivityEditor({ control, dayIndex, activityIndex, onRemove }: ActivityEditorProps) {
  const prefix = `itinerary.${dayIndex}.activities.${activityIndex}` as const

  const typeField = `${prefix}.type` as ActivityFieldName<"type">
  const nameField = `${prefix}.name` as ActivityFieldName<"name">
  const detailsField = `${prefix}.details` as ActivityFieldName<"details">
  const startField = `${prefix}.startTime` as ActivityFieldName<"startTime">
  const endField = `${prefix}.endTime` as ActivityFieldName<"endTime">
  const assigneeField = `${prefix}.assigneeId` as ActivityFieldName<"assigneeId">
  const budgetField = `${prefix}.budgetEstimate` as ActivityFieldName<"budgetEstimate">
  const statusField = `${prefix}.status` as ActivityFieldName<"status">
  const commentsField = `${prefix}.comments` as ActivityFieldName<"comments">

  return (
    <div className="rounded-md border bg-muted/30 p-3">
      <div className="flex items-center gap-3">
        <FormField
          control={control}
          name={typeField as FieldPath<TripFormValues>}
          render={({ field }) => {
            const value = (field.value as string | undefined) ?? "activity"

            return (
              <FormItem className="w-32">
                <FormLabel>类型</FormLabel>
                <Select onValueChange={field.onChange} value={value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="activity">常规活动</SelectItem>
                    <SelectItem value="ticket">票务信息</SelectItem>
                    <SelectItem value="task">准备任务</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )
          }}
        />
        <FormField
          control={control}
          name={nameField as FieldPath<TripFormValues>}
          render={({ field }) => {
            const value = (field.value as string | undefined) ?? ""

            return (
              <FormItem className="flex-1">
                <FormLabel>名称</FormLabel>
                <FormControl>
                  <Input
                    placeholder="卢浮宫导览"
                    value={value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )
          }}
        />
        <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
          ✕
        </Button>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <FormField
          control={control}
          name={detailsField as FieldPath<TripFormValues>}
          render={({ field }) => {
            const value = (field.value as string | undefined) ?? ""

            return (
              <FormItem className="md:col-span-2">
                <FormLabel>详情</FormLabel>
                <FormControl>
                  <Textarea
                    rows={2}
                    value={value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )
          }}
        />
        <FormField
          control={control}
          name={startField as FieldPath<TripFormValues>}
          render={({ field }) => {
            const value = (field.value as string | undefined) ?? ""

            return (
              <FormItem>
                <FormLabel>开始时间</FormLabel>
                <FormControl>
                  <Input
                    type="time"
                    value={value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )
          }}
        />
        <FormField
          control={control}
          name={endField as FieldPath<TripFormValues>}
          render={({ field }) => {
            const value = (field.value as string | undefined) ?? ""

            return (
              <FormItem>
                <FormLabel>结束时间</FormLabel>
                <FormControl>
                  <Input
                    type="time"
                    value={value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )
          }}
        />
        <FormField
          control={control}
          name={assigneeField as FieldPath<TripFormValues>}
          render={({ field }) => {
            const value = (field.value as string | null | undefined) ?? ""

            return (
              <FormItem>
                <FormLabel>负责人</FormLabel>
                <FormControl>
                  <Input
                    placeholder="alex@example.com"
                    value={value}
                    onChange={(event) => field.onChange(event.target.value || null)}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormDescription>指派任务给特定成员。</FormDescription>
                <FormMessage />
              </FormItem>
            )
          }}
        />
        <FormField
          control={control}
          name={budgetField as FieldPath<TripFormValues>}
          render={({ field }) => {
            const value = field.value as number | undefined

            return (
              <FormItem>
                <FormLabel>预算估算</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    value={value ?? ""}
                    onChange={(event) =>
                      field.onChange(
                        event.target.value ? Number(event.target.value) : undefined
                      )
                    }
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )
          }}
        />
        <FormField
          control={control}
          name={statusField as FieldPath<TripFormValues>}
          render={({ field }) => {
            const value = (field.value as string | undefined) ?? "planned"

            return (
              <FormItem>
                <FormLabel>状态</FormLabel>
                <Select onValueChange={field.onChange} value={value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="planned">计划中</SelectItem>
                    <SelectItem value="confirmed">已确认</SelectItem>
                    <SelectItem value="completed">已完成</SelectItem>
                    <SelectItem value="cancelled">已取消</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )
          }}
        />
        <FormField
          control={control}
          name={commentsField as FieldPath<TripFormValues>}
          render={({ field }) => {
            const comments = field.value as TripFormValues["itinerary"][number]["activities"][number]["comments"] | undefined
            const textValue = comments?.map((item) => item.text).join("\n") ?? ""

            return (
              <FormItem className="md:col-span-2">
                <FormLabel>留言</FormLabel>
                <FormControl>
                  <Textarea
                    rows={2}
                    value={textValue}
                    onChange={(event) =>
                      field.onChange(
                        event.target.value
                          .split("\n")
                          .filter(Boolean)
                          .map((text) => ({
                            id: uuid(),
                            userId: "user-1",
                            text,
                            timestamp: new Date().toISOString(),
                          }))
                      )
                    }
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormDescription>支持记录讨论要点。</FormDescription>
                <FormMessage />
              </FormItem>
            )
          }}
        />
      </div>
    </div>
  )
}
