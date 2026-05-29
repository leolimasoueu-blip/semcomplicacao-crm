"use client"

import { useState } from "react"
import { Check, ChevronDown, Plus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const MOCK_WORKSPACES = [
  { id: "1", name: "Minha Empresa", slug: "minha-empresa" },
  { id: "2", name: "Projeto Freelance", slug: "projeto-freelance" },
]

function WorkspaceAvatar({ name }: { name: string }) {
  return (
    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-sky-500 text-xs font-bold text-white">
      {name.charAt(0).toUpperCase()}
    </span>
  )
}

export function WorkspaceSwitcher() {
  const [currentId, setCurrentId] = useState(MOCK_WORKSPACES[0].id)
  const current = MOCK_WORKSPACES.find((w) => w.id === currentId)!

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800 transition-colors outline-none">
        <WorkspaceAvatar name={current.name} />
        <span className="truncate">{current.name}</span>
        <ChevronDown className="ml-auto size-4 shrink-0 text-slate-400" />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" sideOffset={8} className="min-w-52">
        {MOCK_WORKSPACES.map((workspace) => (
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
