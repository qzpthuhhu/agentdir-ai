import { useParams, Link } from "react-router-dom";
import { agents } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ExternalLink, ArrowLeft } from "lucide-react";

const AgentDetailPage = () => {
  const { slug } = useParams();
  const agent = agents.find((a) => a.slug === slug);

  if (!agent) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground text-lg">Agent not found.</p>
        <Link to="/agents"><Button variant="ghost" className="mt-4">Back to agents</Button></Link>
      </div>
    );
  }

  return (
    <div className="container py-12 max-w-4xl">
      <Link to="/agents" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="h-4 w-4" /> Back to agents
      </Link>

      <div className="glass rounded-2xl p-8 md:p-12">
        <div className="flex items-start gap-6 mb-8">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
            <span className="font-mono font-bold text-primary text-2xl">
              {agent.name.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">{agent.name}</h1>
            <p className="text-lg text-muted-foreground">{agent.tagline}</p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="font-medium">{agent.rating}</span>
                <span className="text-sm text-muted-foreground">({agent.reviewCount} reviews)</span>
              </div>
              <Badge variant="outline">{agent.pricing}</Badge>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <div>
              <h2 className="font-display font-semibold text-xl mb-3">About</h2>
              <p className="text-muted-foreground leading-relaxed">{agent.description}</p>
            </div>
            <div>
              <h2 className="font-display font-semibold text-xl mb-3">Features</h2>
              <ul className="space-y-2">
                {agent.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-display font-semibold text-xl mb-3">Use Cases</h2>
              <div className="flex flex-wrap gap-2">
                {agent.useCases.map((uc) => (
                  <Badge key={uc} variant="secondary">{uc}</Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Button className="w-full gap-2">
              <ExternalLink className="h-4 w-4" /> Visit Website
            </Button>
            <div className="glass rounded-xl p-5 space-y-3">
              <h3 className="font-semibold text-sm">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {agent.tags.map((tag) => (
                  <Link key={tag} to={`/tags/${tag}`}>
                    <Badge variant="outline" className="cursor-pointer hover:border-primary/40">{tag}</Badge>
                  </Link>
                ))}
              </div>
            </div>
            <div className="glass rounded-xl p-5">
              <h3 className="font-semibold text-sm mb-2">Category</h3>
              <Link to={`/categories/${agent.category}`} className="text-primary text-sm hover:underline">
                {agent.category}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDetailPage;
