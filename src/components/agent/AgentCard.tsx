import { Link } from "react-router-dom";
import { Agent } from "@/types/agent";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const langColors: Record<string, string> = {
  Python: "bg-[hsl(210,60%,50%)]",
  TypeScript: "bg-[hsl(210,80%,55%)]",
  JavaScript: "bg-[hsl(50,80%,50%)]",
  Go: "bg-[hsl(192,70%,50%)]",
  Rust: "bg-[hsl(20,70%,50%)]",
};

const ecosystemLabels: Record<string, string> = {
  "open-source": "Open Source",
  "startup": "Startup",
  "big-tech": "Big Tech",
  "china-ai": "China AI",
};

// Format GitHub stars with k/M suffix
function formatStars(stars: number | undefined): string {
  if (stars === undefined || stars === null) return "—";
  if (stars >= 1_000_000) {
    return (stars / 1_000_000).toFixed(1) + "M";
  }
  if (stars >= 1_000) {
    return (stars / 1_000).toFixed(1) + "k";
  }
  return stars.toString();
}

const AgentCard = ({ agent }: { agent: Agent }) => {
  const isOpenSource = agent.isOpenSource;

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <Link
        to={`/agents/${agent.slug}`}
        className="block glass rounded-xl p-6 hover:border-primary/40 transition-all group h-full"
      >
        {/* Header: Logo + Badges */}
        <div className="flex items-start justify-between mb-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-border/50">
            <span className="font-mono font-bold text-primary text-lg">
              {agent.name.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            {isOpenSource ? (
              <span className="text-xs px-2.5 py-1 rounded-full border font-medium bg-primary/15 text-primary border-primary/30">
                Open Source
              </span>
            ) : (
              <span className={`text-xs px-2.5 py-1 rounded-full border font-medium bg-accent/15 text-accent border-accent/30`}>
                {ecosystemLabels[agent.ecosystem]}
              </span>
            )}
          </div>
        </div>

        {/* Name + Description */}
        <h3 className="font-display font-semibold text-lg mb-1.5 group-hover:text-primary transition-colors leading-tight">
          {agent.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{agent.tagline}</p>

        {/* Metadata row - different for open source vs commercial */}
        <div className="flex flex-col gap-1.5 mb-4">
          {/* Provider / Author */}
          <span className="text-sm font-medium text-foreground">{agent.provider || "—"}</span>
          
          {isOpenSource ? (
            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                GitHub <span className="text-primary">★</span> {agent.githubUrl ? formatStars(agent.githubStars) : "—"}
              </span>
              <span className="flex items-center gap-1.5">
                {agent.language ? (
                  <>
                    <div className={`h-2 w-2 rounded-full ${langColors[agent.language] || "bg-muted-foreground"}`} />
                    {agent.language}
                  </>
                ) : (
                  "—"
                )}
              </span>
            </div>
          ) : (
            /* Commercial: Pricing + Ecosystem */
            <div className="flex items-center gap-3 text-xs">
              <span className="text-muted-foreground capitalize">{agent.pricing}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">{ecosystemLabels[agent.ecosystem]}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {agent.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs font-normal">
              {tag}
            </Badge>
          ))}
        </div>
      </Link>
    </motion.div>
  );
};

export default AgentCard;
