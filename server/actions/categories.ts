"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { generateSlug } from "@/lib/helpers"
import {
  createCategorySchema,
  updateCategorySchema,
  createTagSchema,
  updateTagSchema,
} from "@/lib/validations"
import type { ApiResponse, CategoryWithChildren } from "@/types"

// ============================================================================
// CATEGORIES
// ============================================================================

export async function getCategories(organizationId?: string): Promise<CategoryWithChildren[]> {
  const session = await getSession()
  if (!session) return []

  const orgId = session.role === "SYSTEM" ? organizationId : session.organizationId
  if (!orgId) return []

  const categories = await prisma.category.findMany({
    where: { organizationId: orgId },
    include: {
      _count: { select: { publications: true } },
    },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  })

  // Build tree structure
  return buildCategoryTree(categories)
}

export async function getCategory(id: string) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      parent: true,
      children: true,
      _count: { select: { publications: true } },
    },
  })

  return category
}

export async function createCategory(formData: FormData): Promise<ApiResponse<{ id: string }>> {
  try {
    const session = await getSession()
    if (!session || (session.role !== "SYSTEM" && session.role !== "ADMIN")) {
      return { success: false, error: "Sem permissão" }
    }

    const organizationId = session.role === "SYSTEM"
      ? (formData.get("organizationId") as string)
      : session.organizationId

    if (!organizationId) {
      return { success: false, error: "Organização não especificada" }
    }

    const rawData = {
      name: formData.get("name"),
      slug: formData.get("slug") || undefined,
      description: formData.get("description") || undefined,
      parentId: formData.get("parentId") || undefined,
      order: formData.get("order") ? parseInt(formData.get("order") as string) : 0,
    }

    const validated = createCategorySchema.safeParse(rawData)
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message }
    }

    const data = validated.data
    const slug = data.slug || generateSlug(data.name)

    // Check slug uniqueness within organization
    const existingSlug = await prisma.category.findFirst({
      where: { organizationId, slug },
    })
    if (existingSlug) {
      return { success: false, error: "Já existe uma categoria com este slug" }
    }

    const category = await prisma.category.create({
      data: {
        organizationId,
        name: data.name,
        slug,
        description: data.description,
        parentId: data.parentId,
        order: data.order,
      },
    })

    revalidatePath("/admin/categorias")

    return { success: true, data: { id: category.id } }
  } catch (error) {
    console.error("Create category error:", error)
    return { success: false, error: "Erro ao criar categoria" }
  }
}

export async function updateCategory(id: string, formData: FormData): Promise<ApiResponse> {
  try {
    const session = await getSession()
    if (!session || (session.role !== "SYSTEM" && session.role !== "ADMIN")) {
      return { success: false, error: "Sem permissão" }
    }

    const category = await prisma.category.findUnique({ where: { id } })
    if (!category) {
      return { success: false, error: "Categoria não encontrada" }
    }

    // Check permission for non-system users
    if (session.role !== "SYSTEM" && category.organizationId !== session.organizationId) {
      return { success: false, error: "Sem permissão" }
    }

    const rawData = {
      name: formData.get("name") || undefined,
      slug: formData.get("slug") || undefined,
      description: formData.get("description") || undefined,
      parentId: formData.get("parentId") || undefined,
      order: formData.get("order") ? parseInt(formData.get("order") as string) : undefined,
    }

    const validated = updateCategorySchema.safeParse(rawData)
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message }
    }

    const data = validated.data

    // Check slug uniqueness if changed
    if (data.slug && data.slug !== category.slug) {
      const existingSlug = await prisma.category.findFirst({
        where: {
          organizationId: category.organizationId,
          slug: data.slug,
          id: { not: id },
        },
      })
      if (existingSlug) {
        return { success: false, error: "Já existe uma categoria com este slug" }
      }
    }

    // Prevent circular reference
    if (data.parentId === id) {
      return { success: false, error: "Uma categoria não pode ser pai de si mesma" }
    }

    await prisma.category.update({
      where: { id },
      data,
    })

    revalidatePath("/admin/categorias")

    return { success: true }
  } catch (error) {
    console.error("Update category error:", error)
    return { success: false, error: "Erro ao atualizar categoria" }
  }
}

export async function deleteCategory(id: string): Promise<ApiResponse> {
  try {
    const session = await getSession()
    if (!session || (session.role !== "SYSTEM" && session.role !== "ADMIN")) {
      return { success: false, error: "Sem permissão" }
    }

    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { children: true, publications: true } } },
    })

    if (!category) {
      return { success: false, error: "Categoria não encontrada" }
    }

    if (session.role !== "SYSTEM" && category.organizationId !== session.organizationId) {
      return { success: false, error: "Sem permissão" }
    }

    if (category._count.children > 0) {
      return { success: false, error: "Não é possível excluir categoria com subcategorias" }
    }

    if (category._count.publications > 0) {
      return { success: false, error: "Não é possível excluir categoria com publicações" }
    }

    await prisma.category.delete({ where: { id } })

    revalidatePath("/admin/categorias")

    return { success: true }
  } catch (error) {
    console.error("Delete category error:", error)
    return { success: false, error: "Erro ao excluir categoria" }
  }
}

