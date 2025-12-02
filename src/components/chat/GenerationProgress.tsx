import { useState, useEffect } from "react";
import { Brain, Code, Palette, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface GenerationProgressProps {
  isGenerating: boolean;
  editMode?: boolean;
}

const steps = [
  { id: "analyzing", label: "Analisando...", icon: Brain },
  { id: "structuring", label: "Estruturando...", icon: Code },
  { id: "styling", label: "Estilizando...", icon: Palette },
  { id: "finalizing", label: "Finalizando...", icon: Check },
];

export function GenerationProgress({ isGenerating, editMode }: GenerationProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isGenerating) {
      setCurrentStep(0);
      return;
    }

    const durations = editMode ? [800, 1200, 800, 500] : [1500, 3000, 2000, 1000];
    let totalTime = 0;

    const timers = durations.map((duration, index) => {
      totalTime += duration;
      return setTimeout(() => {
        if (index < steps.length - 1) {
          setCurrentStep(index + 1);
        }
      }, totalTime - duration);
    });

    return () => timers.forEach(clearTimeout);
  }, [isGenerating, editMode]);

  if (!isGenerating) return null;

  return (
    <div className="space-y-3 rounded-lg bg-muted/50 p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        {editMode ? "Modificando arquivos..." : "Gerando site..."}
      </div>
      <div className="space-y-2">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isComplete = index < currentStep;

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-3 text-xs transition-all duration-300",
                isActive && "text-primary",
                isComplete && "text-muted-foreground",
                !isActive && !isComplete && "text-muted-foreground/50"
              )}
            >
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full transition-all",
                  isActive && "bg-primary/20 text-primary",
                  isComplete && "bg-primary/10 text-primary",
                  !isActive && !isComplete && "bg-muted"
                )}
              >
                {isComplete ? (
                  <Check className="h-3 w-3" />
                ) : isActive ? (
                  <Icon className="h-3 w-3 animate-pulse" />
                ) : (
                  <Icon className="h-3 w-3" />
                )}
              </div>
              <span>{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
