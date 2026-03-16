import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, ArrowLeft, Download, Search, X } from "lucide-react";
import { deleteAgent } from "@/services/admin.service";
import { toast } from "@/hooks/use-toast";
import { useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

const AdminAgentsList = () => {
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [ecoFilter, setEcoFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [ossFilter, setOssFilter] = useState<string>("all");
  const [missingFilter, setMissingFilter] = useState<string>("all");

  const { data: agents = [], isLoading } = useQuery({
    queryKey: ["admin-agents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agents")
        .select("id, name, slug, provider, ecosystem, primary_language, rating, created_at, is_open_source, website_url, description, pricing, country, tagline, github_url, github_repos(stars)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const countries = useMemo(() => {
    const set = new Set(agents.map((a) => a.country).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [agents]);

  const filtered = useMemo(() => {
    let list = agents;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          (a.provider || "").toLowerCase().includes(q) ||
          (a.slug || "").toLowerCase().includes(q)
      );
    }
    if (ecoFilter !== "all") list = list.filter((a) => a.ecosystem === ecoFilter);
    if (countryFilter !== "all") list = list.filter((a) => a.country === countryFilter);
    if (ossFilter !== "all") list = list.filter((a) => (ossFilter === "yes" ? a.is_open_source : !a.is_open_source));
    if (missingFilter !== "all") {
      list = list.filter((a) => {
        switch (missingFilter) {
          case "website": return !a.website_url;
          case "description": return !a.description;
          case "pricing": return !a.pricing || a.pricing === "free";
          case "stars": return !a.github_repos?.[0]?.stars;
          case "tagline": return !a.tagline;
          default: return true;
        }
      });
    }
    return list;
  }, [agents, search, ecoFilter, countryFilter, ossFilter, missingFilter]);

  const deleteMutation = useMutation({
    mutationFn: deleteAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-agents"] });
      toast({ title: "Agent deleted" });
      setDeleteId(null);
    },
    onError: (e: Error) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  const ecoLabel: Record<string, string> = {
    open_source: "Open Source",
    startups: "Startups",
    big_tech: "Big Tech",
    china_ai: "China AI",
  };

  const exportCsv = () => {
    const headers = ["Name", "Slug", "Provider", "Ecosystem", "Country", "Language", "Stars", "Pricing", "Open Source", "Website", "Created"];
    const rows = filtered.map((a) => [
      a.name,
      a.slug,
      a.provider || "",
      ecoLabel[a.ecosystem] || a.ecosystem,
      a.country || "",
      a.primary_language || "",
      a.github_repos?.[0]?.stars || "",
      a.pricing || "",
      a.is_open_source ? "Yes" : "No",
      a.website_url || "",
      new Date(a.created_at).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `agents-export-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: `Exported ${filtered.length} agents to CSV` });
  };

  const hasFilters = search || ecoFilter !== "all" || countryFilter !== "all" || ossFilter !== "all" || missingFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setEcoFilter("all");
    setCountryFilter("all");
    setOssFilter("all");
    setMissingFilter("all");
  };

  return (
    <div className="container py-10 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/ops">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold font-display">Agent Database</h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} of {agents.length} agents
            {hasFilters && " (filtered)"}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv}>
          <Download className="h-4 w-4 mr-1" /> Export CSV
        </Button>
        <Button asChild size="sm">
          <Link to="/admin/agents/new">
            <Plus className="h-4 w-4 mr-1" /> New Agent
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name or provider…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={ecoFilter} onValueChange={setEcoFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Ecosystem" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ecosystems</SelectItem>
            <SelectItem value="open_source">Open Source</SelectItem>
            <SelectItem value="startups">Startups</SelectItem>
            <SelectItem value="big_tech">Big Tech</SelectItem>
            <SelectItem value="china_ai">China AI</SelectItem>
          </SelectContent>
        </Select>
        <Select value={countryFilter} onValueChange={setCountryFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            {countries.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={ossFilter} onValueChange={setOssFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Open Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="yes">Open Source</SelectItem>
            <SelectItem value="no">Proprietary</SelectItem>
          </SelectContent>
        </Select>
        <Select value={missingFilter} onValueChange={setMissingFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Missing Fields" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">No Missing Filter</SelectItem>
            <SelectItem value="website">Missing Website</SelectItem>
            <SelectItem value="description">Missing Description</SelectItem>
            <SelectItem value="tagline">Missing Tagline</SelectItem>
            <SelectItem value="stars">Missing Stars</SelectItem>
            <SelectItem value="pricing">Missing Pricing</SelectItem>
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" /> Clear
          </Button>
        )}
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Ecosystem</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Language</TableHead>
                <TableHead className="text-right">Stars</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">
                    {a.name}
                    {a.is_open_source && (
                      <Badge variant="secondary" className="ml-2 text-xs">OSS</Badge>
                    )}
                  </TableCell>
                  <TableCell>{a.provider || "—"}</TableCell>
                  <TableCell>{ecoLabel[a.ecosystem] || a.ecosystem}</TableCell>
                  <TableCell>{a.country || "—"}</TableCell>
                  <TableCell>{a.primary_language || "—"}</TableCell>
                  <TableCell className="text-right">
                    {a.github_repos?.[0]?.stars?.toLocaleString() || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(a.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/admin/agents/${a.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(a.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No agents match the current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Agent?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this agent and all its relations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminAgentsList;
