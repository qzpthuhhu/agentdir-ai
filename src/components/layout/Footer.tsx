import { Link } from "react-router-dom";
import { useI18n } from "@/i18n/context";
import logoIcon from "@/assets/logo-icon.webp";

const Footer = () => {
  const { t } = useI18n();

  return (
    <footer className="border-t border-border bg-card/40 mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={logoIcon} alt="AgentDir" className="h-8 w-8 rounded-lg" />
              <span className="font-display font-bold text-lg">AgentDir</span>
            </div>
            <p className="text-sm text-muted-foreground">{t("footer.tagline")}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">{t("footer.explore")}</h4>
            <div className="space-y-2">
              <Link to="/agents" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">{t("footer.allAgents")}</Link>
              <Link to="/categories/coding" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">{t("footer.categoriesLink")}</Link>
              <Link to="/compare" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">{t("footer.compareLink")}</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">{t("footer.community")}</h4>
            <div className="space-y-2">
              <Link to="/submit" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">{t("footer.submitAgent")}</Link>
              <span className="block text-sm text-muted-foreground">{t("footer.blog")}</span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">{t("footer.legal")}</h4>
            <div className="space-y-2">
              <span className="block text-sm text-muted-foreground">{t("footer.privacy")}</span>
              <span className="block text-sm text-muted-foreground">{t("footer.terms")}</span>
            </div>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-8 text-center text-xs text-muted-foreground">
          {t("footer.copyright")}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
