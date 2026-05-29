"use client"

import { usePathname } from "next/navigation"
import { Zap, LayoutDashboard, Users, KanbanSquare, Clock, Settings, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { NavItem } from "./nav-item"
import { WorkspaceSwitcher } from "./workspace-switcher"

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/pipeline", label: "Pipeline", icon: KanbanSquare },
  { href: "/activities", label: "Atividades", icon: Clock },
  { href: "/settings", label: "Configurações", icon: Settings },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-slate-900 transition-transform duration-200",
        open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-4 border-b border-slate-800">
        <Zap className="size-5 text-sky-400 shrink-0" />
        <span className="font-semibold text-slate-100 text-sm">SemComplicação</span>
        <button
          onClick={onClose}
          className="ml-auto md:hidden rounded p-1 text-slate-400 hover:text-slate-100 transition-colors"
          aria-label="Fechar menu"
        >
          <X className="size-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {NAV_LINKS.map(({ href, label, icon }) => (
          <NavItem
            key={href}
            href={href}
            label={label}
            icon={icon}
            isActive={pathname === href || pathname.startsWith(href + "/")}
            onClick={onClose}
          />
        ))}
      </nav>

      {/* Workspace switcher */}
      <div className="p-2 border-t border-slate-800">
        <WorkspaceSwitcher />
      </div>
    </aside>
  )
}
