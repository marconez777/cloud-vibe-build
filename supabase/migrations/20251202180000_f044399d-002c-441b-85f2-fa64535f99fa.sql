-- Add priority and is_system columns to ai_memories
ALTER TABLE public.ai_memories 
ADD COLUMN IF NOT EXISTS priority integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_system boolean DEFAULT false;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_ai_memories_is_system ON public.ai_memories(is_system);
CREATE INDEX IF NOT EXISTS idx_ai_memories_priority ON public.ai_memories(priority DESC);

-- Insert default system memories for SEO, Performance, Design
INSERT INTO public.ai_memories (title, content, type, category, is_active, is_system, priority) VALUES
(
  'SEO Técnico Completo',
  'Todos os sites devem incluir:
- Meta tags completas: title (50-60 chars), description (150-160 chars), keywords, author, robots
- Open Graph tags: og:title, og:description, og:image, og:type, og:url
- Twitter Cards: twitter:card, twitter:title, twitter:description, twitter:image
- Schema.org JSON-LD para LocalBusiness ou Service
- Canonical URL em todas as páginas
- Arquivo sitemap.xml básico
- Arquivo robots.txt configurado
- Heading hierarchy correta: único H1, H2 para seções, H3 para subseções
- Alt text descritivo em todas as imagens
- Links internos com anchor text relevante
- URLs amigáveis e descritivas',
  'instruction',
  'estrutura',
  true,
  true,
  100
),
(
  'Performance e Velocidade',
  'Para sites rápidos implementar:
- Lazy loading em imagens: loading="lazy" e width/height explícitos
- CSS crítico inline no <head> para above-the-fold
- Scripts no final do body com defer
- Preconnect para fontes externas: <link rel="preconnect">
- Font-display: swap para web fonts
- Minificação de CSS e JS
- Evitar render-blocking resources
- Usar CSS containment onde apropriado
- Comprimir assets quando possível
- Evitar CSS @import, usar <link> tags',
  'instruction',
  'estrutura',
  true,
  true,
  95
),
(
  'Animações e Micro-interações',
  'Usar animações CSS modernas:
- Fade-in suave em scroll com Intersection Observer
- Hover effects em cards: transform: translateY(-4px), box-shadow aumentado
- Transições de 300ms ease-out para suavidade
- Parallax sutil no hero (opcional)
- Staggered animations em listas (animation-delay incremental)
- Micro-interações em botões: scale(1.02) no hover
- Smooth scroll para navegação interna: scroll-behavior: smooth
- Loading skeleton para conteúdo (opcional)
- Animações de entrada para seções: opacity 0 -> 1, translateY',
  'instruction',
  'estilo',
  true,
  true,
  90
),
(
  'Padrões de Design Moderno 2024/2025',
  'Design trends atuais:
- Gradients sutis e glassmorphism (backdrop-filter: blur)
- Border radius generosos: 12-24px
- Shadows suaves multi-layer com cores
- Tipografia com contraste de peso: light + bold
- Espaçamento generoso: padding 60-100px em seções
- Cards com backdrop-filter blur para profundidade
- Bento grid layouts para features
- Accent colors vibrantes em detalhes (CTAs, links)
- Dark mode como padrão ou toggle
- Ícones com stroke-width consistente
- Imagens com aspect-ratio definido',
  'instruction',
  'estilo',
  true,
  true,
  85
),
(
  'Template Base - Clínica/Consultório',
  'Para sites de clínicas incluir obrigatoriamente:
- Hero com imagem profissional e CTA de agendamento prominente
- Seção de especialidades/serviços com ícones ou cards
- Seção "Sobre o Doutor/Equipe" com foto e credenciais
- Depoimentos de pacientes em carousel ou grid
- Lista de convênios aceitos (se aplicável)
- Mapa de localização integrado ou endereço destacado
- Botão flutuante de WhatsApp para contato rápido
- Horário de funcionamento visível no footer
- Formulário de contato/agendamento simples',
  'instruction',
  'business',
  true,
  true,
  80
),
(
  'Template Base - Empresa de Serviços',
  'Para sites de empresas de serviços incluir:
- Hero impactante com proposta de valor clara
- Grid de serviços oferecidos com descrições curtas
- Seção de diferenciais/por que nos escolher
- Cases de sucesso ou portfólio (se aplicável)
- Depoimentos de clientes satisfeitos
- Números/estatísticas de resultados
- Seção de FAQ com dúvidas frequentes
- CTA forte para orçamento/contato
- Footer completo com todas as informações',
  'instruction',
  'business',
  true,
  true,
  75
)
ON CONFLICT DO NOTHING;