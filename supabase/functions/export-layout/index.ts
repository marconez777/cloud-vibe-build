import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GlobalStyles {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  headingFont: string;
}

interface Section {
  id: string;
  type: string;
  content: Record<string, unknown>;
}

interface LayoutTree {
  id: string;
  name: string;
  pages: Array<{
    id: string;
    name: string;
    slug: string;
    isHomepage: boolean;
    sections: Section[];
  }>;
  globalStyles: GlobalStyles;
}

function generateCSS(styles: GlobalStyles): string {
  return `
:root {
  --primary-color: ${styles.primaryColor};
  --secondary-color: ${styles.secondaryColor};
  --font-family: ${styles.fontFamily}, system-ui, sans-serif;
  --heading-font: ${styles.headingFont}, ${styles.fontFamily}, system-ui, sans-serif;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-family);
  line-height: 1.6;
  color: #333;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--heading-font);
  line-height: 1.2;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Hero Section */
.hero {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  position: relative;
  background-color: var(--primary-color);
  color: white;
  text-align: center;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
}

.hero-content {
  position: relative;
  z-index: 10;
  max-width: 800px;
}

.hero h1 {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 700;
  margin-bottom: 24px;
}

.hero p {
  font-size: 1.25rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto 32px;
}

.btn {
  display: inline-block;
  padding: 12px 32px;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  border: none;
  transition: transform 0.2s;
}

.btn:hover {
  transform: scale(1.05);
}

.btn-primary {
  background-color: var(--secondary-color);
  color: white;
}

.btn-secondary {
  background-color: white;
  color: var(--primary-color);
}

/* Services/Features Section */
.services, .features {
  padding: 80px 24px;
  background: #f9fafb;
}

.section-header {
  text-align: center;
  margin-bottom: 48px;
}

.section-header h2 {
  font-size: 2.5rem;
  color: var(--primary-color);
  margin-bottom: 16px;
}

.section-header p {
  font-size: 1.125rem;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
}

.grid {
  display: grid;
  gap: 32px;
}

.grid-3 {
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.grid-4 {
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.card {
  background: white;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.card h3 {
  font-size: 1.25rem;
  color: var(--primary-color);
  margin-bottom: 12px;
}

.card p {
  color: #666;
}

/* About Section */
.about {
  padding: 80px 24px;
}

.about-content {
  max-width: 800px;
  margin: 0 auto;
}

/* Stats Section */
.stats {
  padding: 60px 24px;
  background: var(--primary-color);
  color: white;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 32px;
  text-align: center;
}

.stat-item h3 {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.stat-item p {
  font-size: 1rem;
  opacity: 0.9;
}

/* Testimonials Section */
.testimonials {
  padding: 80px 24px;
  background: #f9fafb;
}

.testimonial-card {
  background: white;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.testimonial-card p {
  font-style: italic;
  color: #666;
  margin-bottom: 16px;
}

.testimonial-author {
  font-weight: 600;
  color: var(--primary-color);
}

.testimonial-role {
  font-size: 0.875rem;
  color: #999;
}

/* Team Section */
.team {
  padding: 80px 24px;
}

.team-card {
  text-align: center;
}

.team-card .avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: var(--primary-color);
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  font-weight: 700;
}

/* Pricing Section */
.pricing {
  padding: 80px 24px;
  background: #f9fafb;
}

.pricing-card {
  background: white;
  padding: 40px 32px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 2px solid transparent;
}

.pricing-card.highlighted {
  border-color: var(--primary-color);
  transform: scale(1.05);
}

.pricing-card h3 {
  font-size: 1.5rem;
  margin-bottom: 16px;
}

.pricing-card .price {
  font-size: 3rem;
  font-weight: 700;
  color: var(--primary-color);
}

.pricing-card .period {
  color: #999;
}

.pricing-card ul {
  list-style: none;
  margin: 24px 0;
}

.pricing-card li {
  padding: 8px 0;
  color: #666;
}

/* FAQ Section */
.faq {
  padding: 80px 24px;
}

.faq-item {
  border-bottom: 1px solid #eee;
  padding: 24px 0;
}

.faq-item h3 {
  font-size: 1.125rem;
  color: var(--primary-color);
  margin-bottom: 8px;
}

.faq-item p {
  color: #666;
}

/* Gallery Section */
.gallery {
  padding: 80px 24px;
  background: #f9fafb;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.gallery-item {
  aspect-ratio: 1;
  background: #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Blog Section */
.blog {
  padding: 80px 24px;
}

.blog-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.blog-card .image {
  height: 200px;
  background: var(--primary-color);
}

.blog-card .content {
  padding: 24px;
}

.blog-card h3 {
  margin-bottom: 8px;
}

.blog-card .date {
  font-size: 0.875rem;
  color: #999;
  margin-bottom: 12px;
}

/* Contact Section */
.contact {
  padding: 80px 24px;
  background: #f9fafb;
}

.contact-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 32px;
  max-width: 800px;
  margin: 0 auto;
}

.contact-item h3 {
  color: var(--primary-color);
  margin-bottom: 8px;
}

/* CTA Section */
.cta {
  padding: 80px 24px;
  background: var(--primary-color);
  color: white;
  text-align: center;
}

.cta h2 {
  font-size: 2.5rem;
  margin-bottom: 16px;
}

.cta p {
  font-size: 1.25rem;
  opacity: 0.9;
  margin-bottom: 32px;
}

/* Footer */
.footer {
  padding: 60px 24px 24px;
  background: #1a1a1a;
  color: white;
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 40px;
  margin-bottom: 40px;
}

.footer h4 {
  font-size: 1.125rem;
  margin-bottom: 16px;
}

.footer p {
  opacity: 0.7;
  font-size: 0.875rem;
}

.footer ul {
  list-style: none;
}

.footer li {
  margin-bottom: 8px;
}

.footer a {
  color: white;
  opacity: 0.7;
  text-decoration: none;
  transition: opacity 0.2s;
}

.footer a:hover {
  opacity: 1;
}

.footer-bottom {
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.875rem;
  opacity: 0.7;
}

@media (max-width: 768px) {
  .hero h1 {
    font-size: 2rem;
  }
  
  .section-header h2 {
    font-size: 2rem;
  }
  
  .pricing-card.highlighted {
    transform: none;
  }
}
`;
}

