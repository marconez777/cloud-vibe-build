import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Check, FileArchive, FileCode, FileText, Loader2 } from "lucide-react";

export type ExportStage = "preparing" | "collecting" | "generating" | "compressing" | "complete";

interface ExportProgressProps {
  stage: ExportStage;
  progress: number;
}

const stages: { key: ExportStage; label: string; icon: React.ElementType }[] = [
  { key: "preparing", label: "Preparando", icon: FileText },
  { key: "collecting", label: "Coletando arquivos", icon: FileCode },
  { key: "generating", label: "Gerando extras", icon: FileText },
  { key: "compressing", label: "Compactando", icon: FileArchive },
  { key: "complete", label: "Concluído", icon: Check },
];

export function ExportProgress({ stage, progress }: ExportProgressProps) {
  const currentIndex = stages.findIndex((s) => s.key === stage);

  return (
    <div className="space-y-4">
      <Progress value={progress} className="h-2" />

      <div className="flex justify-between">
        {stages.map((s, index) => {
          const Icon = s.icon;
          const isActive = s.key === stage;
          const isComplete = index < currentIndex;

          return (
            <div
              key={s.key}
              className={cn(
                "flex flex-col items-center gap-1",
                isActive && "text-primary",
                isComplete && "text-green-500",
                !isActive && !isComplete && "text-muted-foreground"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2",
                  isActive && "border-primary bg-primary/10",
                  isComplete && "border-green-500 bg-green-500/10",
                  !isActive && !isComplete && "border-muted"
                )}
              >
                {isActive ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isComplete ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <span className="text-xs font-medium">{s.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
