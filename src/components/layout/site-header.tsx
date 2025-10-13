import Link from "next/link"

import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { siteConfig } from "@/config/site"
import { getAuthSession } from "@/lib/auth"
import { UserMenu } from "@/components/user-menu"

export async function SiteHeader() {
  const session = await getAuthSession()

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            {siteConfig.name}
          </Link>
          <nav className="hidden items-center gap-4 text-sm font-medium md:flex">
            {siteConfig.navigation.map((item) => (
              <Link key={item.href} href={item.href} className="text-muted-foreground transition hover:text-foreground">
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/calendar">行程日历</Link>
          </Button>
          <ThemeToggle />
          <UserMenu user={session?.user} />
        </div>
      </div>
    </header>
  )
}