function generateHeroHTML(content: Record<string, unknown>): string {
  const headline = content.headline || "Bem-vindo ao seu site";
  const subheadline = content.subheadline || "Crie experiências incríveis";
  const ctaText = content.ctaText || "Saiba Mais";
  const backgroundImage = content.backgroundImage as string | undefined;
  
  const bgStyle = backgroundImage 
    ? `background-image: url('${backgroundImage}'); background-size: cover; background-position: center;`
    : "";
  
  return `
  <section class="hero" style="${bgStyle}">
    ${backgroundImage ? '<div class="hero-overlay"></div>' : ''}
    <div class="hero-content">
      <h1>${headline}</h1>
      <p>${subheadline}</p>
      <button class="btn btn-primary">${ctaText}</button>
    </div>
  </section>`;
}

function generateServicesHTML(content: Record<string, unknown>): string {
  const title = content.title || "Nossos Serviços";
  const subtitle = content.subtitle || "";
  const services = (content.services as Array<{title: string; description: string}>) || [];
  
  const servicesHtml = services.map(service => `
    <div class="card">
      <h3>${service.title}</h3>
      <p>${service.description}</p>
    </div>
  `).join("");
  
  return `
  <section class="services">
    <div class="container">
      <div class="section-header">
        <h2>${title}</h2>
        ${subtitle ? `<p>${subtitle}</p>` : ''}
      </div>
      <div class="grid grid-3">
        ${servicesHtml}
      </div>
    </div>
  </section>`;
}

function generateFeaturesHTML(content: Record<string, unknown>): string {
  const title = content.title || "Recursos";
  const subtitle = content.subtitle || "";
  const features = (content.features as Array<{title: string; description: string}>) || [];
  
  const featuresHtml = features.map(feature => `
    <div class="card">
      <h3>${feature.title}</h3>
      <p>${feature.description}</p>
    </div>
  `).join("");
  
  return `
  <section class="features">
    <div class="container">
      <div class="section-header">
        <h2>${title}</h2>
        ${subtitle ? `<p>${subtitle}</p>` : ''}
      </div>
      <div class="grid grid-3">
        ${featuresHtml}
      </div>
    </div>
  </section>`;
}

function generateAboutHTML(content: Record<string, unknown>): string {
  const title = content.title || "Sobre Nós";
  const description = content.description || "";
  const stats = (content.stats as Array<{value: string; label: string}>) || [];
  
  const statsHtml = stats.length > 0 ? `
    <div class="stats-grid" style="margin-top: 40px;">
      ${stats.map(stat => `
        <div class="stat-item">
          <h3>${stat.value}</h3>
          <p>${stat.label}</p>
        </div>
      `).join("")}
    </div>
  ` : '';
  
  return `
  <section class="about">
    <div class="container">
      <div class="about-content">
        <div class="section-header">
          <h2>${title}</h2>
        </div>
        <p>${description}</p>
        ${statsHtml}
      </div>
    </div>
  </section>`;
}

