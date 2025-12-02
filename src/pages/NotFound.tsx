import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-2xl gradient-primary shadow-glow">
          <span className="font-heading text-4xl font-bold text-primary-foreground">404</span>
        </div>
        <h1 className="mb-2 font-heading text-3xl font-bold">Página não encontrada</h1>
        <p className="mb-8 text-muted-foreground">
          A página que você está procurando não existe ou foi movida.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/">
            <Button variant="hero">
              <Home className="mr-2 h-4 w-4" />
              Ir para Home
            </Button>
          </Link>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
