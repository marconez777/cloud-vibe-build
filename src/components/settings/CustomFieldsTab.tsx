import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X, Settings2 } from "lucide-react";
import { ProjectSettings } from "@/hooks/useProjectSettings";

interface CustomFieldsTabProps {
  settings: Partial<ProjectSettings>;
  onChange: (settings: Partial<ProjectSettings>) => void;
}

export function CustomFieldsTab({ settings, onChange }: CustomFieldsTabProps) {
  const customFields = settings.custom_fields || {};
  const [newFieldKey, setNewFieldKey] = useState("");
  const [newFieldValue, setNewFieldValue] = useState("");

  const addField = () => {
    if (!newFieldKey.trim()) return;
    
    onChange({
      ...settings,
      custom_fields: {
        ...customFields,
        [newFieldKey.trim()]: newFieldValue.trim(),
      },
    });
    setNewFieldKey("");
    setNewFieldValue("");
  };

  const updateField = (key: string, value: string) => {
    onChange({
      ...settings,
      custom_fields: {
        ...customFields,
        [key]: value,
      },
    });
  };

  const removeField = (key: string) => {
    const newFields = { ...customFields };
    delete newFields[key];
    onChange({
      ...settings,
      custom_fields: newFields,
    });
  };

  const fieldEntries = Object.entries(customFields);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Settings2 className="h-4 w-4 text-primary" />
          Campos Personalizados
        </CardTitle>
        <CardDescription>
          Adicione informações extras específicas do seu negócio que a IA usará na geração
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Fields */}
        {fieldEntries.map(([key, value]) => (
          <div key={key} className="flex items-start gap-2">
            <div className="flex-1 space-y-1">
              <Label className="text-xs text-muted-foreground">{key}</Label>
              <Input
                value={value}
                onChange={(e) => updateField(key, e.target.value)}
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="mt-6 h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => removeField(key)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {/* Add New Field */}
        <div className="rounded-lg border border-dashed p-4">
          <Label className="mb-3 block text-sm font-medium">Adicionar Campo</Label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1 space-y-1">
              <Label htmlFor="field-key" className="text-xs text-muted-foreground">
                Nome do Campo
              </Label>
              <Input
                id="field-key"
                value={newFieldKey}
                onChange={(e) => setNewFieldKey(e.target.value)}
                placeholder="Ex: Anos de experiência"
              />
            </div>
            <div className="flex-1 space-y-1">
              <Label htmlFor="field-value" className="text-xs text-muted-foreground">
                Valor
              </Label>
              <Input
                id="field-value"
                value={newFieldValue}
                onChange={(e) => setNewFieldValue(e.target.value)}
                placeholder="Ex: 15 anos"
              />
            </div>
            <Button
              onClick={addField}
              disabled={!newFieldKey.trim()}
              className="mt-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar
            </Button>
          </div>
        </div>

        {/* Suggestions */}
        <div className="space-y-2 pt-2">
          <Label className="text-xs text-muted-foreground">Sugestões de campos:</Label>
          <div className="flex flex-wrap gap-2">
            {[
              "Anos de experiência",
              "Número de clientes atendidos",
              "Especialidades",
              "Áreas de atuação",
              "Diferenciais",
              "Certificações",
              "Prêmios",
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setNewFieldKey(suggestion)}
                className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <p className="pt-2 text-xs text-muted-foreground">
          Esses campos serão passados para a IA e podem ser usados em qualquer parte do site gerado.
        </p>
      </CardContent>
    </Card>
  );
}
