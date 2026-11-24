import { ImageIcon, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/empty-state"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Mídias",
}

export default function MediaPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mídias</h1>
          <p className="text-muted-foreground">Gerencie seus arquivos e imagens</p>
        </div>
        <Button>
          <Upload className="h-4 w-4" />
          Fazer upload
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Biblioteca de Mídias</CardTitle>
          <CardDescription>
            Arraste arquivos aqui ou clique para fazer upload
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={ImageIcon}
            title="Nenhum arquivo encontrado"
            description="Faça upload de imagens e arquivos para usar nas publicações"
            action={{
              label: "Fazer upload",
              onClick: () => {},
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
