import { Suspense } from "react"
import { Building2, Users, FileText, Eye } from "lucide-react"
import { StatCard } from "@/components/shared/stat-card"
import { getSystemStats } from "@/server/actions/dashboard"
import { getOrganizations } from "@/server/actions/organizations"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatRelativeDate } from "@/lib/helpers"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export const metadata = {
  title: "System Dashboard",
}

async function SystemStats() {
  const stats = await getSystemStats()

  if (!stats) {
    return <p className="text-muted-foreground">Erro ao carregar estatísticas</p>
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Organizações"
        value={stats.totalOrganizations}
        icon={Building2}
        description={`${stats.activeOrganizations} ativas`}
      />
      <StatCard
        title="Total de Usuários"
        value={stats.totalUsers}
        icon={Users}
        description="Em todas as organizações"
      />
      <StatCard
        title="Publicações"
        value={stats.totalPublications}
        icon={FileText}
        description={`${stats.publishedPublications} publicadas`}
      />
      <StatCard
        title="Taxa de Publicação"
        value={`${stats.totalPublications > 0 ? Math.round((stats.publishedPublications / stats.totalPublications) * 100) : 0}%`}
        icon={Eye}
        description="Publicações aprovadas"
      />
    </div>
  )
}

async function RecentOrganizations() {
  const result = await getOrganizations(1, 5)

  if (!result.data || result.data.length === 0) {
    return <p className="text-muted-foreground text-center py-8">Nenhuma organização encontrada</p>
  }

  return (
    <div className="space-y-4">
      {result.data.map((org: Record<string, unknown>) => (
        <Link
          key={org.id as string}
          href={`/system/organizacoes/${org.id}`}
          className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
        >
          <div>
            <p className="font-medium">{org.name as string}</p>
            <p className="text-sm text-muted-foreground">/{org.slug as string}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right text-sm">
              <p>{(org._count as Record<string, number>)?.users || 0} usuários</p>
              <p className="text-muted-foreground">{(org._count as Record<string, number>)?.publications || 0} publicações</p>
            </div>
            <Badge variant={org.isActive ? "secondary" : "outline"}>
              {org.isActive ? "Ativa" : "Inativa"}
            </Badge>
          </div>
        </Link>
      ))}
    </div>
  )
}

function LoadingStats() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-6 animate-pulse">
          <div className="h-4 w-24 bg-muted rounded mb-3" />
          <div className="h-8 w-16 bg-muted rounded" />
        </div>
      ))}
    </div>
  )
}

function LoadingList() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-3 animate-pulse">
          <div>
            <div className="h-4 w-32 bg-muted rounded mb-2" />
            <div className="h-3 w-24 bg-muted rounded" />
          </div>
          <div className="h-6 w-16 bg-muted rounded" />
        </div>
      ))}
    </div>
  )
}

export default function SystemDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">System Dashboard</h1>
        <p className="text-muted-foreground">Visão geral de todas as organizações</p>
      </div>

      <Suspense fallback={<LoadingStats />}>
        <SystemStats />
      </Suspense>

      <Card>
        <CardHeader>
          <CardTitle>Organizações Recentes</CardTitle>
          <CardDescription>Últimas organizações cadastradas</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<LoadingList />}>
            <RecentOrganizations />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
