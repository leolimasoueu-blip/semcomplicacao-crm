"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface NavItemProps {
  href: string
  label: string
  icon: LucideIcon
  isActive: boolean
  onClick?: () => void
}

export function NavItem({ href, label, icon: Icon, isActive, onClick }: NavItemProps) {
  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-sky-500/10 text-sky-400"
          : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
      )}
    >
      <Icon className="size-4 shrink-0" />
      {label}
    </Link>
  )
}
