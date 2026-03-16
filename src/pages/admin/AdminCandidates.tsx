import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCandidates, updateCandidate, addReviewAction, publishCandidate } from "@/services/ops.service";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Eye, CheckCircle, XCircle, Upload, Trash2, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const STATUS_FILTERS = ["all", "draft", "approved", "rejected", "published"] as const;

const AdminCandidates = () => {
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const queryClient = useQueryClient();

  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ["ops-candidates", filter],
    queryFn: () => getCandidates(filter === "all" ? undefined : filter),
  });

  const totalPages = Math.max(1, Math.ceil(candidates.length / pageSize));
  const pagedCandidates = useMemo(
    () => candidates.slice((page - 1) * pageSize, page * pageSize),
    [candidates, page, pageSize]
  );

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    const pageIds = pagedCandidates.map((c: any) => c.id);
    const allSelected = pageIds.every((id: string) => selected.has(id));
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        pageIds.forEach((id: string) => next.delete(id));
        return next;
      });
    } else {
      setSelected((prev) => new Set([...prev, ...pageIds]));
    }
  };

  const bulkAction = async (action: "approve" | "reject" | "publish" | "delete") => {
    if (selected.size === 0) return;
    setBulkLoading(true);
    let successCount = 0;
    let errorCount = 0;

    for (const id of selected) {
      try {
        if (action === "approve") {
          await updateCandidate(id, { status: "approved" });
          await addReviewAction(id, "approve", "Bulk approved");
        } else if (action === "reject") {
          await updateCandidate(id, { status: "rejected" });
          await addReviewAction(id, "reject", "Bulk rejected");
        } else if (action === "publish") {
          await publishCandidate(id);
        } else if (action === "delete") {
          const { supabase } = await import("@/integrations/supabase/client");
          await supabase.from("candidate_agents").delete().eq("id", id);
        }
        successCount++;
      } catch {
        errorCount++;
      }
    }

    toast.success(`${action}: ${successCount} succeeded, ${errorCount} failed`);
    setSelected(new Set());
    setBulkLoading(false);
    queryClient.invalidateQueries({ queryKey: ["ops-candidates"] });
  };

  return (
    <div className="container py-10 max-w-7xl">
      <Link to="/admin/ops" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Ops
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display">Candidates</h1>
          <p className="text-sm text-muted-foreground">{candidates.length} candidate records</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1.5">
          {STATUS_FILTERS.map((s) => (
            <Button
              key={s}
              variant={filter === s ? "default" : "outline"}
              size="sm"
              onClick={() => { setFilter(s); setPage(1); }}
              className="capitalize"
            >
              {s}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Rows per page</span>
          <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
            <SelectTrigger className="w-[70px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="30">30</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-2 mb-4 p-3 rounded-lg border border-primary/30 bg-primary/5">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <div className="flex gap-1.5 ml-auto">
            <Button size="sm" variant="outline" onClick={() => bulkAction("approve")} disabled={bulkLoading} className="gap-1">
              <CheckCircle className="h-3.5 w-3.5" /> Approve
            </Button>
            <Button size="sm" variant="outline" onClick={() => bulkAction("reject")} disabled={bulkLoading} className="gap-1 text-destructive hover:text-destructive">
              <XCircle className="h-3.5 w-3.5" /> Reject
            </Button>
            <Button size="sm" onClick={() => bulkAction("publish")} disabled={bulkLoading} className="gap-1 bg-green-600 hover:bg-green-700 text-white">
              {bulkLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} Publish
            </Button>
            <Button size="sm" variant="destructive" onClick={() => bulkAction("delete")} disabled={bulkLoading} className="gap-1">
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={candidates.length > 0 && selected.size === candidates.length}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Submitter</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.map((c: any) => (
                <TableRow key={c.id} className={selected.has(c.id) ? "bg-primary/5" : ""}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(c.id)}
                      onCheckedChange={() => toggleSelect(c.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.provider || "—"}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      c.submission_source === "user" ? "bg-accent/20 text-accent" :
                      c.submission_source === "auto_ingest" ? "bg-primary/20 text-primary" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {c.submission_source || "admin"}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {c.submitter_username || c.submitter_email || "—"}
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs font-mono ${(c.confidence_score || 0) >= 70 ? "text-green-400" : (c.confidence_score || 0) >= 40 ? "text-yellow-400" : "text-destructive"}`}>
                      {c.confidence_score || 0}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      c.status === "draft" ? "bg-accent/20 text-accent" :
                      c.status === "approved" ? "bg-primary/20 text-primary" :
                      c.status === "published" ? "bg-green-500/20 text-green-400" :
                      c.status === "rejected" ? "bg-destructive/20 text-destructive" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {c.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(c.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`/admin/review/${c.id}`}><Eye className="h-4 w-4" /></Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {candidates.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    No candidates found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminCandidates;
