import { SignInPanel } from "@/components/login/sign-in-panel"
import { Badge } from "@/components/ui/badge"

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6 rounded-3xl border border-border/60 bg-card/60 p-10 text-center">
      <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs uppercase tracking-wide">
        登录 Voyager
      </Badge>
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold">欢迎回来</h1>
        <p className="text-sm text-muted-foreground">
          使用邮箱或社交账号登录，随时查看并协同规划你的旅行行程。
        </p>
      </div>
      <SignInPanel />
    </div>
  )
}