// ============================================================================
// TAGS
// ============================================================================

export async function getTags(organizationId?: string) {
  const session = await getSession()
  if (!session) return []

  const orgId = session.role === "SYSTEM" ? organizationId : session.organizationId
  if (!orgId) return []

  const tags = await prisma.tag.findMany({
    where: { organizationId: orgId },
    include: {
      _count: { select: { publications: true } },
    },
    orderBy: { name: "asc" },
  })

  return tags
}

export async function createTag(formData: FormData): Promise<ApiResponse<{ id: string }>> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: "Não autenticado" }
    }

    const organizationId = session.role === "SYSTEM"
      ? (formData.get("organizationId") as string)
      : session.organizationId

    if (!organizationId) {
      return { success: false, error: "Organização não especificada" }
    }

    const rawData = {
      name: formData.get("name"),
      slug: formData.get("slug") || undefined,
    }

    const validated = createTagSchema.safeParse(rawData)
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message }
    }

    const data = validated.data
    const slug = data.slug || generateSlug(data.name)

    // Check slug uniqueness within organization
    const existingSlug = await prisma.tag.findFirst({
      where: { organizationId, slug },
    })
    if (existingSlug) {
      return { success: false, error: "Já existe uma tag com este slug" }
    }

    const tag = await prisma.tag.create({
      data: {
        organizationId,
        name: data.name,
        slug,
      },
    })

    revalidatePath("/admin/tags")

    return { success: true, data: { id: tag.id } }
  } catch (error) {
    console.error("Create tag error:", error)
    return { success: false, error: "Erro ao criar tag" }
  }
}

export async function updateTag(id: string, formData: FormData): Promise<ApiResponse> {
  try {
    const session = await getSession()
    if (!session || (session.role !== "SYSTEM" && session.role !== "ADMIN")) {
      return { success: false, error: "Sem permissão" }
    }

    const tag = await prisma.tag.findUnique({ where: { id } })
    if (!tag) {
      return { success: false, error: "Tag não encontrada" }
    }

    if (session.role !== "SYSTEM" && tag.organizationId !== session.organizationId) {
      return { success: false, error: "Sem permissão" }
    }

    const rawData = {
      name: formData.get("name") || undefined,
      slug: formData.get("slug") || undefined,
    }

    const validated = updateTagSchema.safeParse(rawData)
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message }
    }

    const data = validated.data

    // Check slug uniqueness if changed
    if (data.slug && data.slug !== tag.slug) {
      const existingSlug = await prisma.tag.findFirst({
        where: {
          organizationId: tag.organizationId,
          slug: data.slug,
          id: { not: id },
        },
      })
      if (existingSlug) {
        return { success: false, error: "Já existe uma tag com este slug" }
      }
    }

    await prisma.tag.update({
      where: { id },
      data,
    })

    revalidatePath("/admin/tags")

    return { success: true }
  } catch (error) {
    console.error("Update tag error:", error)
    return { success: false, error: "Erro ao atualizar tag" }
  }
}

export async function deleteTag(id: string): Promise<ApiResponse> {
  try {
    const session = await getSession()
    if (!session || (session.role !== "SYSTEM" && session.role !== "ADMIN")) {
      return { success: false, error: "Sem permissão" }
    }

    const tag = await prisma.tag.findUnique({ where: { id } })
    if (!tag) {
      return { success: false, error: "Tag não encontrada" }
    }

    if (session.role !== "SYSTEM" && tag.organizationId !== session.organizationId) {
      return { success: false, error: "Sem permissão" }
    }

    // Delete tag associations first
    await prisma.tagsOnPublications.deleteMany({
      where: { tagId: id },
    })

    await prisma.tag.delete({ where: { id } })

    revalidatePath("/admin/tags")

    return { success: true }
  } catch (error) {
    console.error("Delete tag error:", error)
    return { success: false, error: "Erro ao excluir tag" }
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function buildCategoryTree(
  categories: Array<{
    id: string
    name: string
    slug: string
    description: string | null
    parentId: string | null
    order: number
    _count?: { publications: number }
  }>
): CategoryWithChildren[] {
  const categoryMap = new Map<string, CategoryWithChildren>()
  const rootCategories: CategoryWithChildren[] = []

  // First pass: create all category objects
  categories.forEach((cat) => {
    categoryMap.set(cat.id, {
      ...cat,
      children: [],
    })
  })

  // Second pass: build tree
  categories.forEach((cat) => {
    const category = categoryMap.get(cat.id)!
    if (cat.parentId) {
      const parent = categoryMap.get(cat.parentId)
      if (parent) {
        parent.children.push(category)
      }
    } else {
      rootCategories.push(category)
    }
  })

  return rootCategories
}
