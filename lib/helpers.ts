import slugify from "slugify"
import { format, formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

// ============================================================================
// SLUG UTILITIES
// ============================================================================

export function generateSlug(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,
    locale: "pt",
  })
}

// ============================================================================
// DATE UTILITIES
// ============================================================================

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return format(d, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return format(d, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return formatDistanceToNow(d, { addSuffix: true, locale: ptBR })
}

export function formatShortDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return format(d, "dd/MM/yyyy", { locale: ptBR })
}

// ============================================================================
// STRING UTILITIES
// ============================================================================

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length).trim() + "..."
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

// ============================================================================
// PUBLICATION STATUS LABELS
// ============================================================================

export const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Rascunho",
  PENDING_REVIEW: "Aguardando revisão",
  CORRECTION_REQUESTED: "Correção solicitada",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
  SCHEDULED: "Agendado",
  PUBLISHED: "Publicado",
  ARCHIVED: "Arquivado",
}

export const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  PENDING_REVIEW: "bg-yellow-100 text-yellow-800",
  CORRECTION_REQUESTED: "bg-orange-100 text-orange-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  SCHEDULED: "bg-blue-100 text-blue-800",
  PUBLISHED: "bg-emerald-100 text-emerald-800",
  ARCHIVED: "bg-gray-100 text-gray-800",
}

export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] || status
}

export function getStatusColor(status: string): string {
  return STATUS_COLORS[status] || "bg-muted text-muted-foreground"
}

// ============================================================================
// ROLE LABELS
// ============================================================================

export const ROLE_LABELS: Record<string, string> = {
  SYSTEM: "Super Administrador",
  ADMIN: "Administrador",
  VALIDATOR: "Validador",
  USER: "Usuário",
}

export function getRoleLabel(role: string): string {
  return ROLE_LABELS[role] || role
}

// ============================================================================
// NUMBER UTILITIES
// ============================================================================

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M"
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K"
  }
  return num.toString()
}

// ============================================================================
// FILE UTILITIES
// ============================================================================

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2)
}

export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith("image/")
}

// ============================================================================
// URL UTILITIES
// ============================================================================

export function getPublicationUrl(slug: string, organizationSlug?: string): string {
  if (organizationSlug) {
    return `/${organizationSlug}/${slug}`
  }
  return `/${slug}`
}

export function getCategoryUrl(slug: string, organizationSlug?: string): string {
  if (organizationSlug) {
    return `/${organizationSlug}/categoria/${slug}`
  }
  return `/categoria/${slug}`
}
