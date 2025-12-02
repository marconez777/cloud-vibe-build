import { useState } from "react";
import type { GlobalStyles } from "@/types/layout-tree";

interface FAQ {
  question: string;
  answer: string;
}

interface FAQContent {
  title?: string;
  faqs?: FAQ[];
}

interface FAQSectionProps {
  content: Record<string, unknown>;
  styles: GlobalStyles;
}

export function FAQSection({ content, styles }: FAQSectionProps) {
  const {
    title = "Perguntas Frequentes",
    faqs = [
      {
        question: "Como funciona o serviço?",
        answer: "Nosso serviço funciona de forma simples e intuitiva. Basta entrar em contato e nossa equipe vai te guiar em cada etapa.",
      },
      {
        question: "Qual o prazo de entrega?",
        answer: "O prazo varia de acordo com o projeto, mas geralmente entregamos em 7 a 15 dias úteis.",
      },
      {
        question: "Vocês oferecem suporte?",
        answer: "Sim! Oferecemos suporte completo 24/7 para todos os nossos clientes.",
      },
      {
        question: "Posso cancelar a qualquer momento?",
        answer: "Sim, você pode cancelar seu plano a qualquer momento sem taxas adicionais.",
      },
    ],
  } = content as FAQContent;

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <h2
          className="mb-12 text-center text-3xl font-bold sm:text-4xl"
          style={{ fontFamily: styles.headingFont, color: styles.primaryColor }}
        >
          {title}
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-xl border border-gray-200 bg-white"
            >
              <button
                className="flex w-full items-center justify-between p-6 text-left"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span
                  className="font-semibold"
                  style={{ fontFamily: styles.headingFont }}
                >
                  {faq.question}
                </span>
                <span
                  className="text-2xl"
                  style={{ color: styles.primaryColor }}
                >
                  {openIndex === index ? "−" : "+"}
                </span>
              </button>
              {openIndex === index && (
                <div className="border-t border-gray-100 px-6 pb-6">
                  <p className="pt-4 text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
