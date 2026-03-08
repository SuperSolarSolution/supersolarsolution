import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, TrendingUp, Sun, Wallet, Settings, Building2, Users, FileText, 
  BarChart3, AlertTriangle, LogOut, HelpCircle,
  ChevronRight, Banknote, Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface MenuItem {
  label: string;
  icon: React.ComponentType<any>;
  path: string;
}

const roleMenuItems: Record<UserRole, MenuItem[]> = {
  investor: [
    { label: 'Dashboard', icon: Home, path: '/dashboard/investor' },
    { label: 'My Investments', icon: TrendingUp, path: '/dashboard/investor/investments' },
    { label: 'Solar Assets', icon: Sun, path: '/dashboard/investor/assets' },
    { label: 'Returns & Payouts', icon: Banknote, path: '/dashboard/investor/returns' },
    { label: 'Wallet', icon: Wallet, path: '/dashboard/investor/wallet' },
    { label: 'Settings', icon: Settings, path: '/dashboard/investor/settings' },
  ],
  corporate: [
    { label: 'Dashboard', icon: Home, path: '/dashboard/corporate' },
    { label: 'My Projects', icon: Building2, path: '/dashboard/corporate/projects' },
    { label: 'Power Generation', icon: Sun, path: '/dashboard/corporate/power' },
    { label: 'Billing & Payments', icon: FileText, path: '/dashboard/corporate/billing' },
    { label: 'Asset Status', icon: BarChart3, path: '/dashboard/corporate/assets' },
    { label: 'Contracts', icon: FileText, path: '/dashboard/corporate/contracts' },
    { label: 'Sustainability', icon: Shield, path: '/dashboard/corporate/sustainability' },
  ],
  nbfc: [
    { label: 'Dashboard', icon: Home, path: '/dashboard/nbfc' },
    { label: 'Project Discovery', icon: Sun, path: '/dashboard/nbfc/discover' },
    { label: 'Asset Portfolio', icon: BarChart3, path: '/dashboard/nbfc/portfolio' },
    { label: 'Fund Allocation', icon: Wallet, path: '/dashboard/nbfc/allocation' },
    { label: 'Disbursements', icon: Banknote, path: '/dashboard/nbfc/disbursements' },
    { label: 'Risk Alerts', icon: AlertTriangle, path: '/dashboard/nbfc/alerts' },
    { label: 'Reports', icon: FileText, path: '/dashboard/nbfc/reports' },
    { label: 'Settings', icon: Settings, path: '/dashboard/nbfc/settings' },
  ],
  implementer: [
    { label: 'Dashboard', icon: Home, path: '/dashboard/implementer' },
    { label: 'My Projects', icon: Building2, path: '/dashboard/implementer/projects' },
    { label: 'Assigned Assets', icon: Sun, path: '/dashboard/implementer/assets' },
    { label: 'Settings', icon: Settings, path: '/dashboard/implementer/settings' },
  ],
  admin: [
    { label: 'Overview', icon: Home, path: '/dashboard/admin' },
    { label: 'Users', icon: Users, path: '/dashboard/admin/users' },
    { label: 'Solar Assets', icon: Sun, path: '/dashboard/admin/assets' },
    { label: 'Transactions', icon: TrendingUp, path: '/dashboard/admin/transactions' },
    { label: 'Settings', icon: Settings, path: '/dashboard/admin/settings' },
  ],
};

interface MobileSideMenuProps {
  role: UserRole;
  onClose: () => void;
}

export function MobileSideMenu({ role, onClose }: MobileSideMenuProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const menuItems = roleMenuItems[role];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    onClose();
  };

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Profile Section */}
      <div className="p-5 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-primary/20 shadow-sm">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {profile?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">
              {profile?.full_name || 'User'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {profile?.email}
            </p>
            <span className="inline-flex mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary capitalize">
              {role}
            </span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto py-2">
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-200 opacity-0 animate-slide-in-right',
                `animate-stagger-${Math.min(index + 1, 6)}`,
                isActive
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-foreground hover:bg-muted/50'
              )}
            >
              {isActive && (
                <div className="absolute left-0 w-0.5 h-8 rounded-r bg-primary" />
              )}
              <item.icon className={cn(
                'h-5 w-5 transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )} />
              <span className="flex-1 font-medium">{item.label}</span>
              <ChevronRight className={cn(
                'h-4 w-4 transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground/50'
              )} />
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* Footer Actions */}
      <div className="p-4 space-y-1">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 h-11 rounded-lg"
          onClick={onClose}
        >
          <HelpCircle className="h-5 w-5 text-muted-foreground" />
          Help & Support
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 h-11 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
