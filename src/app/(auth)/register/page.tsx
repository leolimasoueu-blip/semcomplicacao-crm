"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AuthCard } from "@/components/shared/auth-card"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface FormErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
}

function validate(
  name: string,
  email: string,
  password: string,
  confirmPassword: string
): FormErrors {
  const errors: FormErrors = {}
  if (!name.trim()) {
    errors.name = "Nome é obrigatório"
  }
  if (!email) {
    errors.email = "E-mail é obrigatório"
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "E-mail inválido"
  }
  if (!password) {
    errors.password = "Senha é obrigatória"
  } else if (password.length < 8) {
    errors.password = "Senha deve ter no mínimo 8 caracteres"
  }
  if (!confirmPassword) {
    errors.confirmPassword = "Confirme sua senha"
  } else if (confirmPassword !== password) {
    errors.confirmPassword = "As senhas não coincidem"
  }
  return errors
}

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  function clearError(field: keyof FormErrors) {
    setErrors((v) => ({ ...v, [field]: undefined }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate(name, email, password, confirmPassword)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    router.push("/onboarding")
  }

  return (
    <AuthCard
      title="Criar sua conta"
      description="Comece grátis, sem cartão de crédito"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="name">Nome completo</Label>
          <Input
            id="name"
            type="text"
            placeholder="Seu nome"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              clearError("name")
            }}
            aria-invalid={!!errors.name}
            autoComplete="name"
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="voce@empresa.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              clearError("email")
            }}
            aria-invalid={!!errors.email}
            autoComplete="email"
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              clearError("password")
            }}
            aria-invalid={!!errors.password}
            autoComplete="new-password"
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm-password">Confirmar senha</Label>
          <Input
            id="confirm-password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              clearError("confirmPassword")
            }}
            aria-invalid={!!errors.confirmPassword}
            autoComplete="new-password"
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">{errors.confirmPassword}</p>
          )}
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
          {isLoading ? "Criando conta..." : "Criar conta"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Já tem uma conta?{" "}
        <Link
          href="/login"
          className="font-medium text-sky-400 transition-colors hover:text-sky-300"
        >
          Fazer login
        </Link>
      </p>
    </AuthCard>
  )
}
