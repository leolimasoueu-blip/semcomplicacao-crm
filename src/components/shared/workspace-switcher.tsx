"use client"

import { useState, useEffect } from "react"
import { Check, ChevronDown, Loader2, Plus } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type WorkspaceEntry = {
  id: string
  name: string
  slug: string
}

function WorkspaceAvatar({ name }: { name: string }) {
  return (
    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-sky-500 text-xs font-bold text-white">
      {name.charAt(0).toUpperCase()}
    </span>
  )
}

export function WorkspaceSwitcher() {
  const [workspaces, setWorkspaces] = useState<WorkspaceEntry[]>([])
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      // Busca memberships. Filtramos em JS para evitar problemas de inferência
      // TypeScript com union literals nas colunas enum do Supabase.
      const { data: raw } = await supabase
        .from("workspace_members")
        .select("workspace_id, status, user_id")

      type MemberRow = { workspace_id: string; user_id: string; status: string }
      const allMemberships = (raw ?? []) as unknown as MemberRow[]

      const ids = allMemberships
        .filter((m) => m.user_id === user.id && m.status === "active")
        .map((m) => m.workspace_id)

      if (!ids.length) {
        setLoading(false)
        return
      }
      const { data: rawWs } = await supabase
        .from("workspaces")
        .select("id, name, slug")
        .in("id", ids)

      const ws = (rawWs ?? []) as unknown as WorkspaceEntry[]

      if (ws.length) {
        setWorkspaces(ws)
        setCurrentId(ws[0].id)
      }
      setLoading(false)
    }

    load()
  }, [])

  const current = workspaces.find((w) => w.id === currentId)

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-2 py-2 text-sm text-slate-400">
        <Loader2 className="size-4 animate-spin" />
        <span className="truncate">Carregando...</span>
      </div>
    )
  }

  if (!current) {
    return (
      <div className="px-2 py-2 text-sm text-slate-500 truncate">
        Sem workspace
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800 transition-colors outline-none">
        <WorkspaceAvatar name={current.name} />
        <span className="truncate">{current.name}</span>
        <ChevronDown className="ml-auto size-4 shrink-0 text-slate-400" />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" sideOffset={8} className="min-w-52">
        {workspaces.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            onClick={() => setCurrentId(workspace.id)}
            className="gap-2"
          >
            <WorkspaceAvatar name={workspace.name} />
            {workspace.name}
            {workspace.id === currentId && (
              <Check className="ml-auto size-4 text-sky-500" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 text-muted-foreground">
          <Plus className="size-4" />
          Criar workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
