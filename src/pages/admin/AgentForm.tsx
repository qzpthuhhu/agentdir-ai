import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { getAllAgentTypes, getAllArchitectures, getAllDomains } from "@/services/taxonomy.service";
import { createAgent, updateAgent, getAgentForEdit, type AgentFormData } from "@/services/admin.service";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const ECOSYSTEMS = [
  { value: "open_source", label: "Open Source" },
  { value: "startups", label: "Startups" },
  { value: "big_tech", label: "Big Tech" },
  { value: "china_ai", label: "China AI" },
] as const;

const PRICING = [
  { value: "free", label: "Free" },
  { value: "freemium", label: "Freemium" },
  { value: "paid", label: "Paid" },
  { value: "enterprise", label: "Enterprise" },
] as const;

const emptyForm: AgentFormData = {
  name: "",
  slug: "",
  tagline: "",
  description: "",
  provider: "",
  country: "",
  ecosystem: "open_source",
  pricing: "free",
  is_open_source: false,
  website_url: "",
  github_url: "",
  docs_url: "",
  primary_language: "",
  license: "",
  logo_url: "",
  features: [],
  use_cases: [],
  tags: [],
  type_ids: [],
  architecture_ids: [],
  domain_ids: [],
  stars: 0,
  forks: 0,
};

interface Props {
  agentId?: string;
}

