import type { GlobalStyles } from "@/types/layout-tree";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterContent {
  companyName?: string;
  description?: string;
  links?: { title: string; items: FooterLink[] }[];
  copyright?: string;
}

interface FooterSectionProps {
  content: Record<string, unknown>;
  styles: GlobalStyles;
}

export function FooterSection({ content, styles }: FooterSectionProps) {
  const {
    companyName = "Empresa",
    description = "Sua empresa de confiança desde sempre.",
    links = [
      {
        title: "Links Úteis",
        items: [
          { label: "Início", href: "#" },
          { label: "Sobre", href: "#" },
          { label: "Serviços", href: "#" },
          { label: "Contato", href: "#" },
        ],
      },
      {
        title: "Legal",
        items: [
          { label: "Termos de Uso", href: "#" },
          { label: "Privacidade", href: "#" },
        ],
      },
    ],
    copyright = `© ${new Date().getFullYear()} Todos os direitos reservados.`,
  } = content as FooterContent;

  return (
    <footer className="bg-gray-900 px-6 py-12 text-gray-300">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <h3
              className="mb-4 text-xl font-bold text-white"
              style={{ fontFamily: styles.headingFont }}
            >
              {companyName}
            </h3>
            <p className="max-w-sm text-sm">{description}</p>
          </div>

          {/* Links */}
          {links.map((group, index) => (
            <div key={index}>
              <h4 className="mb-4 font-semibold text-white">{group.title}</h4>
              <ul className="space-y-2">
                {group.items.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.href}
                      className="text-sm transition-colors hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-gray-800 pt-8 text-center text-sm">
          {copyright}
        </div>
      </div>
    </footer>
  );
}
