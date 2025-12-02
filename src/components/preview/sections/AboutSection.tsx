import type { GlobalStyles } from "@/types/layout-tree";

interface AboutContent {
  title?: string;
  description?: string;
  image?: string;
  stats?: { label: string; value: string }[];
}

interface AboutSectionProps {
  content: Record<string, unknown>;
  styles: GlobalStyles;
}

export function AboutSection({ content, styles }: AboutSectionProps) {
  const {
    title = "Sobre Nós",
    description = "Somos uma empresa dedicada a oferecer as melhores soluções para nossos clientes. Com anos de experiência no mercado, construímos uma reputação sólida baseada em confiança e resultados.",
    image,
    stats = [
      { label: "Anos de Experiência", value: "10+" },
      { label: "Clientes Satisfeitos", value: "500+" },
      { label: "Projetos Entregues", value: "1000+" },
    ],
  } = content as AboutContent;

  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2
              className="mb-6 text-3xl font-bold sm:text-4xl"
              style={{ fontFamily: styles.headingFont, color: styles.primaryColor }}
            >
              {title}
            </h2>
            <p className="text-gray-600 leading-relaxed">{description}</p>

            <div className="mt-8 grid grid-cols-3 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p
                    className="text-2xl font-bold"
                    style={{ color: styles.primaryColor }}
                  >
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            {image ? (
              <img
                src={image}
                alt="Sobre nós"
                className="rounded-xl shadow-lg"
              />
            ) : (
              <div
                className="aspect-square rounded-xl"
                style={{ backgroundColor: `${styles.primaryColor}20` }}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
