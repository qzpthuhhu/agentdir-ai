import { useState } from "react";
import { agents } from "@/lib/mock-data";
import { Agent } from "@/types/agent";
import { Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ComparePage = () => {
  const [selected, setSelected] = useState<Agent[]>([agents[0], agents[1]]);

  const addAgent = (agent: Agent) => {
    if (selected.length < 4 && !selected.find((s) => s.id === agent.id)) {
      setSelected([...selected, agent]);
    }
  };

  const removeAgent = (id: string) => {
    setSelected(selected.filter((s) => s.id !== id));
  };

  const available = agents.filter((a) => !selected.find((s) => s.id === a.id));

  return (
    <div className="container py-12">
      <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Compare Agents</h1>
      <p className="text-muted-foreground mb-8">Select up to 4 agents to compare side by side</p>

      {available.length > 0 && selected.length < 4 && (
        <div className="mb-8">
          <p className="text-sm text-muted-foreground mb-3">Add an agent:</p>
          <div className="flex flex-wrap gap-2">
            {available.map((a) => (
              <Button key={a.id} variant="outline" size="sm" onClick={() => addAgent(a)}>
                + {a.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {selected.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground w-36">Feature</th>
                {selected.map((agent) => (
                  <th key={agent.id} className="p-4 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-semibold">{agent.name}</span>
                      <button onClick={() => removeAgent(agent.id)} className="text-muted-foreground hover:text-foreground">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-border/50">
                <td className="p-4 text-muted-foreground">Rating</td>
                {selected.map((a) => (
                  <td key={a.id} className="p-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                      {a.rating}
                    </div>
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border/50">
                <td className="p-4 text-muted-foreground">Pricing</td>
                {selected.map((a) => <td key={a.id} className="p-4"><Badge variant="outline">{a.pricing}</Badge></td>)}
              </tr>
              <tr className="border-b border-border/50">
                <td className="p-4 text-muted-foreground">Category</td>
                {selected.map((a) => <td key={a.id} className="p-4">{a.category}</td>)}
              </tr>
              <tr className="border-b border-border/50">
                <td className="p-4 text-muted-foreground">Features</td>
                {selected.map((a) => (
                  <td key={a.id} className="p-4">
                    <ul className="space-y-1">
                      {a.features.map((f) => <li key={f} className="text-muted-foreground">• {f}</li>)}
                    </ul>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 text-muted-foreground">Reviews</td>
                {selected.map((a) => <td key={a.id} className="p-4">{a.reviewCount.toLocaleString()}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center py-20 text-muted-foreground">Select agents above to begin comparing.</p>
      )}
    </div>
  );
};

export default ComparePage;
