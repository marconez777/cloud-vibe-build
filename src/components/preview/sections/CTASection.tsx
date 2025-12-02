import type { GlobalStyles } from "@/types/layout-tree";

interface CTAContent {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
}

interface CTASectionProps {
  content: Record<string, unknown>;
  styles: GlobalStyles;
}

export function CTASection({ content, styles }: CTASectionProps) {
  const {
    title = "Pronto para começar?",
    subtitle = "Entre em contato e transforme seu negócio hoje mesmo",
    ctaText = "Fale Conosco",
  } = content as CTAContent;

  return (
    <section
      className="px-6 py-20 text-center text-white"
      style={{ backgroundColor: styles.primaryColor }}
    >
      <div className="mx-auto max-w-3xl">
        <h2
          className="text-3xl font-bold sm:text-4xl"
          style={{ fontFamily: styles.headingFont }}
        >
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl opacity-90">{subtitle}</p>
        <button
          className="mt-8 rounded-lg px-8 py-3 font-semibold transition-transform hover:scale-105"
          style={{ backgroundColor: styles.secondaryColor }}
        >
          {ctaText}
        </button>
      </div>
    </section>
  );
}
