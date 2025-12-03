# 🚀 Guia de Migração: Supabase para Google Cloud Platform

Este documento fornece instruções detalhadas para migrar o PHPVibe 4.0 do Supabase (Lovable Cloud) para a infraestrutura do Google Cloud Platform (GCP).

---

## 📋 Índice

1. [Visão Geral](#1-visão-geral)
2. [Opções de Hospedagem no Google Cloud](#2-opções-de-hospedagem-no-google-cloud)
3. [Pré-requisitos](#3-pré-requisitos)
4. [Migração do Banco de Dados](#4-migração-do-banco-de-dados)
5. [Migração do Storage](#5-migração-do-storage)
6. [Migração das Edge Functions](#6-migração-das-edge-functions)
7. [Atualização do Frontend](#7-atualização-do-frontend)
8. [Scripts de Migração Automatizada](#8-scripts-de-migração-automatizada)
9. [Checklist de Validação](#9-checklist-de-validação)
10. [Rollback e Troubleshooting](#10-rollback-e-troubleshooting)

---

## 1. Visão Geral

### 1.1 Arquitetura Atual vs Arquitetura Alvo

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ARQUITETURA ATUAL                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│   │   Frontend   │───▶│   Supabase   │───▶│  PostgreSQL  │                  │
│   │   (React)    │    │    Client    │    │   Database   │                  │
│   └──────────────┘    └──────────────┘    └──────────────┘                  │
│          │                   │                                               │
│          │                   ▼                                               │
│          │            ┌──────────────┐    ┌──────────────┐                  │
│          │            │    Edge      │    │   Supabase   │                  │
│          └───────────▶│  Functions   │    │   Storage    │                  │
│                       │   (Deno)     │    │   Buckets    │                  │
│                       └──────────────┘    └──────────────┘                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

                                    ▼ MIGRAÇÃO ▼

┌─────────────────────────────────────────────────────────────────────────────┐
│                        ARQUITETURA GOOGLE CLOUD                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│   │   Frontend   │───▶│   API Client │───▶│  Cloud SQL   │                  │
│   │   (React)    │    │   (Custom)   │    │ (PostgreSQL) │                  │
│   └──────────────┘    └──────────────┘    └──────────────┘                  │
│          │                   │                                               │
│          │                   ▼                                               │
│          │            ┌──────────────┐    ┌──────────────┐                  │
│          │            │    Cloud     │    │    Cloud     │                  │
│          └───────────▶│  Functions   │    │   Storage    │                  │
│                       │  (Node.js)   │    │   Buckets    │                  │
│                       └──────────────┘    └──────────────┘                  │
│                              │                                               │
│                              ▼                                               │
│                       ┌──────────────┐                                       │
│                       │   Firebase   │                                       │
│                       │     Auth     │                                       │
│                       └──────────────┘                                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Comparativo de Serviços

| Componente | Supabase | Google Cloud | Observações |
|------------|----------|--------------|-------------|
| Banco de Dados | PostgreSQL (gerenciado) | Cloud SQL (PostgreSQL) | Mesmo engine, configuração similar |
| Autenticação | Supabase Auth | Firebase Authentication | Migração de usuários necessária |
| Storage | Supabase Storage | Cloud Storage | URLs diferentes, migrar arquivos |
| Funções Serverless | Edge Functions (Deno) | Cloud Functions (Node.js) | Reescrita de código necessária |
| Realtime | Supabase Realtime | Firebase/Pub-Sub | Implementação diferente |

### 1.3 Estimativa de Custos Mensais

| Serviço | Tier Gratuito | Uso Estimado PHPVibe | Custo Mensal |
|---------|---------------|---------------------|--------------|
| Cloud SQL (db-f1-micro) | - | 10GB SSD | ~$10-15 USD |
| Cloud Storage | 5GB | 50GB | ~$1-2 USD |
| Cloud Functions | 2M invocações | 10K invocações | ~$0 (tier gratuito) |
| Firebase Auth | 50K MAU | 1K MAU | ~$0 (tier gratuito) |
| **Total Estimado** | - | - | **~$12-20 USD/mês** |

---

## 2. Opções de Hospedagem no Google Cloud

### 2.1 Cloud SQL (PostgreSQL)

Cloud SQL é o serviço gerenciado de banco de dados do Google, compatível com PostgreSQL.

**Vantagens:**
- PostgreSQL 15 nativo (mesmo do Supabase)
- Backups automáticos
- Alta disponibilidade opcional
- Escalabilidade vertical

**Tiers Disponíveis:**

| Tier | vCPUs | RAM | Uso Recomendado |
|------|-------|-----|-----------------|
| db-f1-micro | Compartilhado | 0.6GB | Desenvolvimento/MVP |
| db-g1-small | Compartilhado | 1.7GB | Produção pequena |
| db-custom-1-3840 | 1 | 3.75GB | Produção média |
| db-custom-2-7680 | 2 | 7.5GB | Produção alta |

### 2.2 Cloud Storage

Equivalente ao Supabase Storage para armazenamento de arquivos.

**Classes de Storage:**

| Classe | Uso | Custo/GB/mês |
|--------|-----|--------------|
| Standard | Acesso frequente | $0.020 |
| Nearline | Acesso mensal | $0.010 |
| Coldline | Acesso trimestral | $0.004 |
| Archive | Acesso anual | $0.0012 |

**Recomendação PHPVibe:** Standard para `project-assets` e `theme-assets`.

### 2.3 Cloud Functions

Serverless functions equivalentes às Edge Functions do Supabase.

**Diferenças Principais:**

| Aspecto | Edge Functions (Supabase) | Cloud Functions |
|---------|--------------------------|-----------------|
| Runtime | Deno | Node.js 18/20 |
| Timeout Máximo | 150s (Cloud) / 400s (Pro) | 540s (Gen 2) |
| Memória | 1GB | Até 32GB |
| Linguagem | TypeScript/Deno | JavaScript/TypeScript |

### 2.4 Firebase Authentication

Sistema de autenticação do Google, alternativa ao Supabase Auth.

**Métodos Suportados:**
- Email/Password ✅
- Google Sign-In ✅
- Facebook Login ✅
- GitHub Login ✅
- Phone/SMS ✅
- Anonymous ✅

---

## 3. Pré-requisitos

### 3.1 Ferramentas Necessárias

```bash
# 1. Instalar Google Cloud CLI
# macOS
brew install google-cloud-sdk

# Linux (Debian/Ubuntu)
echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list
curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key --keyring /usr/share/keyrings/cloud.google.gpg add -
sudo apt-get update && sudo apt-get install google-cloud-cli

# Windows
# Baixar instalador: https://cloud.google.com/sdk/docs/install

# 2. Instalar PostgreSQL Client (para pg_dump/pg_restore)
# macOS
brew install postgresql

# Linux
sudo apt-get install postgresql-client

# 3. Instalar Node.js 18+ (para Cloud Functions)
# Via nvm (recomendado)
nvm install 18
nvm use 18

# 4. Verificar instalações
gcloud --version
psql --version
node --version
```

### 3.2 Configuração Inicial do GCP

```bash
# 1. Autenticar no Google Cloud
gcloud auth login

# 2. Criar novo projeto (ou usar existente)
gcloud projects create phpvibe-production --name="PHPVibe Production"

# 3. Definir projeto padrão
gcloud config set project phpvibe-production

# 4. Habilitar billing (necessário para Cloud SQL)
# Acesse: https://console.cloud.google.com/billing

# 5. Habilitar APIs necessárias
gcloud services enable sqladmin.googleapis.com
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable firebase.googleapis.com
gcloud services enable secretmanager.googleapis.com

# 6. Verificar APIs habilitadas
gcloud services list --enabled
```

### 3.3 Credenciais Necessárias

Antes de iniciar, colete as seguintes informações do Supabase:

```bash
# Do Supabase (Lovable Cloud)
SUPABASE_PROJECT_ID="iqcoumkqgcbqdetuqozh"
SUPABASE_URL="https://iqcoumkqgcbqdetuqozh.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIs..."
SUPABASE_SERVICE_ROLE_KEY="seu-service-role-key"
SUPABASE_DB_PASSWORD="sua-senha-do-banco"

# Secrets existentes (verificar no Supabase)
OPENAI_API_KEY="sk-..."
LOVABLE_API_KEY="..."
```

---

## 4. Migração do Banco de Dados

### 4.1 Criar Instância Cloud SQL

```bash
# Criar instância PostgreSQL 15
gcloud sql instances create phpvibe-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=southamerica-east1 \
  --storage-type=SSD \
  --storage-size=10GB \
  --backup-start-time=03:00 \
  --availability-type=zonal \
  --storage-auto-increase

# Aguardar criação (pode levar 5-10 minutos)
gcloud sql instances describe phpvibe-db

# Definir senha do usuário postgres
gcloud sql users set-password postgres \
  --instance=phpvibe-db \
  --password=SUA_SENHA_SEGURA_AQUI

# Criar banco de dados
gcloud sql databases create phpvibe --instance=phpvibe-db

# Obter IP público da instância (para conexão)
gcloud sql instances describe phpvibe-db --format="value(ipAddresses.ipAddress)"
```

### 4.2 Configurar Acesso ao Cloud SQL

```bash
# Opção 1: Autorizar IP específico (desenvolvimento)
gcloud sql instances patch phpvibe-db \
  --authorized-networks=SEU_IP_PUBLICO/32

# Opção 2: Usar Cloud SQL Proxy (recomendado para produção)
# Download do proxy
curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.8.0/cloud-sql-proxy.linux.amd64
chmod +x cloud-sql-proxy

# Executar proxy (em outro terminal)
./cloud-sql-proxy phpvibe-production:southamerica-east1:phpvibe-db
```

### 4.3 Exportar Dados do Supabase

```bash
# Exportar schema e dados do Supabase
# Substitua as credenciais pelos valores reais

export SUPABASE_DB_HOST="db.iqcoumkqgcbqdetuqozh.supabase.co"
export SUPABASE_DB_PORT="5432"
export SUPABASE_DB_USER="postgres"
export SUPABASE_DB_PASSWORD="SUA_SENHA"
export SUPABASE_DB_NAME="postgres"

# Exportar apenas schema público (sem auth, storage, etc.)
pg_dump \
  --host=$SUPABASE_DB_HOST \
  --port=$SUPABASE_DB_PORT \
  --username=$SUPABASE_DB_USER \
  --dbname=$SUPABASE_DB_NAME \
  --schema=public \
  --no-owner \
  --no-privileges \
  --file=supabase_export.sql

# Exportar apenas dados (sem schema)
pg_dump \
  --host=$SUPABASE_DB_HOST \
  --port=$SUPABASE_DB_PORT \
  --username=$SUPABASE_DB_USER \
  --dbname=$SUPABASE_DB_NAME \
  --schema=public \
  --data-only \
  --no-owner \
  --file=supabase_data.sql
```

### 4.4 Scripts SQL para Cloud SQL

Execute os scripts abaixo no Cloud SQL para criar a estrutura:

```sql
-- =============================================================================
-- SCRIPT DE CRIAÇÃO DO BANCO DE DADOS PHPVIBE NO CLOUD SQL
-- =============================================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- TABELA: projects
-- Armazena os projetos de websites dos usuários
-- =============================================================================
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    thumbnail_url TEXT,
    layout_tree JSONB,
    user_id UUID, -- Referência ao Firebase Auth UID
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_created_at ON public.projects(created_at DESC);

-- =============================================================================
-- TABELA: project_files
-- Armazena os arquivos gerados para cada projeto (HTML, CSS, JS)
-- =============================================================================
CREATE TABLE public.project_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, file_path)
);

CREATE INDEX idx_project_files_project_id ON public.project_files(project_id);
CREATE INDEX idx_project_files_file_type ON public.project_files(file_type);

-- =============================================================================
-- TABELA: project_settings
-- Configurações específicas do projeto (dados da empresa, contato, etc.)
-- =============================================================================
CREATE TABLE public.project_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL UNIQUE REFERENCES public.projects(id) ON DELETE CASCADE,
    company_name VARCHAR(255),
    slogan VARCHAR(500),
    logo_url TEXT,
    favicon_url TEXT,
    email VARCHAR(255),
    phone VARCHAR(50),
    whatsapp VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    social_links JSONB DEFAULT '{}',
    business_hours JSONB DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}',
    gallery_images TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_project_settings_project_id ON public.project_settings(project_id);

-- =============================================================================
-- TABELA: chat_messages
-- Histórico de mensagens do chat de geração de sites
-- =============================================================================
CREATE TABLE public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_project_id ON public.chat_messages(project_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(project_id, created_at);

-- =============================================================================
-- TABELA: layout_versions
-- Versionamento de layouts para histórico e rollback
-- =============================================================================
CREATE TABLE public.layout_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    layout_tree JSONB NOT NULL,
    commit_message TEXT,
    is_current BOOLEAN DEFAULT TRUE,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, version_number)
);

CREATE INDEX idx_layout_versions_project_id ON public.layout_versions(project_id);
CREATE INDEX idx_layout_versions_current ON public.layout_versions(project_id, is_current) WHERE is_current = TRUE;

-- =============================================================================
-- TABELA: page_templates
-- Templates de páginas para multiplicação
-- =============================================================================
CREATE TABLE public.page_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    source_file_path VARCHAR(500) NOT NULL,
    output_pattern VARCHAR(500) DEFAULT '{name}.html',
    output_folder VARCHAR(500),
    tags TEXT[] DEFAULT '{}',
    variations JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_page_templates_project_id ON public.page_templates(project_id);

-- =============================================================================
-- TABELA: themes
-- Temas/templates importados pelo usuário
-- =============================================================================
CREATE TABLE public.themes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    tags TEXT[],
    preview_image_url TEXT,
    file_count INTEGER DEFAULT 0,
    total_size_bytes BIGINT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    user_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_themes_category ON public.themes(category);
CREATE INDEX idx_themes_is_active ON public.themes(is_active);
CREATE INDEX idx_themes_user_id ON public.themes(user_id);

-- =============================================================================
-- TABELA: theme_files
-- Arquivos pertencentes aos temas
-- =============================================================================
CREATE TABLE public.theme_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    theme_id UUID NOT NULL REFERENCES public.themes(id) ON DELETE CASCADE,
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    content TEXT, -- Para arquivos de texto
    storage_url TEXT, -- Para arquivos binários no Cloud Storage
    size_bytes BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_theme_files_theme_id ON public.theme_files(theme_id);
CREATE INDEX idx_theme_files_file_type ON public.theme_files(file_type);

-- =============================================================================
-- TABELA: ai_agents
-- Agentes de IA personalizáveis
-- =============================================================================
CREATE TABLE public.ai_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(50) DEFAULT '#7C3AED',
    icon VARCHAR(50),
    system_prompt TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_agents_slug ON public.ai_agents(slug);
CREATE INDEX idx_ai_agents_is_active ON public.ai_agents(is_active);

-- =============================================================================
-- TABELA: ai_memories
-- Memórias/instruções para treinar os agentes de IA
-- =============================================================================
CREATE TABLE public.ai_memories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'instruction',
    category VARCHAR(50),
    agent VARCHAR(50), -- 'design_analyst', 'code_generator', 'seo_specialist', 'all'
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_memories_agent ON public.ai_memories(agent);
CREATE INDEX idx_ai_memories_category ON public.ai_memories(category);
CREATE INDEX idx_ai_memories_is_active ON public.ai_memories(is_active);
CREATE INDEX idx_ai_memories_priority ON public.ai_memories(priority DESC);

-- =============================================================================
-- FUNCTIONS: Utilitárias
-- =============================================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para incrementar version_number automaticamente
CREATE OR REPLACE FUNCTION increment_version_number()
RETURNS TRIGGER AS $$
BEGIN
    SELECT COALESCE(MAX(version_number), 0) + 1 INTO NEW.version_number
    FROM public.layout_versions
    WHERE project_id = NEW.project_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para definir versões anteriores como não-current
CREATE OR REPLACE FUNCTION set_previous_versions_not_current()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.layout_versions
    SET is_current = FALSE
    WHERE project_id = NEW.project_id AND id != NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Triggers de updated_at
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_files_updated_at
    BEFORE UPDATE ON public.project_files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_settings_updated_at
    BEFORE UPDATE ON public.project_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_page_templates_updated_at
    BEFORE UPDATE ON public.page_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_themes_updated_at
    BEFORE UPDATE ON public.themes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_agents_updated_at
    BEFORE UPDATE ON public.ai_agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_memories_updated_at
    BEFORE UPDATE ON public.ai_memories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggers de layout_versions
CREATE TRIGGER increment_layout_version_number
    BEFORE INSERT ON public.layout_versions
    FOR EACH ROW EXECUTE FUNCTION increment_version_number();

CREATE TRIGGER set_previous_layout_versions_not_current
    AFTER INSERT ON public.layout_versions
    FOR EACH ROW EXECUTE FUNCTION set_previous_versions_not_current();

-- =============================================================================
-- DADOS INICIAIS: Agentes de IA do Sistema
-- =============================================================================

INSERT INTO public.ai_agents (slug, name, description, color, icon, is_system, is_active) VALUES
('design_analyst', 'Design Analyst', 'Analisa briefing e imagens de referência para extrair especificações de design', '#7C3AED', 'palette', TRUE, TRUE),
('code_generator', 'Code Generator', 'Gera código HTML/CSS/JS baseado nas especificações do Design Analyst', '#0EA5E9', 'code', TRUE, TRUE),
('seo_specialist', 'SEO Specialist', 'Otimiza o código gerado para SEO, adicionando meta tags e Schema.org', '#10B981', 'search', TRUE, TRUE);

-- =============================================================================
-- FIM DO SCRIPT
-- =============================================================================
```

### 4.5 Importar Dados no Cloud SQL

```bash
# Via Cloud SQL Proxy (conectado localhost:5432)
psql -h localhost -U postgres -d phpvibe < supabase_data.sql

# Ou via IP direto (se autorizado)
psql -h IP_DO_CLOUD_SQL -U postgres -d phpvibe < supabase_data.sql

# Verificar importação
psql -h localhost -U postgres -d phpvibe -c "SELECT COUNT(*) FROM projects;"
psql -h localhost -U postgres -d phpvibe -c "SELECT COUNT(*) FROM ai_memories;"
```

---

## 5. Migração do Storage

### 5.1 Criar Buckets no Cloud Storage

```bash
# Criar bucket para assets de projetos
gsutil mb -l southamerica-east1 -c STANDARD gs://phpvibe-project-assets

# Criar bucket para assets de temas
gsutil mb -l southamerica-east1 -c STANDARD gs://phpvibe-theme-assets

# Configurar CORS para acesso via browser
cat > cors.json << EOF
[
  {
    "origin": ["*"],
    "method": ["GET", "PUT", "POST", "DELETE"],
    "responseHeader": ["Content-Type", "Authorization"],
    "maxAgeSeconds": 3600
  }
]
EOF

gsutil cors set cors.json gs://phpvibe-project-assets
gsutil cors set cors.json gs://phpvibe-theme-assets

# Tornar buckets públicos (se necessário)
gsutil iam ch allUsers:objectViewer gs://phpvibe-project-assets
gsutil iam ch allUsers:objectViewer gs://phpvibe-theme-assets
```

### 5.2 Exportar Arquivos do Supabase Storage

```bash
# Script para download dos arquivos do Supabase Storage
# Requer: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

mkdir -p supabase_storage_backup/project-assets
mkdir -p supabase_storage_backup/theme-assets

# Listar e baixar arquivos (via API)
# Este é um exemplo simplificado - ajustar conforme quantidade de arquivos

curl -X GET \
  "${SUPABASE_URL}/storage/v1/bucket/project-assets/objects" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "apikey: ${SUPABASE_ANON_KEY}" | jq -r '.[] | .name' | while read file; do
    curl -X GET \
      "${SUPABASE_URL}/storage/v1/object/project-assets/${file}" \
      -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
      -o "supabase_storage_backup/project-assets/${file}"
done
```

### 5.3 Upload para Cloud Storage

```bash
# Upload de todos os arquivos para Cloud Storage
gsutil -m cp -r supabase_storage_backup/project-assets/* gs://phpvibe-project-assets/
gsutil -m cp -r supabase_storage_backup/theme-assets/* gs://phpvibe-theme-assets/

# Verificar upload
gsutil ls gs://phpvibe-project-assets/
gsutil ls gs://phpvibe-theme-assets/
```

### 5.4 Atualizar URLs no Banco de Dados

```sql
-- Atualizar URLs de imagens nos projetos
UPDATE public.projects
SET thumbnail_url = REPLACE(
    thumbnail_url,
    'https://iqcoumkqgcbqdetuqozh.supabase.co/storage/v1/object/public/',
    'https://storage.googleapis.com/phpvibe-'
)
WHERE thumbnail_url LIKE '%supabase.co%';

-- Atualizar URLs nas configurações de projeto
UPDATE public.project_settings
SET 
    logo_url = REPLACE(logo_url, 'https://iqcoumkqgcbqdetuqozh.supabase.co/storage/v1/object/public/', 'https://storage.googleapis.com/phpvibe-'),
    favicon_url = REPLACE(favicon_url, 'https://iqcoumkqgcbqdetuqozh.supabase.co/storage/v1/object/public/', 'https://storage.googleapis.com/phpvibe-')
WHERE logo_url LIKE '%supabase.co%' OR favicon_url LIKE '%supabase.co%';

-- Atualizar URLs nos temas
UPDATE public.themes
SET preview_image_url = REPLACE(
    preview_image_url,
    'https://iqcoumkqgcbqdetuqozh.supabase.co/storage/v1/object/public/',
    'https://storage.googleapis.com/phpvibe-'
)
WHERE preview_image_url LIKE '%supabase.co%';

-- Atualizar URLs nos arquivos de tema
UPDATE public.theme_files
SET storage_url = REPLACE(
    storage_url,
    'https://iqcoumkqgcbqdetuqozh.supabase.co/storage/v1/object/public/',
    'https://storage.googleapis.com/phpvibe-'
)
WHERE storage_url LIKE '%supabase.co%';
```

---

## 6. Migração das Edge Functions

### 6.1 Estrutura de Cloud Functions

```
cloud-functions/
├── analyze-design/
│   ├── index.js
│   └── package.json
├── generate-files/
│   ├── index.js
│   └── package.json
├── optimize-seo/
│   ├── index.js
│   └── package.json
├── export-zip/
│   ├── index.js
│   └── package.json
├── export-layout/
│   ├── index.js
│   └── package.json
└── import-theme/
    ├── index.js
    └── package.json
```

### 6.2 Conversão: analyze-design

**Supabase Edge Function (Deno):**
```typescript
// supabase/functions/analyze-design/index.ts
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
// ... resto do código
```

**Cloud Function (Node.js):**
```javascript
// cloud-functions/analyze-design/index.js
const functions = require('@google-cloud/functions-framework');
const fetch = require('node-fetch');

// Configurar CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

functions.http('analyzeDesign', async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.set(corsHeaders);
    res.status(204).send('');
    return;
  }

  res.set(corsHeaders);

  try {
    const { briefing, imageUrls } = req.body;
    const openAIApiKey = process.env.OPENAI_API_KEY;

    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    // Buscar memórias do agente design_analyst
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    const memoriesResult = await pool.query(`
      SELECT title, content FROM ai_memories 
      WHERE is_active = true 
      AND (agent = 'design_analyst' OR agent = 'all')
      ORDER BY priority DESC
    `);

    const memoriesContext = memoriesResult.rows
      .map(m => `### ${m.title}\n${m.content}`)
      .join('\n\n');

    // Construir mensagens para visão
    const messages = [
      {
        role: 'system',
        content: `Você é um Design Analyst especializado em análise visual de websites.
Analise o briefing e as imagens de referência para extrair especificações de design detalhadas.

${memoriesContext}

Responda APENAS em JSON válido com a estrutura:
{
  "colors": { "primary": "#hex", "secondary": "#hex", "accent": "#hex", "background": "#hex", "text": "#hex" },
  "typography": { "headingFont": "Font Name", "bodyFont": "Font Name", "headingWeight": "700", "bodyWeight": "400" },
  "spacing": { "containerWidth": "1200px", "sectionPadding": "80px", "elementGap": "24px" },
  "borderRadius": "12px",
  "shadows": { "card": "0 4px 6px rgba(0,0,0,0.1)", "button": "0 2px 4px rgba(0,0,0,0.1)" },
  "layout": "grid|bento|asymmetric",
  "style": "modern|minimalist|corporate|playful"
}`
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: `Briefing: ${briefing}` },
          ...(imageUrls || []).map(url => ({
            type: 'image_url',
            image_url: { url }
          }))
        ]
      }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'OpenAI API error');
    }

    const designSpecs = JSON.parse(data.choices[0].message.content);

    await pool.end();

    res.json({ designSpecs, model: 'gpt-4o' });

  } catch (error) {
    console.error('Error in analyze-design:', error);
    res.status(500).json({ error: error.message });
  }
});
```

**package.json:**
```json
{
  "name": "analyze-design",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "@google-cloud/functions-framework": "^3.3.0",
    "node-fetch": "^2.7.0",
    "pg": "^8.11.3"
  }
}
```

### 6.3 Conversão: generate-files

```javascript
// cloud-functions/generate-files/index.js
const functions = require('@google-cloud/functions-framework');
const fetch = require('node-fetch');
const { Pool } = require('pg');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

functions.http('generateFiles', async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.set(corsHeaders);
    res.status(204).send('');
    return;
  }

  res.set(corsHeaders);

  try {
    const { briefing, designSpecs, projectId, projectSettings } = req.body;
    const openAIApiKey = process.env.OPENAI_API_KEY;

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    // Buscar memórias do code_generator
    const memoriesResult = await pool.query(`
      SELECT title, content FROM ai_memories 
      WHERE is_active = true 
      AND (agent = 'code_generator' OR agent = 'all')
      ORDER BY priority DESC
    `);

    const memoriesContext = memoriesResult.rows
      .map(m => `### ${m.title}\n${m.content}`)
      .join('\n\n');

    // Buscar prompt customizado do agente
    const agentResult = await pool.query(`
      SELECT system_prompt FROM ai_agents 
      WHERE slug = 'code_generator' AND is_active = true
    `);
    const customPrompt = agentResult.rows[0]?.system_prompt || '';

    const systemPrompt = `Você é um Code Generator especializado em criar websites profissionais.

INSTRUÇÕES DE DESIGN (siga exatamente):
${JSON.stringify(designSpecs, null, 2)}

DADOS DA EMPRESA:
${projectSettings ? JSON.stringify(projectSettings, null, 2) : 'Não fornecido'}

${memoriesContext}

${customPrompt}

Gere um arquivo index.html COMPLETO com:
- CSS inline no <head>
- JavaScript inline antes do </body>
- Header e footer inline (não use placeholders)
- Design responsivo
- Animações CSS profissionais
- Ícones via Lucide CDN

Responda APENAS com o código HTML completo, sem explicações.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Briefing: ${briefing}` }
        ],
        max_tokens: 16000,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'OpenAI API error');
    }

    let htmlContent = data.choices[0].message.content;
    
    // Limpar markdown se presente
    htmlContent = htmlContent
      .replace(/```html\n?/gi, '')
      .replace(/```\n?/gi, '')
      .trim();

    // Salvar arquivo no banco
    if (projectId) {
      await pool.query(`
        INSERT INTO project_files (project_id, file_path, file_name, file_type, content)
        VALUES ($1, 'index.html', 'index.html', 'html', $2)
        ON CONFLICT (project_id, file_path) 
        DO UPDATE SET content = $2, updated_at = NOW()
      `, [projectId, htmlContent]);
    }

    await pool.end();

    res.json({ 
      files: [{ path: 'index.html', name: 'index.html', type: 'html', content: htmlContent }],
      model: 'gpt-4o'
    });

  } catch (error) {
    console.error('Error in generate-files:', error);
    res.status(500).json({ error: error.message });
  }
});
```

### 6.4 Conversão: optimize-seo

```javascript
// cloud-functions/optimize-seo/index.js
const functions = require('@google-cloud/functions-framework');
const fetch = require('node-fetch');
const { Pool } = require('pg');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

