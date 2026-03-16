import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, AlertTriangle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMemo } from "react";

interface AgentRow {
  id: string;
  name: string;
  slug: string;
  provider: string | null;
  website_url: string | null;
  description: string | null;
  tagline: string | null;
  pricing: string;
  ecosystem: string;
  country: string | null;
  primary_language: string | null;
  github_url: string | null;
  is_open_source: boolean;
  github_repos: { stars: number | null }[];
  agent_to_types: { type_id: string }[];
  agent_to_architectures: { architecture_id: string }[];
  agent_to_domains: { domain_id: string }[];
}

type MissingField = "website" | "description" | "tagline" | "stars" | "taxonomy" | "country" | "language";

const AdminQuality = () => {
  const { data: agents = [], isLoading } = useQuery({
    queryKey: ["admin-quality-agents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agents")
        .select("id, name, slug, provider, website_url, description, tagline, pricing, ecosystem, country, primary_language, github_url, is_open_source, github_repos(stars), agent_to_types(type_id), agent_to_architectures(architecture_id), agent_to_domains(domain_id)")
        .order("name");
      if (error) throw error;
      return data as unknown as AgentRow[];
    },
  });

  const checks = useMemo(() => {
    const missing: Record<MissingField, AgentRow[]> = {
      website: [],
      description: [],
      tagline: [],
      stars: [],
      taxonomy: [],
      country: [],
      language: [],
    };
    const incomplete: AgentRow[] = [];

    for (const a of agents) {
      let issues = 0;
      if (!a.website_url) { missing.website.push(a); issues++; }
      if (!a.description) { missing.description.push(a); issues++; }
      if (!a.tagline) { missing.tagline.push(a); issues++; }
      if (!a.github_repos?.[0]?.stars && a.is_open_source) { missing.stars.push(a); issues++; }
      if (!a.country) { missing.country.push(a); issues++; }
      if (!a.primary_language) { missing.language.push(a); issues++; }
      const hasTaxonomy = (a.agent_to_types?.length > 0) || (a.agent_to_architectures?.length > 0) || (a.agent_to_domains?.length > 0);
      if (!hasTaxonomy) { missing.taxonomy.push(a); issues++; }
      if (issues >= 2) incomplete.push(a);
    }
    return { missing, incomplete };
  }, [agents]);

  const labels: Record<MissingField, string> = {
    website: "Missing Website",
    description: "Missing Description",
    tagline: "Missing Tagline",
    stars: "Missing Stars (OSS)",
    taxonomy: "No Taxonomy",
    country: "Missing Country",
    language: "Missing Language",
  };

  const AgentTable = ({ list }: { list: AgentRow[] }) => (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>Ecosystem</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.map((a) => (
            <TableRow key={a.id}>
              <TableCell className="font-medium">{a.name}</TableCell>
              <TableCell>{a.provider || "—"}</TableCell>
              <TableCell>{a.ecosystem}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/admin/agents/${a.id}/edit`}>Edit</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {list.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                <CheckCircle className="h-5 w-5 inline mr-2" />All good — no issues here.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="container py-10 max-w-6xl">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/ops"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold font-display">Data Quality</h1>
          <p className="text-sm text-muted-foreground">{agents.length} agents analyzed</p>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Analyzing…</p>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {(Object.entries(checks.missing) as [MissingField, AgentRow[]][]).map(([key, list]) => (
              <Card key={key}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{labels[key]}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {list.length > 0 ? (
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    <span className="text-2xl font-bold">{list.length}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Incomplete (2+ issues)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {checks.incomplete.length > 0 ? (
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  <span className="text-2xl font-bold">{checks.incomplete.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detail tabs */}
          <Tabs defaultValue="incomplete">
            <TabsList className="mb-4">
              <TabsTrigger value="incomplete">
                Incomplete <Badge variant="secondary" className="ml-1">{checks.incomplete.length}</Badge>
              </TabsTrigger>
              {(Object.entries(checks.missing) as [MissingField, AgentRow[]][])
                .filter(([, list]) => list.length > 0)
                .map(([key, list]) => (
                  <TabsTrigger key={key} value={key}>
                    {labels[key].replace("Missing ", "")} <Badge variant="secondary" className="ml-1">{list.length}</Badge>
                  </TabsTrigger>
                ))}
            </TabsList>
            <TabsContent value="incomplete">
              <AgentTable list={checks.incomplete} />
            </TabsContent>
            {(Object.entries(checks.missing) as [MissingField, AgentRow[]][]).map(([key, list]) => (
              <TabsContent key={key} value={key}>
                <AgentTable list={list} />
              </TabsContent>
            ))}
          </Tabs>
        </>
      )}
    </div>
  );
};

export default AdminQuality;
