import { Theme, THEME_CATEGORIES } from "@/types/themes";
import { useThemes } from "@/hooks/useThemes";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, FileCode, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeSelectorProps {
  selectedThemeId: string | null;
  onSelect: (themeId: string | null) => void;
}

export function ThemeSelector({ selectedThemeId, onSelect }: ThemeSelectorProps) {
  const { data: themes = [], isLoading } = useThemes();

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Carregando temas...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">Como deseja começar?</Label>
      
      <RadioGroup
        value={selectedThemeId || "scratch"}
        onValueChange={(value) => onSelect(value === "scratch" ? null : value)}
      >
        <ScrollArea className="max-h-[300px]">
          <div className="grid gap-3">
            {/* Start from scratch option */}
            <Label
              htmlFor="scratch"
              className={cn(
                "cursor-pointer rounded-lg border-2 p-4 transition-all",
                selectedThemeId === null
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className="flex items-start gap-3">
                <RadioGroupItem value="scratch" id="scratch" className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Começar do Zero</p>
                      <p className="text-xs text-muted-foreground">
                        IA gera o site completo baseado no briefing
                      </p>
                    </div>
                  </div>
                </div>
                {selectedThemeId === null && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </div>
            </Label>

            {/* Theme options */}
            {themes.map((theme) => {
              const isSelected = selectedThemeId === theme.id;
              const categoryLabel = THEME_CATEGORIES.find(c => c.value === theme.category)?.label;

              return (
                <Label
                  key={theme.id}
                  htmlFor={theme.id}
                  className={cn(
                    "cursor-pointer rounded-lg border-2 p-4 transition-all",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value={theme.id} id={theme.id} className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden shrink-0">
                          {theme.preview_image_url ? (
                            <img
                              src={theme.preview_image_url}
                              alt={theme.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <FileCode className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">{theme.name}</p>
                            {categoryLabel && (
                              <Badge variant="secondary" className="text-xs shrink-0">
                                {categoryLabel}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {theme.file_count} arquivos
                          </p>
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </Label>
              );
            })}
          </div>
        </ScrollArea>
      </RadioGroup>

      {themes.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Nenhum tema disponível. Faça upload de temas na página de Temas.
        </p>
      )}
    </div>
  );
}
