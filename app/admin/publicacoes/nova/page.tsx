import { PublicationForm } from "@/components/publications/publication-form"

// This would fetch from database in production
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

export default async function NewPublicationPage() {
  const [categories, tags] = await Promise.all([getCategories(), getTags()])

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Nova Publicação</h1>
        <p className="text-muted-foreground">
          Crie uma nova publicação para o Observatório
        </p>
      </div>

      <PublicationForm categories={categories} tags={tags} />
    </div>
  )
}
