import type { GlobalStyles } from "@/types/layout-tree";

interface BlogPost {
  title: string;
  excerpt: string;
  image?: string;
  date?: string;
  author?: string;
}

interface BlogContent {
  title?: string;
  posts?: BlogPost[];
}

interface BlogSectionProps {
  content: Record<string, unknown>;
  styles: GlobalStyles;
}

export function BlogSection({ content, styles }: BlogSectionProps) {
  const {
    title = "Blog",
    posts = [
      {
        title: "Como melhorar seu negócio",
        excerpt: "Dicas essenciais para impulsionar sua empresa no mercado atual.",
        date: "10 Jan 2024",
      },
      {
        title: "Tendências para 2024",
        excerpt: "Descubra as principais tendências que vão dominar o próximo ano.",
        date: "08 Jan 2024",
      },
      {
        title: "Guia completo de marketing",
        excerpt: "Tudo que você precisa saber sobre marketing digital em um só lugar.",
        date: "05 Jan 2024",
      },
    ],
  } = content as BlogContent;

  return (
    <section className="bg-gray-50 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <h2
          className="mb-12 text-center text-3xl font-bold sm:text-4xl"
          style={{ fontFamily: styles.headingFont, color: styles.primaryColor }}
        >
          {title}
        </h2>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <article
              key={index}
              className="overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div
                className="aspect-video"
                style={{ backgroundColor: `${styles.primaryColor}20` }}
              >
                {post.image ? (
                  <img
                    src={post.image}
                    alt={post.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="text-4xl">📝</span>
                  </div>
                )}
              </div>
              <div className="p-6">
                {post.date && (
                  <p className="mb-2 text-sm text-gray-500">{post.date}</p>
                )}
                <h3
                  className="mb-2 font-semibold"
                  style={{ fontFamily: styles.headingFont }}
                >
                  {post.title}
                </h3>
                <p className="text-sm text-gray-600">{post.excerpt}</p>
                <button
                  className="mt-4 text-sm font-semibold"
                  style={{ color: styles.primaryColor }}
                >
                  Ler mais →
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
