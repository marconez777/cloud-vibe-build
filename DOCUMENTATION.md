# PHPVibe 4.0 - Documentação Completa do Sistema

## Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Stack Tecnológica](#stack-tecnológica)
4. [Estrutura de Diretórios](#estrutura-de-diretórios)
5. [Modelo de Dados](#modelo-de-dados)
6. [Pipeline Multi-Agente de IA](#pipeline-multi-agente-de-ia)
7. [Edge Functions](#edge-functions)
8. [Componentes Principais](#componentes-principais)
9. [Hooks Customizados](#hooks-customizados)
10. [Páginas da Aplicação](#páginas-da-aplicação)
11. [Sistema de Design](#sistema-de-design)
12. [Funcionalidades](#funcionalidades)
13. [Fluxo do Usuário](#fluxo-do-usuário)
14. [API e Integrações](#api-e-integrações)
15. [Configuração e Deploy](#configuração-e-deploy)
16. [Limitações Conhecidas](#limitações-conhecidas)
17. [Roadmap de Melhorias](#roadmap-de-melhorias)

---

## Visão Geral

**PHPVibe 4.0** é um construtor de websites alimentado por IA que permite usuários não-técnicos criarem sites profissionais através de linguagem natural. O sistema utiliza um pipeline multi-agente de IA que analisa briefings, gera código HTML/CSS/JS otimizado, e aplica otimizações de SEO automaticamente.

### Proposta de Valor

- **Conversacional**: Usuários descrevem o site desejado em linguagem natural
- **Multi-Agente**: Pipeline de 3 agentes especializados (Design, Código, SEO)
- **Profissional**: Sites gerados seguem padrões modernos de desenvolvimento
- **Exportável**: Projetos podem ser baixados como ZIP estruturado

### Casos de Uso Principais

- Sites para empresas de serviços (desentupidoras, eletricistas, etc.)
- Sites para clínicas e consultórios
- Sites para restaurantes e pizzarias
- Landing pages promocionais

---

## Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────────┤
│  Pages: Index, Dashboard, Projects, Briefing, VibeChat,         │
│         Knowledge, Preview, PageMultiplier, Versions, Help      │
├─────────────────────────────────────────────────────────────────┤
│  Components: AppLayout, AppSidebar, FileExplorer, FilePreview,  │
│              ChatHeader, MessageBubble, GenerationProgress...   │
├─────────────────────────────────────────────────────────────────┤
│  Hooks: useProjects, useProjectFiles, useChatMessages,          │
│         useAIAgents, useAIMemories, useGenerationStatus...      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE (Lovable Cloud)                      │
├──────────────────┬──────────────────┬───────────────────────────┤
│    Database      │  Edge Functions  │      Storage              │
│   (PostgreSQL)   │   (Deno/TS)      │   (project-assets)        │
├──────────────────┼──────────────────┼───────────────────────────┤
│ - projects       │ - analyze-design │ - Imagens de referência   │
│ - project_files  │ - generate-files │ - Documentos uploadados   │
│ - chat_messages  │ - optimize-seo   │ - Assets de projetos      │
│ - ai_agents      │ - export-zip     │                           │
│ - ai_memories    │ - export-layout  │                           │
│ - layout_versions│ - generate-layout│                           │
│ - page_templates │                  │                           │
└──────────────────┴──────────────────┴───────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      OPENAI API (GPT-4o)                         │
├─────────────────────────────────────────────────────────────────┤
│  - Design Analyst: gpt-4o (visão para análise de imagens)       │
│  - Code Generator: gpt-4o (geração de código complexo)          │
│  - SEO Specialist: gpt-4o-mini (otimizações de SEO)             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Stack Tecnológica

### Frontend

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| React | 18.3.1 | Framework UI |
| Vite | - | Build tool |
| TypeScript | - | Type safety |
| Tailwind CSS | - | Estilização |
| shadcn/ui | - | Componentes UI |
| TanStack Query | 5.83.0 | State management/caching |
| React Router | 6.30.1 | Roteamento |
| Lucide React | 0.462.0 | Ícones |

### Backend

| Tecnologia | Propósito |
|------------|-----------|
| Supabase (Lovable Cloud) | BaaS - Database, Auth, Storage, Edge Functions |
| PostgreSQL | Banco de dados relacional |
| Deno | Runtime para Edge Functions |
| OpenAI API | Modelos de IA (GPT-4o, GPT-4o-mini) |

### Bibliotecas Auxiliares

- **date-fns**: Manipulação de datas
- **zod**: Validação de schemas
- **react-hook-form**: Formulários
- **sonner**: Toasts/notificações
- **recharts**: Gráficos
- **vaul**: Drawer components

---

## Estrutura de Diretórios

```
phpvibe-4.0/
├── public/
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
├── src/
│   ├── assets/                    # Assets estáticos
│   ├── components/
│   │   ├── ui/                    # Componentes shadcn/ui
│   │   ├── chat/                  # Componentes do chat
│   │   │   ├── ChatHeader.tsx
│   │   │   ├── EnhancedGenerationProgress.tsx
│   │   │   ├── GenerationProgress.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   └── QuickSuggestions.tsx
│   │   ├── export/                # Componentes de exportação
│   │   │   ├── ExportOptionsDialog.tsx
│   │   │   └── ExportProgress.tsx
│   │   ├── file-explorer/         # Explorador de arquivos
│   │   │   ├── FileEditor.tsx
│   │   │   ├── FileExplorer.tsx
│   │   │   ├── FilePreview.tsx
│   │   │   ├── FileTree.tsx
│   │   │   └── ResponsivePreview.tsx
│   │   ├── knowledge/             # Base de conhecimento
│   │   │   └── AgentManager.tsx
│   │   ├── layout/                # Layout da aplicação
│   │   │   ├── AppLayout.tsx
│   │   │   └── AppSidebar.tsx
│   │   ├── page-multiplier/       # Multiplicador de páginas
│   │   │   ├── GenerationConfig.tsx
│   │   │   ├── TagsDetector.tsx
│   │   │   ├── TemplatePreview.tsx
│   │   │   ├── TemplateSelector.tsx
│   │   │   └── VariationsTable.tsx
│   │   └── preview/               # Preview de seções
│   │       ├── LayoutRenderer.tsx
│   │       └── sections/
│   │           ├── HeroSection.tsx
│   │           ├── ServicesSection.tsx
│   │           └── ... (outras seções)
│   ├── hooks/                     # Hooks customizados
│   │   ├── useAIAgents.ts
│   │   ├── useAIMemories.ts
│   │   ├── useChatMessages.ts
│   │   ├── useGenerationStatus.ts
│   │   ├── usePageTemplates.ts
│   │   ├── useProjectFiles.ts
│   │   └── useProjects.ts
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts          # Cliente Supabase (auto-gerado)
│   │       └── types.ts           # Tipos do banco (auto-gerado)
│   ├── lib/
│   │   └── utils.ts               # Utilitários (cn, etc.)
│   ├── pages/                     # Páginas da aplicação
│   │   ├── Index.tsx              # Landing page
│   │   ├── Dashboard.tsx          # Dashboard principal
│   │   ├── Projects.tsx           # Lista de projetos
│   │   ├── Briefing.tsx           # Criação de briefing
│   │   ├── VibeChat.tsx           # Chat de geração
│   │   ├── Knowledge.tsx          # Base de conhecimento
│   │   ├── Preview.tsx            # Preview de projeto
│   │   ├── PageMultiplier.tsx     # Multiplicador de páginas
│   │   ├── Versions.tsx           # Histórico de versões
│   │   ├── Help.tsx               # Ajuda
│   │   └── NotFound.tsx           # 404
│   ├── types/                     # Tipos TypeScript
│   │   ├── layout-tree.ts
│   │   ├── page-templates.ts
│   │   └── project-files.ts
│   ├── App.tsx                    # Componente raiz
│   ├── App.css                    # Estilos globais
│   ├── index.css                  # Design system/tokens
│   └── main.tsx                   # Entry point
├── supabase/
│   ├── config.toml                # Configuração Supabase
│   ├── functions/                 # Edge Functions
│   │   ├── analyze-design/
│   │   │   └── index.ts
│   │   ├── export-layout/
│   │   │   └── index.ts
│   │   ├── export-zip/
│   │   │   └── index.ts
│   │   ├── generate-files/
│   │   │   └── index.ts
│   │   ├── generate-layout/
│   │   │   └── index.ts
│   │   └── optimize-seo/
│   │       └── index.ts
│   └── migrations/                # Migrações SQL
├── .env                           # Variáveis de ambiente
├── tailwind.config.ts             # Configuração Tailwind
├── vite.config.ts                 # Configuração Vite
└── package.json                   # Dependências
```

---

## Modelo de Dados

### Diagrama ER

```
┌─────────────────┐       ┌─────────────────┐
│    projects     │       │  project_files  │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │───┐   │ id (PK)         │
│ name            │   │   │ project_id (FK) │◄──┐
│ description     │   │   │ file_path       │   │
│ status          │   │   │ file_name       │   │
│ layout_tree     │   │   │ file_type       │   │
│ thumbnail_url   │   │   │ content         │   │
│ created_at      │   │   │ created_at      │   │
│ updated_at      │   │   │ updated_at      │   │
└─────────────────┘   │   └─────────────────┘   │
                      │                         │
                      │   ┌─────────────────┐   │
                      │   │ chat_messages   │   │
                      │   ├─────────────────┤   │
                      └──►│ id (PK)         │   │
                          │ project_id (FK) │◄──┤
                          │ role            │   │
                          │ content         │   │
                          │ metadata        │   │
                          │ created_at      │   │
                          └─────────────────┘   │
                                                │
┌─────────────────┐       ┌─────────────────┐   │
│   ai_agents     │       │ layout_versions │   │
├─────────────────┤       ├─────────────────┤   │
│ id (PK)         │       │ id (PK)         │   │
│ name            │       │ project_id (FK) │◄──┤
│ slug            │       │ layout_tree     │   │
│ description     │       │ version_number  │   │
│ system_prompt   │       │ commit_message  │   │
│ color           │       │ is_current      │   │
│ icon            │       │ created_at      │   │
│ is_active       │       └─────────────────┘   │
│ is_system       │                             │
│ created_at      │       ┌─────────────────┐   │
│ updated_at      │       │ page_templates  │   │
└─────────────────┘       ├─────────────────┤   │
                          │ id (PK)         │   │
┌─────────────────┐       │ project_id (FK) │◄──┘
│  ai_memories    │       │ name            │
├─────────────────┤       │ source_file_path│
│ id (PK)         │       │ tags            │
│ title           │       │ output_pattern  │
│ content         │       │ output_folder   │
│ type            │       │ variations      │
│ category        │       │ created_at      │
│ agent           │       │ updated_at      │
│ priority        │       └─────────────────┘
│ is_active       │
│ is_system       │
│ created_at      │
│ updated_at      │
└─────────────────┘
```

### Tabelas Detalhadas

#### projects
Armazena os projetos de websites criados pelos usuários.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Identificador único |
| name | TEXT | Nome do projeto |
| description | TEXT | Descrição/briefing do projeto |
| status | TEXT | Estado: draft, generating, ready, error |
| layout_tree | JSONB | Estrutura de layout (legado) |
| thumbnail_url | TEXT | URL da thumbnail |
| created_at | TIMESTAMPTZ | Data de criação |
| updated_at | TIMESTAMPTZ | Última atualização |

#### project_files
Armazena os arquivos gerados para cada projeto.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Identificador único |
| project_id | UUID | FK para projects |
| file_path | TEXT | Caminho completo (ex: "css/styles.css") |
| file_name | TEXT | Nome do arquivo |
| file_type | TEXT | Tipo: html, css, js, json, text, xml |
| content | TEXT | Conteúdo do arquivo |
| created_at | TIMESTAMPTZ | Data de criação |
| updated_at | TIMESTAMPTZ | Última atualização |

#### chat_messages
Histórico de mensagens do chat de cada projeto.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Identificador único |
| project_id | UUID | FK para projects |
| role | TEXT | user, assistant, system |
| content | TEXT | Conteúdo da mensagem |
| metadata | JSONB | Metadados adicionais |
| created_at | TIMESTAMPTZ | Data de criação |

#### ai_agents
Configuração dos agentes de IA do pipeline.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Identificador único |
| name | TEXT | Nome do agente |
| slug | TEXT | Identificador único (design_analyst, code_generator, seo_specialist) |
| description | TEXT | Descrição do papel do agente |
| system_prompt | TEXT | Prompt customizado (opcional) |
| color | TEXT | Cor do agente na UI |
| icon | TEXT | Ícone Lucide |
| is_active | BOOLEAN | Se está ativo |
| is_system | BOOLEAN | Se é agente do sistema |
| created_at | TIMESTAMPTZ | Data de criação |
| updated_at | TIMESTAMPTZ | Última atualização |

#### ai_memories
Base de conhecimento que influencia a geração de sites.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Identificador único |
| title | TEXT | Título da memória |
| content | TEXT | Conteúdo/instruções |
| type | TEXT | instruction, document, template |
| category | TEXT | general, branding, content, structure, style, business |
| agent | TEXT | all, design_analyst, code_generator, seo_specialist |
| priority | INTEGER | Prioridade (maior = mais influente) |
| is_active | BOOLEAN | Se está ativa |
| is_system | BOOLEAN | Se é memória do sistema |
| created_at | TIMESTAMPTZ | Data de criação |
| updated_at | TIMESTAMPTZ | Última atualização |

#### layout_versions
Histórico de versões dos layouts gerados.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Identificador único |
| project_id | UUID | FK para projects |
| layout_tree | JSONB | Snapshot do layout |
| version_number | INTEGER | Número da versão (auto-incremento) |
| commit_message | TEXT | Descrição da versão |
| is_current | BOOLEAN | Se é a versão atual |
| created_by | TEXT | Criador da versão |
| created_at | TIMESTAMPTZ | Data de criação |

#### page_templates
Templates para geração em massa de páginas.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Identificador único |
| project_id | UUID | FK para projects |
| name | TEXT | Nome do template |
| source_file_path | TEXT | Arquivo base |
| tags | TEXT[] | Tags detectadas ({bairro}, {cidade}, etc.) |
| output_pattern | TEXT | Padrão de nome de saída |
| output_folder | TEXT | Pasta de destino |
| variations | JSONB | Array de variações |
| created_at | TIMESTAMPTZ | Data de criação |
| updated_at | TIMESTAMPTZ | Última atualização |

---

## Pipeline Multi-Agente de IA

O PHPVibe utiliza um pipeline de 3 agentes especializados para gerar websites de alta qualidade:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  DESIGN ANALYST │────►│ CODE GENERATOR  │────►│ SEO SPECIALIST  │
│   (gpt-4o)      │     │    (gpt-4o)     │     │  (gpt-4o-mini)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Design Specs    │     │ HTML/CSS/JS     │     │ SEO-Optimized   │
│ (JSON)          │     │ Code            │     │ Final Code      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Agente 1: Design Analyst

**Modelo**: GPT-4o (com capacidade de visão)

**Responsabilidades**:
- Analisar briefing textual do usuário
- Processar imagens de referência (se fornecidas)
- Extrair especificações de design precisas

**Output** (JSON):
```json
{
  "colors": {
    "primary": "#1E40AF",
    "secondary": "#3B82F6",
    "accent": "#F59E0B",
    "background": "#FFFFFF",
    "text": "#1F2937"
  },
  "typography": {
    "headingFont": "Montserrat",
    "bodyFont": "Open Sans",
    "headingWeight": "700",
    "bodyWeight": "400"
  },
  "layout": {
    "style": "modern-corporate",
    "headerStyle": "fixed-transparent",
    "heroStyle": "full-width-gradient"
  },
  "borderRadius": "12px",
  "shadows": "soft-elevated",
  "spacing": "generous"
}
```

### Agente 2: Code Generator

**Modelo**: GPT-4o

**Responsabilidades**:
- Receber briefing + design specs do Agente 1
- Gerar código HTML/CSS/JS completo
- Aplicar memórias de sistema (animações, componentes, etc.)

**Output**: Arquivo index.html com CSS inline e JS inline

**Características do código gerado**:
- HTML5 semântico
- CSS com animações (@keyframes)
- JavaScript para interatividade
- Menu responsivo (hamburger em mobile)
- Ícones via Lucide CDN
- Fontes via Google Fonts

### Agente 3: SEO Specialist

**Modelo**: GPT-4o-mini

**Responsabilidades**:
- Receber código do Agente 2
- Adicionar otimizações de SEO

**Otimizações aplicadas**:
- Meta tags (title, description, OG, Twitter)
- Schema.org JSON-LD (LocalBusiness, Service)
- Breadcrumbs com microdata
- HTML semântico (header, nav, main, section, article, footer)
- Alt attributes em imagens
- Canonical URL
- Heading hierarchy (H1 único)

---

## Edge Functions

### analyze-design

**Endpoint**: `/functions/v1/analyze-design`

**Método**: POST

**Payload**:
```json
{
  "briefing": "Texto do briefing do usuário",
  "imageUrls": ["url1", "url2"]
}
```

**Response**:
```json
{
  "designSpecs": {
    "colors": {...},
    "typography": {...},
    "layout": {...}
  }
}
```

### generate-files

**Endpoint**: `/functions/v1/generate-files`

**Método**: POST

**Payload**:
```json
{
  "projectId": "uuid",
  "briefing": "Texto do briefing",
  "designSpecs": {...}
}
```

**Response**:
```json
{
  "success": true,
  "files": [
    {
      "path": "index.html",
      "name": "index.html",
      "type": "html",
      "content": "<!DOCTYPE html>..."
    }
  ]
}
```

### optimize-seo

**Endpoint**: `/functions/v1/optimize-seo`

**Método**: POST

**Payload**:
```json
{
  "projectId": "uuid",
  "files": [...]
}
```

**Response**:
```json
{
  "success": true,
  "files": [...]
}
```

### export-zip

**Endpoint**: `/functions/v1/export-zip`

**Método**: POST

**Payload**:
```json
{
  "projectId": "uuid",
  "projectName": "meu-site",
  "options": {
    "includeReadme": true,
    "includeHtaccess": true,
    "includeSitemap": true,
    "includeCompiled": false,
    "siteUrl": "https://exemplo.com"
  }
}
```

**Response**: Blob (arquivo ZIP)

---

## Componentes Principais

### Layout Components

#### AppLayout
Container principal que envolve todas as páginas com sidebar.

```tsx
<AppLayout>
  <PageContent />
</AppLayout>
```

#### AppSidebar
Navegação lateral colapsável com links para todas as seções.

**Itens de navegação**:
- Dashboard
- Projetos
- Novo Projeto
- Base de Conhecimento
- Ajuda

### Chat Components

#### ChatHeader
Cabeçalho do chat mostrando status da IA e botão de limpar histórico.

#### MessageBubble
Renderiza mensagens do chat com suporte a:
- Formatação markdown
- Blocos de código com syntax highlighting
- Botão copy-to-clipboard
- Timestamps

#### EnhancedGenerationProgress
Mostra progresso detalhado da geração com:
- Estágio atual (Design Analyst, Code Generator, SEO Specialist)
- Barra de progresso
- Tempo decorrido
- Detecção de timeout

#### QuickSuggestions
Chips clicáveis com sugestões rápidas de comandos.

### File Explorer Components

#### FileExplorer
Painel lateral com árvore de arquivos do projeto.

#### FileTree
Componente recursivo que renderiza estrutura de pastas/arquivos.

#### FileEditor
Editor de código inline com syntax highlighting básico.

#### FilePreview
Iframe que renderiza preview do HTML gerado.

#### ResponsivePreview
Wrapper com controles para visualizar preview em diferentes breakpoints:
- Desktop (1200px)
- Tablet (768px)
- Mobile (375px)

### Export Components

#### ExportOptionsDialog
Dialog para configurar opções de exportação:
- Incluir README.md
- Incluir .htaccess
- Incluir sitemap.xml
- URL do site

#### ExportProgress
Barra de progresso durante exportação.

---

## Hooks Customizados

### useProjects

```tsx
const { 
  data: projects, 
  isLoading, 
  isError 
} = useProjects();

const { mutate: createProject } = useCreateProject();
const { mutate: updateProject } = useUpdateProject();
const { mutate: deleteProject } = useDeleteProject();
```

### useProjectFiles

```tsx
const { 
  data: files, 
  isLoading 
} = useProjectFiles(projectId);

const { mutate: updateFile } = useUpdateFile();
const { mutate: deleteFiles } = useDeleteProjectFiles();

// Utilitário
const fileTree = buildFileTree(files);
```

### useChatMessages

```tsx
const { 
  data: messages, 
  isLoading 
} = useChatMessages(projectId);

const { mutate: addMessage } = useAddChatMessage();
const { mutate: clearMessages } = useClearChatMessages();
```

### useAIAgents

```tsx
const { 
  data: agents, 
  isLoading 
} = useAIAgents();

const { mutate: updateAgent } = useUpdateAIAgent();
```

### useAIMemories

```tsx
const { 
  data: memories, 
  isLoading 
} = useAIMemories();

const { mutate: createMemory } = useCreateAIMemory();
const { mutate: updateMemory } = useUpdateAIMemory();
const { mutate: deleteMemory } = useDeleteAIMemory();
```

### useGenerationStatus

```tsx
const {
  status,      // 'idle' | 'analyzing' | 'design_analyst' | 'code_generator' | 'seo_specialist' | 'saving' | 'complete' | 'error' | 'timeout'
  message,     // Mensagem atual
  progress,    // 0-100
  startTime,   // Timestamp de início
  setStatus,
  setMessage,
  setProgress,
  reset,
  startGeneration,
  completeGeneration,
  setError,
  checkTimeout
} = useGenerationStatus();
```

### usePageTemplates

```tsx
const { 
  data: templates 
} = usePageTemplates(projectId);

const { mutate: createTemplate } = useCreatePageTemplate();
const { mutate: updateTemplate } = useUpdatePageTemplate();
```

---

## Páginas da Aplicação

### Index (`/`)
Landing page pública do produto.

### Dashboard (`/dashboard`)
Visão geral com estatísticas e projetos recentes.

### Projects (`/projects`)
Lista de todos os projetos com opções de:
- Criar novo projeto
- Abrir projeto existente
- Deletar projeto

### Briefing (`/new`)
Formulário para criar novo projeto com:
- Nome do projeto
- Descrição/briefing
- Upload de imagens de referência

### VibeChat (`/vibe/:projectId`)
Interface principal de geração com:
- Chat conversacional
- Preview em tempo real
- Explorador de arquivos
- Editor inline

### Knowledge (`/knowledge`)
Base de conhecimento com:
- Gerenciamento de agentes
- Gerenciamento de memórias
- Upload de documentos

### Preview (`/preview/:projectId`)
Preview em tela cheia do projeto.

### PageMultiplier (`/page-multiplier/:projectId`)
Geração em massa de páginas a partir de template.

### Versions (`/versions/:projectId`)
Histórico de versões do projeto.

### Help (`/help`)
Documentação e ajuda.

---

## Sistema de Design

### Tokens de Cor (index.css)

```css
:root {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --primary: 263 70% 50%;        /* Violet */
  --secondary: 300 75% 48%;       /* Purple */
  --accent: 199 89% 48%;          /* Cyan */
  --muted: 240 3.7% 15.9%;
  --border: 240 3.7% 15.9%;
  --ring: 263 70% 50%;
}
```

### Gradientes

```css
--gradient-primary: linear-gradient(135deg, hsl(263 70% 50%), hsl(300 75% 48%));
--gradient-accent: linear-gradient(135deg, hsl(199 89% 48%), hsl(263 70% 50%));
```

### Tipografia

- **Heading**: Sora (Google Fonts)
- **Body**: Inter (Google Fonts)

### Border Radius

- Default: `0.75rem` (12px)
- Small: `0.5rem` (8px)
- Large: `1rem` (16px)

---

## Funcionalidades

### 1. Criação de Projeto

1. Usuário acessa `/new`
2. Preenche nome e descrição (briefing)
3. Opcionalmente faz upload de imagens de referência
4. Sistema cria projeto no banco com status "draft"
5. Redireciona para `/vibe/:projectId`

### 2. Geração de Website

1. Na página VibeChat, usuário envia mensagem
2. Sistema dispara pipeline:
   - Analyze Design (extrai specs de design)
   - Generate Files (gera código HTML/CSS/JS)
   - Optimize SEO (adiciona otimizações)
3. Arquivos são salvos em `project_files`
4. Preview é atualizado em tempo real

### 3. Edição Conversacional

1. Usuário envia comando (ex: "adicione um formulário de contato")
2. Sistema processa com context do projeto atual
3. Código é atualizado
4. Preview reflete mudanças

### 4. Page Multiplier

1. Usuário seleciona arquivo HTML base
2. Sistema detecta tags (ex: `{bairro}`, `{cidade}`)
3. Usuário preenche tabela de variações
4. Sistema gera múltiplas páginas com substituições

### 5. Exportação

1. Usuário clica em "Exportar"
2. Seleciona opções (README, htaccess, sitemap, etc.)
3. Sistema gera ZIP com estrutura:
   ```
   projeto/
   ├── index.html
   ├── css/
   │   └── styles.css
   ├── js/
   │   └── main.js
   ├── README.md
   ├── robots.txt
   ├── sitemap.xml
   └── .htaccess
   ```
4. Download automático

### 6. Base de Conhecimento

1. Usuário acessa `/knowledge`
2. Pode criar/editar memórias por agente
3. Memórias influenciam geração de todos os projetos
4. Upload de documentos extrai texto e cria memória

---

## Fluxo do Usuário

```
┌─────────────┐
│   Landing   │
│   Page (/)  │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│  Dashboard  │◄───►│  Projects   │
│ (/dashboard)│     │ (/projects) │
└──────┬──────┘     └──────┬──────┘
       │                   │
       ▼                   ▼
┌─────────────┐     ┌─────────────┐
│  Briefing   │────►│  VibeChat   │
│   (/new)    │     │(/vibe/:id)  │
└─────────────┘     └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
       ┌───────────┐┌───────────┐┌───────────┐
       │  Preview  ││   Page    ││  Export   │
       │(/preview) ││Multiplier ││   ZIP     │
       └───────────┘└───────────┘└───────────┘
```

---

## API e Integrações

### Supabase Client

```typescript
import { supabase } from "@/integrations/supabase/client";

// Query
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .eq('id', projectId);

// Insert
const { data, error } = await supabase
  .from('projects')
  .insert({ name, description })
  .select()
  .single();

// Update
const { data, error } = await supabase
  .from('projects')
  .update({ status: 'ready' })
  .eq('id', projectId);

// Delete
const { error } = await supabase
  .from('projects')
  .delete()
  .eq('id', projectId);
```

### Edge Function Invocation

```typescript
const { data, error } = await supabase.functions.invoke('generate-files', {
  body: { projectId, briefing, designSpecs }
});
```

### OpenAI API (via Edge Functions)

```typescript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-4o',
    messages: [...],
    response_format: { type: 'json_object' }
  })
});
```

---

## Configuração e Deploy

### Variáveis de Ambiente

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
VITE_SUPABASE_PROJECT_ID=xxx
```

### Secrets (Supabase)

| Secret | Descrição |
|--------|-----------|
| OPENAI_API_KEY | Chave da API OpenAI |
| SUPABASE_URL | URL do projeto Supabase |
| SUPABASE_ANON_KEY | Chave anônima |
| SUPABASE_SERVICE_ROLE_KEY | Chave de service role |

### Deploy

O deploy é automático via Lovable:

1. **Frontend**: Alterações no código são deployadas automaticamente
2. **Edge Functions**: Deploy automático ao salvar
3. **Banco de Dados**: Migrações via ferramenta de migration

---

## Limitações Conhecidas

### Segurança

| Limitação | Impacto | Status |
|-----------|---------|--------|
| RLS desabilitado | Dados públicos | MVP - Não produção |
| Sem autenticação | Sem multi-usuário | Planejado |
| API key exposta | Risco de abuso | Edge functions protegem |

### Performance

| Limitação | Impacto | Workaround |
|-----------|---------|------------|
| Timeout 150s (Lovable Cloud) | Geração pode falhar | Detecção de timeout na UI |
| Sem streaming | UI não mostra progresso real | EnhancedGenerationProgress |
| Sem cache de memórias | Queries repetidas | Planejado |

### Funcionalidades

| Funcionalidade | Status |
|----------------|--------|
| Multi-tenant | Não implementado |
| Deploy automático (FTP/cPanel) | Fora do escopo MVP |
| Drag-and-drop editor | Fora do escopo MVP |
| Templates pré-prontos | Parcialmente (via memórias) |

---

## Roadmap de Melhorias

### Fase 1: Correções Críticas ✅
- [x] Corrigir texto da sidebar (Gemini → OpenAI)
- [x] Implementar feedback de progresso real
- [x] Adicionar preview responsivo
- [x] Suporte a system_prompt customizado nos agentes

### Fase 2: Funcionalidades de Produto
- [ ] Histórico de versões funcional
- [ ] Cache de memórias
- [ ] Paginação de projetos
- [ ] Duplicar projeto

### Fase 3: Escalabilidade
- [ ] Autenticação de usuários
- [ ] RLS por usuário
- [ ] Streaming de resposta IA
- [ ] Migração para Supabase Pro (timeout 400s)

### Fase 4: Features Avançadas
- [ ] Templates pré-prontos
- [ ] Análise de performance do site
- [ ] Integração GitHub
- [ ] Deploy direto (FTP/cPanel)

---

## Glossário

| Termo | Definição |
|-------|-----------|
| **Briefing** | Descrição textual do site desejado pelo usuário |
| **Design Specs** | Especificações de design extraídas pelo Design Analyst |
| **Edge Function** | Função serverless executada no Supabase |
| **Layout Tree** | Estrutura JSON do layout (legado) |
| **Memory** | Instrução/conhecimento que influencia a geração |
| **Pipeline** | Sequência de processamento multi-agente |
| **RLS** | Row Level Security - políticas de acesso a dados |
| **Vibe Coding** | Metodologia de desenvolvimento conversacional |

---

## Contato e Suporte

Para dúvidas ou suporte sobre o PHPVibe 4.0, consulte a página de Ajuda (`/help`) dentro da aplicação.

---

*Documentação gerada em Dezembro 2025*
*Versão: 4.0.0*
