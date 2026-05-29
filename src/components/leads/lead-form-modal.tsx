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
import { MOCK_MEMBERS } from "@/lib/mock-data"
import type { Lead, LeadStatus } from "@/types"

const STATUS_OPTIONS: Array<{ value: LeadStatus; label: string }> = [
  { value: "new", label: "Novo" },
  { value: "contacted", label: "Contatado" },
  { value: "qualified", label: "Qualificado" },
  { value: "unqualified", label: "Desqualificado" },
  { value: "customer", label: "Cliente" },
]

interface FormData {
  name: string
  email: string
  phone: string
  company: string
  position: string
  status: LeadStatus
  owner_id: string
}

interface FormErrors {
  name?: string
  email?: string
}

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {}
  if (!data.name.trim()) errors.name = "Nome é obrigatório"
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "E-mail inválido"
  }
  return errors
}

const EMPTY_FORM: FormData = {
  name: "",
  email: "",
  phone: "",
  company: "",
  position: "",
  status: "new",
  owner_id: "u1",
}

export interface LeadFormData extends FormData {}

interface LeadFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  lead?: Lead
  onSave: (data: LeadFormData) => void
  onDelete?: (id: string) => void
}

export function LeadFormModal({
  open,
  onOpenChange,
  mode,
  lead,
  onSave,
  onDelete,
}: LeadFormModalProps) {
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (open) {
      setErrors({})
      setConfirmDelete(false)
      if (mode === "edit" && lead) {
        setForm({
          name: lead.name,
          email: lead.email ?? "",
          phone: lead.phone ?? "",
          company: lead.company ?? "",
          position: lead.position ?? "",
          status: lead.status,
          owner_id: lead.owner_id ?? "u1",
        })
      } else {
        setForm(EMPTY_FORM)
      }
    }
  }, [open, mode, lead])

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
    onSave(form)
    setIsLoading(false)
    onOpenChange(false)
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    if (!lead || !onDelete) return
    setIsDeleting(true)
    await new Promise((r) => setTimeout(r, 800))
    onDelete(lead.id)
    setIsDeleting(false)
    onOpenChange(false)
  }

  const selectClass =
    "h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Novo Lead" : "Editar Lead"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="lf-name">Nome *</Label>
                <Input
                  id="lf-name"
                  placeholder="Nome completo"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  aria-invalid={!!errors.name}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lf-email">E-mail</Label>
                <Input
                  id="lf-email"
                  type="email"
                  placeholder="email@empresa.com"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  aria-invalid={!!errors.email}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lf-phone">Telefone</Label>
                <Input
                  id="lf-phone"
                  placeholder="(11) 99999-9999"
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lf-company">Empresa</Label>
                <Input
                  id="lf-company"
                  placeholder="Nome da empresa"
                  value={form.company}
                  onChange={(e) => setField("company", e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lf-position">Cargo</Label>
                <Input
                  id="lf-position"
                  placeholder="Ex: CEO, Gerente"
                  value={form.position}
                  onChange={(e) => setField("position", e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lf-status">Status</Label>
                <select
                  id="lf-status"
                  value={form.status}
                  onChange={(e) => setField("status", e.target.value as LeadStatus)}
                  className={selectClass}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lf-owner">Responsável</Label>
                <select
                  id="lf-owner"
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
            </div>
          </div>

          <DialogFooter className="mt-2">
            {mode === "edit" && onDelete && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={confirmDelete ? "text-destructive hover:text-destructive hover:bg-destructive/10" : "text-muted-foreground"}
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Trash2 className="size-4" />
                )}
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
