"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import { AuthCard } from "@/components/shared/auth-card"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) {
      setError("E-mail é obrigatório")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("E-mail inválido")
      return
    }
    setError("")
    setIsLoading(true)

    const supabase = getSupabaseBrowserClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    })

    setIsLoading(false)

    if (resetError) {
      setError("Erro ao enviar e-mail. Tente novamente.")
      return
    }

    setSent(true)
  }

  return (
    <AuthCard
      title="Recuperar senha"
      description={sent ? undefined : "Enviaremos um link para redefinir sua senha"}
    >
      {sent ? (
        <div className="space-y-4 text-center">
          <div className="flex flex-col items-center gap-3">
            <CheckCircle2 className="size-12 text-sky-400" />
            <p className="text-sm text-muted-foreground">
              Enviamos um link de recuperação para{" "}
              <span className="font-medium text-foreground">{email}</span>.
              Verifique sua caixa de entrada.
            </p>
          </div>
          <Link href="/login">
            <Button variant="outline" size="lg" className="w-full gap-2">
              <ArrowLeft className="size-4" />
              Voltar ao login
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="voce@empresa.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError("") }}
                aria-invalid={!!error}
                autoComplete="email"
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>

            <Button type="submit" size="lg" className="w-full gap-2" disabled={isLoading}>
              {isLoading && (
                <LoadingSpinner size="sm" className="text-primary-foreground" />
              )}
              {isLoading ? "Enviando..." : "Enviar link de recuperação"}
            </Button>
          </form>

          <p className="mt-4 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-sky-400"
            >
              <ArrowLeft className="size-3.5" />
              Voltar ao login
            </Link>
          </p>
        </>
      )}
    </AuthCard>
  )
}
