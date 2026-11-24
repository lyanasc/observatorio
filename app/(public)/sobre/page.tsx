import { Card, CardContent } from "@/components/ui/card"
import { Users, Target, BookOpen, Globe } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Sobre o Observatório
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Somos uma plataforma dedicada à produção e disseminação de conhecimento
            de qualidade, conectando pesquisadores, especialistas e a sociedade em
            busca de soluções para os desafios contemporâneos.
          </p>
        </div>

        {/* Mission Cards */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-semibold">Missão</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Democratizar o acesso ao conhecimento científico e promover o
                debate público informado sobre temas relevantes para a sociedade.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-semibold">Visão</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Ser referência na produção de conteúdo acadêmico acessível,
                contribuindo para uma sociedade mais informada e participativa.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-semibold">Comunidade</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Reunimos pesquisadores, professores, estudantes e profissionais
                comprometidos com a produção de conhecimento de qualidade.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-semibold">Impacto</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Nossas publicações alcançam leitores em todo o Brasil e
                América Latina, contribuindo para o debate público regional.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Content Section */}
        <div className="mx-auto mt-16 max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight">Nossa História</h2>
          <div className="mt-6 space-y-4 text-muted-foreground">
            <p>
              O Observatório nasceu da necessidade de criar um espaço onde o
              conhecimento acadêmico pudesse ser compartilhado de forma acessível
              e relevante para a sociedade. Fundado por um grupo de pesquisadores
              e profissionais de diversas áreas, o projeto começou como uma
              iniciativa independente e cresceu para se tornar uma plataforma
              consolidada de produção de conteúdo.
            </p>
            <p>
              Ao longo dos anos, construímos uma comunidade engajada de autores
              e leitores, unidos pelo compromisso com a qualidade da informação
              e a busca por soluções para os desafios contemporâneos. Nossas
              publicações abordam temas como educação, meio ambiente, tecnologia,
              saúde pública, política e urbanismo, sempre com rigor metodológico
              e linguagem acessível.
            </p>
            <p>
              Hoje, o Observatório é reconhecido como uma fonte confiável de
              análises e reflexões sobre questões que impactam a vida de milhões
              de pessoas. Continuamos comprometidos com nossa missão original:
              democratizar o acesso ao conhecimento e contribuir para uma
              sociedade mais informada e participativa.
            </p>
          </div>

          <h2 className="mt-12 text-2xl font-bold tracking-tight">
            Como Contribuir
          </h2>
          <div className="mt-6 space-y-4 text-muted-foreground">
            <p>
              O Observatório está sempre aberto a novas contribuições. Se você é
              pesquisador, especialista ou profissional com interesse em
              compartilhar conhecimento, convidamos você a fazer parte da nossa
              comunidade de autores.
            </p>
            <p>
              Todas as publicações passam por um processo de revisão editorial
              para garantir a qualidade e relevância do conteúdo. Entre em
              contato conosco para saber mais sobre como submeter seu trabalho.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
