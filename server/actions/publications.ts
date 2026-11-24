"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { generateSlug } from "@/lib/helpers"
import {
  createPublicationSchema,
  updatePublicationSchema,
  changePublicationStatusSchema,
} from "@/lib/validations"
import type { ApiResponse, PaginatedResponse, PublicationFilters } from "@/types"
import { PublicationStatus } from "@prisma/client"

// ============================================================================
// GET PUBLICATIONS (with filters and pagination)
// ============================================================================

export async function getPublications(
  filters: PublicationFilters = {},
  page = 1,
  limit = 10
): Promise<PaginatedResponse<Awaited<ReturnType<typeof formatPublication>>>> {
  const session = await getSession()
  if (!session) {
    return { data: [], pagination: { page, limit, total: 0, totalPages: 0 } }
  }

  const where: Record<string, unknown> = {
    deletedAt: null,
  }

  // Filter by organization for non-system users
  if (session.role !== "SYSTEM" && session.organizationId) {
    where.organizationId = session.organizationId
  }

  // Apply filters
  if (filters.status) {
    where.status = filters.status
  }
  if (filters.authorId) {
    where.authorId = filters.authorId
  }
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { excerpt: { contains: filters.search, mode: "insensitive" } },
    ]
  }
  if (filters.categoryId) {
    where.categories = {
      some: { categoryId: filters.categoryId },
    }
  }
  if (filters.tagId) {
    where.tags = {
      some: { tagId: filters.tagId },
    }
  }

  const [total, publications] = await Promise.all([
    prisma.publication.count({ where }),
    prisma.publication.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        organization: { select: { id: true, name: true, slug: true } },
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
        _count: { select: { comments: true, likes: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return {
    data: publications.map(formatPublication),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

// ============================================================================
// GET SINGLE PUBLICATION
// ============================================================================

export async function getPublication(id: string) {
  const publication = await prisma.publication.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, avatar: true, email: true } },
      organization: { select: { id: true, name: true, slug: true } },
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
      auditLogs: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { comments: true, likes: true } },
    },
  })

  if (!publication) return null

  return formatPublication(publication)
}

// ============================================================================
// GET PUBLICATION BY SLUG (for public)
// ============================================================================

export async function getPublicationBySlug(slug: string, organizationSlug?: string) {
  const where: Record<string, unknown> = {
    slug,
    status: "PUBLISHED",
    deletedAt: null,
  }

  if (organizationSlug) {
    where.organization = { slug: organizationSlug }
  }

  const publication = await prisma.publication.findFirst({
    where,
    include: {
      author: { select: { id: true, name: true, avatar: true } },
      organization: { select: { id: true, name: true, slug: true } },
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
      _count: { select: { comments: true, likes: true } },
    },
  })

  if (!publication) return null

  // Increment view count
  await prisma.publication.update({
    where: { id: publication.id },
    data: { viewCount: { increment: 1 } },
  })

  return formatPublication(publication)
}

// ============================================================================
// CREATE PUBLICATION
// ============================================================================

export async function createPublication(formData: FormData): Promise<ApiResponse<{ id: string }>> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: "Não autenticado" }
    }

    if (!session.organizationId && session.role !== "SYSTEM") {
      return { success: false, error: "Usuário não pertence a nenhuma organização" }
    }

    const rawData = {
      title: formData.get("title"),
      slug: formData.get("slug") || undefined,
      excerpt: formData.get("excerpt") || undefined,
      content: formData.get("content"),
      coverImage: formData.get("coverImage") || undefined,
      categoryIds: formData.getAll("categoryIds"),
      tagIds: formData.getAll("tagIds"),
      seoTitle: formData.get("seoTitle") || undefined,
      seoDescription: formData.get("seoDescription") || undefined,
      scheduledAt: formData.get("scheduledAt") || undefined,
    }

    const validated = createPublicationSchema.safeParse(rawData)
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message }
    }

    const data = validated.data
    const slug = data.slug || generateSlug(data.title)

    // Get organization ID
    const organizationId = session.organizationId || formData.get("organizationId") as string
    if (!organizationId) {
      return { success: false, error: "Organização não especificada" }
    }

    // Check if slug is unique within organization
    const existingSlug = await prisma.publication.findFirst({
      where: { organizationId, slug },
    })

    if (existingSlug) {
      return { success: false, error: "Já existe uma publicação com este slug" }
    }

    const publication = await prisma.publication.create({
      data: {
        organizationId,
        authorId: session.id,
        title: data.title,
        slug,
        excerpt: data.excerpt,
        content: data.content,
        coverImage: data.coverImage,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        scheduledAt: data.scheduledAt,
        categories: {
          create: data.categoryIds.map((categoryId) => ({ categoryId })),
        },
        tags: {
          create: data.tagIds.map((tagId) => ({ tagId })),
        },
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        publicationId: publication.id,
        userId: session.id,
        action: "CREATED",
        newStatus: "DRAFT",
      },
    })

    revalidatePath("/admin/publicacoes")

    return { success: true, data: { id: publication.id } }
  } catch (error) {
    console.error("Create publication error:", error)
    return { success: false, error: "Erro ao criar publicação" }
  }
}

