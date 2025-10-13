"use client"

import { useTransition } from "react"
import type { Session } from "next-auth"
import { signIn, signOut } from "next-auth/react"
import { LogInIcon, LogOutIcon, UserIcon } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

type UserMenuProps = {
  user?: Session["user"]
}

export function UserMenu({ user }: UserMenuProps) {
  const [isPending, startTransition] = useTransition()

  if (!user) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() =>
          startTransition(async () => {
            await signIn()
          })
        }
        disabled={isPending}
      >
        <LogInIcon className="mr-2 h-4 w-4" />
        登录
      </Button>
    )
  }

  const initials = user.name?.slice(0, 2).toUpperCase() ?? user.email?.slice(0, 2).toUpperCase() ?? "ME"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image ?? undefined} alt={user.name ?? "用户"} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium md:inline">{user.name ?? user.email}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>我的账号</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 text-sm">
          <UserIcon className="h-4 w-4" />
          {user.email}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="gap-2 text-sm"
          onSelect={() =>
            startTransition(async () => {
              await signOut({ callbackUrl: "/" })
            })
          }
        >
          <LogOutIcon className="h-4 w-4" />
          退出登录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
