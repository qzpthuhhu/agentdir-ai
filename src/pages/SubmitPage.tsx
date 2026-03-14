import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categories } from "@/hooks/use-agents";
import { toast } from "sonner";
import { useI18n } from "@/i18n/context";

const SubmitPage = () => {
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [website, setWebsite] = useState("");
  const [pricing, setPricing] = useState("");
  const { t } = useI18n();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(t("submit.successTitle"), { description: t("submit.successDesc", { name }) });
    setName(""); setTagline(""); setDescription(""); setCategory(""); setWebsite(""); setPricing("");
  };

  return (
    <div className="container py-12 max-w-2xl">
      <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">{t("submit.title")}</h1>
      <p className="text-muted-foreground mb-8">{t("submit.subtitle")}</p>

      <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-6">
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
    </div>
  );
};

export default SubmitPage;
