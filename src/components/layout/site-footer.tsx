import Link from "next/link"

import { siteConfig } from "@/config/site"

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>&copy; {new Date().getFullYear()} {siteConfig.name}. 专注于让旅行规划更轻松。</p>
        <div className="flex items-center gap-4">
          <Link href={siteConfig.links.github} className="hover:text-foreground">
            GitHub
          </Link>
          <Link href={siteConfig.links.twitter} className="hover:text-foreground">
            X / Twitter
          </Link>
        </div>
      </div>
    </footer>
  )
}
