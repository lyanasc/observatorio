// Type definitions for the application

import { UserRole, PublicationStatus } from "@prisma/client"

// ============================================================================
// USER TYPES
// ============================================================================

export interface SessionUser {
  id: string
  name: string
  email: string
  role: UserRole
  organizationId: string | null
  organizationSlug?: string
}

export interface JWTPayload {
  sub: string
  email: string
  role: UserRole
  organizationId: string | null
  iat: number
  exp: number
}

// ============================================================================
// API TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface PaginationParams {
  page?: number
  limit?: number
}

// ============================================================================
// PUBLICATION TYPES
// ============================================================================

export interface PublicationFilters {
  status?: PublicationStatus
  categoryId?: string
  tagId?: string
  authorId?: string
  search?: string
}

export interface PublicationFormData {
  title: string
  slug?: string
  excerpt?: string
  content: string
  coverImage?: string
  categoryIds?: string[]
  tagIds?: string[]
  seoTitle?: string
  seoDescription?: string
  scheduledAt?: Date
}

// ============================================================================
// ORGANIZATION TYPES
// ============================================================================

export interface OrganizationFormData {
  name: string
  slug?: string
  domain?: string
  avatar?: string
  description?: string
}

// ============================================================================
// CATEGORY TYPES
// ============================================================================

export interface CategoryFormData {
  name: string
  slug?: string
  description?: string
  parentId?: string
  order?: number
}

export interface CategoryWithChildren {
  id: string
  name: string
  slug: string
  description: string | null
  parentId: string | null
  order: number
  children: CategoryWithChildren[]
  _count?: {
    publications: number
  }
}

// ============================================================================
// TAG TYPES
// ============================================================================

export interface TagFormData {
  name: string
  slug?: string
}

// ============================================================================
// COMMENT TYPES
// ============================================================================

export interface CommentFormData {
  content: string
  parentId?: string
}

// ============================================================================
// AUDIT TYPES
// ============================================================================

export interface AuditAction {
  action: string
  previousStatus?: PublicationStatus
  newStatus?: PublicationStatus
  observation?: string
}

// ============================================================================
// USER FORM TYPES
// ============================================================================

export interface UserFormData {
  name: string
  email: string
  password?: string
  role?: UserRole
  avatar?: string
}

// ============================================================================
// PERMISSION HELPERS
// ============================================================================

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  SYSTEM: 100,
  ADMIN: 80,
  VALIDATOR: 60,
  USER: 40,
}

export const hasPermission = (userRole: UserRole, requiredRole: UserRole): boolean => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

export const canManageOrganization = (role: UserRole): boolean => {
  return role === "SYSTEM" || role === "ADMIN"
}

export const canValidatePublications = (role: UserRole): boolean => {
  return role === "SYSTEM" || role === "ADMIN" || role === "VALIDATOR"
}

export const canCreatePublications = (role: UserRole): boolean => {
  return true // All roles can create publications
}
