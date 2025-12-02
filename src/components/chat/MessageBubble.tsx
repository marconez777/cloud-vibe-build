import { Bot, User, Copy, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MessageBubbleProps {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string | Date;
  isThinking?: boolean;
}

export function MessageBubble({ role, content, timestamp, isThinking }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = role === "user";
  const hasCode = content.includes("```") || content.includes("<code>");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedTime = timestamp
    ? format(new Date(timestamp), "HH:mm", { locale: ptBR })
    : null;

  return (
    <div className={cn("flex gap-3 group", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          role === "assistant" ? "bg-primary/10" : "bg-muted"
        )}
      >
        {role === "assistant" ? (
          <Bot className="h-4 w-4 text-primary" />
        ) : (
          <User className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      <div className="flex flex-col gap-1 max-w-[85%]">
        <div
          className={cn(
            "rounded-xl px-4 py-2 relative",
            role === "assistant" ? "bg-muted/50" : "bg-primary text-primary-foreground",
            isThinking && "animate-pulse"
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{content}</p>
          
          {!isUser && hasCode && (
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/50"
              title="Copiar"
            >
              {copied ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3 text-muted-foreground" />
              )}
            </button>
          )}
        </div>
        {formattedTime && (
          <span
            className={cn(
              "text-[10px] text-muted-foreground",
              isUser && "text-right"
            )}
          >
            {formattedTime}
          </span>
        )}
      </div>
    </div>
  );
}
