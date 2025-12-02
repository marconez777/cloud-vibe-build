import type { GlobalStyles } from "@/types/layout-tree";

interface Service {
  title: string;
  description: string;
  icon?: string;
}

interface ServicesContent {
  title?: string;
  subtitle?: string;
  services?: Service[];
}

interface ServicesSectionProps {
  content: Record<string, unknown>;
  styles: GlobalStyles;
}

export function ServicesSection({ content, styles }: ServicesSectionProps) {
  const {
    title = "Nossos Serviços",
    subtitle = "Soluções completas para o seu negócio",
    services = [
      { title: "Serviço 1", description: "Descrição do serviço 1" },
      { title: "Serviço 2", description: "Descrição do serviço 2" },
      { title: "Serviço 3", description: "Descrição do serviço 3" },
    ],
  } = content as ServicesContent;

  return (
    <section className="px-6 py-20">
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
          {services.map((service, index) => (
            <div
              key={index}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg text-white"
                style={{ backgroundColor: styles.primaryColor }}
              >
                <span className="text-xl font-bold">{index + 1}</span>
              </div>
              <h3
                className="mb-2 text-xl font-semibold"
                style={{ fontFamily: styles.headingFont }}
              >
                {service.title}
              </h3>
              <p className="text-gray-600">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