functions.http('optimizeSeo', async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.set(corsHeaders);
    res.status(204).send('');
    return;
  }

  res.set(corsHeaders);

  try {
    const { htmlContent, projectId, businessInfo } = req.body;
    const openAIApiKey = process.env.OPENAI_API_KEY;

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    // Buscar memórias do seo_specialist
    const memoriesResult = await pool.query(`
      SELECT title, content FROM ai_memories 
      WHERE is_active = true 
      AND (agent = 'seo_specialist' OR agent = 'all')
      ORDER BY priority DESC
    `);

    const memoriesContext = memoriesResult.rows
      .map(m => `### ${m.title}\n${m.content}`)
      .join('\n\n');

    const systemPrompt = `Você é um SEO Specialist. Otimize o HTML fornecido adicionando:

1. Meta tags completas (title, description, Open Graph, Twitter Cards)
2. Schema.org JSON-LD (LocalBusiness/Organization)
3. Breadcrumbs com microdata
4. Alt attributes em todas as imagens
5. Heading hierarchy correto (único H1)
6. Semantic HTML5 (header, nav, main, section, article, footer)
7. Canonical URL

${memoriesContext}

INFORMAÇÕES DO NEGÓCIO:
${businessInfo ? JSON.stringify(businessInfo, null, 2) : 'Extraia do conteúdo'}

Retorne APENAS o HTML otimizado completo, sem explicações.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: htmlContent }
        ],
        max_tokens: 16000,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'OpenAI API error');
    }

    let optimizedHtml = data.choices[0].message.content;
    
    // Limpar markdown se presente
    optimizedHtml = optimizedHtml
      .replace(/```html\n?/gi, '')
      .replace(/```\n?/gi, '')
      .trim();

    // Atualizar arquivo no banco
    if (projectId) {
      await pool.query(`
        UPDATE project_files 
        SET content = $2, updated_at = NOW()
        WHERE project_id = $1 AND file_path = 'index.html'
      `, [projectId, optimizedHtml]);
    }

    await pool.end();

    res.json({ 
      optimizedHtml,
      model: 'gpt-4o-mini'
    });

  } catch (error) {
    console.error('Error in optimize-seo:', error);
    res.status(500).json({ error: error.message });
  }
});
```

### 6.5 Conversão: export-zip

```javascript
// cloud-functions/export-zip/index.js
const functions = require('@google-cloud/functions-framework');
const JSZip = require('jszip');
const { Pool } = require('pg');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

functions.http('exportZip', async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.set(corsHeaders);
    res.status(204).send('');
    return;
  }

  res.set(corsHeaders);

  try {
    const { projectId, options } = req.body;
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    // Buscar projeto
    const projectResult = await pool.query(
      'SELECT name FROM projects WHERE id = $1',
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      throw new Error('Project not found');
    }

    const projectName = projectResult.rows[0].name;

    // Buscar arquivos do projeto
    const filesResult = await pool.query(
      'SELECT file_path, file_name, content FROM project_files WHERE project_id = $1',
      [projectId]
    );

    const zip = new JSZip();

    // Adicionar arquivos do projeto
    for (const file of filesResult.rows) {
      zip.file(file.file_path, file.content);
    }

    // Adicionar README se solicitado
    if (options?.includeReadme !== false) {
      const readme = `# ${projectName}

Website gerado pelo PHPVibe 4.0

## Estrutura de Arquivos

${filesResult.rows.map(f => `- ${f.file_path}`).join('\n')}

## Deploy

1. Faça upload dos arquivos para seu servidor
2. Configure o arquivo .htaccess conforme necessário
3. Acesse seu domínio

## Suporte

Gerado em ${new Date().toLocaleDateString('pt-BR')}
`;
      zip.file('README.md', readme);
    }

    // Adicionar .htaccess se solicitado
    if (options?.includeHtaccess !== false) {
      const htaccess = `# Cache Control
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/svg+xml "access plus 1 month"
</IfModule>

# Gzip Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css application/javascript
</IfModule>

# Security Headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
</IfModule>
`;
      zip.file('.htaccess', htaccess);
    }

    // Adicionar robots.txt
    zip.file('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${options?.siteUrl || 'https://seusite.com'}/sitemap.xml`);

    // Gerar ZIP
    const zipContent = await zip.generateAsync({ 
      type: 'base64',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 }
    });

    await pool.end();

    res.json({ 
      zipContent,
      fileName: `${projectName.toLowerCase().replace(/\s+/g, '-')}.zip`
    });

  } catch (error) {
    console.error('Error in export-zip:', error);
    res.status(500).json({ error: error.message });
  }
});
```

**package.json para export-zip:**
```json
{
  "name": "export-zip",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "@google-cloud/functions-framework": "^3.3.0",
    "jszip": "^3.10.1",
    "pg": "^8.11.3"
  }
}
```

### 6.6 Deploy das Cloud Functions

```bash
# Configurar secrets no Secret Manager
echo -n "sk-sua-openai-key" | gcloud secrets create OPENAI_API_KEY --data-file=-
echo -n "postgresql://user:pass@ip:5432/phpvibe" | gcloud secrets create DATABASE_URL --data-file=-

