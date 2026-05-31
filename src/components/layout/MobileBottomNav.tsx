import { Link, useLocation } from 'react-router-dom';
import { Home, TrendingUp, Sun, Wallet, Settings, Building2, Users, FileText, BarChart3, AlertTriangle, CalendarClock, LucideIcon } from 'lucide-react';
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
    { label: 'Assets', icon: Sun, path: '/dashboard/investor/assets' },
    { label: 'SIPs', icon: CalendarClock, path: '/dashboard/investor/sips' },
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
    { label: 'Discover', icon: Sun, path: '/dashboard/nbfc/projects' },
    { label: 'Portfolio', icon: BarChart3, path: '/dashboard/nbfc/portfolio' },
    { label: 'Alerts', icon: AlertTriangle, path: '/dashboard/nbfc/alerts' },
    { label: 'Settings', icon: Settings, path: '/dashboard/nbfc/settings' },
  ],
  implementer: [
    { label: 'Home', icon: Home, path: '/dashboard/implementer' },
    { label: 'Projects', icon: Building2, path: '/dashboard/implementer/projects' },
    { label: 'Install', icon: Wrench, path: '/dashboard/implementer/installation' },
    { label: 'Perf', icon: BarChart3, path: '/dashboard/implementer/performance' },
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-strong md:hidden shadow-[0_-1px_3px_0_hsl(var(--border)/0.3)]">
      <div className="flex items-center justify-around py-1.5 px-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== `/dashboard/${role}` && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all duration-300 min-w-[56px] active:scale-90',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className={cn(
                'relative flex items-center justify-center w-10 h-7 rounded-full transition-all duration-300',
                isActive && 'bg-primary/15'
              )}>
                <item.icon className={cn(
                  'h-[18px] w-[18px] transition-transform duration-300',
                  isActive && 'scale-110'
                )} />
              </div>
              <span className={cn(
                "text-[10px] font-medium mt-0.5 leading-none transition-all duration-300",
                isActive && 'font-semibold'
              )}>{item.label}</span>
            </Link>
          );
        })}
      </div>
      {/* Safe area padding for devices with home indicator */}
      <div className="pb-safe bg-transparent" />
    </nav>
  );
}
