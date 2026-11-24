import { Suspense } from "react"
import { FileText, Users, Eye, MessageSquare, Clock, AlertCircle } from "lucide-react"
import { StatCard } from "@/components/shared/stat-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { getDashboardStats, getRecentPublications, getRecentActivity } from "@/server/actions/dashboard"
import { formatRelativeDate } from "@/lib/helpers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export const metadata = {
  title: "Dashboard",
}

async function DashboardStats() {
  const stats = await getDashboardStats()

  if (!stats) {
    return <p className="text-muted-foreground">Erro ao carregar estatísticas</p>
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total de Publicações"
        value={stats.totalPublications}
        icon={FileText}
        description={`${stats.publishedPublications} publicadas`}
      />
      <StatCard
        title="Aguardando Revisão"
        value={stats.pendingPublications}
        icon={Clock}
        description="Publicações pendentes"
      />
      <StatCard
        title="Total de Visualizações"
        value={stats.totalViews.toLocaleString("pt-BR")}
        icon={Eye}
        description="Em todas as publicações"
      />
      <StatCard
        title="Comentários Pendentes"
        value={stats.pendingComments}
        icon={MessageSquare}
        description="Aguardando moderação"
      />
    </div>
  )
}

async function RecentPublications() {
  const publications = await getRecentPublications(5)

  if (!publications || publications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <FileText className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">Nenhuma publicação encontrada</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {publications.map((publication) => (
        <Link
          key={publication.id}
          href={`/admin/publicacoes/${publication.id}`}
          className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
        >
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{publication.title}</p>
            <p className="text-sm text-muted-foreground">
              {publication.author.name} · {formatRelativeDate(publication.createdAt)}
            </p>
          </div>
          <StatusBadge status={publication.status} />
        </Link>
      ))}
    </div>
  )
}

async function RecentActivity() {
  const activity = await getRecentActivity(8)

  if (!activity || activity.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">Nenhuma atividade recente</p>
      </div>
    )
  }

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      CREATED: "criou",
      UPDATED: "atualizou",
      STATUS_CHANGED: "alterou o status de",
      DELETED: "excluiu",
    }
    return labels[action] || action.toLowerCase()
  }

  return (
    <div className="space-y-4">
      {activity.map((log) => (
        <div key={log.id} className="flex items-start gap-3 text-sm">
          <div className="flex-1">
            <p>
              <span className="font-medium">{log.user.name}</span>{" "}
              {getActionLabel(log.action)}{" "}
              <Link
                href={`/admin/publicacoes/${log.publicationId}`}
                className="font-medium hover:underline"
              >
                {log.publication.title}
              </Link>
            </p>
            {log.observation && (
              <p className="text-muted-foreground mt-1">{log.observation}</p>
            )}
            <p className="text-muted-foreground text-xs mt-1">
              {formatRelativeDate(log.createdAt)}
            </p>
          </div>
        </div>
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
            <div className="h-4 w-48 bg-muted rounded mb-2" />
            <div className="h-3 w-32 bg-muted rounded" />
          </div>
          <div className="h-6 w-20 bg-muted rounded-full" />
        </div>
      ))}
    </div>
  )
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral da sua plataforma</p>
      </div>

      <Suspense fallback={<LoadingStats />}>
        <DashboardStats />
      </Suspense>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Publicações Recentes</CardTitle>
            <CardDescription>Últimas publicações criadas</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<LoadingList />}>
              <RecentPublications />
            </Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Últimas ações no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<LoadingList />}>
              <RecentActivity />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