# Dar permissão às functions para acessar secrets
gcloud secrets add-iam-policy-binding OPENAI_API_KEY \
  --member="serviceAccount:phpvibe-production@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding DATABASE_URL \
  --member="serviceAccount:phpvibe-production@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Deploy analyze-design
cd cloud-functions/analyze-design
gcloud functions deploy analyze-design \
  --gen2 \
  --runtime=nodejs18 \
  --region=southamerica-east1 \
  --source=. \
  --entry-point=analyzeDesign \
  --trigger-http \
  --allow-unauthenticated \
  --memory=512MB \
  --timeout=300s \
  --set-secrets="OPENAI_API_KEY=OPENAI_API_KEY:latest,DATABASE_URL=DATABASE_URL:latest"

# Deploy generate-files
cd ../generate-files
gcloud functions deploy generate-files \
  --gen2 \
  --runtime=nodejs18 \
  --region=southamerica-east1 \
  --source=. \
  --entry-point=generateFiles \
  --trigger-http \
  --allow-unauthenticated \
  --memory=1GB \
  --timeout=540s \
  --set-secrets="OPENAI_API_KEY=OPENAI_API_KEY:latest,DATABASE_URL=DATABASE_URL:latest"

# Deploy optimize-seo
cd ../optimize-seo
gcloud functions deploy optimize-seo \
  --gen2 \
  --runtime=nodejs18 \
  --region=southamerica-east1 \
  --source=. \
  --entry-point=optimizeSeo \
  --trigger-http \
  --allow-unauthenticated \
  --memory=512MB \
  --timeout=300s \
  --set-secrets="OPENAI_API_KEY=OPENAI_API_KEY:latest,DATABASE_URL=DATABASE_URL:latest"

