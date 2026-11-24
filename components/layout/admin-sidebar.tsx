"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FileText,
  Users,
  FolderTree,
  Tags,
  MessageSquare,
  ImageIcon,
  Settings,
  Building2,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/providers/auth-provider"
import { useState } from "react"

interface SidebarProps {
  isSystem?: boolean
}

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/publicacoes", label: "Publicações", icon: FileText },
  { href: "/admin/usuarios", label: "Usuários", icon: Users },
  { href: "/admin/categorias", label: "Categorias", icon: FolderTree },
  { href: "/admin/tags", label: "Tags", icon: Tags },
  { href: "/admin/comentarios", label: "Comentários", icon: MessageSquare },
  { href: "/admin/midias", label: "Mídias", icon: ImageIcon },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
]

const systemLinks = [
  { href: "/system", label: "Dashboard", icon: LayoutDashboard },
  { href: "/system/organizacoes", label: "Organizações", icon: Building2 },
  { href: "/system/usuarios", label: "Usuários", icon: Users },
]

export function AdminSidebar({ isSystem = false }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  const links = isSystem ? systemLinks : adminLinks

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-background border-r border-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {!collapsed && (
          <Link href={isSystem ? "/system" : "/admin"} className="font-semibold text-lg tracking-tight">
            Observatório
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const isActive = pathname === link.href || 
            (link.href !== "/admin" && link.href !== "/system" && pathname.startsWith(link.href))
          const Icon = link.icon

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
              title={collapsed ? link.label : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-border">
        {!collapsed && user && (
          <div className="mb-3 px-3">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        )}
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-muted-foreground hover:text-foreground",
            collapsed && "justify-center px-0"
          )}
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Sair</span>}
        </Button>
      </div>
    </aside>
  )
}
