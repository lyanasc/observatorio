import { z } from "zod"
import { UserRole, PublicationStatus } from "@prisma/client"

// ============================================================================
// AUTH VALIDATIONS
// ============================================================================

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
})

export const registerSchema = z
  .object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
    email: z.string().email("E-mail inválido"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  })

export const forgotPasswordSchema = z.object({
  email: z.string().email("E-mail inválido"),
})

export const resetPasswordSchema = z
  .object({
    token: z.string(),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  })

// ============================================================================
// USER VALIDATIONS
// ============================================================================

export const createUserSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  role: z.nativeEnum(UserRole).optional().default("USER"),
  avatar: z.string().url("URL inválida").optional().nullable(),
})

export const updateUserSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres").optional(),
  email: z.string().email("E-mail inválido").optional(),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres").optional(),
  role: z.nativeEnum(UserRole).optional(),
  avatar: z.string().url("URL inválida").optional().nullable(),
  isActive: z.boolean().optional(),
})

// ============================================================================
// ORGANIZATION VALIDATIONS
// ============================================================================

export const createOrganizationSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  slug: z
    .string()
    .min(2, "O slug deve ter pelo menos 2 caracteres")
    .regex(/^[a-z0-9-]+$/, "O slug deve conter apenas letras minúsculas, números e hífens")
    .optional(),
  domain: z.string().optional().nullable(),
  avatar: z.string().url("URL inválida").optional().nullable(),
  description: z.string().optional().nullable(),
})

export const updateOrganizationSchema = createOrganizationSchema.partial().extend({
  isActive: z.boolean().optional(),
})

// ============================================================================
// PUBLICATION VALIDATIONS
// ============================================================================

export const createPublicationSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  slug: z
    .string()
    .min(2, "O slug deve ter pelo menos 2 caracteres")
    .regex(/^[a-z0-9-]+$/, "O slug deve conter apenas letras minúsculas, números e hífens")
    .optional(),
  excerpt: z.string().max(300, "O resumo deve ter no máximo 300 caracteres").optional().nullable(),
  content: z.string().min(10, "O conteúdo deve ter pelo menos 10 caracteres"),
  coverImage: z.string().url("URL inválida").optional().nullable(),
  categoryIds: z.array(z.string()).optional().default([]),
  tagIds: z.array(z.string()).optional().default([]),
  seoTitle: z.string().max(60, "O título SEO deve ter no máximo 60 caracteres").optional().nullable(),
  seoDescription: z.string().max(160, "A descrição SEO deve ter no máximo 160 caracteres").optional().nullable(),
  scheduledAt: z.coerce.date().optional().nullable(),
})

export const updatePublicationSchema = createPublicationSchema.partial()

export const changePublicationStatusSchema = z.object({
  status: z.nativeEnum(PublicationStatus),
  observation: z.string().optional(),
})

// ============================================================================
// CATEGORY VALIDATIONS
// ============================================================================

export const createCategorySchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  slug: z
    .string()
    .min(2, "O slug deve ter pelo menos 2 caracteres")
    .regex(/^[a-z0-9-]+$/, "O slug deve conter apenas letras minúsculas, números e hífens")
    .optional(),
  description: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
  order: z.number().int().optional().default(0),
})

export const updateCategorySchema = createCategorySchema.partial()

// ============================================================================
// TAG VALIDATIONS
// ============================================================================

export const createTagSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  slug: z
    .string()
    .min(2, "O slug deve ter pelo menos 2 caracteres")
    .regex(/^[a-z0-9-]+$/, "O slug deve conter apenas letras minúsculas, números e hífens")
    .optional(),
})

export const updateTagSchema = createTagSchema.partial()

// ============================================================================
// COMMENT VALIDATIONS
// ============================================================================

export const createCommentSchema = z.object({
  content: z.string().min(3, "O comentário deve ter pelo menos 3 caracteres"),
  parentId: z.string().optional().nullable(),
})

export const updateCommentSchema = z.object({
  content: z.string().min(3, "O comentário deve ter pelo menos 3 caracteres").optional(),
  isApproved: z.boolean().optional(),
})

// ============================================================================
// COMMON VALIDATIONS
// ============================================================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
})

export const searchSchema = z.object({
  q: z.string().optional(),
})

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>
export type CreatePublicationInput = z.infer<typeof createPublicationSchema>
export type UpdatePublicationInput = z.infer<typeof updatePublicationSchema>
export type ChangePublicationStatusInput = z.infer<typeof changePublicationStatusSchema>
export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type CreateTagInput = z.infer<typeof createTagSchema>
export type UpdateTagInput = z.infer<typeof updateTagSchema>
export type CreateCommentInput = z.infer<typeof createCommentSchema>
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
