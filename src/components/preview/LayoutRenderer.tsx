import type { LayoutTree, Section, GlobalStyles } from "@/types/layout-tree";
import { HeroSection } from "./sections/HeroSection";
import { ServicesSection } from "./sections/ServicesSection";
import { FeaturesSection } from "./sections/FeaturesSection";
import { AboutSection } from "./sections/AboutSection";
import { StatsSection } from "./sections/StatsSection";
import { TestimonialsSection } from "./sections/TestimonialsSection";
import { TeamSection } from "./sections/TeamSection";
import { PricingSection } from "./sections/PricingSection";
import { FAQSection } from "./sections/FAQSection";
import { GallerySection } from "./sections/GallerySection";
import { BlogSection } from "./sections/BlogSection";
import { ContactSection } from "./sections/ContactSection";
import { CTASection } from "./sections/CTASection";
import { FooterSection } from "./sections/FooterSection";

interface LayoutRendererProps {
  layoutTree: LayoutTree;
}

const sectionComponents: Record<
  string,
  React.ComponentType<{ content: Record<string, unknown>; styles: GlobalStyles }>
> = {
  hero: HeroSection,
  services: ServicesSection,
  features: FeaturesSection,
  about: AboutSection,
  stats: StatsSection,
  testimonials: TestimonialsSection,
  team: TeamSection,
  pricing: PricingSection,
  faq: FAQSection,
  gallery: GallerySection,
  blog: BlogSection,
  contact: ContactSection,
  cta: CTASection,
  footer: FooterSection,
};

export function LayoutRenderer({ layoutTree }: LayoutRendererProps) {
  const homepage = layoutTree.pages.find((page) => page.isHomepage);

  if (!homepage) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center">
        <p className="text-muted-foreground">Nenhuma página inicial encontrada</p>
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: layoutTree.globalStyles.fontFamily,
        "--primary-color": layoutTree.globalStyles.primaryColor,
        "--secondary-color": layoutTree.globalStyles.secondaryColor,
      } as React.CSSProperties}
    >
      {homepage.sections.map((section) => {
        const SectionComponent = sectionComponents[section.type];

        if (!SectionComponent) {
          return (
            <div
              key={section.id}
              className="border-2 border-dashed border-red-300 bg-red-50 p-8 text-center"
            >
              <p className="text-red-600">
                Componente não encontrado: {section.type}
              </p>
            </div>
          );
        }

        return (
          <SectionComponent
            key={section.id}
            content={section.content}
            styles={layoutTree.globalStyles}
          />
        );
      })}
    </div>
  );
}
