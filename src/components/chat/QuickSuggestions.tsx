import { Sparkles } from "lucide-react";

interface QuickSuggestionsProps {
  hasFiles: boolean;
  onSelect: (suggestion: string) => void;
  disabled?: boolean;
}

const newSiteSuggestions = [
  "Site para pizzaria com cardápio e delivery",
  "Landing page para clínica odontológica",
  "Site institucional para escritório de advocacia",
  "Portfólio para fotógrafo profissional",
];

const editSuggestions = [
  "Mude a cor primária para azul",
  "Adicione um formulário de contato",
  "Inclua uma seção de depoimentos",
  "Torne o design mais moderno",
  "Adicione animações suaves",
  "Melhore o header com menu dropdown",
];

export function QuickSuggestions({ hasFiles, onSelect, disabled }: QuickSuggestionsProps) {
  const suggestions = hasFiles ? editSuggestions : newSiteSuggestions;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Sparkles className="h-3 w-3" />
        <span>Sugestões rápidas</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onSelect(suggestion)}
            disabled={disabled}
            className="rounded-full border border-border bg-background px-3 py-1.5 text-xs transition-all hover:border-primary hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
