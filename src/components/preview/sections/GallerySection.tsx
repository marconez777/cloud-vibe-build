import type { GlobalStyles } from "@/types/layout-tree";

interface GalleryImage {
  src: string;
  alt?: string;
}

interface GalleryContent {
  title?: string;
  images?: GalleryImage[];
}

interface GallerySectionProps {
  content: Record<string, unknown>;
  styles: GlobalStyles;
}

export function GallerySection({ content, styles }: GallerySectionProps) {
  const {
    title = "Galeria",
    images = Array(6).fill({ src: "", alt: "Imagem da galeria" }),
  } = content as GalleryContent;

  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <h2
          className="mb-12 text-center text-3xl font-bold sm:text-4xl"
          style={{ fontFamily: styles.headingFont, color: styles.primaryColor }}
        >
          {title}
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image, index) => (
            <div
              key={index}
              className="aspect-square overflow-hidden rounded-xl"
            >
              {image.src ? (
                <img
                  src={image.src}
                  alt={image.alt || `Imagem ${index + 1}`}
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center"
                  style={{ backgroundColor: `${styles.primaryColor}20` }}
                >
                  <span className="text-4xl">🖼️</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