function generateStatsHTML(content: Record<string, unknown>): string {
  const stats = (content.stats as Array<{value: string; label: string}>) || [];
  
  return `
  <section class="stats">
    <div class="container">
      <div class="stats-grid">
        ${stats.map(stat => `
          <div class="stat-item">
            <h3>${stat.value}</h3>
            <p>${stat.label}</p>
          </div>
        `).join("")}
      </div>
    </div>
  </section>`;
}

function generateTestimonialsHTML(content: Record<string, unknown>): string {
  const title = content.title || "Depoimentos";
  const testimonials = (content.testimonials as Array<{name: string; role: string; content: string}>) || [];
  
  return `
  <section class="testimonials">
    <div class="container">
      <div class="section-header">
        <h2>${title}</h2>
      </div>
      <div class="grid grid-3">
        ${testimonials.map(t => `
          <div class="testimonial-card">
            <p>"${t.content}"</p>
            <div class="testimonial-author">${t.name}</div>
            <div class="testimonial-role">${t.role}</div>
          </div>
        `).join("")}
      </div>
    </div>
  </section>`;
}

function generateTeamHTML(content: Record<string, unknown>): string {
  const title = content.title || "Nossa Equipe";
  const subtitle = content.subtitle || "";
  const members = (content.members as Array<{name: string; role: string}>) || [];
  
  return `
  <section class="team">
    <div class="container">
      <div class="section-header">
        <h2>${title}</h2>
        ${subtitle ? `<p>${subtitle}</p>` : ''}
      </div>
      <div class="grid grid-4">
        ${members.map(member => `
          <div class="team-card">
            <div class="avatar">${member.name.charAt(0)}</div>
            <h3>${member.name}</h3>
            <p>${member.role}</p>
          </div>
        `).join("")}
      </div>
    </div>
  </section>`;
}

function generatePricingHTML(content: Record<string, unknown>): string {
  const title = content.title || "Planos";
  const subtitle = content.subtitle || "";
  const plans = (content.plans as Array<{name: string; price: string; period: string; features: string[]; highlighted?: boolean}>) || [];
  
  return `
  <section class="pricing">
    <div class="container">
      <div class="section-header">
        <h2>${title}</h2>
        ${subtitle ? `<p>${subtitle}</p>` : ''}
      </div>
      <div class="grid grid-3">
        ${plans.map(plan => `
          <div class="pricing-card ${plan.highlighted ? 'highlighted' : ''}">
            <h3>${plan.name}</h3>
            <div class="price">${plan.price}</div>
            <div class="period">${plan.period}</div>
            <ul>
              ${plan.features.map(f => `<li>✓ ${f}</li>`).join("")}
            </ul>
            <button class="btn ${plan.highlighted ? 'btn-primary' : 'btn-secondary'}">Escolher</button>
          </div>
        `).join("")}
      </div>
    </div>
  </section>`;
}

function generateFAQHTML(content: Record<string, unknown>): string {
  const title = content.title || "Perguntas Frequentes";
  const faqs = (content.faqs as Array<{question: string; answer: string}>) || [];
  
  return `
  <section class="faq">
    <div class="container">
      <div class="section-header">
        <h2>${title}</h2>
      </div>
      <div style="max-width: 800px; margin: 0 auto;">
        ${faqs.map(faq => `
          <div class="faq-item">
            <h3>${faq.question}</h3>
            <p>${faq.answer}</p>
          </div>
        `).join("")}
      </div>
    </div>
  </section>`;
}

function generateGalleryHTML(content: Record<string, unknown>): string {
  const title = content.title || "Galeria";
  const images = (content.images as Array<{src: string; alt: string}>) || [];
  
  return `
  <section class="gallery">
    <div class="container">
      <div class="section-header">
        <h2>${title}</h2>
      </div>
      <div class="gallery-grid">
        ${images.map(img => `
          <div class="gallery-item">
            <img src="${img.src}" alt="${img.alt}" />
          </div>
        `).join("")}
      </div>
    </div>
  </section>`;
}

