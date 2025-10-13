"use client"

import { useState } from "react"
import { SendIcon } from "lucide-react"

import type { Activity } from "@/data/schema"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

type ActivityCommentsProps = {
  activity: Activity
}

export function ActivityComments({ activity }: ActivityCommentsProps) {
  const [value, setValue] = useState("")
  const [comments, setComments] = useState(activity.comments)

  const handleSubmit = () => {
    if (!value.trim()) return
    setComments((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        userId: "user-1",
        text: value.trim(),
        timestamp: new Date().toISOString(),
      },
    ])
    setValue("")
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{comment.userId.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 rounded-lg border border-border/40 bg-muted/30 p-3">
              <p className="text-sm text-foreground">{comment.text}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(comment.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
        {comments.length === 0 ? (
          <p className="text-xs text-muted-foreground">还没有评论，快来分享想法吧。</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Textarea
          placeholder="添加评论..."
          value={value}
          onChange={(event) => setValue(event.target.value)}
          rows={3}
        />
        <Button variant="secondary" size="sm" className="gap-2" onClick={handleSubmit}>
          <SendIcon className="h-4 w-4" />
          发布评论
        </Button>
      </div>
    </div>
  )
}
