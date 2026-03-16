import { useQuery } from "@tanstack/react-query";
import { getCandidates } from "@/services/ops.service";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Eye } from "lucide-react";
import { useState } from "react";

const STATUS_FILTERS = ["all", "draft", "approved", "rejected", "published"] as const;

const AdminCandidates = () => {
  const [filter, setFilter] = useState<string>("all");
  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ["ops-candidates", filter],
    queryFn: () => getCandidates(filter === "all" ? undefined : filter),
  });

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

      <div className="flex gap-1.5 mb-6">
        {STATUS_FILTERS.map((s) => (
          <Button
            key={s}
            variant={filter === s ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(s)}
            className="capitalize"
          >
            {s}
          </Button>
        ))}
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
                <TableHead>Country</TableHead>
                <TableHead>Ecosystem</TableHead>
                <TableHead>Pricing</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.map((c: any) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.provider || "—"}</TableCell>
                  <TableCell>{c.country || "—"}</TableCell>
                  <TableCell className="capitalize">{c.ecosystem?.replace("_", " ") || "—"}</TableCell>
                  <TableCell className="capitalize">{c.pricing || "—"}</TableCell>
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
