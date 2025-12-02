import type { GlobalStyles } from "@/types/layout-tree";

interface HeroContent {
  headline?: string;
  subheadline?: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundImage?: string;
}

interface HeroSectionProps {
  content: Record<string, unknown>;
  styles: GlobalStyles;
}

export function HeroSection({ content, styles }: HeroSectionProps) {
  const {
    headline = "Bem-vindo ao seu site",
    subheadline = "Crie experiências incríveis para seus clientes",
    ctaText = "Saiba Mais",
    backgroundImage,
  } = content as HeroContent;

  return (
    <section
      className="relative flex min-h-[70vh] items-center justify-center px-6 py-20"
      style={{
        backgroundColor: styles.primaryColor,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {backgroundImage && (
        <div className="absolute inset-0 bg-black/50" />
      )}
      <div className="relative z-10 mx-auto max-w-4xl text-center text-white">
        <h1
          className="text-4xl font-bold leading-tight sm:text-5xl md:text-6xl"
          style={{ fontFamily: styles.headingFont }}
        >
          {headline}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg opacity-90 sm:text-xl">
          {subheadline}
        </p>
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
