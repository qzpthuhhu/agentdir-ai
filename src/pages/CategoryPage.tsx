import { useParams, Link } from "react-router-dom";
import { useAgents, categories } from "@/hooks/use-agents";
import AgentCard from "@/components/agent/AgentCard";
import { ArrowLeft } from "lucide-react";
import { useI18n } from "@/i18n/context";
import { useMemo } from "react";

const CategoryPage = () => {
  const { slug } = useParams();
  const { t } = useI18n();
  const category = categories.find((c) => c.slug === slug);
  const { data: agents = [] } = useAgents();
  const categoryAgents = useMemo(() => agents.filter((a) => a.category === slug), [agents, slug]);

  return (
    <div className="container py-12">
      <Link to="/agents" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> {t("detail.back")}
      </Link>
      <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
        {category?.name || slug}
      </h1>
      <p className="text-muted-foreground mb-8">{category?.description || `Agents in the ${slug} category`}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categoryAgents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>

      {categoryAgents.length === 0 && (
        <p className="text-center py-20 text-muted-foreground">{t("agents.noResults")}</p>
      )}
    </div>
  );
};

export default CategoryPage;
