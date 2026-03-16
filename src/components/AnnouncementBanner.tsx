import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Megaphone, X } from "lucide-react";
import { useState } from "react";

const AnnouncementBanner = () => {
  const [dismissed, setDismissed] = useState<string[]>([]);

  const { data: announcements = [] } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  const visible = announcements.filter((a: any) => !dismissed.includes(a.id));
  if (visible.length === 0) return null;

  return (
    <div className="border-b border-border bg-primary/5">
      {visible.map((a: any) => (
        <div key={a.id} className="container flex items-center gap-3 py-2.5 text-sm">
          <Megaphone className="h-4 w-4 text-primary shrink-0" />
          <span className="font-medium text-primary">{a.title}</span>
          <span className="text-muted-foreground truncate flex-1">{a.content}</span>
          <button onClick={() => setDismissed((d) => [...d, a.id])} className="text-muted-foreground hover:text-foreground shrink-0">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default AnnouncementBanner;
