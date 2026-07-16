import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import AuthModal from "@/components/auth/AuthModal";

// Local typed wrapper for the beta supabase.auth.oauth namespace.
type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<{ data: any; error: any }>;
  approveAuthorization: (id: string) => Promise<{ data: any; error: any }>;
  denyAuthorization: (id: string) => Promise<{ data: any; error: any }>;
};
const oauth = (supabase.auth as unknown as { oauth: OAuthApi }).oauth;

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const { user, loading: authLoading } = useAuth();
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!authorizationId) {
      setError("Missing authorization_id");
      return;
    }
    if (!user) {
      setAuthOpen(true);
      return;
    }
    let active = true;
    (async () => {
      try {
        const { data, error } = await oauth.getAuthorizationDetails(authorizationId);
        if (!active) return;
        if (error) {
          setError(error.message || "Could not load this authorization request.");
          return;
        }
        const immediate = data?.redirect_url ?? data?.redirect_to;
        if (immediate && !data?.client) {
          window.location.href = immediate;
          return;
        }
        setDetails(data);
      } catch (e: any) {
        if (active) setError(e?.message || "Unexpected error");
      }
    })();
    return () => {
      active = false;
    };
  }, [authorizationId, user, authLoading]);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    try {
      const { data, error } = approve
        ? await oauth.approveAuthorization(authorizationId)
        : await oauth.denyAuthorization(authorizationId);
      if (error) {
        setError(error.message || "Failed to complete authorization.");
        setBusy(false);
        return;
      }
      const target = data?.redirect_url ?? data?.redirect_to;
      if (!target) {
        setError("No redirect returned by the authorization server.");
        setBusy(false);
        return;
      }
      window.location.href = target;
    } catch (e: any) {
      setError(e?.message || "Unexpected error");
      setBusy(false);
    }
  }

  if (authLoading) {
    return <main className="max-w-lg mx-auto py-16 px-4">Loading…</main>;
  }

  if (!user) {
    return (
      <main className="max-w-lg mx-auto py-16 px-4">
        <Card className="p-6 space-y-4">
          <h1 className="text-xl font-semibold">Sign in to continue</h1>
          <p className="text-muted-foreground text-sm">
            You need to sign in to AgentDir before authorizing this connection.
          </p>
          <Button onClick={() => setAuthOpen(true)}>Sign in</Button>
        </Card>
        <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-lg mx-auto py-16 px-4">
        <Card className="p-6 space-y-3">
          <h1 className="text-xl font-semibold">Authorization error</h1>
          <p className="text-sm text-muted-foreground break-words">{error}</p>
        </Card>
      </main>
    );
  }

  if (!details) {
    return <main className="max-w-lg mx-auto py-16 px-4">Loading authorization…</main>;
  }

  const clientName = details.client?.name ?? details.client?.client_name ?? "an app";
  const redirectUri = details.client?.redirect_uri ?? details.redirect_uri ?? "";
  const scopes: string[] = Array.isArray(details.scopes)
    ? details.scopes
    : typeof details.scope === "string"
      ? details.scope.split(" ").filter(Boolean)
      : [];

  return (
    <main className="max-w-lg mx-auto py-16 px-4">
      <Card className="p-6 space-y-5">
        <div>
          <h1 className="text-2xl font-semibold">Connect {clientName} to AgentDir</h1>
          <p className="text-sm text-muted-foreground mt-1">
            This lets {clientName} use AgentDir as you ({user.email}).
          </p>
        </div>

        <div className="text-sm space-y-2">
          <div>
            <span className="font-medium">Signed in as:</span>{" "}
            <span className="text-muted-foreground">{user.email}</span>
          </div>
          {redirectUri && (
            <div className="break-all">
              <span className="font-medium">Redirect:</span>{" "}
              <span className="text-muted-foreground">{redirectUri}</span>
            </div>
          )}
          {scopes.length > 0 && (
            <div>
              <span className="font-medium">Requested access:</span>
              <ul className="list-disc list-inside text-muted-foreground mt-1">
                {scopes.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-xs text-muted-foreground pt-2">
            {clientName} will be able to call AgentDir's tools while you are signed in. This does
            not bypass AgentDir's permissions or backend policies.
          </p>
        </div>

        <div className="flex gap-3">
          <Button onClick={() => decide(true)} disabled={busy} className="flex-1">
            {busy ? "Working…" : "Approve"}
          </Button>
          <Button onClick={() => decide(false)} disabled={busy} variant="outline" className="flex-1">
            Cancel connection
          </Button>
        </div>
      </Card>
    </main>
  );
}
