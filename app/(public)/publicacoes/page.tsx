import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Calendar, User } from "lucide-react"

// This would be replaced with real data fetching
async function getPublications(searchParams: {
  page?: string
  category?: string
  search?: string
}) {
  // Simulated data
  const publications = [
    {
      id: "1",
      title: "O Impacto das Políticas Públicas na Educação Brasileira",
      excerpt: "Uma análise detalhada sobre como as políticas educacionais têm transformado o cenário da educação no Brasil nos últimos anos.",
      author: { name: "Maria Silva" },
      category: { name: "Educação", slug: "educacao" },
      publishedAt: new Date("2024-03-15"),
      slug: "impacto-politicas-publicas-educacao",
      readTime: 8,
    },
    {
      id: "2",
      title: "Sustentabilidade e Desenvolvimento Econômico",
      excerpt: "Explorando a intersecção entre crescimento econômico sustentável e preservação ambiental no contexto latino-americano.",
      author: { name: "João Santos" },
      category: { name: "Meio Ambiente", slug: "meio-ambiente" },
      publishedAt: new Date("2024-03-10"),
      slug: "sustentabilidade-desenvolvimento-economico",
      readTime: 12,
    },
    {
      id: "3",
      title: "Tecnologia e Inclusão Social",
      excerpt: "Como a tecnologia pode ser utilizada como ferramenta de inclusão social e redução de desigualdades.",
      author: { name: "Ana Costa" },
      category: { name: "Tecnologia", slug: "tecnologia" },
      publishedAt: new Date("2024-03-05"),
      slug: "tecnologia-inclusao-social",
      readTime: 6,
    },
    {
      id: "4",
      title: "Saúde Mental no Ambiente de Trabalho",
      excerpt: "Um estudo sobre os impactos do trabalho remoto na saúde mental dos trabalhadores brasileiros pós-pandemia.",
      author: { name: "Carlos Mendes" },
      category: { name: "Saúde", slug: "saude" },
      publishedAt: new Date("2024-02-28"),
      slug: "saude-mental-ambiente-trabalho",
      readTime: 10,
    },
    {
      id: "5",
      title: "Democracia Digital e Participação Cidadã",
      excerpt: "Análise das novas formas de participação política mediadas por tecnologias digitais e seu impacto na democracia.",
      author: { name: "Paula Ferreira" },
      category: { name: "Política", slug: "politica" },
      publishedAt: new Date("2024-02-20"),
      slug: "democracia-digital-participacao-cidada",
      readTime: 15,
    },
    {
      id: "6",
      title: "Urbanização e Mobilidade Sustentável",
      excerpt: "Desafios e soluções para a mobilidade urbana nas grandes cidades brasileiras em busca de sustentabilidade.",
      author: { name: "Ricardo Lima" },
      category: { name: "Urbanismo", slug: "urbanismo" },
      publishedAt: new Date("2024-02-15"),
      slug: "urbanizacao-mobilidade-sustentavel",
      readTime: 9,
    },
  ]

  const categories = [
    { name: "Educação", slug: "educacao" },
    { name: "Meio Ambiente", slug: "meio-ambiente" },
    { name: "Tecnologia", slug: "tecnologia" },
    { name: "Saúde", slug: "saude" },
    { name: "Política", slug: "politica" },
    { name: "Urbanismo", slug: "urbanismo" },
  ]

  return { publications, categories, total: 24, page: 1, pageSize: 6 }
}

export default async function PublicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string; search?: string }>
}) {
  const params = await searchParams
  const { publications, categories, total, page, pageSize } = await getPublications(params)
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Publicações
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Explore todas as publicações do Observatório
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar publicações..."
              className="pl-10"
              defaultValue={params.search}
            />
          </div>
          <div className="flex gap-4">
            <Select defaultValue={params.category || "all"}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.slug} value={cat.slug}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select defaultValue="recent">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Mais Recentes</SelectItem>
                <SelectItem value="popular">Mais Populares</SelectItem>
                <SelectItem value="title">Título A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Publications Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {publications.map((pub) => (
            <Card key={pub.id} className="group flex flex-col transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/categorias/${pub.category.slug}`}
                    className="rounded-full bg-muted px-3 py-1 text-xs font-medium transition-colors hover:bg-muted/80"
                  >
                    {pub.category.name}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {pub.readTime} min de leitura
                  </span>
                </div>
                <Link href={`/publicacoes/${pub.slug}`}>
                  <h2 className="mt-2 line-clamp-2 text-lg font-semibold leading-tight transition-colors group-hover:text-primary">
                    {pub.title}
                  </h2>
                </Link>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <p className="line-clamp-3 flex-1 text-sm text-muted-foreground">
                  {pub.excerpt}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{pub.author.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {pub.publishedAt.toLocaleDateString("pt-BR", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
            >
              Anterior
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={p === page ? "default" : "ghost"}
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  {p}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
            >
              Próxima
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
