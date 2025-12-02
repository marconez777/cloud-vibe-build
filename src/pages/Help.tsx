import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  HelpCircle,
  MessageSquare,
  Code2,
  Download,
  Brain,
  Sparkles,
} from "lucide-react";

const faqs = [
  {
    question: "Como funciona o PHPVibe?",
    answer:
      "O PHPVibe usa inteligência artificial para transformar suas descrições em sites completos. Você descreve o que precisa em linguagem natural, a IA gera a estrutura, você refina através de conversa, e no final exporta código PHP/HTML/CSS pronto para usar.",
  },
  {
    question: "Preciso saber programar?",
    answer:
      "Não! O PHPVibe foi criado para pessoas sem conhecimento técnico. Você só precisa descrever o que quer em português e a IA cuida do resto. Se quiser ajustar algo, é só pedir em linguagem natural.",
  },
  {
    question: "O que é 'Vibe Coding'?",
    answer:
      "Vibe Coding é nossa forma de interagir com a IA através de conversa. Em vez de escrever código, você conversa: 'mude a cor do botão para azul', 'adicione uma seção de depoimentos', etc.",
  },
  {
    question: "Como funciona a Base de Conhecimento?",
    answer:
      "A Base de Conhecimento permite que você treine a IA com informações específicas do seu negócio. Adicione padrões, preferências, textos comuns, e a IA vai considerar tudo isso ao gerar seus sites.",
  },
  {
    question: "Posso usar o código gerado comercialmente?",
    answer:
      "Sim! O código gerado é 100% seu. Você pode usar em projetos pessoais ou comerciais, modificar, revender - sem restrições.",
  },
  {
    question: "Como faço upload do site para meu servidor?",
    answer:
      "Após gerar seu site, clique em 'Exportar' para baixar um arquivo ZIP com todos os arquivos. Depois é só fazer upload via FTP, cPanel, ou o método que seu servidor suportar.",
  },
];

const guides = [
  {
    icon: MessageSquare,
    title: "Criando seu primeiro projeto",
    description: "Aprenda a descrever seu site para a IA de forma eficiente",
  },
  {
    icon: Sparkles,
    title: "Refinando com Vibe Coding",
    description: "Como usar o chat para ajustar cada detalhe do seu site",
  },
  {
    icon: Brain,
    title: "Treinando a IA",
    description: "Configure a Base de Conhecimento para resultados personalizados",
  },
  {
    icon: Download,
    title: "Exportando e publicando",
    description: "Do download ao site no ar em poucos minutos",
  },
];

export default function Help() {
  return (
    <AppLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold">Central de Ajuda</h1>
          <p className="mt-2 text-muted-foreground">
            Tudo que você precisa saber para criar sites incríveis
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* FAQ */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  Perguntas Frequentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="text-base">Guias Rápidos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {guides.map((guide, index) => (
                  <button
                    key={index}
                    className="flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted/50"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <guide.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{guide.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {guide.description}
                      </p>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardContent className="p-4">
                <h4 className="font-semibold text-sm mb-2">Precisa de mais ajuda?</h4>
                <p className="text-xs text-muted-foreground">
                  Entre em contato conosco pelo email{" "}
                  <a href="mailto:suporte@phpvibe.com" className="text-primary hover:underline">
                    suporte@phpvibe.com
                  </a>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
