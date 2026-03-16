import { useQuery } from "@tanstack/react-query";
import { getSources } from "@/services/ops.service";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, ExternalLink } from "lucide-react";

const AdminSources = () => {
  const { data: sources = [], isLoading } = useQuery({ queryKey: ["ops-sources"], queryFn: getSources });

  const typeLabel: Record<string, string> = {
    website: "Website",
    article: "Article",
    manual: "Manual",
    product: "Product Page",
  };

  return (
    <div className="container py-10 max-w-6xl">
      <Link to="/admin/ops" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Ops
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-display">Sources</h1>
          <p className="text-sm text-muted-foreground">{sources.length} source records</p>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fetched</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sources.map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">{s.title || "—"}</TableCell>
                  <TableCell>{typeLabel[s.source_type] || s.source_type}</TableCell>
                  <TableCell className="max-w-[250px] truncate">
                    {s.url ? (
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                        {new URL(s.url).hostname} <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : "—"}
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${s.status === "processed" ? "bg-green-500/20 text-green-400" : "bg-muted text-muted-foreground"}`}>
                      {s.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(s.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminSources;
