import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { FolderOpen, FileText } from "lucide-react"

async function getCategories() {
  return [
    { id: "1", name: "Educação", slug: "educacao", description: "Políticas educacionais, pedagogia e desenvolvimento", count: 24 },
    { id: "2", name: "Meio Ambiente", slug: "meio-ambiente", description: "Sustentabilidade, ecologia e mudanças climáticas", count: 18 },
    { id: "3", name: "Tecnologia", slug: "tecnologia", description: "Inovação, transformação digital e sociedade", count: 15 },
    { id: "4", name: "Saúde", slug: "saude", description: "Saúde pública, medicina e bem-estar", count: 21 },
    { id: "5", name: "Política", slug: "politica", description: "Democracia, governança e políticas públicas", count: 32 },
    { id: "6", name: "Urbanismo", slug: "urbanismo", description: "Cidades, mobilidade e planejamento urbano", count: 12 },
    { id: "7", name: "Economia", slug: "economia", description: "Mercados, finanças e desenvolvimento econômico", count: 28 },
    { id: "8", name: "Cultura", slug: "cultura", description: "Arte, patrimônio e expressões culturais", count: 16 },
  ]
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Categorias
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Explore as publicações por área de conhecimento
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category) => (
            <Link key={category.id} href={`/categorias/${category.slug}`}>
              <Card className="group h-full transition-all hover:shadow-md hover:border-foreground/20">
                <CardHeader className="pb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted transition-colors group-hover:bg-foreground group-hover:text-background">
                    <FolderOpen className="h-6 w-6" />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold">
                    {category.name}
                  </h2>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{category.count} publicações</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
