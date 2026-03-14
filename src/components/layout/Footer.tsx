import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border bg-card/40 mt-auto">
    <div className="container py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">AI</span>
            </div>
            <span className="font-display font-bold text-lg">AgentDir</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Discover, compare, and choose the best AI agents for your needs.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Explore</h4>
          <div className="space-y-2">
            <Link to="/agents" className="block text-sm text-muted-foreground hover:text-foreground">All Agents</Link>
            <Link to="/categories/coding" className="block text-sm text-muted-foreground hover:text-foreground">Categories</Link>
            <Link to="/compare" className="block text-sm text-muted-foreground hover:text-foreground">Compare</Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Community</h4>
          <div className="space-y-2">
            <Link to="/submit" className="block text-sm text-muted-foreground hover:text-foreground">Submit Agent</Link>
            <span className="block text-sm text-muted-foreground">Blog (coming soon)</span>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Legal</h4>
          <div className="space-y-2">
            <span className="block text-sm text-muted-foreground">Privacy Policy</span>
            <span className="block text-sm text-muted-foreground">Terms of Service</span>
          </div>
        </div>
      </div>
      <div className="border-t border-border mt-8 pt-8 text-center text-xs text-muted-foreground">
        © 2024 AgentDir. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
