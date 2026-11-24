"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { generateSlug } from "@/lib/helpers"
import { hashPassword } from "@/lib/auth"
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  createUserSchema,
  updateUserSchema,
} from "@/lib/validations"
import type { ApiResponse, PaginatedResponse } from "@/types"

// ============================================================================
// ORGANIZATIONS
// ============================================================================

export async function getOrganizations(
  page = 1,
  limit = 10,
  search?: string
): Promise<PaginatedResponse<Awaited<ReturnType<typeof prisma.organization.findFirst>>>> {
  const session = await getSession()
  if (!session || session.role !== "SYSTEM") {
    return { data: [], pagination: { page, limit, total: 0, totalPages: 0 } }
  }

  const where: Record<string, unknown> = {}
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
    ]
  }

  const [total, organizations] = await Promise.all([
    prisma.organization.count({ where }),
    prisma.organization.findMany({
      where,
      include: {
        _count: {
          select: {
            users: true,
            publications: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return {
    data: organizations,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function getOrganization(id: string) {
  const organization = await prisma.organization.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          users: true,
          publications: true,
          categories: true,
          tags: true,
        },
      },
    },
  })

  return organization
}

export async function createOrganization(formData: FormData): Promise<ApiResponse<{ id: string }>> {
  try {
    const session = await getSession()
    if (!session || session.role !== "SYSTEM") {
      return { success: false, error: "Sem permissão" }
    }

    const rawData = {
      name: formData.get("name"),
      slug: formData.get("slug") || undefined,
      domain: formData.get("domain") || undefined,
      avatar: formData.get("avatar") || undefined,
      description: formData.get("description") || undefined,
    }

    const validated = createOrganizationSchema.safeParse(rawData)
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message }
    }

    const data = validated.data
    const slug = data.slug || generateSlug(data.name)

    // Check slug uniqueness
    const existingSlug = await prisma.organization.findUnique({
      where: { slug },
    })
    if (existingSlug) {
      return { success: false, error: "Já existe uma organização com este slug" }
    }

    // Check domain uniqueness if provided
    if (data.domain) {
      const existingDomain = await prisma.organization.findUnique({
        where: { domain: data.domain },
      })
      if (existingDomain) {
        return { success: false, error: "Este domínio já está em uso" }
      }
    }

    const organization = await prisma.organization.create({
      data: {
        name: data.name,
        slug,
        domain: data.domain,
        avatar: data.avatar,
        description: data.description,
      },
    })

    revalidatePath("/system/organizacoes")

    return { success: true, data: { id: organization.id } }
  } catch (error) {
    console.error("Create organization error:", error)
    return { success: false, error: "Erro ao criar organização" }
  }
}

export async function updateOrganization(
  id: string,
  formData: FormData
): Promise<ApiResponse> {
  try {
    const session = await getSession()
    if (!session || (session.role !== "SYSTEM" && session.role !== "ADMIN")) {
      return { success: false, error: "Sem permissão" }
    }

    // Non-system users can only edit their own organization
    if (session.role !== "SYSTEM" && session.organizationId !== id) {
      return { success: false, error: "Sem permissão" }
    }

    const rawData = {
      name: formData.get("name") || undefined,
      slug: formData.get("slug") || undefined,
      domain: formData.get("domain") || undefined,
      avatar: formData.get("avatar") || undefined,
      description: formData.get("description") || undefined,
      isActive: formData.get("isActive") === "true" ? true : 
                formData.get("isActive") === "false" ? false : undefined,
    }

    const validated = updateOrganizationSchema.safeParse(rawData)
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message }
    }

    const data = validated.data
    const organization = await prisma.organization.findUnique({ where: { id } })
    if (!organization) {
      return { success: false, error: "Organização não encontrada" }
    }

    // Check slug uniqueness if changed
    if (data.slug && data.slug !== organization.slug) {
      const existingSlug = await prisma.organization.findUnique({
        where: { slug: data.slug },
      })
      if (existingSlug) {
        return { success: false, error: "Já existe uma organização com este slug" }
      }
    }

    // Check domain uniqueness if changed
    if (data.domain && data.domain !== organization.domain) {
      const existingDomain = await prisma.organization.findUnique({
        where: { domain: data.domain },
      })
      if (existingDomain) {
        return { success: false, error: "Este domínio já está em uso" }
      }
    }

    await prisma.organization.update({
      where: { id },
      data,
    })

    revalidatePath("/system/organizacoes")
    revalidatePath(`/system/organizacoes/${id}`)
    revalidatePath("/admin/configuracoes")

    return { success: true }
  } catch (error) {
    console.error("Update organization error:", error)
    return { success: false, error: "Erro ao atualizar organização" }
  }
}

export async function deleteOrganization(id: string): Promise<ApiResponse> {
  try {
    const session = await getSession()
    if (!session || session.role !== "SYSTEM") {
      return { success: false, error: "Sem permissão" }
    }

    await prisma.organization.delete({
      where: { id },
    })

    revalidatePath("/system/organizacoes")

    return { success: true }
  } catch (error) {
    console.error("Delete organization error:", error)
    return { success: false, error: "Erro ao excluir organização" }
  }
}

// ============================================================================
// USERS
// ============================================================================

