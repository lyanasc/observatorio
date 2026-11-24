import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  ArrowLeft,
  Calendar,
  Clock,
  Heart,
  MessageSquare,
  Share2,
  User,
  Bookmark,
} from "lucide-react"

// This would be replaced with real data fetching
async function getPublication(slug: string) {
  const publications: Record<string, {
    id: string
    title: string
    content: string
    excerpt: string
    author: { name: string; bio: string }
    category: { name: string; slug: string }
    tags: { name: string; slug: string }[]
    publishedAt: Date
    readTime: number
    likes: number
    comments: number
  }> = {
    "impacto-politicas-publicas-educacao": {
      id: "1",
      title: "O Impacto das Políticas Públicas na Educação Brasileira",
      content: `
        <p>As políticas públicas educacionais têm desempenhado um papel fundamental na transformação do cenário educacional brasileiro nas últimas décadas. Este artigo analisa as principais iniciativas governamentais e seus impactos na qualidade e acesso à educação no país.</p>
        
        <h2>Contexto Histórico</h2>
        <p>A educação brasileira passou por significativas transformações desde a promulgação da Constituição de 1988, que estabeleceu a educação como direito de todos e dever do Estado. A partir desse marco legal, diversas políticas foram implementadas para ampliar o acesso e melhorar a qualidade do ensino.</p>
        
        <h2>Principais Políticas Implementadas</h2>
        <p>Entre as políticas mais relevantes, destacam-se o FUNDEB (Fundo de Manutenção e Desenvolvimento da Educação Básica), o PNAE (Programa Nacional de Alimentação Escolar) e o Programa Bolsa Família, que vincula o benefício à frequência escolar.</p>
        
        <h2>Resultados e Desafios</h2>
        <p>Os resultados dessas políticas são visíveis em indicadores como a taxa de alfabetização, que subiu de 82,9% em 2000 para 93% em 2020. No entanto, desafios persistem, especialmente relacionados à qualidade do ensino e à desigualdade regional.</p>
        
        <h2>Conclusão</h2>
        <p>A análise demonstra que as políticas públicas têm sido efetivas na ampliação do acesso à educação, mas ainda há um longo caminho a percorrer para garantir uma educação de qualidade para todos os brasileiros.</p>
      `,
      excerpt: "Uma análise detalhada sobre como as políticas educacionais têm transformado o cenário da educação no Brasil nos últimos anos.",
      author: {
        name: "Maria Silva",
        bio: "Doutora em Educação pela USP, pesquisadora e consultora em políticas educacionais.",
      },
      category: { name: "Educação", slug: "educacao" },
      tags: [
        { name: "Políticas Públicas", slug: "politicas-publicas" },
        { name: "Educação", slug: "educacao" },
        { name: "Brasil", slug: "brasil" },
      ],
      publishedAt: new Date("2024-03-15"),
      readTime: 8,
      likes: 124,
      comments: 18,
    },
  }

  return publications[slug] || null
}

async function getRelatedPublications() {
  return [
    {
      id: "2",
      title: "Sustentabilidade e Desenvolvimento Econômico",
      excerpt: "Explorando a intersecção entre crescimento econômico sustentável e preservação ambiental.",
      author: { name: "João Santos" },
      category: { name: "Meio Ambiente", slug: "meio-ambiente" },
      slug: "sustentabilidade-desenvolvimento-economico",
    },
    {
      id: "3",
      title: "Tecnologia e Inclusão Social",
      excerpt: "Como a tecnologia pode ser utilizada como ferramenta de inclusão social.",
      author: { name: "Ana Costa" },
      category: { name: "Tecnologia", slug: "tecnologia" },
      slug: "tecnologia-inclusao-social",
    },
  ]
}

export default async function PublicationPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [publication, related] = await Promise.all([
    getPublication(slug),
    getRelatedPublications(),
  ])

  if (!publication) {
    notFound()
  }

  return (
    <div className="py-8 sm:py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/publicacoes"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Publicações
        </Link>

        {/* Article Header */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/categorias/${publication.category.slug}`}
              className="rounded-full bg-muted px-3 py-1 text-sm font-medium transition-colors hover:bg-muted/80"
            >
              {publication.category.name}
            </Link>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {publication.readTime} min de leitura
            </div>
          </div>

          <h1 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {publication.title}
          </h1>

          <p className="mt-4 text-lg text-muted-foreground">
            {publication.excerpt}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-6 border-y border-border py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">{publication.author.name}</p>
                <p className="text-sm text-muted-foreground">Autor</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {publication.publishedAt.toLocaleDateString("pt-BR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <article
          className="prose prose-neutral max-w-none dark:prose-invert prose-headings:font-semibold prose-headings:tracking-tight prose-h2:mt-8 prose-h2:text-2xl prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: publication.content }}
        />

        {/* Tags */}
        <div className="mt-8 border-t border-border pt-8">
          <h3 className="text-sm font-medium">Tags</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {publication.tags.map((tag) => (
              <Link
                key={tag.slug}
                href={`/tags/${tag.slug}`}
                className="rounded-full border border-border px-3 py-1 text-sm transition-colors hover:bg-muted"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-between border-t border-border pt-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="gap-2">
              <Heart className="h-4 w-4" />
              {publication.likes}
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              {publication.comments}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Author Bio */}
        <Card className="mt-8">
          <CardContent className="flex gap-4 p-6">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-muted">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h3 className="font-semibold">{publication.author.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {publication.author.bio}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Related Publications */}
        <section className="mt-12 border-t border-border pt-12">
          <h2 className="text-2xl font-bold tracking-tight">
            Publicações Relacionadas
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {related.map((pub) => (
              <Card key={pub.id} className="group transition-shadow hover:shadow-md">
                <CardHeader className="pb-3">
                  <Link
                    href={`/categorias/${pub.category.slug}`}
                    className="w-fit rounded-full bg-muted px-3 py-1 text-xs font-medium"
                  >
                    {pub.category.name}
                  </Link>
                  <Link href={`/publicacoes/${pub.slug}`}>
                    <h3 className="mt-2 line-clamp-2 text-lg font-semibold leading-tight transition-colors group-hover:text-primary">
                      {pub.title}
                    </h3>
                  </Link>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {pub.excerpt}
                  </p>
                  <p className="mt-3 text-sm font-medium">
                    {pub.author.name}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
