"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronUp, ChevronDown, ChevronsUpDown, Pencil, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LeadStatusBadge } from "@/components/leads/lead-status-badge"
import { getMemberById } from "@/lib/mock-data"
import type { Lead } from "@/types"

const PAGE_SIZE = 8

type SortKey = "name" | "company" | "status" | "created_at"
type SortDir = "asc" | "desc"

function SortIcon({ column, sortKey, sortDir }: { column: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (column !== sortKey) return <ChevronsUpDown className="size-3.5 text-muted-foreground/50" />
  return sortDir === "asc"
    ? <ChevronUp className="size-3.5 text-foreground" />
    : <ChevronDown className="size-3.5 text-foreground" />
}

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(dateStr))
}

interface LeadTableProps {
  leads: Lead[]
  onEdit: (lead: Lead) => void
}

export function LeadTable({ leads, onEdit }: LeadTableProps) {
  const router = useRouter()
  const [sortKey, setSortKey] = useState<SortKey>("created_at")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [page, setPage] = useState(1)

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
    setPage(1)
  }

  const sorted = [...leads].sort((a, b) => {
    const aVal = a[sortKey] ?? ""
    const bVal = b[sortKey] ?? ""
    const cmp = String(aVal).localeCompare(String(bVal), "pt-BR")
    return sortDir === "asc" ? cmp : -cmp
  })

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function ColHeader({ label, col }: { label: string; col: SortKey }) {
    return (
      <th
        className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide cursor-pointer select-none hover:text-foreground transition-colors"
        onClick={() => handleSort(col)}
      >
        <div className="inline-flex items-center gap-1">
          {label}
          <SortIcon column={col} sortKey={sortKey} sortDir={sortDir} />
        </div>
      </th>
    )
  }

  return (
    <div className="rounded-xl border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/30">
            <tr>
              <ColHeader label="Nome" col="name" />
              <ColHeader label="Empresa" col="company" />
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Cargo
              </th>
              <ColHeader label="Status" col="status" />
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Responsável
              </th>
              <ColHeader label="Criado em" col="created_at" />
              <th className="px-4 py-3 w-10" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {paginated.map((lead) => {
              const owner = getMemberById(lead.owner_id)
              return (
                <tr
                  key={lead.id}
                  className="hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => router.push(`/leads/${lead.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
                        {getInitials(lead.name)}
                      </div>
                      <span className="font-medium text-foreground truncate max-w-[140px]">
                        {lead.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground truncate max-w-[140px]">
                    {lead.company ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground truncate max-w-[120px]">
                    {lead.position ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <LeadStatusBadge status={lead.status} />
                  </td>
                  <td className="px-4 py-3">
                    {owner ? (
                      <div className="flex items-center gap-2">
                        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                          {owner.initials}
                        </div>
                        <span className="text-muted-foreground text-xs truncate max-w-[100px]">
                          {owner.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {formatDate(lead.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit(lead)
                      }}
                    >
                      <Pencil className="size-3.5" />
                      <span className="sr-only">Editar</span>
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t px-4 py-3">
          <p className="text-xs text-muted-foreground">
            {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, leads.length)} de {leads.length} leads
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="px-2 text-xs text-muted-foreground">
              {safePage} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
