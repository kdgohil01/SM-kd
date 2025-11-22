import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FileInput,
  Truck,
  ArrowRightLeft,
  ClipboardList,
  History,
  Settings,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/products', label: 'Products', icon: Package },
  { path: '/receipts', label: 'Receipts', icon: FileInput },
  { path: '/deliveries', label: 'Delivery Orders', icon: Truck },
  { path: '/transfers', label: 'Internal Transfers', icon: ArrowRightLeft },
  { path: '/adjustments', label: 'Inventory Adjustments', icon: ClipboardList },
  { path: '/ledger', label: 'Move History', icon: History },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="border-b p-6">
        <h1 className="flex items-center gap-2">
          <Package className="size-6 text-primary" />
          <span>Inventory Pro</span>
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <Icon className="size-5" />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t p-4 space-y-2">
        <Link
          to="/profile"
          onClick={() => setIsMobileOpen(false)}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${
            isActive('/profile')
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          }`}
        >
          <User className="size-5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm truncate">{user?.name}</p>
            <p className="text-xs opacity-70 truncate">{user?.email}</p>
          </div>
        </Link>
        
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
          onClick={() => {
            logout();
            setIsMobileOpen(false);
          }}
        >
          <LogOut className="size-5" />
          <span className="text-sm">Logout</span>
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X /> : <Menu />}
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Mobile */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-72 border-r bg-card transition-transform md:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Sidebar - Desktop */}
      <aside className="hidden md:block fixed left-0 top-0 h-screen w-72 border-r bg-card">
        <SidebarContent />
      </aside>
    </>
  );
}
