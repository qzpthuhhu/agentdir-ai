import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import {
  scrapeUrl,
  extractAgent,
  createSource,
  createJob,
  updateJobStatus,
  createCandidate,
  getJobs,
  getCandidates,
} from "@/services/ops.service";
import { Globe, FileText, Zap, Loader2, ArrowRight, CheckCircle, XCircle, Clock, List } from "lucide-react";

import React from "react";

const StatusBadge = React.forwardRef<HTMLSpanElement, { status: string }>(({ status, ...props }, ref) => {
  const colors: Record<string, string> = {
    pending: "bg-muted text-muted-foreground",
    processing: "bg-primary/20 text-primary",
    completed: "bg-green-500/20 text-green-400",
    failed: "bg-destructive/20 text-destructive",
    draft: "bg-accent/20 text-accent",
    published: "bg-green-500/20 text-green-400",
  };
  return (
    <span ref={ref} {...props} className={`text-xs px-2 py-0.5 rounded-full ${colors[status] || "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
});

const AdminOps = () => {
  const queryClient = useQueryClient();
  const [urlInput, setUrlInput] = useState("");
  const [batchUrls, setBatchUrls] = useState("");
  const [textInput, setTextInput] = useState("");
  const [activeTab, setActiveTab] = useState("url");

  const { data: jobs = [] } = useQuery({ queryKey: ["ops-jobs"], queryFn: getJobs });
  const { data: candidates = [] } = useQuery({ queryKey: ["ops-candidates"], queryFn: () => getCandidates() });

  const recentCandidates = candidates.slice(0, 5);

  // Single URL processing
  const processUrlMutation = useMutation({
    mutationFn: async (url: string) => {
      const source = await createSource({ url, source_type: "website" });
      const job = await createJob({ source_id: source.id, input_type: "url", input_content: url });
      await updateJobStatus(job.id, "processing");
      const scraped = await scrapeUrl(url);
      const { supabase } = await import("@/integrations/supabase/client");
      await supabase.from("source_records").update({
        title: scraped.title, summary: scraped.metaDescription, raw_content: scraped.text, status: "processed",
      }).eq("id", source.id);
      const extraction = await extractAgent(scraped.text, url, "website");
      await createCandidate({ ...extraction.data, source_id: source.id, job_id: job.id, status: "draft" });
      await updateJobStatus(job.id, "completed");
      return extraction.data;
    },
    onSuccess: (data) => {
      toast({ title: "Extraction complete", description: `Found: ${data.name}` });
      setUrlInput("");
      queryClient.invalidateQueries({ queryKey: ["ops-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["ops-candidates"] });
    },
    onError: (e: Error) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  // Batch URL processing
  const [batchProgress, setBatchProgress] = useState({ total: 0, done: 0, errors: 0, processing: false });

  const processBatchMutation = useMutation({
    mutationFn: async (urls: string[]) => {
      setBatchProgress({ total: urls.length, done: 0, errors: 0, processing: true });
      const results: any[] = [];
      for (const url of urls) {
        try {
          const source = await createSource({ url, source_type: "website" });
          const job = await createJob({ source_id: source.id, input_type: "url", input_content: url });
          await updateJobStatus(job.id, "processing");
          const scraped = await scrapeUrl(url);
          const { supabase } = await import("@/integrations/supabase/client");
          await supabase.from("source_records").update({
            title: scraped.title, summary: scraped.metaDescription, raw_content: scraped.text, status: "processed",
          }).eq("id", source.id);
          const extraction = await extractAgent(scraped.text, url, "website");
          await createCandidate({ ...extraction.data, source_id: source.id, job_id: job.id, status: "draft" });
          await updateJobStatus(job.id, "completed");
          results.push({ url, name: extraction.data.name, ok: true });
          setBatchProgress((p) => ({ ...p, done: p.done + 1 }));
        } catch (err: any) {
          results.push({ url, error: err.message, ok: false });
          setBatchProgress((p) => ({ ...p, done: p.done + 1, errors: p.errors + 1 }));
        }
      }
      return results;
    },
    onSuccess: (results) => {
      const ok = results.filter((r) => r.ok).length;
      const fail = results.filter((r) => !r.ok).length;
      toast({ title: "Batch complete", description: `${ok} succeeded, ${fail} failed` });
      setBatchUrls("");
      setBatchProgress({ total: 0, done: 0, errors: 0, processing: false });
      queryClient.invalidateQueries({ queryKey: ["ops-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["ops-candidates"] });
    },
    onError: (e: Error) => {
      toast({ title: "Batch error", description: e.message, variant: "destructive" });
      setBatchProgress({ total: 0, done: 0, errors: 0, processing: false });
    },
  });

  const processTextMutation = useMutation({
    mutationFn: async (text: string) => {
      const source = await createSource({ source_type: "manual", raw_content: text, title: "Manual text input" });
      const job = await createJob({ source_id: source.id, input_type: "text", input_content: text });
      await updateJobStatus(job.id, "processing");
      const extraction = await extractAgent(text, undefined, "manual");
      await createCandidate({ ...extraction.data, source_id: source.id, job_id: job.id, status: "draft" });
      await updateJobStatus(job.id, "completed");
      return extraction.data;
    },
    onSuccess: (data) => {
      toast({ title: "Extraction complete", description: `Found: ${data.name}` });
      setTextInput("");
      queryClient.invalidateQueries({ queryKey: ["ops-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["ops-candidates"] });
    },
    onError: (e: Error) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  const isProcessing = processUrlMutation.isPending || processTextMutation.isPending || batchProgress.processing;

  const handleBatchSubmit = () => {
    const urls = batchUrls
      .split(/[\n,]+/)
      .map((u) => u.trim())
      .filter((u) => u.length > 0 && (u.startsWith("http://") || u.startsWith("https://")));
    if (urls.length === 0) {
      toast({ title: "No valid URLs", description: "Enter URLs separated by newlines or commas", variant: "destructive" });
      return;
    }
    processBatchMutation.mutate(urls);
  };

  return (
    <div className="container py-10 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-display">AI Ops Center</h1>
          <p className="text-sm text-muted-foreground">Ingest, extract, and review AI agent data</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/sources">Sources</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/candidates">Candidates</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/announcements">Announcements</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/agents">Agents DB</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/quality">Data Quality</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/suggestions">Suggestions</Link>
          </Button>
        </div>
      </div>

      {/* Input Section */}
      <div className="rounded-lg border border-border p-6 mb-8 bg-card">
        <h2 className="text-lg font-semibold mb-4">New Ingestion</h2>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="url" className="gap-1.5"><Globe className="h-3.5 w-3.5" /> Single URL</TabsTrigger>
            <TabsTrigger value="batch" className="gap-1.5"><List className="h-3.5 w-3.5" /> Batch URLs</TabsTrigger>
            <TabsTrigger value="text" className="gap-1.5"><FileText className="h-3.5 w-3.5" /> Raw Text</TabsTrigger>
          </TabsList>

          <TabsContent value="url">
            <div className="space-y-3">
              <Label>Paste a URL (company website, product page, article)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com/ai-agent-product"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  disabled={isProcessing}
                />
                <Button
                  onClick={() => urlInput && processUrlMutation.mutate(urlInput)}
                  disabled={!urlInput || isProcessing}
                  className="gap-1.5 min-w-[140px]"
                >
                  {processUrlMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                  {processUrlMutation.isPending ? "Processing…" : "Extract"}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="batch">
            <div className="space-y-3">
              <Label>Paste multiple URLs (one per line or comma-separated)</Label>
              <Textarea
                placeholder={"https://example.com/agent-1\nhttps://example.com/agent-2\nhttps://example.com/agent-3"}
                value={batchUrls}
                onChange={(e) => setBatchUrls(e.target.value)}
                rows={6}
                disabled={isProcessing}
              />
              {batchProgress.processing && (
                <div className="flex items-center gap-3 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span>Processing {batchProgress.done}/{batchProgress.total}</span>
                  {batchProgress.errors > 0 && <span className="text-destructive">({batchProgress.errors} errors)</span>}
                </div>
              )}
              <Button
                onClick={handleBatchSubmit}
                disabled={!batchUrls.trim() || isProcessing}
                className="gap-1.5"
              >
                {batchProgress.processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                {batchProgress.processing ? `Processing ${batchProgress.done}/${batchProgress.total}` : "Extract All"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="text">
            <div className="space-y-3">
              <Label>Paste raw text (article, press release, product description)</Label>
              <Textarea
                placeholder="Paste content here about an AI agent, company, or product..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows={6}
                disabled={isProcessing}
              />
              <Button
                onClick={() => textInput && processTextMutation.mutate(textInput)}
                disabled={!textInput || isProcessing}
                className="gap-1.5"
              >
                {processTextMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                {processTextMutation.isPending ? "Processing…" : "Extract from Text"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Recent Jobs & Candidates */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-lg border border-border p-5 bg-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Jobs</h3>
            <span className="text-xs text-muted-foreground">{jobs.length} total</span>
          </div>
          <div className="space-y-2">
            {jobs.slice(0, 8).map((job: any) => (
              <div key={job.id} className="flex items-center justify-between text-sm py-1.5 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-2 truncate flex-1">
                  {job.status === "completed" && <CheckCircle className="h-3.5 w-3.5 text-green-400 shrink-0" />}
                  {job.status === "failed" && <XCircle className="h-3.5 w-3.5 text-destructive shrink-0" />}
                  {job.status === "processing" && <Loader2 className="h-3.5 w-3.5 text-primary animate-spin shrink-0" />}
                  {job.status === "pending" && <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                  <span className="truncate">{job.source_records?.title || job.input_type}</span>
                </div>
                <StatusBadge status={job.status} />
              </div>
            ))}
            {jobs.length === 0 && <p className="text-sm text-muted-foreground">No jobs yet</p>}
          </div>
        </div>

        <div className="rounded-lg border border-border p-5 bg-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Candidates</h3>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/candidates" className="gap-1">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
            </Button>
          </div>
          <div className="space-y-2">
            {recentCandidates.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between text-sm py-1.5 border-b border-border/50 last:border-0">
                <div className="truncate flex-1">
                  <span className="font-medium">{c.name}</span>
                  {c.provider && <span className="text-muted-foreground ml-1.5">by {c.provider}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{c.confidence_score}%</span>
                  <StatusBadge status={c.status} />
                </div>
              </div>
            ))}
            {recentCandidates.length === 0 && <p className="text-sm text-muted-foreground">No candidates yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOps;
