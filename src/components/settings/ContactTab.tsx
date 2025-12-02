import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, MapPin, Phone, Mail } from "lucide-react";
import { ProjectSettings } from "@/hooks/useProjectSettings";

interface ContactTabProps {
  settings: Partial<ProjectSettings>;
  onChange: (settings: Partial<ProjectSettings>) => void;
}

export function ContactTab({ settings, onChange }: ContactTabProps) {
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const formatWhatsApp = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 5) return numbers;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  return (
    <div className="space-y-6">
      {/* Company Info */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4 text-primary" />
            Informações da Empresa
          </CardTitle>
          <CardDescription>
            Dados básicos que aparecerão no site
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="company_name">Nome da Empresa</Label>
            <Input
              id="company_name"
              value={settings.company_name || ""}
              onChange={(e) => onChange({ ...settings, company_name: e.target.value })}
              placeholder="Minha Empresa LTDA"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slogan">Slogan</Label>
            <Input
              id="slogan"
              value={settings.slogan || ""}
              onChange={(e) => onChange({ ...settings, slogan: e.target.value })}
              placeholder="Qualidade e confiança"
            />
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-4 w-4 text-primary" />
            Endereço
          </CardTitle>
          <CardDescription>
            Localização do negócio para contato e mapa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Endereço Completo</Label>
            <Input
              id="address"
              value={settings.address || ""}
              onChange={(e) => onChange({ ...settings, address: e.target.value })}
              placeholder="Rua das Flores, 123 - Centro"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={settings.city || ""}
                onChange={(e) => onChange({ ...settings, city: e.target.value })}
                placeholder="São Paulo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              <Input
                id="state"
                value={settings.state || ""}
                onChange={(e) => onChange({ ...settings, state: e.target.value })}
                placeholder="SP"
                maxLength={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip_code">CEP</Label>
              <Input
                id="zip_code"
                value={settings.zip_code || ""}
                onChange={(e) => onChange({ ...settings, zip_code: formatCEP(e.target.value) })}
                placeholder="01234-567"
                maxLength={9}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Phone className="h-4 w-4 text-primary" />
            Contato
          </CardTitle>
          <CardDescription>
            Telefones e e-mail para formulário de contato
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone Fixo</Label>
            <Input
              id="phone"
              value={settings.phone || ""}
              onChange={(e) => onChange({ ...settings, phone: formatPhone(e.target.value) })}
              placeholder="(11) 1234-5678"
              maxLength={15}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              value={settings.whatsapp || ""}
              onChange={(e) => onChange({ ...settings, whatsapp: formatWhatsApp(e.target.value) })}
              placeholder="(11) 91234-5678"
              maxLength={15}
            />
            <p className="text-xs text-muted-foreground">
              Será usado no botão de WhatsApp do site
            </p>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-3 w-3" />
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              value={settings.email || ""}
              onChange={(e) => onChange({ ...settings, email: e.target.value })}
              placeholder="contato@empresa.com.br"
            />
            <p className="text-xs text-muted-foreground">
              Receberá as mensagens do formulário de contato
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
