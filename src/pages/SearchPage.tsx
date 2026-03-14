import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { agents, tags } from "@/lib/mock-data";
import AgentCard from "@/components/agent/AgentCard";
import SearchBar from "@/components/search/SearchBar";
import { Badge } from "@/components/ui/badge";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  const results = query.length > 0
    ? agents.filter((a) =>
        a.name.toLowerCase().includes(query.toLowerCase()) ||
        a.tagline.toLowerCase().includes(query.toLowerCase()) ||
        a.description.toLowerCase().includes(query.toLowerCase()) ||
        a.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  return (
    <div className="container py-12">
      <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Search</h1>
      <p className="text-muted-foreground mb-8">Find the perfect AI agent for your needs</p>

      <div className="max-w-2xl mb-8">
        <SearchBar value={query} onChange={setQuery} />
      </div>

      {!query && (
        <div className="mb-8">
          <p className="text-sm text-muted-foreground mb-3">Popular tags:</p>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag.slug}
                variant="outline"
                className="cursor-pointer hover:border-primary/40"
                onClick={() => setQuery(tag.name.toLowerCase())}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {query && (
        <p className="text-sm text-muted-foreground mb-6">
          {results.length} result{results.length !== 1 ? "s" : ""} for "{query}"
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {results.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
};

export default SearchPage;
