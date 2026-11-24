import { Suspense } from "react"
import { Plus, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getTags } from "@/server/actions/categories"
import { EmptyState } from "@/components/shared/empty-state"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const metadata = {
  title: "Tags",
}

async function TagsList() {
  const tags = await getTags()

  if (!tags || tags.length === 0) {
    return (
      <EmptyState
        icon={Tag}
        title="Nenhuma tag encontrada"
        description="Crie tags para marcar suas publicações"
        action={{
          label: "Criar tag",
          onClick: () => {},
        }}
      />
    )
  }

  return (
    <div className="flex flex-wrap gap-3">
      {tags.map((tag) => (
        <div
          key={tag.id}
          className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-muted transition-colors cursor-pointer"
        >
          <Tag className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{tag.name}</span>
          <Badge variant="secondary" className="ml-2">
            {tag._count?.publications || 0}
          </Badge>
        </div>
      ))}
    </div>
  )
}

function LoadingTags() {
  return (
    <div className="flex flex-wrap gap-3">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex items-center gap-2 p-3 rounded-lg border border-border animate-pulse">
          <div className="h-4 w-4 bg-muted rounded" />
          <div className="h-4 w-20 bg-muted rounded" />
          <div className="h-5 w-8 bg-muted rounded-full ml-2" />
        </div>
      ))}
    </div>
  )
}

export default function TagsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tags</h1>
          <p className="text-muted-foreground">Marque suas publicações com tags</p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          Nova tag
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todas as Tags</CardTitle>
          <CardDescription>
            Clique em uma tag para editar ou ver publicações relacionadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<LoadingTags />}>
            <TagsList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
