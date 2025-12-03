import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  Zap,
  Code2,
  MessageSquare,
  Download,
  Brain,
  ArrowRight,
  Check,
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Vibe Coding",
    description: "Descreva seu site em linguagem natural e a IA cria a estrutura completa.",
  },
  {
    icon: Brain,
    title: "IA Treinável",
    description: "Base de conhecimento personalizável. A IA aprende com seus arquivos.",
  },
  {
    icon: Code2,
    title: "Código PHP Limpo",
    description: "Export código PHP, HTML e CSS pronto para upload no seu servidor.",
  },
  {
    icon: Zap,
    title: "Rápido & Simples",
    description: "Do briefing ao site pronto em minutos, não em dias.",
  },
];

const steps = [
  { step: "01", title: "Descreva", description: "Conte sobre seu negócio e o site que precisa" },
  { step: "02", title: "Refine", description: "Converse com a IA para ajustar cada detalhe" },
  { step: "03", title: "Exporte", description: "Baixe o código PHP pronto para usar" },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-heading text-xl font-bold">
              PHP<span className="gradient-text">Vibe</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/help">
              <Button variant="ghost" size="sm">
                Ajuda
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" size="sm">
                Entrar
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="hero" size="sm">
                Começar Agora
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20">
        {/* Background effects */}
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
        
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
              <Sparkles className="h-4 w-4" />
              Powered by Gemini AI
            </div>
            
            <h1 className="font-heading text-5xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl">
              Crie sites PHP com{" "}
              <span className="gradient-text">conversas</span>
            </h1>
            
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Descreva o site que você precisa, converse com a IA para refinar, 
              e exporte código PHP limpo pronto para seu servidor.
            </p>
            
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link to="/new">
                <Button variant="hero" size="xl">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Criar Meu Site
                </Button>
              </Link>
              <Link to="/projects">
                <Button variant="outline" size="xl">
                  Ver Exemplos
                </Button>
              </Link>
            </div>
          </div>

          {/* Preview mockup */}
          <div className="relative mx-auto mt-20 max-w-5xl">
            <div className="glass rounded-2xl p-2 shadow-glow">
              <div className="rounded-xl bg-muted/50 p-8">
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-3 w-3 rounded-full bg-destructive" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                      <span className="text-sm">👤</span>
                    </div>
                    <div className="glass rounded-2xl rounded-tl-sm p-4 max-w-lg">
                      <p className="text-sm text-foreground">
                        Quero um site para minha clínica odontológica com hero, serviços, 
                        depoimentos e formulário de contato. Cores azul e branco.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 flex-row-reverse">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full gradient-primary">
                      <Sparkles className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="gradient-primary rounded-2xl rounded-tr-sm p-4 max-w-lg">
                      <p className="text-sm text-primary-foreground">
                        Perfeito! Criei um layout profissional com 5 seções. O hero 
                        destaca sua clínica, serviços em cards, depoimentos com fotos...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="font-heading text-3xl font-bold md:text-4xl">
              Por que escolher o PHPVibe?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Tudo que você precisa para criar sites profissionais rapidamente
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                variant="feature"
                className="animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
                    <feature.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 gradient-hero">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="font-heading text-3xl font-bold md:text-4xl">
              Como funciona
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Três passos simples para seu site ficar pronto
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {steps.map((item, index) => (
              <div
                key={item.step}
                className="relative animate-slide-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {index < steps.length - 1 && (
                  <div className="absolute left-1/2 top-12 hidden h-0.5 w-full bg-gradient-to-r from-primary/50 to-transparent md:block" />
                )}
                <div className="relative flex flex-col items-center text-center">
                  <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl glass border-primary/30">
                    <span className="font-heading text-3xl font-bold gradient-text">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="font-heading text-xl font-semibold">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <Card variant="gradient" className="relative overflow-hidden p-12 text-center">
            <div className="absolute inset-0 gradient-hero opacity-50" />
            <div className="relative">
              <h2 className="font-heading text-3xl font-bold md:text-4xl">
                Pronto para criar seu site?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
                Comece agora gratuitamente. Sem cartão de crédito, sem complicação.
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link to="/new">
                  <Button variant="hero" size="xl">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Começar Agora
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  100% Gratuito
                </span>
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  Código Exportável
                </span>
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  Cadastro Rápido
                </span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-heading font-bold">PHPVibe</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 PHPVibe. Feito com ❤️ e IA.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
