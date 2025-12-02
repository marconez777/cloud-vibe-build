import type { GlobalStyles } from "@/types/layout-tree";

interface Testimonial {
  name: string;
  role?: string;
  content: string;
  avatar?: string;
}

interface TestimonialsContent {
  title?: string;
  testimonials?: Testimonial[];
}

interface TestimonialsSectionProps {
  content: Record<string, unknown>;
  styles: GlobalStyles;
}

export function TestimonialsSection({ content, styles }: TestimonialsSectionProps) {
  const {
    title = "O que dizem nossos clientes",
    testimonials = [
      {
        name: "Maria Silva",
        role: "CEO, Empresa X",
        content: "Excelente serviço! Superou todas as nossas expectativas.",
      },
      {
        name: "João Santos",
        role: "Diretor, Empresa Y",
        content: "Profissionais dedicados e resultados impressionantes.",
      },
      {
        name: "Ana Costa",
        role: "Gerente, Empresa Z",
        content: "Recomendo a todos. Parceria de sucesso há anos.",
      },
    ],
  } = content as TestimonialsContent;

  return (
    <section className="bg-gray-50 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <h2
          className="mb-12 text-center text-3xl font-bold sm:text-4xl"
          style={{ fontFamily: styles.headingFont, color: styles.primaryColor }}
        >
          {title}
        </h2>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="rounded-xl bg-white p-6 shadow-sm"
            >
              <p className="mb-4 text-gray-600 italic">
                "{testimonial.content}"
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: styles.primaryColor }}
                >
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  {testimonial.role && (
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
