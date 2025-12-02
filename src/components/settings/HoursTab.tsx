import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Clock } from "lucide-react";
import { ProjectSettings } from "@/hooks/useProjectSettings";

interface HoursTabProps {
  settings: Partial<ProjectSettings>;
  onChange: (settings: Partial<ProjectSettings>) => void;
}

const daysOfWeek = [
  { key: "monday", label: "Segunda-feira" },
  { key: "tuesday", label: "Terça-feira" },
  { key: "wednesday", label: "Quarta-feira" },
  { key: "thursday", label: "Quinta-feira" },
  { key: "friday", label: "Sexta-feira" },
  { key: "saturday", label: "Sábado" },
  { key: "sunday", label: "Domingo" },
];

export function HoursTab({ settings, onChange }: HoursTabProps) {
  const businessHours = settings.business_hours || {};

  const updateHours = (day: string, value: string | null) => {
    onChange({
      ...settings,
      business_hours: {
        ...businessHours,
        [day]: value || undefined,
      },
    });
  };

  const isOpen = (day: string) => {
    const hours = (businessHours as Record<string, string | undefined>)[day];
    return hours !== undefined && hours !== "Fechado";
  };

  const getHours = (day: string) => {
    const hours = (businessHours as Record<string, string | undefined>)[day];
    if (!hours || hours === "Fechado") return { open: "08:00", close: "18:00" };
    const [open, close] = hours.split(" - ");
    return { open: open || "08:00", close: close || "18:00" };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4 text-primary" />
          Horário de Funcionamento
        </CardTitle>
        <CardDescription>
          Defina os horários de atendimento para cada dia da semana
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {daysOfWeek.map(({ key, label }) => {
          const open = isOpen(key);
          const hours = getHours(key);

          return (
            <div
              key={key}
              className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <Switch
                  checked={open}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateHours(key, "08:00 - 18:00");
                    } else {
                      updateHours(key, "Fechado");
                    }
                  }}
                />
                <Label className={`font-medium ${!open ? "text-muted-foreground" : ""}`}>
                  {label}
                </Label>
              </div>

              {open ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={hours.open}
                    onChange={(e) => updateHours(key, `${e.target.value} - ${hours.close}`)}
                    className="w-28"
                  />
                  <span className="text-muted-foreground">até</span>
                  <Input
                    type="time"
                    value={hours.close}
                    onChange={(e) => updateHours(key, `${hours.open} - ${e.target.value}`)}
                    className="w-28"
                  />
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Fechado</span>
              )}
            </div>
          );
        })}

        <p className="pt-2 text-xs text-muted-foreground">
          Os horários serão exibidos na seção de contato do site e usados em Schema.org para SEO local.
        </p>
      </CardContent>
    </Card>
  );
}
