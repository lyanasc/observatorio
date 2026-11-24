"use server"

import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"

// ============================================================================
// DASHBOARD STATS
// ============================================================================

export async function getDashboardStats() {
  const session = await getSession()
  if (!session) return null

  const where: Record<string, unknown> = {}
  if (session.role !== "SYSTEM" && session.organizationId) {
    where.organizationId = session.organizationId
  }

  const [
    totalPublications,
    publishedPublications,
    draftPublications,
    pendingPublications,
    totalUsers,
    totalComments,
    pendingComments,
    totalViews,
  ] = await Promise.all([
    prisma.publication.count({ where: { ...where, deletedAt: null } }),
    prisma.publication.count({ where: { ...where, status: "PUBLISHED", deletedAt: null } }),
    prisma.publication.count({ where: { ...where, status: "DRAFT", deletedAt: null } }),
    prisma.publication.count({ where: { ...where, status: "PENDING_REVIEW", deletedAt: null } }),
    session.role === "SYSTEM"
      ? prisma.user.count()
      : prisma.user.count({ where: { organizationId: session.organizationId } }),
    session.role === "SYSTEM"
      ? prisma.comment.count()
      : prisma.comment.count({ where: { publication: { organizationId: session.organizationId } } }),
    session.role === "SYSTEM"
      ? prisma.comment.count({ where: { isApproved: false } })
      : prisma.comment.count({ where: { isApproved: false, publication: { organizationId: session.organizationId } } }),
    prisma.publication.aggregate({
      where: { ...where, deletedAt: null },
      _sum: { viewCount: true },
    }),
  ])

  return {
    totalPublications,
    publishedPublications,
    draftPublications,
    pendingPublications,
    totalUsers,
    totalComments,
    pendingComments,
    totalViews: totalViews._sum.viewCount || 0,
  }
}

// ============================================================================
// RECENT PUBLICATIONS
// ============================================================================

export async function getRecentPublications(limit = 5) {
  const session = await getSession()
  if (!session) return []

  const where: Record<string, unknown> = { deletedAt: null }
  if (session.role !== "SYSTEM" && session.organizationId) {
    where.organizationId = session.organizationId
  }

  const publications = await prisma.publication.findMany({
    where,
    include: {
      author: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  })

  return publications
}

// ============================================================================
// RECENT ACTIVITY (Audit Logs)
// ============================================================================

export async function getRecentActivity(limit = 10) {
  const session = await getSession()
  if (!session) return []

  const where: Record<string, unknown> = {}
  if (session.role !== "SYSTEM" && session.organizationId) {
    where.publication = { organizationId: session.organizationId }
  }

  const logs = await prisma.auditLog.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      publication: { select: { id: true, title: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  })

  return logs
}

// ============================================================================
// PUBLICATIONS BY STATUS (for charts)
// ============================================================================

export async function getPublicationsByStatus() {
  const session = await getSession()
  if (!session) return []

  const where: Record<string, unknown> = { deletedAt: null }
  if (session.role !== "SYSTEM" && session.organizationId) {
    where.organizationId = session.organizationId
  }

  const result = await prisma.publication.groupBy({
    by: ["status"],
    where,
    _count: { _all: true },
  })

  return result.map((item) => ({
    status: item.status,
    count: item._count._all,
  }))
}

// ============================================================================
// PUBLICATIONS OVER TIME (for charts)
// ============================================================================

export async function getPublicationsOverTime(days = 30) {
  const session = await getSession()
  if (!session) return []

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const where: Record<string, unknown> = {
    createdAt: { gte: startDate },
    deletedAt: null,
  }
  if (session.role !== "SYSTEM" && session.organizationId) {
    where.organizationId = session.organizationId
  }

  const publications = await prisma.publication.findMany({
    where,
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  })

  // Group by date
  const grouped = publications.reduce((acc, pub) => {
    const date = pub.createdAt.toISOString().split("T")[0]
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Fill in missing dates
  const result: { date: string; count: number }[] = []
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    const dateStr = date.toISOString().split("T")[0]
    result.push({ date: dateStr, count: grouped[dateStr] || 0 })
  }

  return result
}

// ============================================================================
// TOP AUTHORS
// ============================================================================

export async function getTopAuthors(limit = 5) {
  const session = await getSession()
  if (!session) return []

  const where: Record<string, unknown> = { deletedAt: null, status: "PUBLISHED" }
  if (session.role !== "SYSTEM" && session.organizationId) {
    where.organizationId = session.organizationId
  }

  const result = await prisma.publication.groupBy({
    by: ["authorId"],
    where,
    _count: { _all: true },
    orderBy: { _count: { authorId: "desc" } },
    take: limit,
  })

  // Get author details
  const authorIds = result.map((r) => r.authorId)
  const authors = await prisma.user.findMany({
    where: { id: { in: authorIds } },
    select: { id: true, name: true, avatar: true },
  })

  return result.map((r) => ({
    author: authors.find((a) => a.id === r.authorId),
    count: r._count._all,
  }))
}

// ============================================================================
// SYSTEM STATS (for super-admin)
// ============================================================================

export async function getSystemStats() {
  const session = await getSession()
  if (!session || session.role !== "SYSTEM") return null

  const [
    totalOrganizations,
    activeOrganizations,
    totalUsers,
    totalPublications,
    publishedPublications,
  ] = await Promise.all([
    prisma.organization.count(),
    prisma.organization.count({ where: { isActive: true } }),
    prisma.user.count(),
    prisma.publication.count({ where: { deletedAt: null } }),
    prisma.publication.count({ where: { status: "PUBLISHED", deletedAt: null } }),
  ])

  return {
    totalOrganizations,
    activeOrganizations,
    totalUsers,
    totalPublications,
    publishedPublications,
  }
}
