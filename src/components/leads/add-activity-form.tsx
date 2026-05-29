"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { ACTIVITY_CONFIG } from "@/components/leads/activity-item"
import type { ActivityType } from "@/types"

const ACTIVITY_TYPES: ActivityType[] = ["call", "email", "meeting", "note"]

interface AddActivityFormProps {
  onAdd: (type: ActivityType, description: string) => void
}

export function AddActivityForm({ onAdd }: AddActivityFormProps) {
  const [type, setType] = useState<ActivityType>("note")
  const [description, setDescription] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!description.trim()) {
      setError("Descreva a atividade")
      return
    }
    setError("")
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    onAdd(type, description.trim())
    setDescription("")
    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {ACTIVITY_TYPES.map((t) => {
          const config = ACTIVITY_CONFIG[t]
          const Icon = config.icon
          return (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                type === t
                  ? "bg-foreground text-background border-foreground"
                  : "bg-transparent text-muted-foreground border-input hover:border-foreground/30"
              }`}
            >
              <Icon className="size-3" />
              {config.label}
            </button>
          )
        })}
      </div>

      <div className="space-y-1.5">
        <textarea
          placeholder="Descreva a atividade..."
          value={description}
          onChange={(e) => {
            setDescription(e.target.value)
            setError("")
          }}
          rows={3}
          aria-invalid={!!error}
          className={`w-full rounded-lg border bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 resize-none transition-colors ${
            error ? "border-destructive" : "border-input"
          }`}
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <Button type="submit" size="sm" disabled={isLoading} className="gap-2">
        {isLoading && <LoadingSpinner size="sm" className="text-primary-foreground" />}
        {isLoading ? "Registrando..." : "Registrar atividade"}
      </Button>
    </form>
  )
}
