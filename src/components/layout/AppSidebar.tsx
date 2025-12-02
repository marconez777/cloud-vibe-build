import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderOpen,
  Plus,
  HelpCircle,
  Sparkles,
  Brain,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: FolderOpen, label: "Projects", href: "/projects" },
  { icon: Plus, label: "New Project", href: "/new" },
  { icon: Brain, label: "Knowledge Base", href: "/knowledge" },
  { icon: HelpCircle, label: "Help", href: "/help" },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const location = useLocation();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen border-r border-sidebar-border bg-sidebar transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-3">
            <div className={cn("flex items-center gap-2", collapsed && "justify-center w-full")}>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg gradient-primary">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              {!collapsed && (
                <span className="font-heading text-xl font-bold text-foreground">
                  PHP<span className="gradient-text">Vibe</span>
                </span>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              const linkContent = (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    collapsed && "justify-center px-2",
                    isActive
                      ? "bg-sidebar-accent text-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
                  {!collapsed && item.label}
                </Link>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right" className="bg-popover text-popover-foreground">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return linkContent;
            })}
          </nav>

          {/* Footer */}
          {!collapsed && (
            <div className="border-t border-sidebar-border p-4">
              <div className="glass rounded-lg p-4">
                <p className="text-xs text-muted-foreground">Powered by AI</p>
                <p className="mt-1 text-sm font-medium text-foreground">OpenAI GPT-4o</p>
              </div>
            </div>
          )}

          {/* Toggle Button */}
          <div className={cn("border-t border-sidebar-border p-2", collapsed && "mt-auto")}>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className={cn("w-full justify-center", !collapsed && "justify-end")}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <>
                  <span className="text-xs text-muted-foreground mr-2">Recolher</span>
                  <ChevronLeft className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
