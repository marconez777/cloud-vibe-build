import { useState, useCallback } from "react";

export type GenerationStage = 
  | "idle"
  | "analyzing"
  | "design_analyst"
  | "code_generator"
  | "seo_specialist"
  | "personalizing"
  | "metadata"
  | "saving"
  | "complete"
  | "error"
  | "timeout";

export interface GenerationStatus {
  stage: GenerationStage;
  message: string;
  progress: number;
  startTime: number | null;
  error?: string;
}

const STAGE_INFO: Record<GenerationStage, { message: string; progress: number }> = {
  idle: { message: "", progress: 0 },
  analyzing: { message: "Analisando briefing e imagens...", progress: 10 },
  design_analyst: { message: "Design Analyst extraindo cores e estilos...", progress: 30 },
  code_generator: { message: "Code Generator criando HTML/CSS/JS...", progress: 60 },
  seo_specialist: { message: "SEO Specialist otimizando meta tags...", progress: 85 },
  personalizing: { message: "Personalizando textos do template...", progress: 40 },
  metadata: { message: "Atualizando metadados SEO...", progress: 75 },
  saving: { message: "Salvando arquivos no projeto...", progress: 95 },
  complete: { message: "Site gerado com sucesso!", progress: 100 },
  error: { message: "Erro na geração", progress: 0 },
  timeout: { message: "Timeout - geração demorou muito", progress: 0 },
};

const TIMEOUT_MS = 150000; // 150 seconds (Lovable Cloud limit)

export function useGenerationStatus() {
  const [status, setStatus] = useState<GenerationStatus>({
    stage: "idle",
    message: "",
    progress: 0,
    startTime: null,
  });

  const startGeneration = useCallback(() => {
    setStatus({
      stage: "analyzing",
      message: STAGE_INFO.analyzing.message,
      progress: STAGE_INFO.analyzing.progress,
      startTime: Date.now(),
    });
  }, []);

  const updateStage = useCallback((stage: GenerationStage, customMessage?: string) => {
    const info = STAGE_INFO[stage];
    setStatus((prev) => ({
      ...prev,
      stage,
      message: customMessage || info.message,
      progress: info.progress,
    }));
  }, []);

  const completeGeneration = useCallback(() => {
    setStatus({
      stage: "complete",
      message: STAGE_INFO.complete.message,
      progress: 100,
      startTime: null,
    });
    
    // Reset after showing success
    globalThis.setTimeout(() => {
      setStatus({
        stage: "idle",
        message: "",
        progress: 0,
        startTime: null,
      });
    }, 3000);
  }, []);

  const setError = useCallback((error: string) => {
    setStatus({
      stage: "error",
      message: STAGE_INFO.error.message,
      progress: 0,
      startTime: null,
      error,
    });
  }, []);

  const setTimeout = useCallback(() => {
    setStatus({
      stage: "timeout",
      message: STAGE_INFO.timeout.message,
      progress: 0,
      startTime: null,
      error: "A geração excedeu o tempo limite de 150 segundos. Tente simplificar o briefing ou dividir em partes menores.",
    });
  }, []);

  const reset = useCallback(() => {
    setStatus({
      stage: "idle",
      message: "",
      progress: 0,
      startTime: null,
    });
  }, []);

  const isGenerating = status.stage !== "idle" && status.stage !== "complete" && status.stage !== "error" && status.stage !== "timeout";

  const checkTimeout = useCallback(() => {
    if (status.startTime && Date.now() - status.startTime > TIMEOUT_MS) {
      setTimeout();
      return true;
    }
    return false;
  }, [status.startTime, setTimeout]);

  return {
    status,
    isGenerating,
    startGeneration,
    updateStage,
    completeGeneration,
    setError,
    setTimeout,
    reset,
    checkTimeout,
    TIMEOUT_MS,
  };
}
