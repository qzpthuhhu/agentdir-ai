import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import {
  getCandidate,
  updateCandidate,
  addReviewAction,
  publishCandidate,
  findDuplicates,
  getReviewActions,
} from "@/services/ops.service";
import { ArrowLeft, CheckCircle, XCircle, Upload, AlertTriangle, Loader2 } from "lucide-react";

const ECOSYSTEMS = ["open_source", "startups", "big_tech", "china_ai"] as const;
const PRICING = ["free", "freemium", "paid", "enterprise"] as const;

const AdminReview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: candidate, isLoading } = useQuery({
    queryKey: ["candidate", id],
    queryFn: () => getCandidate(id!),
    enabled: !!id,
  });

  const { data: duplicates = [] } = useQuery({
    queryKey: ["duplicates", candidate?.name, candidate?.website_url],
    queryFn: () => findDuplicates(candidate!.name, candidate!.website_url || undefined),
    enabled: !!candidate?.name,
  });

  const { data: reviewHistory = [] } = useQuery({
    queryKey: ["review-actions", id],
    queryFn: () => getReviewActions(id!),
    enabled: !!id,
  });

  const [form, setForm] = useState<Record<string, any> | null>(null);

  // Initialize form from candidate (using useEffect instead of render-time setState)
  const candidateStr = JSON.stringify(candidate);
  useState(() => {}); // placeholder
  if (candidate && !form) {
    // We use a timeout-free approach: just set on next line after hooks
  }

  const set = (key: string, value: any) => setForm((f) => f ? { ...f, [key]: value } : f);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!form || !id) return;
      const { id: _, source_records, created_at, updated_at, ...updates } = form;
      await updateCandidate(id, updates);
      await addReviewAction(id, "edit", "Fields updated");
    },
    onSuccess: () => {
      toast({ title: "Saved" });
      queryClient.invalidateQueries({ queryKey: ["candidate", id] });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const approveMutation = useMutation({
    mutationFn: async () => {
      if (!id) return;
      await updateCandidate(id, { status: "approved" });
      await addReviewAction(id, "approve", "Candidate approved for publishing");
    },
    onSuccess: () => {
      toast({ title: "Approved" });
      setForm((f) => f ? { ...f, status: "approved" } : f);
      queryClient.invalidateQueries({ queryKey: ["candidate", id] });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      if (!id) return;
      await updateCandidate(id, { status: "rejected" });
      await addReviewAction(id, "reject", "Candidate rejected");
    },
    onSuccess: () => {
      toast({ title: "Rejected" });
      setForm((f) => f ? { ...f, status: "rejected" } : f);
      queryClient.invalidateQueries({ queryKey: ["candidate", id] });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const publishMutation = useMutation({
    mutationFn: () => publishCandidate(id!),
    onSuccess: (result) => {
      toast({ title: "Published!", description: `Agent ${result.action}d successfully (ID: ${result.agentId.slice(0, 8)}…)` });
      setForm((f) => f ? { ...f, status: "published" } : f);
      queryClient.invalidateQueries({ queryKey: ["candidate", id] });
    },
    onError: (e: Error) => toast({ title: "Publish failed", description: e.message, variant: "destructive" }),
  });

  if (!id) return <p>Missing candidate ID</p>;
  if (isLoading || !form) return <div className="container py-10"><p className="text-muted-foreground">Loading…</p></div>;

  const isPublished = form.status === "published";
  const isApproved = form.status === "approved";

  return (
    <div className="container py-10 max-w-4xl">
      <Link to="/admin/candidates" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Candidates
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-display">Review: {form.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              form.status === "draft" ? "bg-accent/20 text-accent" :
              form.status === "approved" ? "bg-primary/20 text-primary" :
              form.status === "published" ? "bg-green-500/20 text-green-400" :
              "bg-destructive/20 text-destructive"
            }`}>{form.status}</span>
            <span className="text-sm text-muted-foreground">Confidence: {form.confidence_score}%</span>
          </div>
        </div>
      </div>

      {/* Duplicate Warning */}
      {duplicates.length > 0 && (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-300 text-sm">Potential duplicates found</p>
            <div className="text-sm text-yellow-200/70 mt-1 space-y-0.5">
              {duplicates.map((d: any) => (
                <p key={d.id}>• {d.name} ({d.slug}) — {d.provider || "no provider"}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Extraction Notes */}
      {form.extraction_notes && (
        <div className="rounded-lg border border-border bg-card p-4 mb-6">
          <p className="text-xs font-medium text-muted-foreground mb-1">Extraction Notes</p>
          <p className="text-sm">{form.extraction_notes}</p>
        </div>
      )}

      {/* Source info */}
      {form.source_records?.url && (
        <div className="rounded-lg border border-border bg-card p-4 mb-6">
          <p className="text-xs font-medium text-muted-foreground mb-1">Source</p>
          <a href={form.source_records.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
            {form.source_records.url}
          </a>
        </div>
      )}

      {/* Edit Form */}
      <div className="space-y-6">
        <Section title="Identity">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name"><Input value={form.name || ""} onChange={(e) => set("name", e.target.value)} disabled={isPublished} /></Field>
            <Field label="Slug"><Input value={form.slug || ""} onChange={(e) => set("slug", e.target.value)} disabled={isPublished} /></Field>
          </div>
          <Field label="Tagline"><Input value={form.tagline || ""} onChange={(e) => set("tagline", e.target.value)} disabled={isPublished} /></Field>
          <Field label="Description"><Textarea value={form.description || ""} onChange={(e) => set("description", e.target.value)} rows={4} disabled={isPublished} /></Field>
        </Section>

        <Section title="Provider">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Provider"><Input value={form.provider || ""} onChange={(e) => set("provider", e.target.value)} disabled={isPublished} /></Field>
            <Field label="Country"><Input value={form.country || ""} onChange={(e) => set("country", e.target.value)} disabled={isPublished} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Ecosystem">
              <Select value={form.ecosystem || "open_source"} onValueChange={(v) => set("ecosystem", v)} disabled={isPublished}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ECOSYSTEMS.map((e) => <SelectItem key={e} value={e} className="capitalize">{e.replace("_", " ")}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Pricing">
              <Select value={form.pricing || "free"} onValueChange={(v) => set("pricing", v)} disabled={isPublished}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRICING.map((p) => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="os" checked={form.is_open_source || false} onCheckedChange={(v) => set("is_open_source", !!v)} disabled={isPublished} />
            <Label htmlFor="os">Open Source</Label>
          </div>
        </Section>

        <Section title="Links">
          <Field label="Website"><Input value={form.website_url || ""} onChange={(e) => set("website_url", e.target.value)} disabled={isPublished} /></Field>
          <Field label="GitHub"><Input value={form.github_url || ""} onChange={(e) => set("github_url", e.target.value)} disabled={isPublished} /></Field>
          <Field label="Docs"><Input value={form.docs_url || ""} onChange={(e) => set("docs_url", e.target.value)} disabled={isPublished} /></Field>
        </Section>

        <Section title="Classification">
          <Field label="Agent Types (comma-separated slugs)">
            <Input value={(form.agent_type_slugs || []).join(", ")} onChange={(e) => set("agent_type_slugs", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))} disabled={isPublished} />
          </Field>
          <Field label="Architectures (comma-separated slugs)">
            <Input value={(form.architecture_slugs || []).join(", ")} onChange={(e) => set("architecture_slugs", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))} disabled={isPublished} />
          </Field>
          <Field label="Domains (comma-separated slugs)">
            <Input value={(form.domain_slugs || []).join(", ")} onChange={(e) => set("domain_slugs", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))} disabled={isPublished} />
          </Field>
        </Section>

        <Section title="Tags & Features">
          <Field label="Tags">
            <Input value={(form.tags || []).join(", ")} onChange={(e) => set("tags", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))} disabled={isPublished} />
          </Field>
          <Field label="Features">
            <Input value={(form.features || []).join(", ")} onChange={(e) => set("features", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))} disabled={isPublished} />
          </Field>
          <Field label="Use Cases">
            <Input value={(form.use_cases || []).join(", ")} onChange={(e) => set("use_cases", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))} disabled={isPublished} />
          </Field>
        </Section>

        <Section title="Extra Metadata">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Target Customer"><Input value={form.target_customer || ""} onChange={(e) => set("target_customer", e.target.value)} disabled={isPublished} /></Field>
            <Field label="Enterprise Focus"><Input value={form.enterprise_focus || ""} onChange={(e) => set("enterprise_focus", e.target.value)} disabled={isPublished} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Deployment Type"><Input value={form.deployment_type || ""} onChange={(e) => set("deployment_type", e.target.value)} disabled={isPublished} /></Field>
            <Field label="Service Model"><Input value={form.service_model || ""} onChange={(e) => set("service_model", e.target.value)} disabled={isPublished} /></Field>
          </div>
        </Section>

        {/* Review History */}
        {reviewHistory.length > 0 && (
          <Section title="Review History">
            <div className="space-y-1.5">
              {reviewHistory.map((r: any) => (
                <div key={r.id} className="flex items-center gap-2 text-sm">
                  <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span>
                  <span className="capitalize font-medium">{r.action}</span>
                  {r.notes && <span className="text-muted-foreground">— {r.notes}</span>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Actions */}
        {!isPublished && (
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving…" : "Save Changes"}
            </Button>
            <Button variant="outline" onClick={() => approveMutation.mutate()} disabled={approveMutation.isPending} className="gap-1.5">
              <CheckCircle className="h-4 w-4" /> Approve
            </Button>
            <Button variant="outline" onClick={() => rejectMutation.mutate()} disabled={rejectMutation.isPending} className="gap-1.5 text-destructive hover:text-destructive">
              <XCircle className="h-4 w-4" /> Reject
            </Button>
            {(isApproved || form.status === "draft") && (
              <Button
                onClick={() => publishMutation.mutate()}
                disabled={publishMutation.isPending}
                className="ml-auto gap-1.5 bg-green-600 hover:bg-green-700 text-white"
              >
                {publishMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {publishMutation.isPending ? "Publishing…" : "Publish to Live"}
              </Button>
            )}
          </div>
        )}
      </div>
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

export default AdminReview;
