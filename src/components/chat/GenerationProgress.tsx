import { useState, useEffect } from "react";
import { Palette, Eye, Code, Sparkles, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface GenerationProgressProps {
  isGenerating: boolean;
  editMode?: boolean;
}

const generationSteps = [
  { id: "analyzing", label: "Analisando design...", sublabel: "Extraindo cores e fontes", icon: Eye },
  { id: "designing", label: "Design Analyst", sublabel: "Criando especificações", icon: Palette },
  { id: "coding", label: "Code Generator", sublabel: "Gerando HTML/CSS/JS", icon: Code },
  { id: "finalizing", label: "Finalizando", sublabel: "Otimizando arquivos", icon: Sparkles },
];

const editSteps = [
  { id: "analyzing", label: "Analisando...", sublabel: "Lendo arquivos", icon: Eye },
  { id: "modifying", label: "Modificando...", sublabel: "Aplicando mudanças", icon: Code },
  { id: "finalizing", label: "Finalizando...", sublabel: "Salvando", icon: Check },
];

export function GenerationProgress({ isGenerating, editMode }: GenerationProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);

  const steps = editMode ? editSteps : generationSteps;

  useEffect(() => {
    if (!isGenerating) {
      setCurrentStep(0);
      setExtractedColors([]);
      return;
    }

    // Simulate color extraction for visual feedback
    if (!editMode) {
      const colorTimer = setTimeout(() => {
        setExtractedColors(["#2D5F88", "#0D9488", "#F0FDFA"]);
      }, 2000);
      
      return () => clearTimeout(colorTimer);
    }
  }, [isGenerating, editMode]);

  useEffect(() => {
    if (!isGenerating) {
      setCurrentStep(0);
      return;
    }

    const durations = editMode 
      ? [800, 1500, 500] 
      : [2000, 4000, 6000, 2000]; // Longer for multi-agent pipeline

    let totalTime = 0;
    const timers: NodeJS.Timeout[] = [];

    durations.forEach((duration, index) => {
      if (index < steps.length - 1) {
        totalTime += duration;
        const timer = setTimeout(() => {
          setCurrentStep(index + 1);
        }, totalTime);
        timers.push(timer);
      }
    });

    return () => timers.forEach(clearTimeout);
  }, [isGenerating, editMode, steps.length]);

  if (!isGenerating) return null;

  return (
    <div className="space-y-4 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 p-5 border border-primary/10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            {editMode ? "Modificando arquivos" : "Pipeline Multi-Agent"}
          </p>
          <p className="text-xs text-muted-foreground">
            {editMode ? "Aplicando suas mudanças" : "Design Analyst → Code Generator"}
          </p>
        </div>
      </div>

      {/* Extracted Colors Preview (only for generation) */}
      {!editMode && extractedColors.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-background/50 p-3">
          <span className="text-xs text-muted-foreground">Cores detectadas:</span>
          <div className="flex gap-1.5">
            {extractedColors.map((color, i) => (
              <div
                key={i}
                className="h-5 w-5 rounded-full border border-border shadow-sm transition-transform hover:scale-110"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      {/* Steps */}
      <div className="space-y-2">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isComplete = index < currentStep;

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-3 rounded-lg p-2.5 transition-all duration-300",
                isActive && "bg-primary/10",
                isComplete && "opacity-60"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full transition-all",
                  isActive && "bg-primary text-primary-foreground shadow-lg shadow-primary/30",
                  isComplete && "bg-primary/20 text-primary",
                  !isActive && !isComplete && "bg-muted text-muted-foreground"
                )}
              >
                {isComplete ? (
                  <Check className="h-4 w-4" />
                ) : isActive ? (
                  <Icon className="h-4 w-4 animate-pulse" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1">
                <p className={cn(
                  "text-sm font-medium transition-colors",
                  isActive && "text-primary",
                  isComplete && "text-muted-foreground",
                  !isActive && !isComplete && "text-muted-foreground/50"
                )}>
                  {step.label}
                </p>
                <p className={cn(
                  "text-xs transition-colors",
                  isActive && "text-primary/70",
                  "text-muted-foreground/70"
                )}>
                  {step.sublabel}
                </p>
              </div>
              {isActive && (
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
        <div 
          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
