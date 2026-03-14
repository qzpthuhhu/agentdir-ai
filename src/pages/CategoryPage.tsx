import { useParams, Link } from "react-router-dom";
import { agents, categories } from "@/lib/mock-data";
import AgentCard from "@/components/agent/AgentCard";
import { ArrowLeft } from "lucide-react";

const CategoryPage = () => {
  const { slug } = useParams();
  const category = categories.find((c) => c.slug === slug);
  const categoryAgents = agents.filter((a) => a.category === slug);

  return (
    <div className="container py-12">
      <Link to="/agents" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
        {category?.name || slug}
      </h1>
      <p className="text-muted-foreground mb-8">{category?.description || `Agents in the ${slug} category`}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {categoryAgents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>

      {categoryAgents.length === 0 && (
        <p className="text-center py-20 text-muted-foreground">No agents in this category yet.</p>
      )}
    </div>
  );
};

export default CategoryPage;
