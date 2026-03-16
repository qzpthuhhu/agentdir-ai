import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { Plus, Trash2, ArrowLeft } from "lucide-react";

const AdminAnnouncements = () => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: announcements = [] } = useQuery({
    queryKey: ["admin-announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (editingId) {
        const { error } = await supabase.from("announcements").update({ title, content }).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("announcements").insert({ title, content });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ title: editingId ? "Updated" : "Created", description: "Announcement saved." });
      setTitle(""); setContent(""); setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, publish }: { id: string; publish: boolean }) => {
      const { error } = await supabase.from("announcements").update({
        is_published: publish,
        published_at: publish ? new Date().toISOString() : null,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("announcements").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });

  const startEdit = (a: any) => {
    setEditingId(a.id);
    setTitle(a.title);
    setContent(a.content);
  };

  return (
    <div className="container py-10 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <Button variant="ghost" size="icon" asChild><Link to="/admin/ops"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div>
          <h1 className="text-2xl font-bold font-display">Announcements</h1>
          <p className="text-sm text-muted-foreground">Create and manage public announcements</p>
        </div>
      </div>

      {/* Create / Edit form */}
      <div className="rounded-lg border border-border p-6 bg-card mb-8">
        <h2 className="text-lg font-semibold mb-4">{editingId ? "Edit Announcement" : "New Announcement"}</h2>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Announcement title" />
          </div>
          <div className="grid gap-2">
            <Label>Content</Label>
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Announcement content..." rows={3} />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => createMutation.mutate()} disabled={!title || !content} className="gap-1.5">
              <Plus className="h-4 w-4" />{editingId ? "Update" : "Create"}
            </Button>
            {editingId && (
              <Button variant="outline" onClick={() => { setEditingId(null); setTitle(""); setContent(""); }}>Cancel</Button>
            )}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {announcements.map((a: any) => (
          <div key={a.id} className="rounded-lg border border-border p-4 bg-card flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold">{a.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{a.content}</p>
              <p className="text-xs text-muted-foreground mt-2">{new Date(a.created_at).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{a.is_published ? "Published" : "Draft"}</span>
                <Switch checked={a.is_published} onCheckedChange={(v) => togglePublish.mutate({ id: a.id, publish: v })} />
              </div>
              <Button variant="ghost" size="sm" onClick={() => startEdit(a)}>Edit</Button>
              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteMutation.mutate(a.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {announcements.length === 0 && <p className="text-muted-foreground text-sm">No announcements yet.</p>}
      </div>
    </div>
  );
};

export default AdminAnnouncements;
