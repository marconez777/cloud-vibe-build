import type { GlobalStyles } from "@/types/layout-tree";

interface ContactContent {
  title?: string;
  subtitle?: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface ContactSectionProps {
  content: Record<string, unknown>;
  styles: GlobalStyles;
}

export function ContactSection({ content, styles }: ContactSectionProps) {
  const {
    title = "Entre em Contato",
    subtitle = "Estamos prontos para atendê-lo",
    email = "contato@empresa.com",
    phone = "(11) 9999-9999",
    address = "São Paulo, SP",
  } = content as ContactContent;

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

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Form */}
          <div className="rounded-xl bg-white p-8 shadow-sm">
            <form className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium">Nome</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2"
                  style={{ focusRingColor: styles.primaryColor } as any}
                  placeholder="Seu nome"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Email</label>
                <input
                  type="email"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2"
                  placeholder="seu@email.com"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Mensagem</label>
                <textarea
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2"
                  rows={4}
                  placeholder="Sua mensagem..."
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg py-3 font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: styles.primaryColor }}
              >
                Enviar Mensagem
              </button>
            </form>
          </div>

          {/* Info */}
          <div className="space-y-8">
            <div>
              <h3
                className="mb-4 text-xl font-semibold"
                style={{ fontFamily: styles.headingFont }}
              >
                Informações de Contato
              </h3>
              <div className="space-y-4">
                <p className="flex items-center gap-3 text-gray-600">
                  <span style={{ color: styles.primaryColor }}>📧</span>
                  {email}
                </p>
                <p className="flex items-center gap-3 text-gray-600">
                  <span style={{ color: styles.primaryColor }}>📱</span>
                  {phone}
                </p>
                <p className="flex items-center gap-3 text-gray-600">
                  <span style={{ color: styles.primaryColor }}>📍</span>
                  {address}
                </p>
              </div>
            </div>

            <div
              className="aspect-video rounded-xl"
              style={{ backgroundColor: `${styles.primaryColor}20` }}
            >
              <div className="flex h-full items-center justify-center">
                <span className="text-4xl">🗺️</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
