import type { GlobalStyles } from "@/types/layout-tree";

interface Feature {
  title: string;
  description: string;
  icon?: string;
}

interface FeaturesContent {
  title?: string;
  subtitle?: string;
  features?: Feature[];
}

interface FeaturesSectionProps {
  content: Record<string, unknown>;
  styles: GlobalStyles;
}

export function FeaturesSection({ content, styles }: FeaturesSectionProps) {
  const {
    title = "Por que nos escolher?",
    subtitle = "Recursos que fazem a diferença",
    features = [
      { title: "Rápido", description: "Entregas em tempo recorde" },
      { title: "Seguro", description: "Seus dados protegidos" },
      { title: "Suporte", description: "Atendimento 24/7" },
      { title: "Qualidade", description: "Excelência em cada detalhe" },
    ],
  } = content as FeaturesContent;

  return (
    <section className="bg-gray-50 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2
            className="text-3xl font-bold sm:text-4xl"
            style={{ fontFamily: styles.headingFont, color: styles.primaryColor }}
          >
            {title}
          </h2>
          <p className="mt-4 text-gray-600">{subtitle}</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
                style={{ backgroundColor: `${styles.primaryColor}20` }}
              >
                <span
                  className="text-2xl font-bold"
                  style={{ color: styles.primaryColor }}
                >
                  ✓
                </span>
              </div>
              <h3
                className="mb-2 font-semibold"
                style={{ fontFamily: styles.headingFont }}
              >
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