// ============================================================================
// UPDATE PUBLICATION
// ============================================================================

export async function updatePublication(
  id: string,
  formData: FormData
): Promise<ApiResponse> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: "Não autenticado" }
    }

    const publication = await prisma.publication.findUnique({
      where: { id },
    })

    if (!publication) {
      return { success: false, error: "Publicação não encontrada" }
    }

    // Check permission
    if (
      session.role !== "SYSTEM" &&
      session.role !== "ADMIN" &&
      publication.authorId !== session.id
    ) {
      return { success: false, error: "Sem permissão para editar esta publicação" }
    }

    const rawData = {
      title: formData.get("title") || undefined,
      slug: formData.get("slug") || undefined,
      excerpt: formData.get("excerpt") || undefined,
      content: formData.get("content") || undefined,
      coverImage: formData.get("coverImage") || undefined,
      categoryIds: formData.getAll("categoryIds"),
      tagIds: formData.getAll("tagIds"),
      seoTitle: formData.get("seoTitle") || undefined,
      seoDescription: formData.get("seoDescription") || undefined,
      scheduledAt: formData.get("scheduledAt") || undefined,
    }

    const validated = updatePublicationSchema.safeParse(rawData)
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message }
    }

    const data = validated.data

    // Check slug uniqueness if changed
    if (data.slug && data.slug !== publication.slug) {
      const existingSlug = await prisma.publication.findFirst({
        where: {
          organizationId: publication.organizationId,
          slug: data.slug,
          id: { not: id },
        },
      })

      if (existingSlug) {
        return { success: false, error: "Já existe uma publicação com este slug" }
      }
    }

    await prisma.$transaction(async (tx) => {
      // Update categories
      if (data.categoryIds) {
        await tx.categoriesOnPublications.deleteMany({
          where: { publicationId: id },
        })
        if (data.categoryIds.length > 0) {
          await tx.categoriesOnPublications.createMany({
            data: data.categoryIds.map((categoryId) => ({
              publicationId: id,
              categoryId,
            })),
          })
        }
      }

      // Update tags
      if (data.tagIds) {
        await tx.tagsOnPublications.deleteMany({
          where: { publicationId: id },
        })
        if (data.tagIds.length > 0) {
          await tx.tagsOnPublications.createMany({
            data: data.tagIds.map((tagId) => ({
              publicationId: id,
              tagId,
            })),
          })
        }
      }

      // Update publication
      await tx.publication.update({
        where: { id },
        data: {
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt,
          content: data.content,
          coverImage: data.coverImage,
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription,
          scheduledAt: data.scheduledAt,
        },
      })

      // Create audit log
      await tx.auditLog.create({
        data: {
          publicationId: id,
          userId: session.id,
          action: "UPDATED",
        },
      })
    })

    revalidatePath("/admin/publicacoes")
    revalidatePath(`/admin/publicacoes/${id}`)

    return { success: true }
  } catch (error) {
    console.error("Update publication error:", error)
    return { success: false, error: "Erro ao atualizar publicação" }
  }
}

// ============================================================================
// CHANGE PUBLICATION STATUS
// ============================================================================

