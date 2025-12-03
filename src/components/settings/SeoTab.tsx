import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ProjectSettings } from "@/hooks/useProjectSettings";
import { Search, Globe, Share2, MapPin, FileText } from "lucide-react";

interface SeoTabProps {
  settings: Partial<ProjectSettings>;
  onChange: (settings: Partial<ProjectSettings>) => void;
}

export function SeoTab({ settings, onChange }: SeoTabProps) {
  const seoSettings = (settings.custom_fields as any)?.seo || {};

  const updateSeoField = (field: string, value: any) => {
    const currentCustomFields = settings.custom_fields || {};
    onChange({
      ...settings,
      custom_fields: {
        ...currentCustomFields,
        seo: {
          ...seoSettings,
          [field]: value,
        },
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Basic SEO */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="h-5 w-5" />
            SEO Básico
          </CardTitle>
          <CardDescription>
            Configurações essenciais para motores de busca
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meta_title_template">Template do Título</Label>
            <Input
              id="meta_title_template"
              value={seoSettings.meta_title_template || ""}
              onChange={(e) => updateSeoField("meta_title_template", e.target.value)}
              placeholder="{page} | {empresa} - {cidade}"
            />
            <p className="text-xs text-muted-foreground">
              Use {"{page}"}, {"{empresa}"}, {"{cidade}"} como variáveis
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta_description">Meta Description Padrão</Label>
            <Textarea
              id="meta_description"
              value={seoSettings.meta_description || ""}
              onChange={(e) => updateSeoField("meta_description", e.target.value)}
              placeholder="Descrição do seu negócio para aparecer no Google (150-160 caracteres)"
              rows={3}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Recomendado: 150-160 caracteres</span>
              <span className={
                (seoSettings.meta_description?.length || 0) > 160 ? "text-destructive" :
                (seoSettings.meta_description?.length || 0) >= 150 ? "text-green-500" :
                ""
              }>
                {seoSettings.meta_description?.length || 0}/160
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="keywords">Palavras-chave</Label>
            <Input
              id="keywords"
              value={seoSettings.keywords || ""}
              onChange={(e) => updateSeoField("keywords", e.target.value)}
              placeholder="palavra1, palavra2, palavra3"
            />
            <p className="text-xs text-muted-foreground">
              Separe as palavras-chave por vírgula (5-10 recomendado)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="canonical_url">URL Canônica Base</Label>
            <Input
              id="canonical_url"
              value={seoSettings.canonical_url || ""}
              onChange={(e) => updateSeoField("canonical_url", e.target.value)}
              placeholder="https://www.seusite.com.br"
            />
          </div>
        </CardContent>
      </Card>

      {/* Local SEO */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5" />
            SEO Local
          </CardTitle>
          <CardDescription>
            Otimize para buscas na sua região
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="service_area">Áreas de Atendimento</Label>
            <Textarea
              id="service_area"
              value={seoSettings.service_area || ""}
              onChange={(e) => updateSeoField("service_area", e.target.value)}
              placeholder="Centro, Zona Sul, Zona Norte, Barra da Tijuca..."
              rows={2}
            />
            <p className="text-xs text-muted-foreground">
              Liste os bairros/regiões atendidas (serão usados no Schema.org)
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="geo_lat">Latitude</Label>
              <Input
                id="geo_lat"
                value={seoSettings.geo_lat || ""}
                onChange={(e) => updateSeoField("geo_lat", e.target.value)}
                placeholder="-22.9068"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="geo_lng">Longitude</Label>
              <Input
                id="geo_lng"
                value={seoSettings.geo_lng || ""}
                onChange={(e) => updateSeoField("geo_lng", e.target.value)}
                placeholder="-43.1729"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price_range">Faixa de Preço</Label>
            <div className="flex gap-2">
              {["$", "$$", "$$$", "$$$$"].map((range) => (
                <Badge
                  key={range}
                  variant={seoSettings.price_range === range ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => updateSeoField("price_range", range)}
                >
                  {range}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social SEO */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Share2 className="h-5 w-5" />
            SEO Social
          </CardTitle>
          <CardDescription>
            Configurações para compartilhamento em redes sociais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="og_image">Imagem de Compartilhamento (URL)</Label>
            <Input
              id="og_image"
              value={seoSettings.og_image || ""}
              onChange={(e) => updateSeoField("og_image", e.target.value)}
              placeholder="https://seusite.com/imagem-compartilhamento.jpg"
            />
            <p className="text-xs text-muted-foreground">
              Recomendado: 1200x630px para Open Graph
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitter_handle">Twitter/X Handle</Label>
            <Input
              id="twitter_handle"
              value={seoSettings.twitter_handle || ""}
              onChange={(e) => updateSeoField("twitter_handle", e.target.value)}
              placeholder="@suaempresa"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fb_app_id">Facebook App ID</Label>
            <Input
              id="fb_app_id"
              value={seoSettings.fb_app_id || ""}
              onChange={(e) => updateSeoField("fb_app_id", e.target.value)}
              placeholder="123456789012345"
            />
          </div>
        </CardContent>
      </Card>

      {/* Advanced SEO */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />
            SEO Avançado
          </CardTitle>
          <CardDescription>
            Configurações técnicas adicionais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Gerar robots.txt</Label>
              <p className="text-xs text-muted-foreground">
                Arquivo que controla indexação pelos bots
              </p>
            </div>
            <Switch
              checked={seoSettings.generate_robots !== false}
              onCheckedChange={(checked) => updateSeoField("generate_robots", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Gerar sitemap.xml</Label>
              <p className="text-xs text-muted-foreground">
                Mapa do site para motores de busca
              </p>
            </div>
            <Switch
              checked={seoSettings.generate_sitemap !== false}
              onCheckedChange={(checked) => updateSeoField("generate_sitemap", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Schema.org FAQPage</Label>
              <p className="text-xs text-muted-foreground">
                Rich result para seções de FAQ
              </p>
            </div>
            <Switch
              checked={seoSettings.enable_faq_schema === true}
              onCheckedChange={(checked) => updateSeoField("enable_faq_schema", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Schema.org Service</Label>
              <p className="text-xs text-muted-foreground">
                Rich result para serviços oferecidos
              </p>
            </div>
            <Switch
              checked={seoSettings.enable_service_schema !== false}
              onCheckedChange={(checked) => updateSeoField("enable_service_schema", checked)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom_robots">robots.txt personalizado</Label>
            <Textarea
              id="custom_robots"
              value={seoSettings.custom_robots || ""}
              onChange={(e) => updateSeoField("custom_robots", e.target.value)}
              placeholder="User-agent: *&#10;Allow: /&#10;Disallow: /admin/"
              rows={4}
              className="font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
