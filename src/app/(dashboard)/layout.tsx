import { getSupabaseServerClient } from "@/lib/supabase/server"
import { AppShell } from "@/components/shared/app-shell"
import type { AppUser } from "@/types/app"

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let appUser: AppUser | null = null
  if (user) {
    const displayName =
      (user.user_metadata?.full_name as string | undefined) ??
      user.email?.split("@")[0] ??
      "Usuário"
    appUser = {
      id: user.id,
      email: user.email ?? null,
      displayName,
      initials: getInitials(displayName),
    }
  }

  return <AppShell user={appUser}>{children}</AppShell>
}
