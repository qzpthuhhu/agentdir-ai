import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categories } from "@/lib/mock-data";
import { toast } from "sonner";

const SubmitPage = () => {
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [website, setWebsite] = useState("");
  const [pricing, setPricing] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Agent submitted! We'll review it shortly.", { description: `${name} has been submitted for review.` });
    setName(""); setTagline(""); setDescription(""); setCategory(""); setWebsite(""); setPricing("");
  };

  return (
    <div className="container py-12 max-w-2xl">
      <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Submit an Agent</h1>
      <p className="text-muted-foreground mb-8">Know a great AI agent? Submit it to our directory.</p>

      <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-6">
        <div className="grid gap-2">
          <Label htmlFor="name">Agent Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. ChatGPT" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="tagline">Tagline</Label>
          <Input id="tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="A short description" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell us more about this agent..." rows={4} required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Pricing</Label>
            <Select value={pricing} onValueChange={setPricing}>
              <SelectTrigger><SelectValue placeholder="Select pricing" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="freemium">Freemium</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="website">Website URL</Label>
          <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.com" type="url" required />
        </div>
        <Button type="submit" className="w-full">Submit Agent</Button>
      </form>
    </div>
  );
};

export default SubmitPage;
