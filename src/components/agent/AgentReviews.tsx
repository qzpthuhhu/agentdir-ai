import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Star, Loader2 } from "lucide-react";

interface AgentReviewsProps {
  agentId: string;
  onAuthRequired: () => void;
}

function StarRating({ value, onChange, readonly = false }: { value: number; onChange?: (v: number) => void; readonly?: boolean }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          className={`${readonly ? "cursor-default" : "cursor-pointer"} transition-colors`}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          onClick={() => onChange?.(star)}
        >
          <Star
            className={`h-5 w-5 ${
              (hover || value) >= star
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/30"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function AgentReviews({ agentId, onAuthRequired }: AgentReviewsProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [editing, setEditing] = useState(false);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["agent-reviews", agentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agent_reviews")
        .select("*, profiles(username, email)")
        .eq("agent_id", agentId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const userReview = reviews.find((r: any) => r.user_id === user?.id);
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
    : 0;

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");
      if (userReview) {
        const { error } = await supabase
          .from("agent_reviews")
          .update({ rating, review_text: reviewText })
          .eq("id", userReview.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("agent_reviews")
          .insert({ agent_id: agentId, user_id: user.id, rating, review_text: reviewText });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(userReview ? "Review updated" : "Review submitted");
      queryClient.invalidateQueries({ queryKey: ["agent-reviews", agentId] });
      setEditing(false);
      setRating(0);
      setReviewText("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const startEdit = () => {
    if (!user) {
      onAuthRequired();
      return;
    }
    if (userReview) {
      setRating(userReview.rating);
      setReviewText(userReview.review_text || "");
    }
    setEditing(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-semibold text-xl">User Reviews</h2>
          <div className="flex items-center gap-3 mt-1">
            <StarRating value={Math.round(avgRating)} readonly />
            <span className="text-sm text-muted-foreground">
              {avgRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
            </span>
          </div>
        </div>
        {!editing && (
          <Button variant="outline" size="sm" onClick={startEdit}>
            {userReview ? "Edit your review" : "Write a review"}
          </Button>
        )}
      </div>

      {editing && (
        <div className="glass rounded-xl p-6 space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Your rating</p>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <Textarea
            placeholder="Share your experience with this agent..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={3}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => submitMutation.mutate()}
              disabled={rating === 0 || submitMutation.isPending}
            >
              {submitMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              {userReview ? "Update" : "Submit"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="text-muted-foreground text-sm">No reviews yet. Be the first to review this agent!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r: any) => (
            <div key={r.id} className="glass rounded-xl p-5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                    {(r.profiles?.username || r.profiles?.email || "?")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{r.profiles?.username || "Anonymous"}</p>
                    <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <StarRating value={r.rating} readonly />
              </div>
              {r.review_text && <p className="text-sm text-muted-foreground">{r.review_text}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
