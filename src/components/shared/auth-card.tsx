import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface AuthCardProps {
  title: string
  description?: string
  children: React.ReactNode
}

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="flex flex-col items-center gap-2">
        <div className="flex size-10 items-center justify-center rounded-xl bg-sky-500 text-sm font-bold text-white select-none">
          SC
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          SemComplicação
        </span>
      </div>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  )
}
