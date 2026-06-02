"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useTransition } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { LeadStatus } from "@/types"

const STATUS_OPTIONS: Array<{ value: LeadStatus | "all"; label: string }> = [
  { value: "all", label: "Todos os status" },
  { value: "new", label: "Novo" },
  { value: "contacted", label: "Contatado" },
  { value: "qualified", label: "Qualificado" },
  { value: "unqualified", label: "Desqualificado" },
  { value: "converted", label: "Cliente" },
]

export function LeadFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const search = searchParams.get("search") ?? ""
  const status = (searchParams.get("status") ?? "all") as LeadStatus | "all"
  const hasFilters = search !== "" || status !== "all"

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value === "" || value === "all") {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`)
    })
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Buscar por nome ou empresa..."
          defaultValue={search}
          onChange={(e) => updateParams({ search: e.target.value })}
          className="pl-8"
        />
      </div>

      <select
        value={status}
        onChange={(e) => updateParams({ status: e.target.value })}
        className="h-9 rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:w-48"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => updateParams({ search: "", status: "all" })}
          className="shrink-0"
        >
          <X className="size-4" />
          Limpar
        </Button>
      )}
    </div>
  )
}
