"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RichTextEditor } from "@/components/editor/rich-text-editor"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  ArrowLeft,
  Save,
  Send,
  Eye,
  Calendar,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { publicationSchema } from "@/lib/validations"
import type { z } from "zod"
import type { PublicationStatus } from "@/types"

type FormData = z.infer<typeof publicationSchema>

interface Category {
  id: string
  name: string
}

interface Tag {
  id: string
  name: string
}

interface PublicationFormProps {
  publication?: {
    id: string
    title: string
    slug: string
    excerpt: string
    content: string
    status: PublicationStatus
    categoryId: string
    tags: { id: string }[]
    scheduledAt: Date | null
  }
  categories: Category[]
  tags: Tag[]
  isValidator?: boolean
}

export function PublicationForm({
  publication,
  categories,
  tags,
  isValidator = false,
}: PublicationFormProps) {
  const router = useRouter()
  const [content, setContent] = useState(publication?.content || "")
  const [selectedTags, setSelectedTags] = useState<string[]>(
    publication?.tags.map((t) => t.id) || []
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitAction, setSubmitAction] = useState<string>("")

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(publicationSchema),
    defaultValues: {
      title: publication?.title || "",
      slug: publication?.slug || "",
      excerpt: publication?.excerpt || "",
      content: publication?.content || "",
      categoryId: publication?.categoryId || "",
      tagIds: publication?.tags.map((t) => t.id) || [],
      scheduledAt: publication?.scheduledAt?.toISOString().slice(0, 16) || undefined,
    },
  })

  const title = watch("title")

  // Auto-generate slug from title
  useEffect(() => {
    if (!publication && title) {
      const slug = title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
      setValue("slug", slug)
    }
  }, [title, publication, setValue])

  // Update content in form
  useEffect(() => {
    setValue("content", content)
  }, [content, setValue])

  // Update tags in form
  useEffect(() => {
    setValue("tagIds", selectedTags)
  }, [selectedTags, setValue])

  const onSubmit = async (data: FormData, action: string) => {
    setIsSubmitting(true)
    setSubmitAction(action)

    try {
      const payload = {
        ...data,
        action,
        publicationId: publication?.id,
      }

      const response = await fetch("/api/publications", {
        method: publication ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error("Erro ao salvar publicação")
      }

      router.push("/admin/publicacoes")
      router.refresh()
    } catch (error) {
      console.error("Error saving publication:", error)
    } finally {
      setIsSubmitting(false)
      setSubmitAction("")
    }
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    )
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/publicacoes"
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
          {publication && (
            <StatusBadge status={publication.status} />
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/preview/${publication?.slug}`, "_blank")}
            disabled={!publication}
          >
            <Eye className="mr-2 h-4 w-4" />
            Visualizar
          </Button>
        </div>
      </div>

      <form className="space-y-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                placeholder="Digite o título da publicação"
                className="text-lg"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL)</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">/publicacoes/</span>
                <Input
                  id="slug"
                  placeholder="titulo-da-publicacao"
                  {...register("slug")}
                />
              </div>
              {errors.slug && (
                <p className="text-sm text-destructive">{errors.slug.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Resumo</Label>
              <Textarea
                id="excerpt"
                placeholder="Breve descrição da publicação (exibido em cards e listagens)"
                rows={3}
                {...register("excerpt")}
              />
              {errors.excerpt && (
                <p className="text-sm text-destructive">{errors.excerpt.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Conteúdo</Label>
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="Escreva o conteúdo da publicação..."
              />
              {errors.content && (
                <p className="text-sm text-destructive">{errors.content.message}</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Publicar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {publication?.status === "REJECTED" && (
                  <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>Esta publicação foi rejeitada e precisa ser revisada.</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="scheduledAt">Agendar publicação</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="scheduledAt"
                      type="datetime-local"
                      className="pl-10"
                      {...register("scheduledAt")}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSubmit((data) => onSubmit(data, "DRAFT"))}
                    disabled={isSubmitting}
                  >
                    {isSubmitting && submitAction === "DRAFT" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Salvar Rascunho
                  </Button>

                  {!isValidator && (
                    <Button
                      type="button"
                      onClick={handleSubmit((data) => onSubmit(data, "REVIEW"))}
                      disabled={isSubmitting}
                    >
                      {isSubmitting && submitAction === "REVIEW" ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-4 w-4" />
                      )}
                      Enviar para Revisão
                    </Button>
                  )}

                  {isValidator && publication?.status === "REVIEW" && (
                    <>
                      <Button
                        type="button"
                        variant="default"
                        onClick={handleSubmit((data) => onSubmit(data, "APPROVED"))}
                        disabled={isSubmitting}
                      >
                        {isSubmitting && submitAction === "APPROVED" ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Aprovar
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={handleSubmit((data) => onSubmit(data, "REJECTED"))}
                        disabled={isSubmitting}
                      >
                        {isSubmitting && submitAction === "REJECTED" ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Rejeitar
                      </Button>
                    </>
                  )}

                  {isValidator && publication?.status === "APPROVED" && (
                    <Button
                      type="button"
                      onClick={handleSubmit((data) => onSubmit(data, "PUBLISHED"))}
                      disabled={isSubmitting}
                    >
                      {isSubmitting && submitAction === "PUBLISHED" ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Publicar Agora
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  defaultValue={publication?.categoryId}
                  onValueChange={(value) => setValue("categoryId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && (
                  <p className="mt-2 text-sm text-destructive">
                    {errors.categoryId.message}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                        selectedTags.includes(tag.id)
                          ? "border-foreground bg-foreground text-background"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
