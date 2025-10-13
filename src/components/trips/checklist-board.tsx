"use client"

import { useState } from "react"

import type { Checklist } from "@/data/schema"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type ChecklistBoardProps = {
  checklist: Checklist
}

export function ChecklistBoard({ checklist }: ChecklistBoardProps) {
  const [packing, setPacking] = useState(checklist.packing)
  const [todos, setTodos] = useState(checklist.todos)
  const [newPacking, setNewPacking] = useState("")
  const [newTodo, setNewTodo] = useState("")

  const handleAddPacking = () => {
    if (!newPacking.trim()) return
    setPacking((prev) => [...prev, { id: crypto.randomUUID(), item: newPacking.trim(), packed: false }])
    setNewPacking("")
  }

  const handleAddTodo = () => {
    if (!newTodo.trim()) return
    setTodos((prev) => [...prev, { id: crypto.randomUUID(), item: newTodo.trim(), completed: false }])
    setNewTodo("")
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChecklistColumn
        title="打包清单"
        items={packing.map((item) => ({ id: item.id, label: item.item, checked: Boolean(item.packed) }))}
        onToggle={(id) =>
          setPacking((prev) => prev.map((item) => (item.id === id ? { ...item, packed: !item.packed } : item)))
        }
        inputValue={newPacking}
        onInputChange={setNewPacking}
        onAdd={handleAddPacking}
        placeholder="添加新的行李物品"
      />
      <ChecklistColumn
        title="行前待办"
        items={todos.map((item) => ({ id: item.id, label: item.item, checked: Boolean(item.completed) }))}
        onToggle={(id) =>
          setTodos((prev) => prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)))
        }
        inputValue={newTodo}
        onInputChange={setNewTodo}
        onAdd={handleAddTodo}
        placeholder="添加新的准备任务"
      />
    </div>
  )
}

type ChecklistColumnProps = {
  title: string
  items: Array<{ id: string; label: string; checked: boolean }>
  onToggle: (id: string) => void
  inputValue: string
  onInputChange: (value: string) => void
  onAdd: () => void
  placeholder: string
}

function ChecklistColumn({
  title,
  items,
  onToggle,
  inputValue,
  onInputChange,
  onAdd,
  placeholder,
}: ChecklistColumnProps) {
  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          {items.map((item) => (
            <label key={item.id} className="flex items-center gap-2 text-sm">
              <Checkbox checked={item.checked} onCheckedChange={() => onToggle(item.id)} />
              <span className={item.checked ? "line-through text-muted-foreground" : "text-foreground"}>
                {item.label}
              </span>
            </label>
          ))}
          {items.length === 0 ? <p className="text-xs text-muted-foreground">暂无项目。</p> : null}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder={placeholder}
            value={inputValue}
            onChange={(event) => onInputChange(event.target.value)}
          />
          <Button variant="secondary" size="sm" onClick={onAdd}>
            添加
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
