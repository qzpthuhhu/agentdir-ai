import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { agents, categories } from "@/lib/mock-data";
import AgentCard from "@/components/agent/AgentCard";
import CategoryBadge from "@/components/agent/CategoryBadge";
import SearchBar from "@/components/search/SearchBar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useI18n } from "@/i18n/context";

const Index = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { t } = useI18n();
  const featured = agents.slice(0, 4);
  const trending = agents.sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 3);

  const handleSearch = (val: string) => {
    setSearch(val);
    if (val.length > 2) navigate(`/search?q=${encodeURIComponent(val)}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-28 md:py-44">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-accent/3 to-transparent" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px]" />
        <div className="container relative z-10 text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 text-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">{t("hero.badge")}</span>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl md:text-8xl font-bold mb-6 leading-[1.05] tracking-tight">
              {t("hero.title1")}
              <br />
              <span className="gradient-text">{t("hero.title2")}</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
              {t("hero.subtitle")}
            </p>

            <div className="max-w-2xl mx-auto mb-10">
              <SearchBar value={search} onChange={handleSearch} placeholder={t("hero.searchPlaceholder")} />
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {categories.slice(0, 6).map((cat) => (
                <CategoryBadge key={cat.slug} slug={cat.slug} name={cat.name} />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trending Agents */}
      <section className="container py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-2 text-primary text-sm font-medium mb-3">
              <TrendingUp className="h-4 w-4" />
              <span>{t("featured.title")}</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold">{t("featured.title")}</h2>
            <p className="text-muted-foreground mt-2 max-w-lg">{t("featured.subtitle")}</p>
          </div>
          <Link to="/agents">
            <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground hidden sm:flex">
              {t("featured.viewAll")} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((agent, i) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
            >
              <AgentCard agent={agent} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container py-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">{t("categories.title")}</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">{t("categories.subtitle")}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link
                to={`/categories/${cat.slug}`}
                className="glass rounded-xl p-6 hover:border-primary/40 transition-all group block h-full"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-1.5 group-hover:text-primary transition-colors">{cat.name}</h3>
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{cat.description}</p>
                <span className="text-xs font-mono text-primary">{cat.agentCount} agents →</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
