"use client"

import { useState } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type Resolver } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const ExpenseSchema = z.object({
  amount: z.coerce.number().min(0, "金额需大于 0"),
  category: z.enum(["transport", "accommodation", "food", "activities", "shopping", "other"]),
  description: z.string().min(2, "请输入描述"),
  date: z.string(),
})

type ExpenseFormValues = z.infer<typeof ExpenseSchema>

type ExpenseDrawerProps = {
  currency: string
  onAdded?: (expense: ExpenseFormValues) => void
}

export function ExpenseDrawer({ currency, onAdded }: ExpenseDrawerProps) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const defaultValues: ExpenseFormValues = {
    amount: 0,
    category: "transport",
    description: "",
    date: new Date().toISOString().slice(0, 10),
  }
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(ExpenseSchema) as unknown as Resolver<ExpenseFormValues>,
    defaultValues,
  })

  const handleSubmit = (values: ExpenseFormValues) => {
    onAdded?.(values)
    setStatus("已添加开销记录（示例数据，本地暂存）")
    setOpen(false)
    form.reset(defaultValues)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          快速记录开销
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>添加开销</SheetTitle>
          <SheetDescription>将开销与预算分类关联，便于后续统计分析。</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="mt-6 space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>金额 ({currency})</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step={50}
                      value={field.value ?? 0}
                      onChange={(event) =>
                        field.onChange(event.target.value ? Number(event.target.value) : 0)
                      }
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
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>分类</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? "transport"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择分类" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="transport">交通</SelectItem>
                      <SelectItem value="accommodation">住宿</SelectItem>
                      <SelectItem value="food">餐饮</SelectItem>
                      <SelectItem value="activities">活动</SelectItem>
                      <SelectItem value="shopping">购物</SelectItem>
                      <SelectItem value="other">其他</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>描述</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="如：往返机票"
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
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>日期</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
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
            <SheetFooter>
              <Button type="submit">保存</Button>
            </SheetFooter>
          </form>
        </Form>
        {status ? <p className="mt-4 text-xs text-muted-foreground">{status}</p> : null}
      </SheetContent>
    </Sheet>
  )
}
