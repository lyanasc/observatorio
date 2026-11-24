import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  className?: string
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  DRAFT: {
    label: "Rascunho",
    className: "bg-muted text-muted-foreground",
  },
  PENDING_REVIEW: {
    label: "Aguardando revisão",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500",
  },
  CORRECTION_REQUESTED: {
    label: "Correção solicitada",
    className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-500",
  },
  APPROVED: {
    label: "Aprovado",
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500",
  },
  REJECTED: {
    label: "Rejeitado",
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500",
  },
  SCHEDULED: {
    label: "Agendado",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500",
  },
  PUBLISHED: {
    label: "Publicado",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-500",
  },
  ARCHIVED: {
    label: "Arquivado",
    className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-500",
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    className: "bg-muted text-muted-foreground",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