const AgentForm = ({ agentId }: Props) => {
  const navigate = useNavigate();
  const isEdit = !!agentId;
  const [form, setForm] = useState<AgentFormData>(emptyForm);

  const { data: types = [] } = useQuery({ queryKey: ["taxonomy-types"], queryFn: getAllAgentTypes });
  const { data: archs = [] } = useQuery({ queryKey: ["taxonomy-archs"], queryFn: getAllArchitectures });
  const { data: doms = [] } = useQuery({ queryKey: ["taxonomy-domains"], queryFn: getAllDomains });

  const { data: existing } = useQuery({
    queryKey: ["admin-agent", agentId],
    queryFn: () => getAgentForEdit(agentId!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name,
        slug: existing.slug,
        tagline: existing.tagline || "",
        description: existing.description || "",
        provider: existing.provider || "",
        country: existing.country || "",
        ecosystem: existing.ecosystem,
        pricing: existing.pricing,
        is_open_source: existing.is_open_source,
        website_url: existing.website_url || "",
        github_url: existing.github_url || "",
        docs_url: existing.docs_url || "",
        primary_language: existing.primary_language || "",
        license: existing.license || "",
        logo_url: existing.logo_url || "",
        features: existing.features || [],
        use_cases: existing.use_cases || [],
        tags: existing.tags || [],
        type_ids: (existing.agent_to_types || []).map((r: any) => r.type_id),
        architecture_ids: (existing.agent_to_architectures || []).map((r: any) => r.architecture_id),
        domain_ids: (existing.agent_to_domains || []).map((r: any) => r.domain_id),
        stars: existing.github_repos?.[0]?.stars || 0,
        forks: existing.github_repos?.[0]?.forks || 0,
      });
    }
  }, [existing]);

  const mutation = useMutation({
    mutationFn: () => isEdit ? updateAgent(agentId!, form) : createAgent(form),
    onSuccess: () => {
      toast({ title: isEdit ? "Agent updated" : "Agent created" });
      navigate("/admin/agents");
    },
    onError: (e: Error) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  const set = (key: keyof AgentFormData, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const toggleMulti = (key: "type_ids" | "architecture_ids" | "domain_ids", id: string) => {
    setForm((f) => {
      const arr = f[key] as string[];
      return { ...f, [key]: arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id] };
    });
  };

  const autoSlug = (name: string) => {
    set("name", name);
    if (!isEdit) {
      set("slug", name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug) {
      toast({ title: "Name and slug are required", variant: "destructive" });
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="container py-10 max-w-3xl">
      <Link to="/admin/agents" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to agents
      </Link>

      <h1 className="text-2xl font-bold font-display mb-8">
        {isEdit ? "Edit Agent" : "Create Agent"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <Section title="Basic Info">
          <Field label="Name">
            <Input value={form.name} onChange={(e) => autoSlug(e.target.value)} required />
          </Field>
          <Field label="Slug">
            <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} required />
          </Field>
          <Field label="Tagline">
            <Input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} />
          </Field>
          <Field label="Description">
            <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} />
          </Field>
          <Field label="Logo URL">
            <Input value={form.logo_url} onChange={(e) => set("logo_url", e.target.value)} />
          </Field>
        </Section>

        {/* Provider */}
        <Section title="Provider">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Provider">
              <Input value={form.provider} onChange={(e) => set("provider", e.target.value)} />
            </Field>
            <Field label="Country">
              <Input value={form.country} onChange={(e) => set("country", e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Ecosystem">
              <Select value={form.ecosystem} onValueChange={(v) => set("ecosystem", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ECOSYSTEMS.map((e) => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Pricing">
              <Select value={form.pricing} onValueChange={(v) => set("pricing", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRICING.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="is_os" checked={form.is_open_source} onCheckedChange={(v) => set("is_open_source", !!v)} />
            <Label htmlFor="is_os">Open Source</Label>
          </div>
        </Section>

        {/* Links */}
        <Section title="Links">
          <Field label="Website URL">
            <Input value={form.website_url} onChange={(e) => set("website_url", e.target.value)} />
          </Field>
          <Field label="GitHub URL">
            <Input value={form.github_url} onChange={(e) => set("github_url", e.target.value)} />
          </Field>
          <Field label="Docs URL">
            <Input value={form.docs_url} onChange={(e) => set("docs_url", e.target.value)} />
          </Field>
        </Section>

        {/* Technical */}
        <Section title="Technical">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Primary Language">
              <Input value={form.primary_language} onChange={(e) => set("primary_language", e.target.value)} />
            </Field>
            <Field label="License">
              <Input value={form.license} onChange={(e) => set("license", e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Stars">
              <Input type="number" value={form.stars} onChange={(e) => set("stars", Number(e.target.value))} />
            </Field>
            <Field label="Forks">
              <Input type="number" value={form.forks} onChange={(e) => set("forks", Number(e.target.value))} />
            </Field>
          </div>
        </Section>

        {/* Classification */}
        <Section title="Agent Types">
          <div className="flex flex-wrap gap-2">
            {types.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleMulti("type_ids", t.id)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  form.type_ids.includes(t.id)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Architectures">
          <div className="flex flex-wrap gap-2">
            {archs.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => toggleMulti("architecture_ids", a.id)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  form.architecture_ids.includes(a.id)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {a.name}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Domains">
          <div className="flex flex-wrap gap-2">
            {doms.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => toggleMulti("domain_ids", d.id)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  form.domain_ids.includes(d.id)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {d.name}
              </button>
            ))}
          </div>
        </Section>

        {/* Tags / Features */}
        <Section title="Tags & Features">
          <Field label="Tags (comma-separated)">
            <Input
              value={form.tags.join(", ")}
              onChange={(e) => set("tags", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
            />
          </Field>
          <Field label="Features (comma-separated)">
            <Input
              value={form.features.join(", ")}
              onChange={(e) => set("features", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
            />
          </Field>
          <Field label="Use Cases (comma-separated)">
            <Input
              value={form.use_cases.join(", ")}
              onChange={(e) => set("use_cases", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
            />
          </Field>
        </Section>

        <div className="flex gap-3">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving…" : isEdit ? "Update Agent" : "Create Agent"}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate("/admin/agents")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-4">
    <h2 className="text-lg font-semibold border-b border-border pb-2">{title}</h2>
    {children}
  </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-sm">{label}</Label>
    {children}
  </div>
);

export default AgentForm;
