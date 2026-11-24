import { Suspense } from "react"
import Link from "next/link"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getUsers } from "@/server/actions/organizations"
import { EmptyState } from "@/components/shared/empty-state"
import { formatRelativeDate, getRoleLabel } from "@/lib/helpers"
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
import { Badge } from "@/components/ui/badge"

export const metadata = {
  title: "Usuários",
}

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string }>
}

async function UsersTable({ page, search }: { page: number; search?: string }) {
  const result = await getUsers(page, 10, search)

  if (!result.data || result.data.length === 0) {
    return (
      <EmptyState
        title="Nenhum usuário encontrado"
        description="Convide usuários para sua organização"
        action={{
          label: "Adicionar usuário",
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
              <TableHead>Usuário</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Publicações</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.data.map((user: Record<string, unknown>) => (
              <TableRow key={user.id as string}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar as string || ""} />
                      <AvatarFallback className="text-xs">
                        {getInitials(user.name as string || "")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name as string}</p>
                      <p className="text-sm text-muted-foreground">{user.email as string}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {getRoleLabel(user.role as string)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {(user._count as Record<string, number>)?.publications || 0}
                </TableCell>
                <TableCell>
                  {user.isActive ? (
                    <span className="text-green-600 text-sm">Ativo</span>
                  ) : (
                    <span className="text-red-600 text-sm">Inativo</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatRelativeDate(user.createdAt as Date)}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/usuarios/${user.id}`}>
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
              <Link href={`/admin/usuarios?page=${p}${search ? `&search=${search}` : ""}`}>
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
            <div className="h-8 w-8 bg-muted rounded-full" />
            <div className="flex-1">
              <div className="h-4 w-32 bg-muted rounded mb-2" />
              <div className="h-3 w-48 bg-muted rounded" />
            </div>
            <div className="h-6 w-20 bg-muted rounded" />
            <div className="h-4 w-16 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function UsersPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = parseInt(params.page || "1")
  const search = params.search

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Usuários</h1>
          <p className="text-muted-foreground">Gerencie os usuários da sua organização</p>
        </div>
        <Button asChild>
          <Link href="/admin/usuarios/novo">
            <Plus className="h-4 w-4" />
            Adicionar usuário
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar usuários..." className="pl-9" />
        </div>
      </div>

      <Suspense fallback={<LoadingTable />}>
        <UsersTable page={page} search={search} />
      </Suspense>
    </div>
  )
}
