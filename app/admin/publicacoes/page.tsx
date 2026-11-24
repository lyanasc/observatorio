import { Suspense } from "react"
import Link from "next/link"
import { Plus, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getPublications } from "@/server/actions/publications"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { formatRelativeDate } from "@/lib/helpers"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/lib/helpers"

export const metadata = {
  title: "Publicações",
}

interface PageProps {
  searchParams: Promise<{ page?: string; status?: string; search?: string }>
}

async function PublicationsTable({ page, status, search }: { page: number; status?: string; search?: string }) {
  const filters: Record<string, unknown> = {}
  if (status) filters.status = status
  if (search) filters.search = search

  const result = await getPublications(filters, page, 10)

  if (!result.data || result.data.length === 0) {
    return (
      <EmptyState
        title="Nenhuma publicação encontrada"
        description="Comece criando sua primeira publicação"
        action={{
          label: "Criar publicação",
          onClick: () => {},
        }}
      />
    )
  }

  return (
    <>
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Autor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.data.map((publication: Record<string, unknown>) => (
              <TableRow key={publication.id as string}>
                <TableCell>
                  <Link
                    href={`/admin/publicacoes/${publication.id}`}
                    className="font-medium hover:underline"
                  >
                    {publication.title as string}
                  </Link>
                  {publication.excerpt && (
                    <p className="text-sm text-muted-foreground truncate max-w-md">
                      {publication.excerpt as string}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={(publication.author as Record<string, unknown>)?.avatar as string || ""} />
                      <AvatarFallback className="text-xs">
                        {getInitials((publication.author as Record<string, unknown>)?.name as string || "")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{(publication.author as Record<string, unknown>)?.name as string}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={publication.status as string} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatRelativeDate(publication.createdAt as Date)}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/publicacoes/${publication.id}/editar`}>
                      Editar
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {result.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {Array.from({ length: result.pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="sm"
              asChild
            >
              <Link href={`/admin/publicacoes?page=${p}${status ? `&status=${status}` : ""}${search ? `&search=${search}` : ""}`}>
                {p}
              </Link>
            </Button>
          ))}
        </div>
      )}
    </>
  )
}

function LoadingTable() {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 animate-pulse">
            <div className="flex-1">
              <div className="h-4 w-48 bg-muted rounded mb-2" />
              <div className="h-3 w-64 bg-muted rounded" />
            </div>
            <div className="h-6 w-6 bg-muted rounded-full" />
            <div className="h-6 w-20 bg-muted rounded-full" />
            <div className="h-4 w-24 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function PublicationsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = parseInt(params.page || "1")
  const status = params.status
  const search = params.search

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Publicações</h1>
          <p className="text-muted-foreground">Gerencie suas publicações</p>
        </div>
        <Button asChild>
          <Link href="/admin/publicacoes/nova">
            <Plus className="h-4 w-4" />
            Nova publicação
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar publicações..." className="pl-9" />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <Suspense fallback={<LoadingTable />}>
        <PublicationsTable page={page} status={status} search={search} />
      </Suspense>
    </div>
  )
}