function generateBlogHTML(content: Record<string, unknown>): string {
  const title = content.title || "Blog";
  const posts = (content.posts as Array<{title: string; excerpt: string; date: string}>) || [];
  
  return `
  <section class="blog">
    <div class="container">
      <div class="section-header">
        <h2>${title}</h2>
      </div>
      <div class="grid grid-3">
        ${posts.map(post => `
          <div class="blog-card">
            <div class="image"></div>
            <div class="content">
              <h3>${post.title}</h3>
              <div class="date">${post.date}</div>
              <p>${post.excerpt}</p>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  </section>`;
}

function generateContactHTML(content: Record<string, unknown>): string {
  const title = content.title || "Contato";
  const subtitle = content.subtitle || "";
  const email = content.email || "";
  const phone = content.phone || "";
  const address = content.address || "";
  
  return `
  <section class="contact">
    <div class="container">
      <div class="section-header">
        <h2>${title}</h2>
        ${subtitle ? `<p>${subtitle}</p>` : ''}
      </div>
      <div class="contact-info">
        ${email ? `<div class="contact-item"><h3>Email</h3><p>${email}</p></div>` : ''}
        ${phone ? `<div class="contact-item"><h3>Telefone</h3><p>${phone}</p></div>` : ''}
        ${address ? `<div class="contact-item"><h3>Endereço</h3><p>${address}</p></div>` : ''}
      </div>
    </div>
  </section>`;
}

function generateCTAHTML(content: Record<string, unknown>): string {
  const title = content.title || "Pronto para começar?";
  const subtitle = content.subtitle || "";
  const ctaText = content.ctaText || "Entrar em Contato";
  
  return `
  <section class="cta">
    <div class="container">
      <h2>${title}</h2>
      ${subtitle ? `<p>${subtitle}</p>` : ''}
      <button class="btn btn-secondary">${ctaText}</button>
    </div>
  </section>`;
}

function generateFooterHTML(content: Record<string, unknown>): string {
  const companyName = content.companyName || "Empresa";
  const description = content.description || "";
  const links = (content.links as Array<{title: string; items: Array<{label: string; href: string}>}>) || [];
  const copyright = content.copyright || `© ${new Date().getFullYear()} ${companyName}. Todos os direitos reservados.`;
  
  const linksHtml = links.map(group => `
    <div>
      <h4>${group.title}</h4>
      <ul>
        ${group.items.map(item => `<li><a href="${item.href}">${item.label}</a></li>`).join("")}
      </ul>
    </div>
  `).join("");
  
  return `
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <h4>${companyName}</h4>
          <p>${description}</p>
        </div>
        ${linksHtml}
      </div>
      <div class="footer-bottom">
        <p>${copyright}</p>
      </div>
    </div>
  </footer>`;
}

function generateSectionHTML(section: Section): string {
  switch (section.type) {
    case 'hero': return generateHeroHTML(section.content);
    case 'services': return generateServicesHTML(section.content);
    case 'features': return generateFeaturesHTML(section.content);
    case 'about': return generateAboutHTML(section.content);
    case 'stats': return generateStatsHTML(section.content);
    case 'testimonials': return generateTestimonialsHTML(section.content);
    case 'team': return generateTeamHTML(section.content);
    case 'pricing': return generatePricingHTML(section.content);
    case 'faq': return generateFAQHTML(section.content);
    case 'gallery': return generateGalleryHTML(section.content);
    case 'blog': return generateBlogHTML(section.content);
    case 'contact': return generateContactHTML(section.content);
    case 'cta': return generateCTAHTML(section.content);
    case 'footer': return generateFooterHTML(section.content);
    default: return `<!-- Unknown section type: ${section.type} -->`;
  }
}

function generateHTML(layout: LayoutTree): string {
  const homepage = layout.pages.find(page => page.isHomepage);
  if (!homepage) {
    throw new Error("No homepage found in layout");
  }

  const sectionsHTML = homepage.sections.map(generateSectionHTML).join("\n");
  const css = generateCSS(layout.globalStyles);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${layout.name}">
  <title>${layout.name}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(layout.globalStyles.fontFamily)}:wght@400;500;600;700&family=${encodeURIComponent(layout.globalStyles.headingFont)}:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
${css}
  </style>
</head>
<body>
${sectionsHTML}
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { layoutTree, projectName } = await req.json();
    
    if (!layoutTree) {
      return new Response(
        JSON.stringify({ error: "Layout tree is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Generating HTML export for:", projectName || layoutTree.name);

    const html = generateHTML(layoutTree as LayoutTree);

    return new Response(
      JSON.stringify({
        html,
        filename: `${(projectName || layoutTree.name || 'site').toLowerCase().replace(/\s+/g, '-')}.html`,
        success: true,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in export-layout:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
