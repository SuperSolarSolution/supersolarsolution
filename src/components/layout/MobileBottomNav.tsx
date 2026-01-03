import { Link, useLocation } from 'react-router-dom';
import { Home, TrendingUp, Sun, Wallet, Settings, Building2, Users, FileText, BarChart3, AlertTriangle, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types';

interface NavItem {
  label: string;
  icon: LucideIcon;
  path: string;
}

const roleNavItems: Record<UserRole, NavItem[]> = {
  investor: [
    { label: 'Home', icon: Home, path: '/dashboard/investor' },
    { label: 'Investments', icon: TrendingUp, path: '/dashboard/investor/investments' },
    { label: 'Assets', icon: Sun, path: '/dashboard/investor/assets' },
    { label: 'Wallet', icon: Wallet, path: '/dashboard/investor/wallet' },
    { label: 'Settings', icon: Settings, path: '/dashboard/investor/settings' },
  ],
  corporate: [
    { label: 'Home', icon: Home, path: '/dashboard/corporate' },
    { label: 'Projects', icon: Building2, path: '/dashboard/corporate/projects' },
    { label: 'Power', icon: Sun, path: '/dashboard/corporate/power' },
    { label: 'Billing', icon: FileText, path: '/dashboard/corporate/billing' },
    { label: 'Settings', icon: Settings, path: '/dashboard/corporate/sustainability' },
  ],
  nbfc: [
    { label: 'Home', icon: Home, path: '/dashboard/nbfc' },
    { label: 'Discover', icon: Sun, path: '/dashboard/nbfc/discover' },
    { label: 'Portfolio', icon: BarChart3, path: '/dashboard/nbfc/portfolio' },
    { label: 'Alerts', icon: AlertTriangle, path: '/dashboard/nbfc/alerts' },
    { label: 'Settings', icon: Settings, path: '/dashboard/nbfc/settings' },
  ],
  implementer: [
    { label: 'Home', icon: Home, path: '/dashboard/implementer' },
    { label: 'Projects', icon: Building2, path: '/dashboard/implementer/projects' },
    { label: 'Assets', icon: Sun, path: '/dashboard/implementer/assets' },
    { label: 'Settings', icon: Settings, path: '/dashboard/implementer/settings' },
  ],
  admin: [
    { label: 'Home', icon: Home, path: '/dashboard/admin' },
    { label: 'Users', icon: Users, path: '/dashboard/admin/users' },
    { label: 'Assets', icon: Sun, path: '/dashboard/admin/assets' },
    { label: 'Transactions', icon: TrendingUp, path: '/dashboard/admin/transactions' },
    { label: 'Settings', icon: Settings, path: '/dashboard/admin/settings' },
  ],
};

interface MobileBottomNavProps {
  role: UserRole;
}

export function MobileBottomNav({ role }: MobileBottomNavProps) {
  const location = useLocation();
  const navItems = roleNavItems[role];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/90 md:hidden">
      <div className="flex items-center justify-around py-2 px-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== `/dashboard/${role}` && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all min-w-[60px]',
                isActive 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive && 'scale-110')} />
              <span className="text-[10px] font-medium mt-1 leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
      {/* Safe area padding for devices with home indicator */}
      <div className="h-safe-area-inset-bottom bg-card" />
    </nav>
  );
}
