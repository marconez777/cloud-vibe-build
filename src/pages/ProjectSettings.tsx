import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Save, 
  Loader2,
  Palette,
  MapPin,
  Share2,
  Clock,
  Settings2,
  Sparkles,
  Search
} from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { 
  useProjectSettings, 
  useUpsertProjectSettings,
  ProjectSettings as ProjectSettingsType
} from "@/hooks/useProjectSettings";
import { IdentityTab } from "@/components/settings/IdentityTab";
import { ContactTab } from "@/components/settings/ContactTab";
import { SocialTab } from "@/components/settings/SocialTab";
import { HoursTab } from "@/components/settings/HoursTab";
import { CustomFieldsTab } from "@/components/settings/CustomFieldsTab";
import { SeoTab } from "@/components/settings/SeoTab";

export default function ProjectSettings() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { data: projects } = useProjects();
  const { data: existingSettings, isLoading } = useProjectSettings(projectId);
  const upsertSettings = useUpsertProjectSettings();

  const project = projects?.find((p) => p.id === projectId);

  const [settings, setSettings] = useState<Partial<ProjectSettingsType>>({
    company_name: "",
    slogan: "",
    logo_url: null,
    favicon_url: null,
    gallery_images: [],
    address: "",
    city: "",
    state: "",
    zip_code: "",
    phone: "",
    whatsapp: "",
    email: "",
    social_links: {},
    business_hours: {},
    custom_fields: {},
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (existingSettings) {
      setSettings(existingSettings);
    }
  }, [existingSettings]);

  const handleChange = (newSettings: Partial<ProjectSettingsType>) => {
    setSettings(newSettings);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!projectId) return;
    
    await upsertSettings.mutateAsync({
      projectId,
      settings: {
        ...settings,
        project_id: projectId,
      },
    });
    setHasChanges(false);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b bg-card/50 px-6 py-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="flex-1 p-6">
            <Skeleton className="h-[400px] w-full" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b bg-card/50 px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/vibe/${projectId}`)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Personalizar Site</h1>
              <p className="text-sm text-muted-foreground">
                {project?.name || "Projeto"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(`/vibe/${projectId}`)}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Gerar Site
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || upsertSettings.isPending}
            >
              {upsertSettings.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Salvar
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-3xl">
            <Tabs defaultValue="identity" className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="identity" className="gap-2">
                  <Palette className="h-4 w-4" />
                  <span className="hidden sm:inline">Identidade</span>
                </TabsTrigger>
                <TabsTrigger value="contact" className="gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="hidden sm:inline">Contato</span>
                </TabsTrigger>
                <TabsTrigger value="social" className="gap-2">
                  <Share2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Social</span>
                </TabsTrigger>
                <TabsTrigger value="hours" className="gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="hidden sm:inline">Horários</span>
                </TabsTrigger>
                <TabsTrigger value="seo" className="gap-2">
                  <Search className="h-4 w-4" />
                  <span className="hidden sm:inline">SEO</span>
                </TabsTrigger>
                <TabsTrigger value="custom" className="gap-2">
                  <Settings2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Extras</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="identity">
                <IdentityTab
                  settings={settings}
                  onChange={handleChange}
                  projectId={projectId || ""}
                />
              </TabsContent>

              <TabsContent value="contact">
                <ContactTab settings={settings} onChange={handleChange} />
              </TabsContent>

              <TabsContent value="social">
                <SocialTab settings={settings} onChange={handleChange} />
              </TabsContent>

              <TabsContent value="hours">
                <HoursTab settings={settings} onChange={handleChange} />
              </TabsContent>

              <TabsContent value="seo">
                <SeoTab settings={settings} onChange={handleChange} />
              </TabsContent>

              <TabsContent value="custom">
                <CustomFieldsTab settings={settings} onChange={handleChange} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
