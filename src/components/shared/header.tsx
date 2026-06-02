"use client"

import { Menu, LogOut, User, Settings } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/supabase/actions"
import type { AppUser } from "@/types/app"

interface HeaderProps {
  onMenuClick: () => void
  user: AppUser | null
}

export function Header({ onMenuClick, user }: HeaderProps) {
  return (
    <header className="flex h-16 items-center gap-4 border-b border-border bg-background px-6">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMenuClick}
        aria-label="Abrir menu"
      >
        <Menu className="size-5" />
      </Button>

      <div className="flex-1" />

      <DropdownMenu>
        <DropdownMenuTrigger className="outline-none">
          <Avatar>
            <AvatarFallback>{user?.initials ?? "?"}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="bottom" sideOffset={8} className="min-w-48">
          <div className="px-1.5 py-1.5">
            <p className="text-sm font-medium">{user?.displayName ?? "Usuário"}</p>
            <p className="text-xs text-muted-foreground">{user?.email ?? ""}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-2">
            <User className="size-4" />
            Perfil
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2">
            <Settings className="size-4" />
            Configurações
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="gap-2"
            variant="destructive"
            onClick={() => void signOut()}
          >
            <LogOut className="size-4" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