export async function getUsers(
  page = 1,
  limit = 10,
  search?: string,
  organizationId?: string
): Promise<PaginatedResponse<Awaited<ReturnType<typeof prisma.user.findFirst>>>> {
  const session = await getSession()
  if (!session) {
    return { data: [], pagination: { page, limit, total: 0, totalPages: 0 } }
  }

  const where: Record<string, unknown> = {}

  // Filter by organization
  if (session.role !== "SYSTEM") {
    where.organizationId = session.organizationId
  } else if (organizationId) {
    where.organizationId = organizationId
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ]
  }

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      include: {
        organization: { select: { id: true, name: true, slug: true } },
        _count: {
          select: {
            publications: true,
            comments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  // Remove password from response
  const safeUsers = users.map(({ password: _, ...user }) => user)

  return {
    data: safeUsers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function getUser(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      organization: { select: { id: true, name: true, slug: true } },
      _count: {
        select: {
          publications: true,
          comments: true,
        },
      },
    },
  })

  if (!user) return null

  const { password: _, ...safeUser } = user
  return safeUser
}

export async function createUser(formData: FormData): Promise<ApiResponse<{ id: string }>> {
  try {
    const session = await getSession()
    if (!session || (session.role !== "SYSTEM" && session.role !== "ADMIN")) {
      return { success: false, error: "Sem permissão" }
    }

    const rawData = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      role: formData.get("role") || "USER",
      avatar: formData.get("avatar") || undefined,
    }

    const validated = createUserSchema.safeParse(rawData)
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message }
    }

    const data = validated.data

    // Check email uniqueness
    const existingEmail = await prisma.user.findUnique({
      where: { email: data.email },
    })
    if (existingEmail) {
      return { success: false, error: "Este e-mail já está em uso" }
    }

    // Determine organization ID
    const organizationId =
      session.role === "SYSTEM"
        ? (formData.get("organizationId") as string) || null
        : session.organizationId

    // Only SYSTEM can create SYSTEM users
    if (data.role === "SYSTEM" && session.role !== "SYSTEM") {
      return { success: false, error: "Sem permissão para criar usuários SYSTEM" }
    }

    const hashedPassword = await hashPassword(data.password)

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
        avatar: data.avatar,
        organizationId,
      },
    })

    revalidatePath("/admin/usuarios")
    revalidatePath("/system/organizacoes")

    return { success: true, data: { id: user.id } }
  } catch (error) {
    console.error("Create user error:", error)
    return { success: false, error: "Erro ao criar usuário" }
  }
}

export async function updateUser(id: string, formData: FormData): Promise<ApiResponse> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: "Não autenticado" }
    }

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      return { success: false, error: "Usuário não encontrado" }
    }

    // Check permission
    const canEdit =
      session.role === "SYSTEM" ||
      (session.role === "ADMIN" && user.organizationId === session.organizationId) ||
      session.id === id

    if (!canEdit) {
      return { success: false, error: "Sem permissão" }
    }

    const rawData = {
      name: formData.get("name") || undefined,
      email: formData.get("email") || undefined,
      password: formData.get("password") || undefined,
      role: formData.get("role") || undefined,
      avatar: formData.get("avatar") || undefined,
      isActive: formData.get("isActive") === "true" ? true :
                formData.get("isActive") === "false" ? false : undefined,
    }

    const validated = updateUserSchema.safeParse(rawData)
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message }
    }

    const data = validated.data

    // Check email uniqueness if changed
    if (data.email && data.email !== user.email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: data.email },
      })
      if (existingEmail) {
        return { success: false, error: "Este e-mail já está em uso" }
      }
    }

    // Only SYSTEM can change role to SYSTEM
    if (data.role === "SYSTEM" && session.role !== "SYSTEM") {
      return { success: false, error: "Sem permissão para definir role SYSTEM" }
    }

    // Non-admins can only edit their own name and avatar
    if (session.id === id && session.role !== "SYSTEM" && session.role !== "ADMIN") {
      const updateData: Record<string, unknown> = {}
      if (data.name) updateData.name = data.name
      if (data.avatar !== undefined) updateData.avatar = data.avatar
      if (data.password) updateData.password = await hashPassword(data.password)

      await prisma.user.update({
        where: { id },
        data: updateData,
      })
    } else {
      const updateData: Record<string, unknown> = { ...data }
      if (data.password) {
        updateData.password = await hashPassword(data.password)
      } else {
        delete updateData.password
      }

      await prisma.user.update({
        where: { id },
        data: updateData,
      })
    }

    revalidatePath("/admin/usuarios")
    revalidatePath(`/admin/usuarios/${id}`)

    return { success: true }
  } catch (error) {
    console.error("Update user error:", error)
    return { success: false, error: "Erro ao atualizar usuário" }
  }
}

export async function deleteUser(id: string): Promise<ApiResponse> {
  try {
    const session = await getSession()
    if (!session || (session.role !== "SYSTEM" && session.role !== "ADMIN")) {
      return { success: false, error: "Sem permissão" }
    }

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      return { success: false, error: "Usuário não encontrado" }
    }

    // Non-system users can only delete users from their organization
    if (session.role !== "SYSTEM" && user.organizationId !== session.organizationId) {
      return { success: false, error: "Sem permissão" }
    }

    // Cannot delete yourself
    if (session.id === id) {
      return { success: false, error: "Você não pode excluir sua própria conta" }
    }

    await prisma.user.delete({
      where: { id },
    })

    revalidatePath("/admin/usuarios")

    return { success: true }
  } catch (error) {
    console.error("Delete user error:", error)
    return { success: false, error: "Erro ao excluir usuário" }
  }
}