export async function changePublicationStatus(
  id: string,
  formData: FormData
): Promise<ApiResponse> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: "Não autenticado" }
    }

    const rawData = {
      status: formData.get("status"),
      observation: formData.get("observation") || undefined,
    }

    const validated = changePublicationStatusSchema.safeParse(rawData)
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message }
    }

    const { status, observation } = validated.data

    const publication = await prisma.publication.findUnique({
      where: { id },
    })

    if (!publication) {
      return { success: false, error: "Publicação não encontrada" }
    }

    // Check permission based on status transition
    const canChangeStatus = checkStatusPermission(session.role, publication.status, status)
    if (!canChangeStatus) {
      return { success: false, error: "Sem permissão para esta ação" }
    }

    const updateData: Record<string, unknown> = { status }

    // Set publishedAt when publishing
    if (status === "PUBLISHED" && !publication.publishedAt) {
      updateData.publishedAt = new Date()
    }

    await prisma.$transaction(async (tx) => {
      await tx.publication.update({
        where: { id },
        data: updateData,
      })

      await tx.auditLog.create({
        data: {
          publicationId: id,
          userId: session.id,
          action: "STATUS_CHANGED",
          previousStatus: publication.status,
          newStatus: status,
          observation,
        },
      })
    })

    revalidatePath("/admin/publicacoes")
    revalidatePath(`/admin/publicacoes/${id}`)

    return { success: true }
  } catch (error) {
    console.error("Change publication status error:", error)
    return { success: false, error: "Erro ao alterar status" }
  }
}

// ============================================================================
// DELETE PUBLICATION (soft delete)
// ============================================================================

export async function deletePublication(id: string): Promise<ApiResponse> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: "Não autenticado" }
    }

    const publication = await prisma.publication.findUnique({
      where: { id },
    })

    if (!publication) {
      return { success: false, error: "Publicação não encontrada" }
    }

    // Check permission
    if (
      session.role !== "SYSTEM" &&
      session.role !== "ADMIN" &&
      publication.authorId !== session.id
    ) {
      return { success: false, error: "Sem permissão para excluir esta publicação" }
    }

    await prisma.$transaction(async (tx) => {
      await tx.publication.update({
        where: { id },
        data: { deletedAt: new Date() },
      })

      await tx.auditLog.create({
        data: {
          publicationId: id,
          userId: session.id,
          action: "DELETED",
          previousStatus: publication.status,
        },
      })
    })

    revalidatePath("/admin/publicacoes")

    return { success: true }
  } catch (error) {
    console.error("Delete publication error:", error)
    return { success: false, error: "Erro ao excluir publicação" }
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatPublication(publication: Record<string, unknown>) {
  return {
    ...publication,
    categories: (publication.categories as Array<{ category: unknown }>)?.map((c) => c.category) || [],
    tags: (publication.tags as Array<{ tag: unknown }>)?.map((t) => t.tag) || [],
  }
}

function checkStatusPermission(
  role: string,
  currentStatus: PublicationStatus,
  newStatus: PublicationStatus
): boolean {
  // SYSTEM and ADMIN can do anything
  if (role === "SYSTEM" || role === "ADMIN") {
    return true
  }

  // VALIDATOR can approve, reject, request correction, publish, archive
  if (role === "VALIDATOR") {
    const validatorTransitions: Record<string, PublicationStatus[]> = {
      PENDING_REVIEW: ["APPROVED", "REJECTED", "CORRECTION_REQUESTED"],
      APPROVED: ["SCHEDULED", "PUBLISHED"],
      SCHEDULED: ["PUBLISHED"],
      PUBLISHED: ["ARCHIVED"],
    }
    return validatorTransitions[currentStatus]?.includes(newStatus) || false
  }

  // USER can only submit for review or revert to draft
  if (role === "USER") {
    const userTransitions: Record<string, PublicationStatus[]> = {
      DRAFT: ["PENDING_REVIEW"],
      CORRECTION_REQUESTED: ["DRAFT", "PENDING_REVIEW"],
    }
    return userTransitions[currentStatus]?.includes(newStatus) || false
  }

  return false
}
