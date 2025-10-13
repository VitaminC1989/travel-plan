"use client"

import { useTransition } from "react"
import { signIn } from "next-auth/react"
import { GithubIcon, MailIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function SignInPanel() {
  const [isPending, startTransition] = useTransition()

  const handleEmailSignIn = (formData: FormData) => {
    const email = formData.get("email") as string
    if (!email) return
    startTransition(() => {
      void signIn("magic-link", { email, redirect: true })
    })
  }

  return (
    <div className="space-y-6">
      <form className="space-y-3" action={handleEmailSignIn}>
        <div className="space-y-2 text-left">
          <label htmlFor="email" className="text-sm font-medium">
            邮箱地址
          </label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" required />
        </div>
        <Button type="submit" className="w-full" disabled={isPending}>
          <MailIcon className="mr-2 h-4 w-4" />
          发送登录链接
        </Button>
      </form>
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">或选择社交账号登录</p>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() =>
            startTransition(() => {
              void signIn("github")
            })
          }
        >
          <GithubIcon className="mr-2 h-4 w-4" />
          使用 GitHub 登录
        </Button>
      </div>
    </div>
  )
}
