import { useState } from "react";
import { TemplateVariation } from "@/types/page-templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Upload, FileSpreadsheet } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface VariationsTableProps {
  tags: string[];
  variations: TemplateVariation[];
  onChange: (variations: TemplateVariation[]) => void;
}

export function VariationsTable({
  tags,
  variations,
  onChange,
}: VariationsTableProps) {
  const [bulkInput, setBulkInput] = useState("");
  const [showBulkImport, setShowBulkImport] = useState(false);

  const addRow = () => {
    const newRow: TemplateVariation = {};
    tags.forEach((tag) => (newRow[tag] = ""));
    onChange([...variations, newRow]);
  };

  const removeRow = (index: number) => {
    onChange(variations.filter((_, i) => i !== index));
  };

  const updateCell = (rowIndex: number, tag: string, value: string) => {
    const updated = [...variations];
    updated[rowIndex] = { ...updated[rowIndex], [tag]: value };
    onChange(updated);
  };

  const handleBulkImport = () => {
    if (!bulkInput.trim() || tags.length === 0) return;

    const lines = bulkInput
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);

    const newVariations: TemplateVariation[] = lines.map((line) => {
      const values = line.split(/[,;|\t]/).map((v) => v.trim());
      const variation: TemplateVariation = {};
      tags.forEach((tag, index) => {
        variation[tag] = values[index] || "";
      });
      return variation;
    });

    onChange([...variations, ...newVariations]);
    setBulkInput("");
    setShowBulkImport(false);
  };

  if (tags.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted/30 p-6 text-center">
        <FileSpreadsheet className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          Selecione um template com tags para configurar as variações
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          Variações ({variations.length} página{variations.length !== 1 ? "s" : ""})
        </label>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBulkImport(!showBulkImport)}
          >
            <Upload className="mr-2 h-4 w-4" />
            Importar Lista
          </Button>
          <Button variant="outline" size="sm" onClick={addRow}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Linha
          </Button>
        </div>
      </div>

      {showBulkImport && (
        <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">
            Cole os valores separados por vírgula, ponto e vírgula ou tab. Uma linha por variação.
            <br />
            <span className="text-xs">
              Ordem das colunas: {tags.map((t) => `{${t}}`).join(", ")}
            </span>
          </p>
          <Textarea
            placeholder={`Exemplo:\nCentro, São Paulo, 11999990001\nJardins, São Paulo, 11999990002`}
            value={bulkInput}
            onChange={(e) => setBulkInput(e.target.value)}
            rows={4}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBulkImport(false)}
            >
              Cancelar
            </Button>
            <Button size="sm" onClick={handleBulkImport}>
              Importar
            </Button>
          </div>
        </div>
      )}

      {variations.length > 0 ? (
        <div className="rounded-lg border border-border">
          <ScrollArea className="max-h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  {tags.map((tag) => (
                    <TableHead key={tag}>
                      <span className="text-primary">{`{${tag}}`}</span>
                    </TableHead>
                  ))}
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variations.map((variation, rowIndex) => (
                  <TableRow key={rowIndex}>
                    <TableCell className="text-muted-foreground">
                      {rowIndex + 1}
                    </TableCell>
                    {tags.map((tag) => (
                      <TableCell key={tag}>
                        <Input
                          value={variation[tag] || ""}
                          onChange={(e) =>
                            updateCell(rowIndex, tag, e.target.value)
                          }
                          placeholder={tag}
                          className="h-8"
                        />
                      </TableCell>
                    ))}
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => removeRow(rowIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhuma variação adicionada. Clique em "Adicionar Linha" ou importe uma lista.
          </p>
        </div>
      )}
    </div>
  );
}
