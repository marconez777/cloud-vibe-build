import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Search, 
  FileText, 
  Image, 
  Link, 
  Code,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SeoCheckItem {
  id: string;
  label: string;
  description: string;
  status: "pass" | "fail" | "warning";
  weight: number;
}

interface SeoAnalyzerProps {
  htmlContent: string;
  businessName?: string;
}

export function SeoAnalyzer({ htmlContent, businessName }: SeoAnalyzerProps) {
  const seoChecks = useMemo((): SeoCheckItem[] => {
    if (!htmlContent) return [];
    
    const checks: SeoCheckItem[] = [];
    
    // Meta Title
    const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch?.[1] || "";
    checks.push({
      id: "meta-title",
      label: "Meta Title",
      description: title 
        ? `${title.length} caracteres${title.length < 50 ? " (muito curto)" : title.length > 60 ? " (muito longo)" : " ✓"}`
        : "Não encontrado",
      status: title.length >= 50 && title.length <= 60 ? "pass" : title.length > 0 ? "warning" : "fail",
      weight: 15,
    });
    
    // Meta Description
    const descMatch = htmlContent.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const description = descMatch?.[1] || "";
    checks.push({
      id: "meta-description",
      label: "Meta Description",
      description: description 
        ? `${description.length} caracteres${description.length < 150 ? " (muito curto)" : description.length > 160 ? " (muito longo)" : " ✓"}`
        : "Não encontrado",
      status: description.length >= 150 && description.length <= 160 ? "pass" : description.length > 0 ? "warning" : "fail",
      weight: 15,
    });
    
    // H1 Tag
    const h1Matches = htmlContent.match(/<h1[^>]*>[\s\S]*?<\/h1>/gi) || [];
    checks.push({
      id: "h1-tag",
      label: "Tag H1",
      description: h1Matches.length === 1 
        ? "H1 único encontrado ✓" 
        : h1Matches.length === 0 
          ? "Nenhum H1 encontrado" 
          : `${h1Matches.length} H1s encontrados (deve ter apenas 1)`,
      status: h1Matches.length === 1 ? "pass" : "fail",
      weight: 10,
    });
    
    // Schema.org JSON-LD
    const hasSchema = htmlContent.includes('application/ld+json');
    checks.push({
      id: "schema-org",
      label: "Schema.org JSON-LD",
      description: hasSchema ? "Structured data presente ✓" : "Nenhum structured data encontrado",
      status: hasSchema ? "pass" : "warning",
      weight: 10,
    });
    
    // Open Graph
    const hasOgTitle = htmlContent.includes('og:title');
    const hasOgDesc = htmlContent.includes('og:description');
    const hasOgImage = htmlContent.includes('og:image');
    const ogScore = [hasOgTitle, hasOgDesc, hasOgImage].filter(Boolean).length;
    checks.push({
      id: "open-graph",
      label: "Open Graph Tags",
      description: ogScore === 3 ? "Completo ✓" : `${ogScore}/3 tags presentes`,
      status: ogScore === 3 ? "pass" : ogScore > 0 ? "warning" : "fail",
      weight: 10,
    });
    
    // Twitter Cards
    const hasTwitterCard = htmlContent.includes('twitter:card');
    checks.push({
      id: "twitter-cards",
      label: "Twitter Cards",
      description: hasTwitterCard ? "Presente ✓" : "Não encontrado",
      status: hasTwitterCard ? "pass" : "warning",
      weight: 5,
    });
    
    // Canonical URL
    const hasCanonical = htmlContent.includes('rel="canonical"') || htmlContent.includes("rel='canonical'");
    checks.push({
      id: "canonical",
      label: "Canonical URL",
      description: hasCanonical ? "Presente ✓" : "Não encontrado",
      status: hasCanonical ? "pass" : "warning",
      weight: 5,
    });
    
    // Images with Alt
    const imgMatches = htmlContent.match(/<img[^>]+>/gi) || [];
    const imgsWithAlt = imgMatches.filter(img => /alt=["'][^"']+["']/.test(img));
    checks.push({
      id: "img-alt",
      label: "Imagens com Alt",
      description: imgMatches.length > 0 
        ? `${imgsWithAlt.length}/${imgMatches.length} imagens com alt`
        : "Nenhuma imagem encontrada",
      status: imgMatches.length === 0 || imgsWithAlt.length === imgMatches.length ? "pass" : "warning",
      weight: 10,
    });
    
    // Semantic HTML
    const hasHeader = htmlContent.includes('<header');
    const hasMain = htmlContent.includes('<main');
    const hasFooter = htmlContent.includes('<footer');
    const hasNav = htmlContent.includes('<nav');
    const semanticScore = [hasHeader, hasMain, hasFooter, hasNav].filter(Boolean).length;
    checks.push({
      id: "semantic-html",
      label: "HTML Semântico",
      description: `${semanticScore}/4 elementos semânticos`,
      status: semanticScore >= 3 ? "pass" : semanticScore >= 2 ? "warning" : "fail",
      weight: 10,
    });
    
    // Viewport Meta
    const hasViewport = htmlContent.includes('name="viewport"') || htmlContent.includes("name='viewport'");
    checks.push({
      id: "viewport",
      label: "Meta Viewport",
      description: hasViewport ? "Mobile-friendly ✓" : "Não encontrado",
      status: hasViewport ? "pass" : "fail",
      weight: 5,
    });
    
    // Robots Meta
    const hasRobots = htmlContent.includes('name="robots"') || htmlContent.includes("name='robots'");
    checks.push({
      id: "robots",
      label: "Meta Robots",
      description: hasRobots ? "Presente ✓" : "Não encontrado",
      status: hasRobots ? "pass" : "warning",
      weight: 5,
    });
    
    return checks;
  }, [htmlContent]);

  const seoScore = useMemo(() => {
    if (seoChecks.length === 0) return 0;
    
    const maxScore = seoChecks.reduce((sum, check) => sum + check.weight, 0);
    const actualScore = seoChecks.reduce((sum, check) => {
      if (check.status === "pass") return sum + check.weight;
      if (check.status === "warning") return sum + (check.weight * 0.5);
      return sum;
    }, 0);
    
    return Math.round((actualScore / maxScore) * 100);
  }, [seoChecks]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excelente";
    if (score >= 80) return "Muito Bom";
    if (score >= 70) return "Bom";
    if (score >= 60) return "Regular";
    if (score >= 50) return "Precisa Melhorar";
    return "Crítico";
  };

  const StatusIcon = ({ status }: { status: "pass" | "fail" | "warning" }) => {
    switch (status) {
      case "pass":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "fail":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  if (!htmlContent) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">
            Gere um site para analisar o SEO
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Score Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="h-5 w-5" />
            Score de SEO
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className={cn("text-5xl font-bold", getScoreColor(seoScore))}>
              {seoScore}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-muted-foreground">de 100</span>
                <Badge variant={seoScore >= 70 ? "default" : seoScore >= 50 ? "secondary" : "destructive"}>
                  {getScoreLabel(seoScore)}
                </Badge>
              </div>
              <Progress value={seoScore} className="h-3" />
            </div>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              <span>{seoChecks.filter(c => c.status === "pass").length} aprovados</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5 text-yellow-500" />
              <span>{seoChecks.filter(c => c.status === "warning").length} alertas</span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="h-3.5 w-3.5 text-red-500" />
              <span>{seoChecks.filter(c => c.status === "fail").length} falhas</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checklist */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />
            Checklist de SEO
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {seoChecks.map((check) => (
              <div 
                key={check.id} 
                className="flex items-center gap-3 px-6 py-3 hover:bg-muted/50 transition-colors"
              >
                <StatusIcon status={check.status} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{check.label}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {check.description}
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {check.weight}pts
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
