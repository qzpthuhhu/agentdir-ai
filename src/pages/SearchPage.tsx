import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { agents, tags } from "@/lib/mock-data";
import AgentCard from "@/components/agent/AgentCard";
import SearchBar from "@/components/search/SearchBar";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n/context";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const { t } = useI18n();

  const results = query.length > 0
    ? agents.filter((a) =>
        a.name.toLowerCase().includes(query.toLowerCase()) ||
        a.tagline.toLowerCase().includes(query.toLowerCase()) ||
        a.description.toLowerCase().includes(query.toLowerCase()) ||
        a.tags.some((tg) => tg.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  return (
    <div className="container py-12">
      <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">{t("search.title")}</h1>
      <p className="text-muted-foreground mb-8">{t("search.subtitle")}</p>

      <div className="max-w-2xl mb-8">
        <SearchBar value={query} onChange={setQuery} />
      </div>

      {!query && (
        <div className="mb-8">
          <p className="text-sm text-muted-foreground mb-3">{t("search.popularTags")}</p>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag.slug}
                variant="outline"
                className="cursor-pointer hover:border-primary/40 transition-colors"
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
          {t("search.results", { count: results.length, query })}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {results.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
};

export default SearchPage;
