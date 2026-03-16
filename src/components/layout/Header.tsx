import { Link } from "react-router-dom";
import { Search, Menu, X, Globe, User, LogOut } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useI18n, LOCALE_LABELS, Locale } from "@/i18n/context";
import { useAuth } from "@/hooks/use-auth";
import AuthModal from "@/components/auth/AuthModal";
import logoIcon from "@/assets/logo-icon.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const { t, locale, setLocale } = useI18n();
  const { user, profile, signOut } = useAuth();

  const navLinks = [
    { to: "/agents", label: t("nav.explore") },
    { to: "/compare", label: t("nav.compare") },
    { to: "/search", label: t("nav.search") },
    { to: "/submit", label: t("nav.submit") },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 glass">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logoIcon} alt="AgentDir" className="h-9 w-9 rounded-lg" />
            <span className="font-display font-bold text-xl tracking-tight">AgentDir</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-muted/50"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <Globe className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[140px]">
                {(Object.keys(LOCALE_LABELS) as Locale[]).map((loc) => (
                  <DropdownMenuItem
                    key={loc}
                    onClick={() => setLocale(loc)}
                    className={locale === loc ? "bg-primary/10 text-primary" : ""}
                  >
                    {LOCALE_LABELS[loc]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Link to="/search">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Search className="h-4 w-4" />
              </Button>
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                      {(profile?.username || user.email || "U")[0].toUpperCase()}
                    </div>
                    <span className="text-sm max-w-[120px] truncate">{profile?.username || user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="text-xs text-muted-foreground" disabled>
                    {user.email}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setAuthOpen(true)} className="gap-1.5">
                <User className="h-4 w-4" /> Log in
              </Button>
            )}

            <Link to="/submit">
              <Button size="sm" className="glow-primary">{t("nav.submit")}</Button>
            </Link>
          </div>

          <button
            className="md:hidden text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-card p-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block text-sm text-muted-foreground hover:text-foreground py-2.5 px-3 rounded-lg hover:bg-muted/50"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-border mt-2 space-y-2">
              {user ? (
                <div className="flex items-center justify-between px-3">
                  <span className="text-sm text-muted-foreground truncate">{profile?.username || user.email}</span>
                  <Button variant="ghost" size="sm" onClick={() => signOut()} className="text-destructive">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => { setAuthOpen(true); setMobileOpen(false); }} className="w-full gap-1.5">
                  <User className="h-4 w-4" /> Log in / Sign up
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground w-full justify-start">
                    <Globe className="h-4 w-4" />
                    {LOCALE_LABELS[locale]}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {(Object.keys(LOCALE_LABELS) as Locale[]).map((loc) => (
                    <DropdownMenuItem
                      key={loc}
                      onClick={() => setLocale(loc)}
                      className={locale === loc ? "bg-primary/10 text-primary" : ""}
                    >
                      {LOCALE_LABELS[loc]}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}
      </header>
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
};

export default Header;