# Deploy export-zip
cd ../export-zip
gcloud functions deploy export-zip \
  --gen2 \
  --runtime=nodejs18 \
  --region=southamerica-east1 \
  --source=. \
  --entry-point=exportZip \
  --trigger-http \
  --allow-unauthenticated \
  --memory=512MB \
  --timeout=120s \
  --set-secrets="DATABASE_URL=DATABASE_URL:latest"

# Listar funções deployadas
gcloud functions list --region=southamerica-east1
```

---

## 7. Atualização do Frontend

### 7.1 Novo Cliente de API

Crie um novo cliente para substituir o Supabase:

```typescript
// src/lib/api-client.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const CLOUD_FUNCTIONS_URL = import.meta.env.VITE_CLOUD_FUNCTIONS_URL;

interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
}

class ApiClient {
  private baseUrl: string;
  private functionsUrl: string;
  private authToken: string | null = null;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.functionsUrl = CLOUD_FUNCTIONS_URL;
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    return headers;
  }

  // ==================== PROJECTS ====================
  
  async getProjects(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/projects`, {
        headers: this.getHeaders(),
      });
      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async getProject(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${id}`, {
        headers: this.getHeaders(),
      });
      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async createProject(project: any): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/projects`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(project),
      });
      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async updateProject(id: string, updates: any): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${id}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(updates),
      });
      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async deleteProject(id: string): Promise<ApiResponse<void>> {
    try {
      await fetch(`${this.baseUrl}/projects/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      return { data: undefined, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  // ==================== PROJECT FILES ====================

  async getProjectFiles(projectId: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/files`, {
        headers: this.getHeaders(),
      });
      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async updateProjectFile(projectId: string, filePath: string, content: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/files`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ filePath, content }),
      });
      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  // ==================== AI MEMORIES ====================

  async getMemories(agent?: string): Promise<ApiResponse<any[]>> {
    try {
      const url = agent 
        ? `${this.baseUrl}/memories?agent=${agent}`
        : `${this.baseUrl}/memories`;
      const response = await fetch(url, {
        headers: this.getHeaders(),
      });
      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async createMemory(memory: any): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/memories`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(memory),
      });
      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async updateMemory(id: string, updates: any): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/memories/${id}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(updates),
      });
      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async deleteMemory(id: string): Promise<ApiResponse<void>> {
    try {
      await fetch(`${this.baseUrl}/memories/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      return { data: undefined, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  // ==================== CLOUD FUNCTIONS ====================

  async analyzeDesign(briefing: string, imageUrls?: string[]): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.functionsUrl}/analyze-design`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ briefing, imageUrls }),
      });
      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async generateFiles(params: {
    briefing: string;
    designSpecs: any;
    projectId?: string;
    projectSettings?: any;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.functionsUrl}/generate-files`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(params),
      });
      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async optimizeSeo(params: {
    htmlContent: string;
    projectId?: string;
    businessInfo?: any;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.functionsUrl}/optimize-seo`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(params),
      });
      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async exportZip(projectId: string, options?: any): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.functionsUrl}/export-zip`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ projectId, options }),
      });
      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }
}

