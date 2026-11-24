import { Suspense } from "react"
import { Plus, FolderTree } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCategories } from "@/server/actions/categories"
import { EmptyState } from "@/components/shared/empty-state"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CategoryWithChildren } from "@/types"

export const metadata = {
  title: "Categorias",
}

function CategoryItem({ category, level = 0 }: { category: CategoryWithChildren; level?: number }) {
  return (
    <div>
      <div
        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
        style={{ paddingLeft: `${(level * 24) + 12}px` }}
      >
        <div className="flex items-center gap-3">
          <FolderTree className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="font-medium">{category.name}</p>
            {category.description && (
              <p className="text-sm text-muted-foreground">{category.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {category._count?.publications || 0} publicações
          </span>
          <Button variant="ghost" size="sm">
            Editar
          </Button>
        </div>
      </div>
      {category.children && category.children.length > 0 && (
        <div>
          {category.children.map((child) => (
            <CategoryItem key={child.id} category={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

async function CategoriesList() {
  const categories = await getCategories()

  if (!categories || categories.length === 0) {
    return (
      <EmptyState
        icon={FolderTree}
        title="Nenhuma categoria encontrada"
        description="Crie categorias para organizar suas publicações"
        action={{
          label: "Criar categoria",
          onClick: () => {},
        }}
      />
    )
  }

  return (
    <div className="space-y-1">
      {categories.map((category) => (
        <CategoryItem key={category.id} category={category} />
      ))}
    </div>
  )
}

function LoadingCategories() {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3 animate-pulse">
          <div className="h-4 w-4 bg-muted rounded" />
          <div className="flex-1">
            <div className="h-4 w-32 bg-muted rounded mb-2" />
            <div className="h-3 w-48 bg-muted rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Categorias</h1>
          <p className="text-muted-foreground">Organize suas publicações em categorias</p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          Nova categoria
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hierarquia de Categorias</CardTitle>
          <CardDescription>
            Arraste para reordenar ou clique para editar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<LoadingCategories />}>
            <CategoriesList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
