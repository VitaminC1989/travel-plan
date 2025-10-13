"use client"

import { useState } from "react"
import { z } from "zod"

import type { ShareLink } from "@/data/schema"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const ShareSchema = z.object({
  permission: z.enum(["view", "edit"]),
  expiresAt: z.string().nullable(),
})

type ShareDialogProps = {
  shareLinks: ShareLink[]
  tripId: string
}

export function ShareDialog({ shareLinks, tripId }: ShareDialogProps) {
  const [open, setOpen] = useState(false)
  const [permission, setPermission] = useState<"view" | "edit">(shareLinks[0]?.permission ?? "view")
  const [expiresAt, setExpiresAt] = useState<string | null>(shareLinks[0]?.expiresAt ?? null)
  const [status, setStatus] = useState<string | null>(null)

  const latestLink = shareLinks.at(0)
  const inviteUrl = latestLink?.url ?? `https://travel.example.com/share/${tripId}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setStatus("链接已复制")
    } catch {
      setStatus("复制失败，请手动复制")
    }
  }

  const handleSave = () => {
    ShareSchema.parse({ permission, expiresAt })
    setStatus("分享设置已更新")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          分享行程
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>分享与协同</DialogTitle>
          <DialogDescription>生成一个可分享链接并设置访问权限。</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">邀请链接</label>
            <div className="flex gap-2">
              <Input readOnly value={inviteUrl} />
              <Button variant="secondary" onClick={handleCopy}>
                复制
              </Button>
            </div>
            {status ? <p className="text-xs text-muted-foreground">{status}</p> : null}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">权限</label>
              <Select value={permission} onValueChange={(value: "view" | "edit") => setPermission(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="选择权限" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">仅查看</SelectItem>
                  <SelectItem value="edit">可编辑</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">到期时间</label>
              <Input
                type="date"
                value={expiresAt ?? ""}
                onChange={(event) => setExpiresAt(event.target.value || null)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">历史分享链接</p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {shareLinks.map((link) => (
                <li key={link.id}>
                  {link.url} · {link.permission === "edit" ? "可编辑" : "仅查看"}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>保存设置</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
