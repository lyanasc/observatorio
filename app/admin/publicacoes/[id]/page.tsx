import { notFound } from "next/navigation"
import { PublicationForm } from "@/components/publications/publication-form"
import type { PublicationStatus } from "@/types"

// This would fetch from database in production
async function getPublication(id: string) {
  const publications: Record<string, {
    id: string
    title: string
    slug: string
    excerpt: string
    content: string
    status: PublicationStatus
    categoryId: string
    tags: { id: string }[]
    scheduledAt: Date | null
  }> = {
    "1": {
      id: "1",
      title: "O Impacto das Políticas Públicas na Educação Brasileira",
      slug: "impacto-politicas-publicas-educacao",
      excerpt: "Uma análise detalhada sobre como as políticas educacionais têm transformado o cenário da educação no Brasil nos últimos anos.",
      content: "<p>As políticas públicas educacionais têm desempenhado um papel fundamental...</p>",
      status: "PUBLISHED",
      categoryId: "1",
      tags: [{ id: "1" }, { id: "8" }],
      scheduledAt: null,
    },
  }

  return publications[id] || null
}

async function getCategories() {
  return [
    { id: "1", name: "Educação" },
    { id: "2", name: "Meio Ambiente" },
    { id: "3", name: "Tecnologia" },
    { id: "4", name: "Saúde" },
    { id: "5", name: "Política" },
    { id: "6", name: "Urbanismo" },
  ]
}

async function getTags() {
  return [
    { id: "1", name: "Políticas Públicas" },
    { id: "2", name: "Sustentabilidade" },
    { id: "3", name: "Inovação" },
    { id: "4", name: "Inclusão Social" },
    { id: "5", name: "Democracia" },
    { id: "6", name: "Mobilidade" },
    { id: "7", name: "Saúde Mental" },
    { id: "8", name: "Educação Digital" },
  ]
}

export default async function EditPublicationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [publication, categories, tags] = await Promise.all([
    getPublication(id),
    getCategories(),
    getTags(),
  ])

  if (!publication) {
    notFound()
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Editar Publicação</h1>
        <p className="text-muted-foreground">
          Edite os detalhes da publicação
        </p>
      </div>

      <PublicationForm
        publication={publication}
        categories={categories}
        tags={tags}
      />
    </div>
  )
}
