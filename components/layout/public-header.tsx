"use client"

import Link from "next/link"
import { useAuth } from "@/providers/auth-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Menu, User, LogOut, Settings, FileText } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function PublicHeader() {
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
              <span className="text-sm font-bold text-background">O</span>
            </div>
            <span className="text-lg font-semibold tracking-tight">Observatório</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/publicacoes"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Publicações
            </Link>
            <Link
              href="/categorias"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Categorias
            </Link>
            <Link
              href="/sobre"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Sobre
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Search className="h-4 w-4" />
            <span className="sr-only">Pesquisar</span>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <User className="h-4 w-4" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                {(user.role === "ADMIN" || user.role === "VALIDATOR" || user.role === "SYSTEM") && (
                  <DropdownMenuItem asChild>
                    <Link href={user.role === "SYSTEM" ? "/system" : "/admin"}>
                      <FileText className="mr-2 h-4 w-4" />
                      Painel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/perfil">
                    <Settings className="mr-2 h-4 w-4" />
                    Configurações
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
                <Link href="/login">Entrar</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/cadastro">Cadastrar</Link>
              </Button>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "border-t border-border md:hidden",
          mobileMenuOpen ? "block" : "hidden"
        )}
      >
        <nav className="flex flex-col gap-1 p-4">
          <Link
            href="/publicacoes"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Publicações
          </Link>
          <Link
            href="/categorias"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Categorias
          </Link>
          <Link
            href="/sobre"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Sobre
          </Link>
          {!user && (
            <Link
              href="/login"
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground sm:hidden"
            >
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
