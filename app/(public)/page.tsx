import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ArrowRight, BookOpen, Users, TrendingUp } from "lucide-react"

// This would fetch from the database in production
async function getFeaturedPublications() {
  // Simulated data for now - will be replaced with real DB queries
  return [
    {
      id: "1",
      title: "O Impacto das Políticas Públicas na Educação Brasileira",
      excerpt: "Uma análise detalhada sobre como as políticas educacionais têm transformado o cenário da educação no Brasil nos últimos anos.",
      author: "Maria Silva",
      category: "Educação",
      publishedAt: new Date("2024-03-15"),
      slug: "impacto-politicas-publicas-educacao",
    },
    {
      id: "2",
      title: "Sustentabilidade e Desenvolvimento Econômico",
      excerpt: "Explorando a intersecção entre crescimento econômico sustentável e preservação ambiental no contexto latino-americano.",
      author: "João Santos",
      category: "Meio Ambiente",
      publishedAt: new Date("2024-03-10"),
      slug: "sustentabilidade-desenvolvimento-economico",
    },
    {
      id: "3",
      title: "Tecnologia e Inclusão Social",
      excerpt: "Como a tecnologia pode ser utilizada como ferramenta de inclusão social e redução de desigualdades.",
      author: "Ana Costa",
      category: "Tecnologia",
      publishedAt: new Date("2024-03-05"),
      slug: "tecnologia-inclusao-social",
    },
  ]
}

async function getStats() {
  return {
    publications: 156,
    authors: 42,
    categories: 12,
  }
}

export default async function HomePage() {
  const [publications, stats] = await Promise.all([
    getFeaturedPublications(),
    getStats(),
  ])

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-muted/50 to-background">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Conhecimento para
              <span className="block text-muted-foreground">transformar a sociedade</span>
            </h1>
            <p className="mt-6 text-pretty text-lg text-muted-foreground">
              O Observatório é uma plataforma dedicada à produção e disseminação
              de conhecimento, conectando pesquisadores, especialistas e a
              sociedade em busca de soluções para os desafios contemporâneos.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/publicacoes">
                  Explorar Publicações
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/sobre">Saiba Mais</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.publications}</p>
                <p className="text-sm text-muted-foreground">Publicações</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.authors}</p>
                <p className="text-sm text-muted-foreground">Autores</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.categories}</p>
                <p className="text-sm text-muted-foreground">Categorias</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Publications */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Publicações em Destaque
              </h2>
              <p className="mt-2 text-muted-foreground">
                As mais recentes contribuições de nossos autores
              </p>
            </div>
            <Button variant="ghost" asChild className="hidden sm:flex">
              <Link href="/publicacoes">
                Ver Todas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {publications.map((pub) => (
              <Card key={pub.id} className="group transition-shadow hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                      {pub.category}
                    </span>
                  </div>
                  <Link href={`/publicacoes/${pub.slug}`}>
                    <h3 className="mt-2 line-clamp-2 text-lg font-semibold leading-tight transition-colors group-hover:text-primary">
                      {pub.title}
                    </h3>
                  </Link>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {pub.excerpt}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="font-medium">{pub.author}</span>
                    <span className="text-muted-foreground">
                      {pub.publishedAt.toLocaleDateString("pt-BR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Button variant="outline" asChild>
              <Link href="/publicacoes">
                Ver Todas as Publicações
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Quer contribuir com o Observatório?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Cadastre-se e faça parte da nossa comunidade de pesquisadores e
              especialistas. Compartilhe seu conhecimento e contribua para o
              debate público.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/cadastro">Criar Conta Gratuita</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/sobre">Como Funciona</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
