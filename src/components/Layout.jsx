import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Plane, Users, FileText, Handshake, Newspaper,
  Menu, X, ChevronRight, LogOut, Megaphone, Bell, BarChart3, QrCode, Sparkles, Home
} from "lucide-react";
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import useNoIndex from "@/hooks/useNoIndex";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/aircraft", label: "Aircraft", icon: Plane },
  { path: "/clients", label: "Clients", icon: Users },
  { path: "/appraisals", label: "Appraisals", icon: FileText },
  { path: "/deals", label: "Deals", icon: Handshake },
  { path: "/affiliates", label: "Affiliates", icon: Megaphone },
  { path: "/employees", label: "Employees", icon: QrCode },
  { path: "/announcements", label: "News", icon: Newspaper },
  { path: "/subscribers", label: "Alert Subscribers", icon: Bell },
  { path: "/market-reports", label: "Market Reports", icon: BarChart3 },
  { path: "/aircraft-assistant", label: "Aircraft Assistant", icon: Sparkles },
];

// Routes employees can access (prefixes — detail pages under each are included)
const EMPLOYEE_ALLOWED = ['/', '/aircraft', '/clients', '/deals', '/aircraft-assistant', '/market-reports'];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  useNoIndex();

  useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    if (user.role === 'affiliate') {
      navigate('/affiliate-dashboard', { replace: true });
    } else if (user.role === 'employee') {
      const allowed = EMPLOYEE_ALLOWED.some(p => location.pathname === p || location.pathname.startsWith(p + '/'));
      if (!allowed) {
        navigate('/aircraft-assistant', { replace: true });
      }
    }
  }, [user, location.pathname, navigate]);

  const visibleNavItems = user?.role === 'employee'
    ? navItems.filter(i => EMPLOYEE_ALLOWED.includes(i.path))
    : navItems;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-sidebar flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-sidebar-border">
          <img src="https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/9dc8b6aa8_logo-01.png" alt="ClearBlue Aero" className="h-[50px] w-auto brightness-0 invert" />
          <button 
            className="lg:hidden text-sidebar-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const isActive = item.path === '/'
              ? location.pathname === '/'
              : (location.pathname === item.path || 
                (item.path !== "/dashboard" && location.pathname.startsWith(item.path)));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${isActive 
                    ? 'bg-sidebar-accent text-sidebar-primary' 
                    : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                  }
                `}
              >
                <item.icon className="w-[18px] h-[18px]" />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-sidebar-border">
          <button
            onClick={() => base44.auth.logout()}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 w-full transition-colors"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar (hidden on desktop for the full-bleed Aircraft Assistant page) */}
        <header className={`h-14 bg-card border-b border-border flex items-center px-4 lg:px-6 shrink-0 ${location.pathname === '/aircraft-assistant' ? 'lg:hidden' : ''}`}>
          <button 
            className="lg:hidden mr-3 p-1.5 rounded-lg hover:bg-muted"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}