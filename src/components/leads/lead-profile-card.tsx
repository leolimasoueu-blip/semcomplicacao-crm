import { Mail, Phone, Building2, Briefcase, User, Calendar, Pencil } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LeadStatusBadge } from "@/components/leads/lead-status-badge"
import { getMemberById } from "@/lib/mock-data"
import type { Lead } from "@/types"

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(dateStr))
}

interface InfoRowProps {
  icon: React.ElementType
  label: string
  value: string | null | undefined
  href?: string
}

function InfoRow({ icon: Icon, label, value, href }: InfoRowProps) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3">
      <Icon className="size-4 shrink-0 text-muted-foreground mt-0.5" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        {href ? (
          <a href={href} className="text-sm text-sky-500 hover:underline truncate block">
            {value}
          </a>
        ) : (
          <p className="text-sm text-foreground truncate">{value}</p>
        )}
      </div>
    </div>
  )
}

interface LeadProfileCardProps {
  lead: Lead
  onEdit: () => void
}

export function LeadProfileCard({ lead, onEdit }: LeadProfileCardProps) {
  const owner = getMemberById(lead.owner_id)

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-sky-100 text-base font-semibold text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
              {getInitials(lead.name)}
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-foreground truncate">
                {lead.name}
              </h2>
              {lead.position && (
                <p className="text-xs text-muted-foreground truncate">{lead.position}</p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onEdit} className="shrink-0">
            <Pencil className="size-4" />
            <span className="sr-only">Editar lead</span>
          </Button>
        </div>
        <div className="mt-3">
          <LeadStatusBadge status={lead.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        <div className="space-y-3">
          <InfoRow icon={Mail} label="E-mail" value={lead.email} href={lead.email ? `mailto:${lead.email}` : undefined} />
          <InfoRow icon={Phone} label="Telefone" value={lead.phone} href={lead.phone ? `tel:${lead.phone}` : undefined} />
          <InfoRow icon={Building2} label="Empresa" value={lead.company} />
          <InfoRow icon={Briefcase} label="Cargo" value={lead.position} />
        </div>

        <div className="border-t pt-4 space-y-3">
          {owner && (
            <div className="flex items-center gap-3">
              <User className="size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Responsável</p>
                <p className="text-sm text-foreground">{owner.name}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Calendar className="size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Lead desde</p>
              <p className="text-sm text-foreground">{formatDate(lead.created_at)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
