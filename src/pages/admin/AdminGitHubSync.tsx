import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, Loader2, CheckCircle, XCircle, Clock, GitBranch, Star, GitFork } from "lucide-react";

const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

export default function AdminGitHubSync() {
  const queryClient = useQueryClient();

  const { data: logs, isLoading } = useQuery({
    queryKey: ["github-sync-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("github_sync_logs")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      const resp = await fetch(`${FUNCTIONS_URL}/sync-github-stats`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ trigger_type: "manual" }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Sync failed" }));
        throw new Error(err.error || "Sync failed");
      }
      return resp.json();
    },
    onSuccess: (data) => {
      toast({ title: "GitHub Sync Complete", description: `Updated ${data.updated}/${data.total} repos, ${data.failed} failed` });
      queryClient.invalidateQueries({ queryKey: ["github-sync-logs"] });
    },
    onError: (err: Error) => {
      toast({ title: "Sync Failed", description: err.message, variant: "destructive" });
      queryClient.invalidateQueries({ queryKey: ["github-sync-logs"] });
    },
  });

  const statusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed": return <XCircle className="h-4 w-4 text-destructive" />;
      case "running": return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500/20 text-green-400";
      case "failed": return "bg-destructive/20 text-destructive";
      case "running": return "bg-primary/20 text-primary";
      default: return "bg-muted text-muted-foreground";
    }
  };

  // Find current running job
  const isRunning = logs?.some((l: any) => l.status === "running") || syncMutation.isPending;
  const lastCompleted = logs?.find((l: any) => l.status === "completed");

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <Link to="/admin/ops" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <GitBranch className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">GitHub Stats Sync</h1>
          <p className="text-sm text-muted-foreground">
            Auto-syncs stars, forks, language & license from GitHub API. Runs every Sunday automatically.
          </p>
        </div>
      </div>

      {/* Summary Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Last successful sync</p>
              <p className="text-lg font-semibold">
                {lastCompleted
                  ? new Date(lastCompleted.completed_at).toLocaleString()
                  : "Never"}
              </p>
              {lastCompleted && (
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Star className="h-3 w-3" /> {lastCompleted.updated_repos} updated</span>
                  <span className="flex items-center gap-1"><GitFork className="h-3 w-3" /> {lastCompleted.total_repos} total</span>
                  {lastCompleted.failed_repos > 0 && (
                    <span className="text-destructive">{lastCompleted.failed_repos} failed</span>
                  )}
                </div>
              )}
            </div>
            <Button
              onClick={() => syncMutation.mutate()}
              disabled={isRunning}
              size="lg"
            >
              {isRunning ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Syncing...</>
              ) : (
                <><RefreshCw className="mr-2 h-4 w-4" /> Run Sync Now</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Info */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Schedule</CardTitle>
          <CardDescription>
            Automatic sync runs every <strong>Sunday at 00:00 UTC</strong> via cron job.
            You can also trigger a manual sync anytime using the button above.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sync History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !logs?.length ? (
            <p className="text-center text-muted-foreground py-8">No sync runs yet</p>
          ) : (
            <div className="space-y-3">
              {logs.map((log: any) => (
                <div key={log.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-3">
                    {statusIcon(log.status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={statusColor(log.status)}>
                          {log.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {log.trigger_type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(log.started_at).toLocaleString()}
                        {log.completed_at && (
                          <> — {Math.round((new Date(log.completed_at).getTime() - new Date(log.started_at).getTime()) / 1000)}s</>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    {log.status === "completed" && (
                      <span className="text-muted-foreground">
                        {log.updated_repos}/{log.total_repos} repos
                        {log.failed_repos > 0 && <span className="text-destructive ml-1">({log.failed_repos} failed)</span>}
                      </span>
                    )}
                    {log.error_message && (
                      <span className="text-destructive text-xs">{log.error_message.slice(0, 60)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
