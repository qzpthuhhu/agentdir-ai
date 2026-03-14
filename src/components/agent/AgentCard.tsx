import { Link } from "react-router-dom";
import { Star, GitFork } from "lucide-react";
import { Agent } from "@/types/agent";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const pricingColors: Record<string, string> = {
  free: "bg-primary/15 text-primary border-primary/30",
  freemium: "bg-accent/15 text-accent border-accent/30",
  paid: "bg-secondary text-secondary-foreground border-border",
  enterprise: "bg-muted text-muted-foreground border-border",
};

const langColors: Record<string, string> = {
  Python: "bg-[hsl(210,60%,50%)]",
  TypeScript: "bg-[hsl(210,80%,55%)]",
  JavaScript: "bg-[hsl(50,80%,50%)]",
  Go: "bg-[hsl(192,70%,50%)]",
  Rust: "bg-[hsl(20,70%,50%)]",
};

const AgentCard = ({ agent }: { agent: Agent }) => (
  <motion.div
    whileHover={{ y: -6, scale: 1.02 }}
    transition={{ duration: 0.2, ease: "easeOut" }}
  >
    <Link
      to={`/agents/${agent.slug}`}
      className="block glass rounded-xl p-6 hover:border-primary/40 transition-all group h-full"
    >
      {/* Header: Logo + Pricing */}
      <div className="flex items-start justify-between mb-5">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-border/50">
          <span className="font-mono font-bold text-primary text-lg">
            {agent.name.substring(0, 2).toUpperCase()}
          </span>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${pricingColors[agent.pricing]}`}>
          {agent.pricing}
        </span>
      </div>

      {/* Name + Description */}
      <h3 className="font-display font-semibold text-lg mb-1.5 group-hover:text-primary transition-colors leading-tight">
        {agent.name}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{agent.tagline}</p>

      {/* Stats row: Rating + GitHub Stars + Language */}
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-primary text-primary" />
          <span className="text-sm font-semibold">{agent.rating}</span>
          <span className="text-xs text-muted-foreground">({agent.reviewCount.toLocaleString()})</span>
        </div>
        {agent.githubStars && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <GitFork className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">{(agent.githubStars / 1000).toFixed(1)}k</span>
          </div>
        )}
        {agent.language && (
          <div className="flex items-center gap-1.5">
            <div className={`h-2.5 w-2.5 rounded-full ${langColors[agent.language] || "bg-muted-foreground"}`} />
            <span className="text-xs text-muted-foreground">{agent.language}</span>
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

export default AgentCard;
