import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/i18n/context";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchBar = ({ value, onChange, placeholder }: SearchBarProps) => {
  const { t } = useI18n();

  return (
    <div className="relative group">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || t("hero.searchPlaceholder")}
        className="pl-12 h-14 bg-card border-border text-foreground text-base rounded-xl focus:border-primary/50 focus:ring-primary/20 transition-all"
      />
    </div>
  );
};

export default SearchBar;
