import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export const metadata = {
  title: "Configurações",
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações da sua organização</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações da Organização</CardTitle>
            <CardDescription>
              Informações básicas sobre sua organização
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" placeholder="Nome da organização" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" placeholder="minha-organizacao" />
              <p className="text-xs text-muted-foreground">
                URL: observatorio.com/minha-organizacao
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" placeholder="Descrição da organização" />
            </div>
            <Button>Salvar alterações</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Domínio Personalizado</CardTitle>
            <CardDescription>
              Configure um domínio personalizado para sua organização
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="domain">Domínio</Label>
              <Input id="domain" placeholder="meusite.com.br" />
              <p className="text-xs text-muted-foreground">
                Configure o DNS para apontar para nossos servidores
              </p>
            </div>
            <Button>Verificar domínio</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Zona de Perigo</CardTitle>
            <CardDescription>
              Ações irreversíveis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive">Excluir organização</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
