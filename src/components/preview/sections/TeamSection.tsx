import type { GlobalStyles } from "@/types/layout-tree";

interface TeamMember {
  name: string;
  role: string;
  image?: string;
  social?: { type: string; url: string }[];
}

interface TeamContent {
  title?: string;
  subtitle?: string;
  members?: TeamMember[];
}

interface TeamSectionProps {
  content: Record<string, unknown>;
  styles: GlobalStyles;
}

export function TeamSection({ content, styles }: TeamSectionProps) {
  const {
    title = "Nossa Equipe",
    subtitle = "Profissionais dedicados ao seu sucesso",
    members = [
      { name: "Carlos Lima", role: "CEO" },
      { name: "Ana Martins", role: "CTO" },
      { name: "Pedro Souza", role: "Designer" },
      { name: "Julia Costa", role: "Marketing" },
    ],
  } = content as TeamContent;

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

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {members.map((member, index) => (
            <div key={index} className="text-center">
              <div
                className="mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-full text-4xl font-bold text-white"
                style={{ backgroundColor: styles.primaryColor }}
              >
                {member.name.charAt(0)}
              </div>
              <h3
                className="font-semibold"
                style={{ fontFamily: styles.headingFont }}
              >
                {member.name}
              </h3>
              <p className="text-sm text-gray-600">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
