"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { createCommentSchema, updateCommentSchema } from "@/lib/validations"
import type { ApiResponse, PaginatedResponse } from "@/types"

// ============================================================================
// GET COMMENTS (Admin - for moderation)
// ============================================================================

export async function getComments(
  page = 1,
  limit = 10,
  filters: { publicationId?: string; isApproved?: boolean } = {}
): Promise<PaginatedResponse<Awaited<ReturnType<typeof prisma.comment.findFirst>>>> {
  const session = await getSession()
  if (!session) {
    return { data: [], pagination: { page, limit, total: 0, totalPages: 0 } }
  }

  const where: Record<string, unknown> = {}

  // Filter by organization for non-system users
  if (session.role !== "SYSTEM" && session.organizationId) {
    where.publication = { organizationId: session.organizationId }
  }

  if (filters.publicationId) {
    where.publicationId = filters.publicationId
  }

  if (filters.isApproved !== undefined) {
    where.isApproved = filters.isApproved
  }

  const [total, comments] = await Promise.all([
    prisma.comment.count({ where }),
    prisma.comment.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        publication: { select: { id: true, title: true, slug: true } },
        parent: { select: { id: true, content: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return {
    data: comments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

// ============================================================================
// GET COMMENTS FOR PUBLICATION (Public)
// ============================================================================

export async function getPublicationComments(publicationId: string, page = 1, limit = 20) {
  const [total, comments] = await Promise.all([
    prisma.comment.count({
      where: { publicationId, isApproved: true, parentId: null },
    }),
    prisma.comment.findMany({
      where: { publicationId, isApproved: true, parentId: null },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        replies: {
          where: { isApproved: true },
          include: {
            author: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return {
    data: comments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

// ============================================================================
// CREATE COMMENT
// ============================================================================

export async function createComment(
  publicationId: string,
  formData: FormData
): Promise<ApiResponse<{ id: string }>> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: "Você precisa estar logado para comentar" }
    }

    const rawData = {
      content: formData.get("content"),
      parentId: formData.get("parentId") || undefined,
    }

    const validated = createCommentSchema.safeParse(rawData)
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message }
    }

    const { content, parentId } = validated.data

    // Verify publication exists and is published
    const publication = await prisma.publication.findUnique({
      where: { id: publicationId },
    })

    if (!publication || publication.status !== "PUBLISHED") {
      return { success: false, error: "Publicação não encontrada" }
    }

    // Verify parent comment exists if replying
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      })
      if (!parentComment || parentComment.publicationId !== publicationId) {
        return { success: false, error: "Comentário pai não encontrado" }
      }
    }

    const comment = await prisma.comment.create({
      data: {
        publicationId,
        authorId: session.id,
        content,
        parentId,
        // Auto-approve for admins and validators
        isApproved: session.role === "SYSTEM" || session.role === "ADMIN" || session.role === "VALIDATOR",
      },
    })

    revalidatePath(`/${publication.slug}`)

    return { success: true, data: { id: comment.id } }
  } catch (error) {
    console.error("Create comment error:", error)
    return { success: false, error: "Erro ao criar comentário" }
  }
}

// ============================================================================
// APPROVE COMMENT
// ============================================================================

export async function approveComment(id: string): Promise<ApiResponse> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: "Não autenticado" }
    }

    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        publication: { select: { organizationId: true, slug: true } },
      },
    })

    if (!comment) {
      return { success: false, error: "Comentário não encontrado" }
    }

    // Check permission
    const canModerate =
      session.role === "SYSTEM" ||
      session.role === "ADMIN" ||
      (session.role === "VALIDATOR" && comment.publication.organizationId === session.organizationId)

    if (!canModerate) {
      return { success: false, error: "Sem permissão" }
    }

    await prisma.comment.update({
      where: { id },
      data: { isApproved: true },
    })

    revalidatePath("/admin/comentarios")
    revalidatePath(`/${comment.publication.slug}`)

    return { success: true }
  } catch (error) {
    console.error("Approve comment error:", error)
    return { success: false, error: "Erro ao aprovar comentário" }
  }
}

// ============================================================================
// REJECT COMMENT
// ============================================================================

export async function rejectComment(id: string): Promise<ApiResponse> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: "Não autenticado" }
    }

    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        publication: { select: { organizationId: true } },
      },
    })

    if (!comment) {
      return { success: false, error: "Comentário não encontrado" }
    }

    // Check permission
    const canModerate =
      session.role === "SYSTEM" ||
      session.role === "ADMIN" ||
      (session.role === "VALIDATOR" && comment.publication.organizationId === session.organizationId)

    if (!canModerate) {
      return { success: false, error: "Sem permissão" }
    }

    await prisma.comment.update({
      where: { id },
      data: { isApproved: false },
    })

    revalidatePath("/admin/comentarios")

    return { success: true }
  } catch (error) {
    console.error("Reject comment error:", error)
    return { success: false, error: "Erro ao rejeitar comentário" }
  }
}

// ============================================================================
// DELETE COMMENT
// ============================================================================

export async function deleteComment(id: string): Promise<ApiResponse> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: "Não autenticado" }
    }

    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        publication: { select: { organizationId: true } },
      },
    })

    if (!comment) {
      return { success: false, error: "Comentário não encontrado" }
    }

    // Check permission
    const canDelete =
      session.role === "SYSTEM" ||
      session.role === "ADMIN" ||
      (session.role === "VALIDATOR" && comment.publication.organizationId === session.organizationId) ||
      comment.authorId === session.id

    if (!canDelete) {
      return { success: false, error: "Sem permissão" }
    }

    // Delete replies first
    await prisma.comment.deleteMany({
      where: { parentId: id },
    })

    await prisma.comment.delete({ where: { id } })

    revalidatePath("/admin/comentarios")

    return { success: true }
  } catch (error) {
    console.error("Delete comment error:", error)
    return { success: false, error: "Erro ao excluir comentário" }
  }
}

// ============================================================================
// LIKES
// ============================================================================

export async function toggleLike(publicationId: string): Promise<ApiResponse<{ liked: boolean }>> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: "Você precisa estar logado para curtir" }
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        publicationId_userId: {
          publicationId,
          userId: session.id,
        },
      },
    })

    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id },
      })
      return { success: true, data: { liked: false } }
    } else {
      await prisma.like.create({
        data: {
          publicationId,
          userId: session.id,
        },
      })
      return { success: true, data: { liked: true } }
    }
  } catch (error) {
    console.error("Toggle like error:", error)
    return { success: false, error: "Erro ao curtir" }
  }
}

export async function checkUserLiked(publicationId: string): Promise<boolean> {
  const session = await getSession()
  if (!session) return false

  const like = await prisma.like.findUnique({
    where: {
      publicationId_userId: {
        publicationId,
        userId: session.id,
      },
    },
  })

  return !!like
}
