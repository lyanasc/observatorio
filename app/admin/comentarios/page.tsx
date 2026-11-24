import { Suspense } from "react"
import { MessageSquare, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getComments } from "@/server/actions/comments"
import { EmptyState } from "@/components/shared/empty-state"
import { formatRelativeDate, truncate } from "@/lib/helpers"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export const metadata = {
  title: "Comentários",
}

async function CommentsTable({ isApproved }: { isApproved?: boolean }) {
  const result = await getComments(1, 20, { isApproved })

  if (!result.data || result.data.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title={isApproved === false ? "Nenhum comentário pendente" : "Nenhum comentário encontrado"}
        description={isApproved === false ? "Todos os comentários foram moderados" : "Os comentários aparecerão aqui"}
      />
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Autor</TableHead>
            <TableHead>Comentário</TableHead>
            <TableHead>Publicação</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="w-[120px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {result.data.map((comment: Record<string, unknown>) => (
            <TableRow key={comment.id as string}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={(comment.author as Record<string, unknown>)?.avatar as string || ""} />
                    <AvatarFallback className="text-xs">
                      {getInitials((comment.author as Record<string, unknown>)?.name as string || "")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{(comment.author as Record<string, unknown>)?.name as string}</span>
                </div>
              </TableCell>
              <TableCell className="max-w-md">
                <p className="text-sm">{truncate(comment.content as string, 100)}</p>
              </TableCell>
              <TableCell>
                <Link
                  href={`/admin/publicacoes/${(comment.publication as Record<string, unknown>)?.id}`}
                  className="text-sm hover:underline"
                >
                  {truncate((comment.publication as Record<string, unknown>)?.title as string, 30)}
                </Link>
              </TableCell>
              <TableCell>
                {comment.isApproved ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Aprovado
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    Pendente
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatRelativeDate(comment.createdAt as Date)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  {!comment.isApproved && (
                    <Button variant="ghost" size="icon-sm" className="text-green-600">
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon-sm" className="text-red-600">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function LoadingTable() {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 animate-pulse">
            <div className="h-6 w-6 bg-muted rounded-full" />
            <div className="flex-1">
              <div className="h-4 w-full max-w-md bg-muted rounded" />
            </div>
            <div className="h-4 w-24 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function CommentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Comentários</h1>
        <p className="text-muted-foreground">Modere os comentários das publicações</p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
          <TabsTrigger value="approved">Aprovados</TabsTrigger>
          <TabsTrigger value="all">Todos</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-4">
          <Suspense fallback={<LoadingTable />}>
            <CommentsTable isApproved={false} />
          </Suspense>
        </TabsContent>
        <TabsContent value="approved" className="mt-4">
          <Suspense fallback={<LoadingTable />}>
            <CommentsTable isApproved={true} />
          </Suspense>
        </TabsContent>
        <TabsContent value="all" className="mt-4">
          <Suspense fallback={<LoadingTable />}>
            <CommentsTable />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}
