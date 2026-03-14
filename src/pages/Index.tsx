import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { agents, categories } from "@/lib/mock-data";
import AgentCard from "@/components/agent/AgentCard";
import CategoryBadge from "@/components/agent/CategoryBadge";
import SearchBar from "@/components/search/SearchBar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Index = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const featured = agents.slice(0, 4);

  const handleSearch = (val: string) => {
    setSearch(val);
    if (val.length > 2) navigate(`/search?q=${encodeURIComponent(val)}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-36">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl animate-pulse-glow" />
        <div className="container relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Discover 200+ AI Agents</span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Find the Perfect
              <br />
              <span className="gradient-text">AI Agent</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              The most comprehensive directory of AI agents. Compare features, read reviews, and find the right tool for every task.
            </p>
            <div className="max-w-xl mx-auto mb-8">
              <SearchBar value={search} onChange={handleSearch} />
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {categories.slice(0, 6).map((cat) => (
                <CategoryBadge key={cat.slug} slug={cat.slug} name={cat.name} />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Agents */}
      <section className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold">Featured Agents</h2>
            <p className="text-muted-foreground mt-1">Top-rated AI agents hand-picked by our team</p>
          </div>
          <Link to="/agents">
            <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
              View all <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featured.map((agent, i) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <AgentCard agent={agent} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container py-16">
        <h2 className="font-display text-2xl md:text-3xl font-bold mb-8">Browse by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/categories/${cat.slug}`}
              className="glass rounded-xl p-5 hover:border-primary/30 transition-all group"
            >
              <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">{cat.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{cat.description}</p>
              <span className="text-xs font-mono text-primary">{cat.agentCount} agents</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
