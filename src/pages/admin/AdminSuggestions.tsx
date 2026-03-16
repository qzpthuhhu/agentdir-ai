import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Sparkles, Loader2, AlertTriangle, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useState, useMemo } from "react";

const AdminSuggestions = () => {
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState(false);

  const { data: agents = [] } = useQuery({
    queryKey: ["admin-suggestions-agents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agents")
        .select("id, name, slug, provider, website_url, description, tagline, ecosystem, country, primary_language, github_url, is_open_source, pricing, github_repos(stars)")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  // Detect possible duplicates (same provider + similar name)
  const duplicates = useMemo(() => {
    const dupes: { a: typeof agents[0]; b: typeof agents[0] }[] = [];
    for (let i = 0; i < agents.length; i++) {
      for (let j = i + 1; j < agents.length; j++) {
        const a = agents[i];
        const b = agents[j];
        const nameA = a.name.toLowerCase().replace(/[^a-z0-9]/g, "");
        const nameB = b.name.toLowerCase().replace(/[^a-z0-9]/g, "");
        // Check if names are very similar
        if (
          nameA === nameB ||
          nameA.includes(nameB) ||
          nameB.includes(nameA) ||
          (a.provider && b.provider && a.provider === b.provider && levenshtein(nameA, nameB) <= 3)
        ) {
          dupes.push({ a, b });
        }
      }
    }
    return dupes;
  }, [agents]);

  // Agents that could use metadata refresh
  const staleAgents = useMemo(() => {
    return agents.filter((a) => {
      let issues = 0;
      if (!a.description) issues++;
      if (!a.tagline) issues++;
      if (!a.website_url) issues++;
      if (!a.country) issues++;
      if (a.is_open_source && !a.github_repos?.[0]?.stars) issues++;
      return issues >= 2;
    });
  }, [agents]);

  // Well-known agents not in DB
  const knownAgents = useMemo(() => {
    const wellKnown = [
      "SWE-Agent", "Devin", "Sweep", "Mentat", "Tabby", "Continue", "Cody",
      "Copilot Workspace", "Replit Agent", "Bolt.new", "v0", "Windsurf",
      "Tabnine", "Codeium", "Amazon CodeWhisperer", "Bard", "Pi", "Poe",
      "Character.ai", "Jasper", "Copy.ai", "Writesonic", "Stability AI",
      "Midjourney", "DALL-E", "Suno", "ElevenLabs", "Runway",
      "Harvey AI", "Glean", "Dust", "Fixie", "LangSmith",
    ];
    const existingNames = new Set(agents.map((a) => a.name.toLowerCase()));
    const existingSlugs = new Set(agents.map((a) => a.slug.toLowerCase()));
    return wellKnown.filter((name) => {
      const lower = name.toLowerCase();
      const slug = lower.replace(/[^a-z0-9]+/g, "-");
      return !existingNames.has(lower) && !existingSlugs.has(slug);
    });
  }, [agents]);

  return (
    <div className="container py-10 max-w-6xl">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/ops"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold font-display">Suggestions</h1>
          <p className="text-sm text-muted-foreground">AI-assisted maintenance recommendations — all require human review</p>
        </div>
      </div>

      <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
        <p className="text-sm text-muted-foreground">
          All suggestions are recommendations only. Nothing is auto-published. Use the action buttons to navigate to the relevant edit page.
        </p>
      </div>

      <Tabs defaultValue="missing">
        <TabsList className="mb-4">
          <TabsTrigger value="missing">
            Missing Agents <Badge variant="secondary" className="ml-1">{knownAgents.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="duplicates">
            Possible Duplicates <Badge variant="secondary" className="ml-1">{duplicates.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="stale">
            Needs Update <Badge variant="secondary" className="ml-1">{staleAgents.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="missing">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Well-Known Agents Not in Database</CardTitle>
              <CardDescription>These popular AI agents may be missing from your directory. Add them via /admin/ops URL ingestion.</CardDescription>
            </CardHeader>
            <CardContent>
              {knownAgents.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4 text-center">Great coverage — no known missing agents!</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {knownAgents.map((name) => (
                    <Badge key={name} variant="outline" className="text-sm py-1 px-3">
                      {name}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="duplicates">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Possible Duplicate Entries</CardTitle>
              <CardDescription>Agents with similar names or same provider that may be duplicates.</CardDescription>
            </CardHeader>
            <CardContent>
              {duplicates.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4 text-center">No duplicates detected.</p>
              ) : (
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Agent A</TableHead>
                        <TableHead>Agent B</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {duplicates.map(({ a, b }, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{a.name}</TableCell>
                          <TableCell className="font-medium">{b.name}</TableCell>
                          <TableCell>{a.provider || b.provider || "—"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="sm" asChild>
                                <Link to={`/admin/agents/${a.id}/edit`}>Edit A</Link>
                              </Button>
                              <Button variant="ghost" size="sm" asChild>
                                <Link to={`/admin/agents/${b.id}/edit`}>Edit B</Link>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stale">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Agents Needing Metadata Refresh</CardTitle>
              <CardDescription>These agents have 2+ missing fields and could benefit from a data update.</CardDescription>
            </CardHeader>
            <CardContent>
              {staleAgents.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4 text-center">All agents have good data coverage.</p>
              ) : (
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Missing</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {staleAgents.map((a) => {
                        const missing: string[] = [];
                        if (!a.description) missing.push("desc");
                        if (!a.tagline) missing.push("tagline");
                        if (!a.website_url) missing.push("website");
                        if (!a.country) missing.push("country");
                        if (a.is_open_source && !a.github_repos?.[0]?.stars) missing.push("stars");
                        return (
                          <TableRow key={a.id}>
                            <TableCell className="font-medium">{a.name}</TableCell>
                            <TableCell>{a.provider || "—"}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {missing.map((m) => (
                                  <Badge key={m} variant="destructive" className="text-xs">{m}</Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" asChild>
                                <Link to={`/admin/agents/${a.id}/edit`}>Edit</Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Simple Levenshtein for duplicate detection
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

export default AdminSuggestions;
