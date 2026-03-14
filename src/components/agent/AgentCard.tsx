import { Link } from "react-router-dom";
import { Star, ExternalLink } from "lucide-react";
import { Agent } from "@/types/agent";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const pricingColors: Record<string, string> = {
  free: "bg-primary/15 text-primary border-primary/30",
  freemium: "bg-accent/15 text-accent border-accent/30",
  paid: "bg-secondary text-secondary-foreground border-border",
  enterprise: "bg-muted text-muted-foreground border-border",
};

const AgentCard = ({ agent }: { agent: Agent }) => (
  <motion.div
    whileHover={{ y: -4 }}
    transition={{ duration: 0.2 }}
  >
    <Link
      to={`/agents/${agent.slug}`}
      className="block glass rounded-xl p-6 hover:border-primary/30 transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <span className="font-mono font-bold text-primary text-sm">
            {agent.name.substring(0, 2).toUpperCase()}
          </span>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full border ${pricingColors[agent.pricing]}`}>
          {agent.pricing}
        </span>
      </div>

      <h3 className="font-display font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
        {agent.name}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{agent.tagline}</p>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-primary text-primary" />
          <span className="text-sm font-medium">{agent.rating}</span>
        </div>
        <span className="text-xs text-muted-foreground">({agent.reviewCount} reviews)</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {agent.tags.slice(0, 3).map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>
    </Link>
  </motion.div>
);

export default AgentCard;
