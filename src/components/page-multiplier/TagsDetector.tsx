import { Badge } from "@/components/ui/badge";
import { Tag, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface TagsDetectorProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

export function TagsDetector({ tags, onAddTag, onRemoveTag }: TagsDetectorProps) {
  const [newTag, setNewTag] = useState("");

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      onAddTag(newTag.trim());
      setNewTag("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Tag className="h-4 w-4 text-primary" />
        <label className="text-sm font-medium text-foreground">
          Tags Detectadas
        </label>
        <span className="text-xs text-muted-foreground">
          ({tags.length} encontrada{tags.length !== 1 ? "s" : ""})
        </span>
      </div>

      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="gap-1 px-3 py-1 text-sm"
            >
              <span className="text-primary">{`{${tag}}`}</span>
              <button
                onClick={() => onRemoveTag(tag)}
                className="ml-1 rounded-full hover:bg-destructive/20"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Nenhuma tag encontrada. Use o formato {"{tag}"} no template.
        </p>
      )}

      <div className="flex gap-2">
        <Input
          placeholder="Adicionar tag manualmente..."
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Button variant="outline" size="icon" onClick={handleAddTag}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
