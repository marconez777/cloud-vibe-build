import { useEffect, useState } from "react";
import { 
  Palette, Eye, Code, Search, Sparkles, Check, Loader2, 
  AlertTriangle, Clock, Zap 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import type { GenerationStage } from "@/hooks/useGenerationStatus";

interface EnhancedGenerationProgressProps {
  stage: GenerationStage;
  message: string;
  progress: number;
  error?: string;
  startTime: number | null;
}

const stageConfig: Record<GenerationStage, { icon: typeof Eye; color: string }> = {
  idle: { icon: Sparkles, color: "text-muted-foreground" },
  analyzing: { icon: Eye, color: "text-blue-500" },
  design_analyst: { icon: Palette, color: "text-purple-500" },
  code_generator: { icon: Code, color: "text-green-500" },
  seo_specialist: { icon: Search, color: "text-orange-500" },
  saving: { icon: Sparkles, color: "text-cyan-500" },
  complete: { icon: Check, color: "text-emerald-500" },
  error: { icon: AlertTriangle, color: "text-destructive" },
  timeout: { icon: Clock, color: "text-yellow-500" },
};

const pipelineStages: GenerationStage[] = [
  "analyzing",
  "design_analyst",
  "code_generator",
  "seo_specialist",
  "saving",
];

export function EnhancedGenerationProgress({
  stage,
  message,
  progress,
  error,
  startTime,
}: EnhancedGenerationProgressProps) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!startTime) {
      setElapsedTime(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  if (stage === "idle") return null;

  const config = stageConfig[stage];
  const Icon = config.icon;
  const isError = stage === "error" || stage === "timeout";
  const isComplete = stage === "complete";

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className={cn(
      "space-y-4 rounded-xl p-5 border transition-all",
      isError && "bg-destructive/5 border-destructive/20",
      isComplete && "bg-emerald-500/5 border-emerald-500/20",
      !isError && !isComplete && "bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            isError && "bg-destructive/20",
            isComplete && "bg-emerald-500/20",
            !isError && !isComplete && "bg-primary/20"
          )}>
            {!isError && !isComplete ? (
              <Loader2 className={cn("h-5 w-5 animate-spin", config.color)} />
            ) : (
              <Icon className={cn("h-5 w-5", config.color)} />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {isError ? "Erro na Geração" : isComplete ? "Concluído!" : "Pipeline Multi-Agent"}
            </p>
            <p className="text-xs text-muted-foreground">{message}</p>
          </div>
        </div>
        
        {startTime && !isError && !isComplete && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {formatTime(elapsedTime)}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Pipeline Steps */}
      {!isError && !isComplete && (
        <div className="space-y-2">
          {pipelineStages.map((s, index) => {
            const stepConfig = stageConfig[s];
            const StepIcon = stepConfig.icon;
            const currentIndex = pipelineStages.indexOf(stage);
            const isActive = s === stage;
            const isDone = index < currentIndex;
            const isPending = index > currentIndex;

            return (
              <div
                key={s}
                className={cn(
                  "flex items-center gap-3 rounded-lg p-2.5 transition-all duration-300",
                  isActive && "bg-primary/10",
                  isDone && "opacity-60"
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full transition-all",
                    isActive && "bg-primary text-primary-foreground shadow-lg shadow-primary/30",
                    isDone && "bg-primary/20 text-primary",
                    isPending && "bg-muted text-muted-foreground"
                  )}
                >
                  {isDone ? (
                    <Check className="h-4 w-4" />
                  ) : isActive ? (
                    <StepIcon className="h-4 w-4 animate-pulse" />
                  ) : (
                    <StepIcon className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={cn(
                    "text-sm font-medium transition-colors capitalize",
                    isActive && "text-primary",
                    isDone && "text-muted-foreground",
                    isPending && "text-muted-foreground/50"
                  )}>
                    {s.replace("_", " ")}
                  </p>
                </div>
                {isActive && (
                  <Zap className="h-4 w-4 animate-pulse text-primary" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Progress bar */}
      {!isError && (
        <div className="space-y-1.5">
          <Progress value={progress} className="h-2" />
          <p className="text-right text-xs text-muted-foreground">{progress}%</p>
        </div>
      )}
    </div>
  );
}
