import { agents, categories } from "@/lib/mock-data";
import AgentCard from "@/components/agent/AgentCard";
import { useState } from "react";
import SearchBar from "@/components/search/SearchBar";
import { useI18n } from "@/i18n/context";

const AgentsPage = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { t } = useI18n();

  const filtered = agents.filter((a) => {
    const matchesSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.tagline.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !activeCategory || a.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="container py-12">
      <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">{t("agents.title")}</h1>
      <p className="text-muted-foreground mb-8">{t("agents.subtitle")}</p>

      <div className="max-w-lg mb-6">
        <SearchBar value={search} onChange={setSearch} />
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActiveCategory(null)}
          className={`text-xs px-3.5 py-1.5 rounded-full border transition-colors font-medium ${!activeCategory ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"}`}
        >
          {t("agents.all")}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setActiveCategory(cat.slug)}
            className={`text-xs px-3.5 py-1.5 rounded-full border transition-colors font-medium ${activeCategory === cat.slug ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg">{t("agents.noResults")}</p>
        </div>
      )}
    </div>
  );
};

export default AgentsPage;
