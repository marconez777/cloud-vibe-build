import type { GlobalStyles } from "@/types/layout-tree";

interface Stat {
  value: string;
  label: string;
}

interface StatsContent {
  stats?: Stat[];
}

interface StatsSectionProps {
  content: Record<string, unknown>;
  styles: GlobalStyles;
}

export function StatsSection({ content, styles }: StatsSectionProps) {
  const {
    stats = [
      { value: "10K+", label: "Clientes" },
      { value: "500+", label: "Projetos" },
      { value: "99%", label: "Satisfação" },
      { value: "24/7", label: "Suporte" },
    ],
  } = content as StatsContent;

  return (
    <section
      className="px-6 py-16"
      style={{ backgroundColor: styles.primaryColor }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center text-white">
              <p
                className="text-4xl font-bold sm:text-5xl"
                style={{ fontFamily: styles.headingFont }}
              >
                {stat.value}
              </p>
              <p className="mt-2 text-sm opacity-80">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
