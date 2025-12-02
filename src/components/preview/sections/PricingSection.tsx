import type { GlobalStyles } from "@/types/layout-tree";

interface PricingPlan {
  name: string;
  price: string;
  period?: string;
  features: string[];
  highlighted?: boolean;
}

interface PricingContent {
  title?: string;
  subtitle?: string;
  plans?: PricingPlan[];
}

interface PricingSectionProps {
  content: Record<string, unknown>;
  styles: GlobalStyles;
}

export function PricingSection({ content, styles }: PricingSectionProps) {
  const {
    title = "Planos e Preços",
    subtitle = "Escolha o melhor plano para você",
    plans = [
      {
        name: "Básico",
        price: "R$ 99",
        period: "/mês",
        features: ["Recurso 1", "Recurso 2", "Recurso 3"],
      },
      {
        name: "Profissional",
        price: "R$ 199",
        period: "/mês",
        features: ["Tudo do Básico", "Recurso 4", "Recurso 5", "Recurso 6"],
        highlighted: true,
      },
      {
        name: "Enterprise",
        price: "R$ 499",
        period: "/mês",
        features: ["Tudo do Profissional", "Recurso 7", "Recurso 8", "Suporte VIP"],
      },
    ],
  } = content as PricingContent;

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

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`rounded-xl bg-white p-8 shadow-sm ${
                plan.highlighted ? "ring-2 scale-105" : ""
              }`}
              style={
                plan.highlighted
                  ? { boxShadow: `0 0 0 2px ${styles.primaryColor}` }
                  : undefined
              }
            >
              <h3
                className="mb-2 text-xl font-semibold"
                style={{ fontFamily: styles.headingFont }}
              >
                {plan.name}
              </h3>
              <div className="mb-6">
                <span
                  className="text-4xl font-bold"
                  style={{ color: styles.primaryColor }}
                >
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-gray-500">{plan.period}</span>
                )}
              </div>
              <ul className="mb-8 space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-600">
                    <span style={{ color: styles.primaryColor }}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full rounded-lg py-3 font-semibold transition-opacity hover:opacity-90 ${
                  plan.highlighted ? "text-white" : ""
                }`}
                style={{
                  backgroundColor: plan.highlighted
                    ? styles.primaryColor
                    : `${styles.primaryColor}20`,
                  color: plan.highlighted ? "white" : styles.primaryColor,
                }}
              >
                Escolher Plano
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
