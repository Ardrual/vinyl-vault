"use client"

import { useUser } from "@stackframe/stack"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Settings } from "lucide-react"
import Link from "next/link"

export function AuthNav() {
  const user = useUser()

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/handler/sign-in">
          <Button variant="outline">Sign In</Button>
        </Link>
        <Link href="/handler/sign-up">
          <Button>Sign Up</Button>
        </Link>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.profileImageUrl || ""} alt={user.displayName || ""} />
            <AvatarFallback>
              {user.displayName?.charAt(0)?.toUpperCase() || user.primaryEmail?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {user.displayName && <p className="font-medium">{user.displayName}</p>}
            {user.primaryEmail && (
              <p className="w-[200px] truncate text-sm text-muted-foreground">{user.primaryEmail}</p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <Link href="/handler/account-settings">
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Account Settings</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <Link href="/handler/sign-out">
          <DropdownMenuItem>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
