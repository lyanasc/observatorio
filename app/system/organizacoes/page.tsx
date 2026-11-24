import { Suspense } from "react"
import Link from "next/link"
import { Plus, Search, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getOrganizations } from "@/server/actions/organizations"
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
import { Badge } from "@/components/ui/badge"

export const metadata = {
  title: "Organizações",
}

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string }>
}

async function OrganizationsTable({ page, search }: { page: number; search?: string }) {
  const result = await getOrganizations(page, 10, search)

  if (!result.data || result.data.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="Nenhuma organização encontrada"
        description="Crie a primeira organização da plataforma"
        action={{
          label: "Criar organização",
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
              <TableHead>Organização</TableHead>
              <TableHead>Usuários</TableHead>
              <TableHead>Publicações</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criada em</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.data.map((org: Record<string, unknown>) => (
              <TableRow key={org.id as string}>
                <TableCell>
                  <div>
                    <p className="font-medium">{org.name as string}</p>
                    <p className="text-sm text-muted-foreground">/{org.slug as string}</p>
                  </div>
                </TableCell>
                <TableCell>
                  {(org._count as Record<string, number>)?.users || 0}
                </TableCell>
                <TableCell>
                  {(org._count as Record<string, number>)?.publications || 0}
                </TableCell>
                <TableCell>
                  {org.isActive ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Ativa
                    </Badge>
                  ) : (
                    <Badge variant="outline">Inativa</Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatRelativeDate(org.createdAt as Date)}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/system/organizacoes/${org.id}`}>
                      Gerenciar
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
              <Link href={`/system/organizacoes?page=${p}${search ? `&search=${search}` : ""}`}>
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
              <div className="h-4 w-32 bg-muted rounded mb-2" />
              <div className="h-3 w-24 bg-muted rounded" />
            </div>
            <div className="h-4 w-12 bg-muted rounded" />
            <div className="h-4 w-12 bg-muted rounded" />
            <div className="h-6 w-16 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function OrganizationsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = parseInt(params.page || "1")
  const search = params.search

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Organizações</h1>
          <p className="text-muted-foreground">Gerencie todas as organizações da plataforma</p>
        </div>
        <Button asChild>
          <Link href="/system/organizacoes/nova">
            <Plus className="h-4 w-4" />
            Nova organização
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar organizações..." className="pl-9" />
        </div>
      </div>

      <Suspense fallback={<LoadingTable />}>
        <OrganizationsTable page={page} search={search} />
      </Suspense>
    </div>
  )
}
