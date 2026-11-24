import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser, requireAuth } from "@/lib/auth"
import { publicationSchema } from "@/lib/validations"
import type { PublicationStatus } from "@/types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") as PublicationStatus | null
    const categoryId = searchParams.get("categoryId")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")

    const where: Record<string, unknown> = { deletedAt: null }

    if (status) {
      where.status = status
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    const [publications, total] = await Promise.all([
      prisma.publication.findMany({
        where,
        include: {
          author: {
            select: { id: true, name: true, email: true },
          },
          category: true,
          tags: {
            include: { tag: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.publication.count({ where }),
    ])

    return NextResponse.json({
      publications,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Error fetching publications:", error)
    return NextResponse.json(
      { error: "Erro ao buscar publicações" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...data } = body

    const validated = publicationSchema.parse(data)

    let status: PublicationStatus = "DRAFT"
    if (action === "REVIEW") {
      status = "REVIEW"
    }

    const publication = await prisma.publication.create({
      data: {
        title: validated.title,
        slug: validated.slug,
        excerpt: validated.excerpt,
        content: validated.content,
        status,
        authorId: user.id,
        organizationId: user.organizationId!,
        categoryId: validated.categoryId,
        scheduledAt: validated.scheduledAt ? new Date(validated.scheduledAt) : null,
        tags: validated.tagIds?.length
          ? {
              create: validated.tagIds.map((tagId) => ({
                tag: { connect: { id: tagId } },
              })),
            }
          : undefined,
      },
      include: {
        author: { select: { id: true, name: true } },
        category: true,
        tags: { include: { tag: true } },
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        entity: "Publication",
        entityId: publication.id,
        userId: user.id,
        organizationId: user.organizationId!,
        details: { status },
      },
    })

    return NextResponse.json(publication, { status: 201 })
  } catch (error) {
    console.error("Error creating publication:", error)
    return NextResponse.json(
      { error: "Erro ao criar publicação" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { action, publicationId, ...data } = body

    if (!publicationId) {
      return NextResponse.json(
        { error: "ID da publicação é obrigatório" },
        { status: 400 }
      )
    }

    const validated = publicationSchema.parse(data)

    const existingPublication = await prisma.publication.findUnique({
      where: { id: publicationId },
    })

    if (!existingPublication) {
      return NextResponse.json(
        { error: "Publicação não encontrada" },
        { status: 404 }
      )
    }

    // Check permissions
    const isAuthor = existingPublication.authorId === user.id
    const isValidator = user.role === "VALIDATOR" || user.role === "ADMIN" || user.role === "SYSTEM"

    if (!isAuthor && !isValidator) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    let newStatus = existingPublication.status as PublicationStatus

    switch (action) {
      case "DRAFT":
        newStatus = "DRAFT"
        break
      case "REVIEW":
        newStatus = "REVIEW"
        break
      case "APPROVED":
        if (!isValidator) {
          return NextResponse.json({ error: "Sem permissão para aprovar" }, { status: 403 })
        }
        newStatus = "APPROVED"
        break
      case "REJECTED":
        if (!isValidator) {
          return NextResponse.json({ error: "Sem permissão para rejeitar" }, { status: 403 })
        }
        newStatus = "REJECTED"
        break
      case "PUBLISHED":
        if (!isValidator) {
          return NextResponse.json({ error: "Sem permissão para publicar" }, { status: 403 })
        }
        newStatus = "PUBLISHED"
        break
      case "SCHEDULED":
        if (!isValidator) {
          return NextResponse.json({ error: "Sem permissão para agendar" }, { status: 403 })
        }
        newStatus = "SCHEDULED"
        break
    }

    // Delete existing tag connections
    await prisma.publicationTag.deleteMany({
      where: { publicationId },
    })

    const publication = await prisma.publication.update({
      where: { id: publicationId },
      data: {
        title: validated.title,
        slug: validated.slug,
        excerpt: validated.excerpt,
        content: validated.content,
        status: newStatus,
        categoryId: validated.categoryId,
        scheduledAt: validated.scheduledAt ? new Date(validated.scheduledAt) : null,
        publishedAt: newStatus === "PUBLISHED" ? new Date() : undefined,
        tags: validated.tagIds?.length
          ? {
              create: validated.tagIds.map((tagId) => ({
                tag: { connect: { id: tagId } },
              })),
            }
          : undefined,
      },
      include: {
        author: { select: { id: true, name: true } },
        category: true,
        tags: { include: { tag: true } },
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entity: "Publication",
        entityId: publication.id,
        userId: user.id,
        organizationId: user.organizationId!,
        details: {
          previousStatus: existingPublication.status,
          newStatus,
          action,
        },
      },
    })

    return NextResponse.json(publication)
  } catch (error) {
    console.error("Error updating publication:", error)
    return NextResponse.json(
      { error: "Erro ao atualizar publicação" },
      { status: 500 }
    )
  }
}
