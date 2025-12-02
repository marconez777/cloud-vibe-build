import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileOutput, Folder } from "lucide-react";

interface GenerationConfigProps {
  outputPattern: string;
  outputFolder: string;
  onPatternChange: (pattern: string) => void;
  onFolderChange: (folder: string) => void;
  tags: string[];
}

export function GenerationConfig({
  outputPattern,
  outputFolder,
  onPatternChange,
  onFolderChange,
  tags,
}: GenerationConfigProps) {
  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
        <FileOutput className="h-4 w-4 text-primary" />
        Configuração de Saída
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="output-pattern">Padrão do Nome do Arquivo</Label>
          <Input
            id="output-pattern"
            value={outputPattern}
            onChange={(e) => onPatternChange(e.target.value)}
            placeholder="desentupidora-{bairro}.html"
          />
          <p className="text-xs text-muted-foreground">
            Use as tags para criar nomes únicos:{" "}
            {tags.map((t) => `{${t}}`).join(", ") || "nenhuma tag"}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="output-folder">Pasta de Destino</Label>
          <div className="flex items-center gap-2">
            <Folder className="h-4 w-4 text-muted-foreground" />
            <Input
              id="output-folder"
              value={outputFolder}
              onChange={(e) => onFolderChange(e.target.value)}
              placeholder="pages"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Deixe vazio para a raiz do projeto
          </p>
        </div>
      </div>
    </div>
  );
}
