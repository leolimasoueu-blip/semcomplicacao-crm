"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Building2 } from "lucide-react"
import { AuthCard } from "@/components/shared/auth-card"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function OnboardingPage() {
  const router = useRouter()
  const [workspaceName, setWorkspaceName] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = workspaceName.trim()
    if (!trimmed) {
      setError("Nome do workspace é obrigatório")
      return
    }
    if (trimmed.length < 3) {
      setError("Nome deve ter no mínimo 3 caracteres")
      return
    }
    setError("")
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    router.push("/dashboard")
  }

  return (
    <AuthCard
      title="Configure seu workspace"
      description="Como você quer chamar sua empresa ou time?"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="workspace-name">Nome do workspace</Label>
          <div className="relative">
            <Building2 className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="workspace-name"
              type="text"
              placeholder="Ex: Minha Empresa"
              value={workspaceName}
              onChange={(e) => {
                setWorkspaceName(e.target.value)
                setError("")
              }}
              aria-invalid={!!error}
              className="pl-8"
              autoFocus
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full gap-2"
          disabled={isLoading}
        >
          {isLoading && (
            <LoadingSpinner size="sm" className="text-primary-foreground" />
          )}
          {isLoading ? "Criando workspace..." : "Criar workspace e entrar"}
        </Button>
      </form>
    </AuthCard>
  )
}
