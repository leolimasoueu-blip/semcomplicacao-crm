"use client"

import { useState, useEffect } from "react"
import { Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { MOCK_MEMBERS, MOCK_LEADS } from "@/lib/mock-data"
import { PIPELINE_STAGES } from "@/utils/pipeline-stages"
import type { Deal, DealStage } from "@/types"

interface FormData {
  title: string
  value: string
  lead_id: string
  owner_id: string
  stage: DealStage
  due_date: string
}

interface FormErrors {
  title?: string
  value?: string
}

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {}
  if (!data.title.trim()) errors.title = "Título é obrigatório"
  if (data.value && isNaN(Number(data.value.replace(",", ".")))) {
    errors.value = "Valor inválido"
  }
  return errors
}

const EMPTY_FORM = (stage: DealStage): FormData => ({
  title: "",
  value: "",
  lead_id: "",
  owner_id: "u1",
  stage,
  due_date: "",
})

export interface DealFormData {
  title: string
  value: number
  lead_id: string
  owner_id: string | null
  stage: DealStage
  due_date: string | null
}

interface DealFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  deal?: Deal
  defaultStage?: DealStage
  onSave: (data: DealFormData) => void
  onDelete?: (id: string) => void
}

export function DealFormModal({
  open,
  onOpenChange,
  mode,
  deal,
  defaultStage = "new_lead",
  onSave,
  onDelete,
}: DealFormModalProps) {
  const [form, setForm] = useState<FormData>(EMPTY_FORM(defaultStage))
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (open) {
      setErrors({})
      setConfirmDelete(false)
      if (mode === "edit" && deal) {
        setForm({
          title: deal.title,
          value: deal.value > 0 ? String(deal.value) : "",
          lead_id: deal.lead_id,
          owner_id: deal.owner_id ?? "u1",
          stage: deal.stage,
          due_date: deal.due_date ?? "",
        })
      } else {
        setForm(EMPTY_FORM(defaultStage))
      }
    }
  }, [open, mode, deal, defaultStage])

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((v) => ({ ...v, [key]: value }))
    if (key in errors) setErrors((v) => ({ ...v, [key]: undefined }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    onSave({
      title: form.title.trim(),
      value: form.value ? Number(form.value.replace(",", ".")) : 0,
      lead_id: form.lead_id,
      owner_id: form.owner_id || null,
      stage: form.stage,
      due_date: form.due_date || null,
    })
    setIsLoading(false)
    onOpenChange(false)
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    if (!deal || !onDelete) return
    setIsDeleting(true)
    await new Promise((r) => setTimeout(r, 800))
    onDelete(deal.id)
    setIsDeleting(false)
    onOpenChange(false)
  }

  const selectClass =
    "h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Novo Negócio" : "Editar Negócio"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 py-2">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="df-title">Título *</Label>
              <Input
                id="df-title"
                placeholder="Ex: Licença Pro — Empresa X"
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                aria-invalid={!!errors.title}
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="df-value">Valor (R$)</Label>
                <Input
                  id="df-value"
                  placeholder="0"
                  value={form.value}
                  onChange={(e) => setField("value", e.target.value)}
                  aria-invalid={!!errors.value}
                />
                {errors.value && <p className="text-xs text-destructive">{errors.value}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="df-due">Prazo</Label>
                <Input
                  id="df-due"
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setField("due_date", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="df-lead">Lead vinculado</Label>
              <select
                id="df-lead"
                value={form.lead_id}
                onChange={(e) => setField("lead_id", e.target.value)}
                className={selectClass}
              >
                <option value="">— selecione —</option>
                {MOCK_LEADS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}{l.company ? ` (${l.company})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="df-owner">Responsável</Label>
                <select
                  id="df-owner"
                  value={form.owner_id}
                  onChange={(e) => setField("owner_id", e.target.value)}
                  className={selectClass}
                >
                  {MOCK_MEMBERS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="df-stage">Etapa</Label>
                <select
                  id="df-stage"
                  value={form.stage}
                  onChange={(e) => setField("stage", e.target.value as DealStage)}
                  className={selectClass}
                >
                  {PIPELINE_STAGES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-2">
            {mode === "edit" && onDelete && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={
                  confirmDelete
                    ? "text-destructive hover:text-destructive hover:bg-destructive/10"
                    : "text-muted-foreground"
                }
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? <LoadingSpinner size="sm" /> : <Trash2 className="size-4" />}
                {confirmDelete ? "Confirmar exclusão" : "Excluir"}
              </Button>
            )}
            <div className="flex gap-2 sm:ml-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={isLoading || isDeleting}
              >
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={isLoading} className="gap-2">
                {isLoading && <LoadingSpinner size="sm" className="text-primary-foreground" />}
                {isLoading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
