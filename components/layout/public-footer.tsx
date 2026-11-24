import Link from "next/link"

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
                <span className="text-sm font-bold text-background">O</span>
              </div>
              <span className="text-lg font-semibold tracking-tight">Observatório</span>
            </Link>
            <p className="mt-4 max-w-md text-sm text-muted-foreground">
              Plataforma dedicada à produção e disseminação de conhecimento,
              conectando pesquisadores, especialistas e a sociedade.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Navegação</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/publicacoes"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Publicações
                </Link>
              </li>
              <li>
                <Link
                  href="/categorias"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Categorias
                </Link>
              </li>
              <li>
                <Link
                  href="/sobre"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Sobre
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/termos"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link
                  href="/privacidade"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Privacidade
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Observatório. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
