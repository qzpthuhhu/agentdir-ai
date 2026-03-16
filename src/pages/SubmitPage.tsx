import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { categories } from "@/hooks/use-agents";
import { toast } from "sonner";
import { useI18n } from "@/i18n/context";
import { useAuth } from "@/hooks/use-auth";
import AuthModal from "@/components/auth/AuthModal";
import { Globe, FileText, Loader2, LogIn } from "lucide-react";
import { scrapeUrl, extractAgent, createSource, createJob, updateJobStatus, createCandidate } from "@/services/ops.service";

const SubmitPage = () => {
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [website, setWebsite] = useState("");
  const [pricing, setPricing] = useState("");
  const [urlOnly, setUrlOnly] = useState("");
  const [submitMode, setSubmitMode] = useState<"url" | "manual">("url");
  const [isProcessing, setIsProcessing] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const { t } = useI18n();
  const { user, profile } = useAuth();

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlOnly || !user) return;
    setIsProcessing(true);
    try {
      const source = await createSource({ url: urlOnly, source_type: "user_submit" });
      const job = await createJob({ source_id: source.id, input_type: "url", input_content: urlOnly });
      await updateJobStatus(job.id, "processing");

      const scraped = await scrapeUrl(urlOnly);
      const { supabase } = await import("@/integrations/supabase/client");
      await supabase.from("source_records").update({
        title: scraped.title,
        summary: scraped.metaDescription,
        raw_content: scraped.text,
        status: "processed",
      }).eq("id", source.id);

      const extraction = await extractAgent(scraped.text, urlOnly, "user_submit");
      await createCandidate({
        ...extraction.data,
        source_id: source.id,
        job_id: job.id,
        status: "draft",
        submitted_by_user_id: user.id,
        submitter_email: user.email || profile?.email || "",
        submitter_username: profile?.username || "",
        submission_source: "user",
      });
      await updateJobStatus(job.id, "completed");

      toast.success(t("submit.successTitle"), { description: t("submit.urlSuccessDesc") });
      setUrlOnly("");
    } catch (err: any) {
      toast.error("Submission failed", { description: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    toast.success(t("submit.successTitle"), { description: t("submit.successDesc", { name }) });
    setName(""); setTagline(""); setDescription(""); setCategory(""); setWebsite(""); setPricing("");
  };

  if (!user) {
    return (
      <div className="container py-20 max-w-lg text-center">
        <div className="glass rounded-2xl p-10 space-y-6">
          <LogIn className="h-12 w-12 mx-auto text-primary" />
          <h1 className="font-display text-2xl font-bold">Sign in to submit an agent</h1>
          <p className="text-muted-foreground">You need to be logged in to submit AI agents for review.</p>
          <Button className="glow-primary" onClick={() => setAuthOpen(true)}>
            Log in / Sign up
          </Button>
        </div>
        <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
      </div>
    );
  }

  return (
    <div className="container py-12 max-w-2xl">
      <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">{t("submit.title")}</h1>
      <p className="text-muted-foreground mb-8">{t("submit.subtitle")}</p>

      <Tabs value={submitMode} onValueChange={(v) => setSubmitMode(v as "url" | "manual")} className="space-y-6">
        <TabsList className="w-full">
          <TabsTrigger value="url" className="flex-1 gap-1.5"><Globe className="h-4 w-4" />{t("submit.urlTab")}</TabsTrigger>
          <TabsTrigger value="manual" className="flex-1 gap-1.5"><FileText className="h-4 w-4" />{t("submit.manualTab")}</TabsTrigger>
        </TabsList>

        <TabsContent value="url">
          <div className="glass rounded-2xl p-8 space-y-4">
            <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 text-sm text-primary">
              {t("submit.urlHint")}
            </div>
            <form onSubmit={handleUrlSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="urlOnly">{t("submit.website")}</Label>
                <Input
                  id="urlOnly"
                  value={urlOnly}
                  onChange={(e) => setUrlOnly(e.target.value)}
                  placeholder="https://example.com/ai-agent"
                  type="url"
                  required
                  disabled={isProcessing}
                />
              </div>
              <Button type="submit" className="w-full glow-primary" disabled={!urlOnly || isProcessing}>
                {isProcessing ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />{t("submit.processing")}</> : t("submit.submitUrl")}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground text-center">
              Submitting as {profile?.username || user.email}
            </p>
          </div>
        </TabsContent>

        <TabsContent value="manual">
          <form onSubmit={handleManualSubmit} className="glass rounded-2xl p-8 space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="name">{t("submit.name")}</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("submit.namePlaceholder")} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tagline">{t("submit.tagline")}</Label>
              <Input id="tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder={t("submit.taglinePlaceholder")} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">{t("submit.description")}</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("submit.descriptionPlaceholder")} rows={4} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t("submit.category")}</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder={t("submit.categoryPlaceholder")} /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>{t("submit.pricing")}</Label>
                <Select value={pricing} onValueChange={setPricing}>
                  <SelectTrigger><SelectValue placeholder={t("submit.pricingPlaceholder")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="freemium">Freemium</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="website">{t("submit.website")}</Label>
              <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder={t("submit.websitePlaceholder")} type="url" required />
            </div>
            <Button type="submit" className="w-full glow-primary">{t("submit.submitButton")}</Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SubmitPage;