export const apiClient = new ApiClient();
```

### 7.2 Variáveis de Ambiente

```bash
# .env.production (criar este arquivo)
VITE_API_BASE_URL=https://api.seudominio.com
VITE_CLOUD_FUNCTIONS_URL=https://southamerica-east1-phpvibe-production.cloudfunctions.net
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=phpvibe-production.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=phpvibe-production
VITE_STORAGE_BUCKET=phpvibe-project-assets
```

### 7.3 Firebase Authentication

```typescript
// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const signIn = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signUp = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signOut = () => {
  return firebaseSignOut(auth);
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

export const getIdToken = async () => {
  const user = auth.currentUser;
  if (user) {
    return user.getIdToken();
  }
  return null;
};
```

### 7.4 Atualização do AuthContext

```typescript
// src/contexts/AuthContext.tsx (versão GCP)
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth, signIn, signUp, signOut, onAuthChange, getIdToken } from '@/lib/firebase';
import { apiClient } from '@/lib/api-client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setUser(user);
      if (user) {
        const token = await getIdToken();
        apiClient.setAuthToken(token);
      } else {
        apiClient.setAuthToken(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    await signIn(email, password);
  };

  const handleSignUp = async (email: string, password: string) => {
    await signUp(email, password);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <AuthContext.Provider 
      value={{
        user,
        loading,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

---

## 8. Scripts de Migração Automatizada

### 8.1 Script Principal de Migração

```bash
#!/bin/bash
# migrate-to-gcp.sh
# Script completo de migração Supabase → Google Cloud

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  PHPVibe - Migração para Google Cloud  ${NC}"
echo -e "${GREEN}========================================${NC}"

# Verificar pré-requisitos
echo -e "\n${YELLOW}[1/8] Verificando pré-requisitos...${NC}"
command -v gcloud >/dev/null 2>&1 || { echo -e "${RED}gcloud CLI não encontrado${NC}"; exit 1; }
command -v psql >/dev/null 2>&1 || { echo -e "${RED}psql não encontrado${NC}"; exit 1; }
command -v gsutil >/dev/null 2>&1 || { echo -e "${RED}gsutil não encontrado${NC}"; exit 1; }
echo -e "${GREEN}✓ Todos os pré-requisitos instalados${NC}"

# Configurações
GCP_PROJECT="phpvibe-production"
GCP_REGION="southamerica-east1"
DB_INSTANCE="phpvibe-db"
DB_NAME="phpvibe"

# Supabase (preencher)
SUPABASE_DB_HOST="${SUPABASE_DB_HOST:-db.iqcoumkqgcbqdetuqozh.supabase.co}"
SUPABASE_DB_USER="${SUPABASE_DB_USER:-postgres}"
SUPABASE_DB_NAME="${SUPABASE_DB_NAME:-postgres}"

# Criar diretório de backup
BACKUP_DIR="./migration_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# 1. Exportar dados do Supabase
echo -e "\n${YELLOW}[2/8] Exportando dados do Supabase...${NC}"
echo "Digite a senha do banco Supabase:"
read -s SUPABASE_DB_PASSWORD

PGPASSWORD=$SUPABASE_DB_PASSWORD pg_dump \
  --host=$SUPABASE_DB_HOST \
  --port=5432 \
  --username=$SUPABASE_DB_USER \
  --dbname=$SUPABASE_DB_NAME \
  --schema=public \
  --no-owner \
  --no-privileges \
  --file="$BACKUP_DIR/schema.sql"

PGPASSWORD=$SUPABASE_DB_PASSWORD pg_dump \
  --host=$SUPABASE_DB_HOST \
  --port=5432 \
  --username=$SUPABASE_DB_USER \
  --dbname=$SUPABASE_DB_NAME \
  --schema=public \
  --data-only \
  --no-owner \
  --file="$BACKUP_DIR/data.sql"

echo -e "${GREEN}✓ Dados exportados para $BACKUP_DIR${NC}"

# 2. Configurar projeto GCP
echo -e "\n${YELLOW}[3/8] Configurando projeto GCP...${NC}"
gcloud config set project $GCP_PROJECT

# Habilitar APIs
gcloud services enable sqladmin.googleapis.com --quiet
gcloud services enable cloudfunctions.googleapis.com --quiet
gcloud services enable storage.googleapis.com --quiet
gcloud services enable secretmanager.googleapis.com --quiet
echo -e "${GREEN}✓ APIs habilitadas${NC}"

# 3. Criar Cloud SQL (se não existir)
echo -e "\n${YELLOW}[4/8] Criando instância Cloud SQL...${NC}"
if ! gcloud sql instances describe $DB_INSTANCE &>/dev/null; then
  gcloud sql instances create $DB_INSTANCE \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=$GCP_REGION \
    --storage-type=SSD \
    --storage-size=10GB \
    --quiet
  
  echo "Definindo senha do banco (use uma senha forte):"
  read -s GCP_DB_PASSWORD
  gcloud sql users set-password postgres \
    --instance=$DB_INSTANCE \
    --password=$GCP_DB_PASSWORD
  
  gcloud sql databases create $DB_NAME --instance=$DB_INSTANCE --quiet
  echo -e "${GREEN}✓ Cloud SQL criado${NC}"
else
  echo -e "${GREEN}✓ Cloud SQL já existe${NC}"
fi

# 4. Importar dados no Cloud SQL
echo -e "\n${YELLOW}[5/8] Importando dados no Cloud SQL...${NC}"
GCP_DB_IP=$(gcloud sql instances describe $DB_INSTANCE --format="value(ipAddresses[0].ipAddress)")

# Autorizar IP atual temporariamente
MY_IP=$(curl -s ifconfig.me)
gcloud sql instances patch $DB_INSTANCE --authorized-networks=$MY_IP/32 --quiet

echo "Digite a senha do Cloud SQL:"
read -s GCP_DB_PASSWORD

# Importar schema
PGPASSWORD=$GCP_DB_PASSWORD psql \
  --host=$GCP_DB_IP \
  --username=postgres \
  --dbname=$DB_NAME \
  < "$BACKUP_DIR/schema.sql"

# Importar dados
PGPASSWORD=$GCP_DB_PASSWORD psql \
  --host=$GCP_DB_IP \
  --username=postgres \
  --dbname=$DB_NAME \
  < "$BACKUP_DIR/data.sql"

echo -e "${GREEN}✓ Dados importados no Cloud SQL${NC}"

# 5. Criar buckets Cloud Storage
echo -e "\n${YELLOW}[6/8] Criando buckets Cloud Storage...${NC}"
gsutil mb -l $GCP_REGION -c STANDARD gs://${GCP_PROJECT}-project-assets 2>/dev/null || true
gsutil mb -l $GCP_REGION -c STANDARD gs://${GCP_PROJECT}-theme-assets 2>/dev/null || true

# Configurar CORS
cat > /tmp/cors.json << EOF
[{"origin": ["*"], "method": ["GET", "PUT", "POST", "DELETE"], "responseHeader": ["Content-Type", "Authorization"], "maxAgeSeconds": 3600}]
EOF
gsutil cors set /tmp/cors.json gs://${GCP_PROJECT}-project-assets
gsutil cors set /tmp/cors.json gs://${GCP_PROJECT}-theme-assets

# Tornar público
gsutil iam ch allUsers:objectViewer gs://${GCP_PROJECT}-project-assets
gsutil iam ch allUsers:objectViewer gs://${GCP_PROJECT}-theme-assets

echo -e "${GREEN}✓ Buckets criados${NC}"

# 6. Configurar Secrets
echo -e "\n${YELLOW}[7/8] Configurando secrets...${NC}"
echo "Digite sua OPENAI_API_KEY:"
read -s OPENAI_KEY
echo -n "$OPENAI_KEY" | gcloud secrets create OPENAI_API_KEY --data-file=- 2>/dev/null || \
echo -n "$OPENAI_KEY" | gcloud secrets versions add OPENAI_API_KEY --data-file=-

DATABASE_URL="postgresql://postgres:${GCP_DB_PASSWORD}@${GCP_DB_IP}:5432/${DB_NAME}"
echo -n "$DATABASE_URL" | gcloud secrets create DATABASE_URL --data-file=- 2>/dev/null || \
echo -n "$DATABASE_URL" | gcloud secrets versions add DATABASE_URL --data-file=-

echo -e "${GREEN}✓ Secrets configurados${NC}"

# 7. Deploy Cloud Functions
echo -e "\n${YELLOW}[8/8] Deploy das Cloud Functions...${NC}"
if [ -d "cloud-functions" ]; then
  for func_dir in cloud-functions/*/; do
    func_name=$(basename "$func_dir")
    echo "Deploying $func_name..."
    cd "$func_dir"
    gcloud functions deploy $func_name \
      --gen2 \
      --runtime=nodejs18 \
      --region=$GCP_REGION \
      --source=. \
      --entry-point=${func_name//-/} \
      --trigger-http \
      --allow-unauthenticated \
      --memory=512MB \
      --timeout=300s \
      --set-secrets="OPENAI_API_KEY=OPENAI_API_KEY:latest,DATABASE_URL=DATABASE_URL:latest" \
      --quiet
    cd ../..
  done
  echo -e "${GREEN}✓ Cloud Functions deployadas${NC}"
else
  echo -e "${YELLOW}⚠ Diretório cloud-functions não encontrado${NC}"
fi

# Resumo
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  Migração Concluída!                   ${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\nRecursos criados:"
echo -e "  • Cloud SQL: $DB_INSTANCE ($GCP_DB_IP)"
echo -e "  • Storage: gs://${GCP_PROJECT}-project-assets"
echo -e "  • Storage: gs://${GCP_PROJECT}-theme-assets"
echo -e "  • Secrets: OPENAI_API_KEY, DATABASE_URL"
echo -e "\nPróximos passos:"
echo -e "  1. Configure Firebase Authentication"
echo -e "  2. Atualize as variáveis de ambiente do frontend"
echo -e "  3. Teste todas as funcionalidades"
echo -e "  4. Remova a autorização do seu IP do Cloud SQL"
```

### 8.2 Script de Rollback

```bash
#!/bin/bash
# rollback-gcp.sh
# Script de rollback para Supabase

set -e

echo "========================================="
echo "  PHPVibe - Rollback para Supabase"
echo "========================================="

# Este script reverte as variáveis de ambiente
# para apontar de volta ao Supabase

cat > .env.local << EOF
VITE_SUPABASE_URL=https://iqcoumkqgcbqdetuqozh.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=iqcoumkqgcbqdetuqozh
EOF

echo "✓ Variáveis de ambiente restauradas"
echo ""
echo "Para completar o rollback:"
echo "1. Reverta o código do AuthContext para usar Supabase"
echo "2. Reverta os hooks para usar supabase client"
echo "3. Rebuild o frontend: npm run build"
```

---

## 9. Checklist de Validação

### 9.1 Checklist Pré-Migração

- [ ] Backup completo do Supabase realizado
- [ ] Conta GCP com billing configurado
- [ ] gcloud CLI instalado e autenticado
- [ ] PostgreSQL client (psql) instalado
- [ ] Node.js 18+ instalado
- [ ] Credenciais do Supabase anotadas
- [ ] OPENAI_API_KEY disponível

### 9.2 Checklist Pós-Migração

#### Banco de Dados
- [ ] Todas as tabelas criadas no Cloud SQL
- [ ] Dados migrados corretamente
- [ ] Triggers funcionando
- [ ] Índices criados

#### Storage
- [ ] Buckets criados
- [ ] CORS configurado
- [ ] Arquivos migrados
- [ ] URLs atualizadas no banco

#### Cloud Functions
- [ ] analyze-design deployada e funcionando
- [ ] generate-files deployada e funcionando
- [ ] optimize-seo deployada e funcionando
- [ ] export-zip deployada e funcionando
- [ ] Secrets configurados corretamente

#### Frontend
- [ ] Variáveis de ambiente atualizadas
- [ ] Firebase Auth configurado
- [ ] API Client funcionando
- [ ] Login/Logout funcionando
- [ ] CRUD de projetos funcionando
- [ ] Geração de sites funcionando
- [ ] Export ZIP funcionando

### 9.3 Testes Funcionais

```bash
# Testar Cloud Functions
# analyze-design
curl -X POST https://southamerica-east1-phpvibe-production.cloudfunctions.net/analyze-design \
  -H "Content-Type: application/json" \
  -d '{"briefing": "Site para pizzaria moderna em São Paulo"}'

# generate-files
curl -X POST https://southamerica-east1-phpvibe-production.cloudfunctions.net/generate-files \
  -H "Content-Type: application/json" \
  -d '{"briefing": "Site para pizzaria", "designSpecs": {"colors": {"primary": "#FF5722"}}}'

# export-zip
curl -X POST https://southamerica-east1-phpvibe-production.cloudfunctions.net/export-zip \
  -H "Content-Type: application/json" \
  -d '{"projectId": "uuid-do-projeto"}'
```

---

## 10. Rollback e Troubleshooting

### 10.1 Procedimento de Rollback

Se algo der errado durante a migração:

1. **Rollback do Frontend:**
   ```bash
   git checkout HEAD~1 -- src/
   npm run build
   ```

2. **Manter Supabase ativo:**
   - Não delete dados do Supabase até validação completa
   - Mantenha backups por pelo menos 30 dias

3. **Reverter variáveis de ambiente:**
   ```bash
   ./rollback-gcp.sh
   ```

### 10.2 Problemas Comuns

#### Erro: "Connection refused" no Cloud SQL

```bash
# Verificar se IP está autorizado
gcloud sql instances describe phpvibe-db --format="value(settings.ipConfiguration.authorizedNetworks)"

# Adicionar IP
MY_IP=$(curl -s ifconfig.me)
gcloud sql instances patch phpvibe-db --authorized-networks=$MY_IP/32
```

#### Erro: "Permission denied" no Cloud Storage

```bash
# Verificar permissões
gsutil iam get gs://phpvibe-project-assets

# Adicionar permissão pública
gsutil iam ch allUsers:objectViewer gs://phpvibe-project-assets
```

#### Erro: "Secret not found" nas Cloud Functions

```bash
# Listar secrets
gcloud secrets list

# Verificar se função tem permissão
gcloud secrets get-iam-policy OPENAI_API_KEY
```

#### Erro: "CORS" no frontend

```bash
# Verificar CORS do bucket
gsutil cors get gs://phpvibe-project-assets

# Verificar headers da Cloud Function
# Adicionar corsHeaders em todas as respostas
```

#### Cloud Function timeout

```bash
# Aumentar timeout (máximo 540s para Gen 2)
gcloud functions deploy generate-files \
  --timeout=540s \
  --memory=1GB
```

### 10.3 Logs e Debugging

```bash
# Ver logs das Cloud Functions
gcloud functions logs read analyze-design --region=southamerica-east1 --limit=50

# Ver logs do Cloud SQL
gcloud sql operations list --instance=phpvibe-db

# Ver métricas
gcloud monitoring dashboards list
```

---

## Apêndice A: Custos Detalhados

### Estimativa Mensal (Uso Baixo/Médio)

| Serviço | Especificação | Custo USD |
|---------|--------------|-----------|
| Cloud SQL | db-f1-micro, 10GB SSD | $9.37 |
| Cloud Storage | 10GB Standard | $0.20 |
| Cloud Functions | 50K invocações | $0.00 (tier gratuito) |
| Network Egress | 5GB | $0.60 |
| **Total** | | **~$10-15/mês** |

### Estimativa Mensal (Uso Alto)

| Serviço | Especificação | Custo USD |
|---------|--------------|-----------|
| Cloud SQL | db-g1-small, 50GB SSD | $35.04 |
| Cloud Storage | 100GB Standard | $2.00 |
| Cloud Functions | 500K invocações | $4.00 |
| Network Egress | 50GB | $6.00 |
| **Total** | | **~$50-60/mês** |

---

## Apêndice B: Referências

- [Cloud SQL Documentation](https://cloud.google.com/sql/docs)
- [Cloud Functions Documentation](https://cloud.google.com/functions/docs)
- [Cloud Storage Documentation](https://cloud.google.com/storage/docs)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Secret Manager](https://cloud.google.com/secret-manager/docs)
- [gcloud CLI Reference](https://cloud.google.com/sdk/gcloud/reference)

---

*Documento gerado em: Dezembro 2025*
*Versão: 1.0*
*PHPVibe 4.0*
