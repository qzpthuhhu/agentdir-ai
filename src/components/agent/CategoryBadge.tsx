import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const CategoryBadge = ({ slug, name }: { slug: string; name: string }) => (
  <Link to={`/categories/${slug}`}>
    <Badge variant="outline" className="hover:bg-primary/10 hover:border-primary/40 transition-colors cursor-pointer">
      {name}
    </Badge>
  </Link>
);

export default CategoryBadge;
