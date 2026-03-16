import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAgent } from "@/hooks/use-agents";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, ArrowLeft } from "lucide-react";
import { useI18n } from "@/i18n/context";
import AgentReviews from "@/components/agent/AgentReviews";
import AuthModal from "@/components/auth/AuthModal";

function formatStars(stars: number | undefined): string {
  if (!stars) return "0";
  if (stars >= 1_000_000) return (stars / 1_000_000).toFixed(1) + "M";
  if (stars >= 1_000) return (stars / 1_000).toFixed(1) + "k";
  return stars.toString();
}

const AgentDetailPage = () => {
  const { slug } = useParams();
  const { t } = useI18n();
  const { data: agent, isLoading } = useAgent(slug);
  const [authOpen, setAuthOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground text-lg">Loading...</p>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground text-lg">{t("detail.notFound")}</p>
        <Link to="/agents"><Button variant="ghost" className="mt-4">{t("detail.back")}</Button></Link>
      </div>
    );
  }

  return (
    <div className="container py-12 max-w-4xl">
      <Link to="/agents" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" /> {t("detail.back")}
      </Link>

      <div className="glass rounded-2xl p-8 md:p-12">
        <div className="flex items-start gap-6 mb-8">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0 border border-border/50">
            <span className="font-mono font-bold text-primary text-2xl">
              {agent.name.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">{agent.name}</h1>
            <p className="text-lg text-muted-foreground">{agent.tagline}</p>
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              {agent.isOpenSource && agent.githubStars && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <span className="text-sm font-medium">GitHub <span className="text-amber-500">★</span> {formatStars(agent.githubStars)}</span>
                </div>
              )}
              {agent.isOpenSource && agent.license && (
                <Badge variant="outline">{agent.license}</Badge>
              )}
              {agent.isOpenSource && agent.language && (
                <Badge variant="secondary">{agent.language}</Badge>
              )}
              {!agent.isOpenSource && (
                <Badge variant="outline">{agent.pricing}</Badge>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <div>
              <h2 className="font-display font-semibold text-xl mb-3">{t("detail.about")}</h2>
              <p className="text-muted-foreground leading-relaxed">{agent.description}</p>
            </div>
            <div>
              <h2 className="font-display font-semibold text-xl mb-3">{t("detail.features")}</h2>
              <ul className="space-y-2.5">
                {agent.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-display font-semibold text-xl mb-3">{t("detail.useCases")}</h2>
              <div className="flex flex-wrap gap-2">
                {agent.useCases.map((uc) => (
                  <Badge key={uc} variant="secondary">{uc}</Badge>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <AgentReviews agentId={agent.id} onAuthRequired={() => setAuthOpen(true)} />
          </div>

          <div className="space-y-4">
            <Button className="w-full gap-2 glow-primary" asChild>
              <a href={agent.website} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" /> {t("detail.visitWebsite")}
              </a>
            </Button>
            <div className="glass rounded-xl p-5 space-y-3">
              <h3 className="font-semibold text-sm">{t("detail.tags")}</h3>
              <div className="flex flex-wrap gap-2">
                {agent.tags.map((tag) => (
                  <Link key={tag} to={`/tags/${tag}`}>
                    <Badge variant="outline" className="cursor-pointer hover:border-primary/40 transition-colors">{tag}</Badge>
                  </Link>
                ))}
              </div>
            </div>
            <div className="glass rounded-xl p-5">
              <h3 className="font-semibold text-sm mb-2">{t("detail.category")}</h3>
              <Link to={`/categories/${agent.category}`} className="text-primary text-sm hover:underline">
                {agent.category}
              </Link>
            </div>
          </div>
        </div>
      </div>
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
};

export default AgentDetailPage;
