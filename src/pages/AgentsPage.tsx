import { agents, agentTypes, architectures, domains, ecosystems } from "@/lib/mock-data";
import AgentCard from "@/components/agent/AgentCard";
import { useState, useMemo } from "react";
import SearchBar from "@/components/search/SearchBar";
import { useI18n } from "@/i18n/context";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, SlidersHorizontal } from "lucide-react";
import type { AgentType, Architecture, Domain, Ecosystem } from "@/types/agent";

type BrowseMode = "type" | "architecture" | "domain";

const LANGUAGES = ["Python", "TypeScript", "JavaScript", "Go", "Rust"];

const AgentsPage = () => {
  const [search, setSearch] = useState("");
  const [browseMode, setBrowseMode] = useState<BrowseMode>("type");
  const [selectedTypes, setSelectedTypes] = useState<AgentType[]>([]);
  const [selectedArchitectures, setSelectedArchitectures] = useState<Architecture[]>([]);
  const [selectedDomains, setSelectedDomains] = useState<Domain[]>([]);
  const [selectedEcosystems, setSelectedEcosystems] = useState<Ecosystem[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [openSourceOnly, setOpenSourceOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const { t } = useI18n();

  const toggleItem = (arr: string[], item: string, setter: (v: any) => void) => {
    setter(arr.includes(item) ? arr.filter((i: string) => i !== item) : [...arr, item]);
  };

  const activeFilterCount = selectedTypes.length + selectedArchitectures.length + selectedDomains.length + selectedEcosystems.length + selectedLanguages.length + (openSourceOnly ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedTypes([]);
    setSelectedArchitectures([]);
    setSelectedDomains([]);
    setSelectedEcosystems([]);
    setSelectedLanguages([]);
    setOpenSourceOnly(false);
  };

  const filtered = useMemo(() => agents.filter((a) => {
    const matchesSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.tagline.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(a.agentType);
    const matchesArch = selectedArchitectures.length === 0 || a.architectures.some(ar => selectedArchitectures.includes(ar));
    const matchesDomain = selectedDomains.length === 0 || a.domains.some(d => selectedDomains.includes(d));
    const matchesEco = selectedEcosystems.length === 0 || selectedEcosystems.includes(a.ecosystem);
    const matchesLang = selectedLanguages.length === 0 || (a.language && selectedLanguages.includes(a.language));
    const matchesOS = !openSourceOnly || a.isOpenSource;
    return matchesSearch && matchesType && matchesArch && matchesDomain && matchesEco && matchesLang && matchesOS;
  }), [search, selectedTypes, selectedArchitectures, selectedDomains, selectedEcosystems, selectedLanguages, openSourceOnly]);

  const browseModes: { key: BrowseMode; label: string }[] = [
    { key: "type", label: t("browse.agentType") },
    { key: "architecture", label: t("browse.architecture") },
    { key: "domain", label: t("browse.domain") },
  ];

  const browseItems = browseMode === "type" ? agentTypes : browseMode === "architecture" ? architectures : domains;
  const browseSelected = browseMode === "type" ? selectedTypes : browseMode === "architecture" ? selectedArchitectures : selectedDomains;
  const browseToggle = (slug: string) => {
    if (browseMode === "type") toggleItem(selectedTypes, slug as AgentType, setSelectedTypes);
    else if (browseMode === "architecture") toggleItem(selectedArchitectures, slug as Architecture, setSelectedArchitectures);
    else toggleItem(selectedDomains, slug as Domain, setSelectedDomains);
  };

  return (
    <div className="container py-12">
      <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">{t("agents.title")}</h1>
      <p className="text-muted-foreground mb-8">{t("agents.subtitle")}</p>

      {/* Search */}
      <div className="max-w-2xl mb-6">
        <SearchBar value={search} onChange={setSearch} />
      </div>

      {/* Browse by selector */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-muted-foreground font-medium">{t("browse.browseBy")}:</span>
        <div className="flex gap-1">
          {browseModes.map(m => (
            <button
              key={m.key}
              onClick={() => setBrowseMode(m.key)}
              className={`text-xs px-3.5 py-1.5 rounded-full border transition-colors font-medium ${browseMode === m.key ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"}`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Browse category pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {browseItems.map((item) => (
          <button
            key={item.slug}
            onClick={() => browseToggle(item.slug)}
            className={`text-xs px-3.5 py-1.5 rounded-full border transition-colors font-medium ${
              browseSelected.includes(item.slug as any)
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
            }`}
            title={item.description}
          >
            {item.name}
          </button>
        ))}
      </div>

      <div className="flex gap-8">
        {/* Filter sidebar */}
        <aside className={`${showFilters ? "w-56 shrink-0" : "w-0 overflow-hidden"} transition-all hidden lg:block`}>
          <div className="sticky top-24 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                {t("browse.filters")}
              </h3>
              {activeFilterCount > 0 && (
                <button onClick={clearAllFilters} className="text-xs text-primary hover:underline">{t("browse.clearAll")}</button>
              )}
            </div>

            {/* Ecosystem */}
            <FilterSection title={t("browse.ecosystem")}>
              {ecosystems.map(e => (
                <FilterCheckbox key={e.slug} label={e.name} checked={selectedEcosystems.includes(e.slug)} onChange={() => toggleItem(selectedEcosystems, e.slug, setSelectedEcosystems)} count={e.agentCount} />
              ))}
            </FilterSection>

            {/* Agent Type */}
            <FilterSection title={t("browse.agentType")}>
              {agentTypes.slice(0, 6).map(at => (
                <FilterCheckbox key={at.slug} label={at.name} checked={selectedTypes.includes(at.slug)} onChange={() => toggleItem(selectedTypes, at.slug, setSelectedTypes)} />
              ))}
            </FilterSection>

            {/* Architecture */}
            <FilterSection title={t("browse.architecture")}>
              {architectures.slice(0, 6).map(ar => (
                <FilterCheckbox key={ar.slug} label={ar.name} checked={selectedArchitectures.includes(ar.slug)} onChange={() => toggleItem(selectedArchitectures, ar.slug, setSelectedArchitectures)} />
              ))}
            </FilterSection>

            {/* Language */}
            <FilterSection title={t("browse.language")}>
              {LANGUAGES.map(lang => (
                <FilterCheckbox key={lang} label={lang} checked={selectedLanguages.includes(lang)} onChange={() => toggleItem(selectedLanguages, lang, setSelectedLanguages)} />
              ))}
            </FilterSection>

            {/* Open Source */}
            <div className="flex items-center gap-2">
              <Checkbox id="os-filter" checked={openSourceOnly} onCheckedChange={(v) => setOpenSourceOnly(!!v)} />
              <Label htmlFor="os-filter" className="text-sm cursor-pointer">{t("browse.openSourceOnly")}</Label>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Active filters bar */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs text-muted-foreground">{t("browse.activeFilters")}:</span>
              {selectedEcosystems.map(e => <ActiveBadge key={e} label={ecosystems.find(x => x.slug === e)?.name || e} onRemove={() => toggleItem(selectedEcosystems, e, setSelectedEcosystems)} />)}
              {selectedTypes.map(t => <ActiveBadge key={t} label={agentTypes.find(x => x.slug === t)?.name || t} onRemove={() => toggleItem(selectedTypes, t, setSelectedTypes)} />)}
              {selectedArchitectures.map(a => <ActiveBadge key={a} label={architectures.find(x => x.slug === a)?.name || a} onRemove={() => toggleItem(selectedArchitectures, a, setSelectedArchitectures)} />)}
              {selectedDomains.map(d => <ActiveBadge key={d} label={domains.find(x => x.slug === d)?.name || d} onRemove={() => toggleItem(selectedDomains, d, setSelectedDomains)} />)}
              {selectedLanguages.map(l => <ActiveBadge key={l} label={l} onRemove={() => toggleItem(selectedLanguages, l, setSelectedLanguages)} />)}
              {openSourceOnly && <ActiveBadge label="Open Source" onRemove={() => setOpenSourceOnly(false)} />}
            </div>
          )}

          <p className="text-sm text-muted-foreground mb-4">{filtered.length} {t("browse.agentsFound")}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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
      </div>
    </div>
  );
};

const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{title}</h4>
    <div className="space-y-2">{children}</div>
  </div>
);

const FilterCheckbox = ({ label, checked, onChange, count }: { label: string; checked: boolean; onChange: () => void; count?: number }) => (
  <div className="flex items-center gap-2">
    <Checkbox id={`filter-${label}`} checked={checked} onCheckedChange={onChange} />
    <Label htmlFor={`filter-${label}`} className="text-sm cursor-pointer flex-1">{label}</Label>
    {count !== undefined && <span className="text-xs text-muted-foreground">{count}</span>}
  </div>
);

const ActiveBadge = ({ label, onRemove }: { label: string; onRemove: () => void }) => (
  <Badge variant="secondary" className="gap-1 pr-1 text-xs">
    {label}
    <button onClick={onRemove} className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10 transition-colors"><X className="h-3 w-3" /></button>
  </Badge>
);

export default AgentsPage;
