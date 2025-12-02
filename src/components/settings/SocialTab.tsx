import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2 } from "lucide-react";
import { ProjectSettings } from "@/hooks/useProjectSettings";

interface SocialTabProps {
  settings: Partial<ProjectSettings>;
  onChange: (settings: Partial<ProjectSettings>) => void;
}

const socialNetworks = [
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/empresa", icon: "📸" },
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/empresa", icon: "👤" },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/company/empresa", icon: "💼" },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@empresa", icon: "🎬" },
  { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@empresa", icon: "🎵" },
  { key: "twitter", label: "Twitter / X", placeholder: "https://twitter.com/empresa", icon: "🐦" },
];

export function SocialTab({ settings, onChange }: SocialTabProps) {
  const socialLinks = settings.social_links || {};

  const updateSocialLink = (key: string, value: string) => {
    onChange({
      ...settings,
      social_links: {
        ...socialLinks,
        [key]: value || undefined,
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Share2 className="h-4 w-4 text-primary" />
          Redes Sociais
        </CardTitle>
        <CardDescription>
          Links para suas redes sociais que aparecerão no rodapé e header do site
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {socialNetworks.map(({ key, label, placeholder, icon }) => (
          <div key={key} className="space-y-2">
            <Label htmlFor={key} className="flex items-center gap-2">
              <span>{icon}</span>
              {label}
            </Label>
            <Input
              id={key}
              value={(socialLinks as Record<string, string>)[key] || ""}
              onChange={(e) => updateSocialLink(key, e.target.value)}
              placeholder={placeholder}
            />
          </div>
        ))}
        <p className="pt-2 text-xs text-muted-foreground">
          Deixe em branco os campos das redes que não utiliza. A IA exibirá apenas as redes preenchidas.
        </p>
      </CardContent>
    </Card>
  );
}
