import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types';
import {
  LayoutDashboard,
  PieChart,
  Building2,
  Wallet,
  FileText,
  Settings,
  Users,
  Sun,
  TrendingUp,
  Wrench,
  Shield,
  Calculator,
  Leaf,
  Receipt,
  AlertTriangle,
  BarChart3,
} from 'lucide-react';

interface DashboardSidebarProps {
  role: UserRole;
}

const menuItems: Record<UserRole, { label: string; icon: React.ComponentType<any>; path: string }[]> = {
  investor: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/investor' },
    { label: 'My Investments', icon: PieChart, path: '/dashboard/investor/investments' },
    { label: 'Solar Assets', icon: Sun, path: '/dashboard/investor/assets' },
    { label: 'Returns & Payouts', icon: TrendingUp, path: '/dashboard/investor/returns' },
    { label: 'Wallet', icon: Wallet, path: '/dashboard/investor/wallet' },
    { label: 'Settings', icon: Settings, path: '/dashboard/investor/settings' },
  ],
  corporate: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/corporate' },
    { label: 'Energy Analytics', icon: BarChart3, path: '/dashboard/corporate/energy' },
    { label: 'Cost Savings', icon: Wallet, path: '/dashboard/corporate/savings' },
    { label: 'Billing', icon: Receipt, path: '/dashboard/corporate/billing' },
    { label: 'Sustainability', icon: Leaf, path: '/dashboard/corporate/sustainability' },
    { label: 'Contracts', icon: FileText, path: '/dashboard/corporate/contracts' },
    { label: 'Settings', icon: Settings, path: '/dashboard/corporate/settings' },
  ],
  nbfc: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/nbfc' },
    { label: 'Fund Allocation', icon: PieChart, path: '/dashboard/nbfc/allocation' },
    { label: 'Disbursements', icon: Wallet, path: '/dashboard/nbfc/disbursements' },
    { label: 'Asset Portfolio', icon: Sun, path: '/dashboard/nbfc/portfolio' },
    { label: 'Risk Alerts', icon: AlertTriangle, path: '/dashboard/nbfc/alerts' },
    { label: 'Reports', icon: FileText, path: '/dashboard/nbfc/reports' },
    { label: 'Settings', icon: Settings, path: '/dashboard/nbfc/settings' },
  ],
  implementer: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/implementer' },
    { label: 'Projects', icon: Building2, path: '/dashboard/implementer/projects' },
    { label: 'Installation', icon: Wrench, path: '/dashboard/implementer/installation' },
    { label: 'Maintenance', icon: Settings, path: '/dashboard/implementer/maintenance' },
    { label: 'Performance', icon: TrendingUp, path: '/dashboard/implementer/performance' },
    { label: 'Documents', icon: FileText, path: '/dashboard/implementer/documents' },
  ],
  admin: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/admin' },
    { label: 'Users', icon: Users, path: '/dashboard/admin/users' },
    { label: 'Solar Assets', icon: Sun, path: '/dashboard/admin/assets' },
    { label: 'Transactions', icon: Wallet, path: '/dashboard/admin/transactions' },
    { label: 'Compliance', icon: Shield, path: '/dashboard/admin/compliance' },
    { label: 'Audit Logs', icon: FileText, path: '/dashboard/admin/audit' },
    { label: 'Settings', icon: Settings, path: '/dashboard/admin/settings' },
  ],
};

const roleLabels: Record<UserRole, string> = {
  investor: 'Investor Portal',
  corporate: 'Corporate Portal',
  nbfc: 'NBFC Portal',
  implementer: 'Implementer Portal',
  admin: 'Admin Console',
};

export function DashboardSidebar({ role }: DashboardSidebarProps) {
  const location = useLocation();
  const items = menuItems[role];

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r border-border bg-sidebar overflow-y-auto">
      <div className="p-4">
        <div className="mb-6 rounded-lg bg-primary/10 p-3">
          <p className="text-xs font-medium text-muted-foreground">Portal</p>
          <p className="text-sm font-semibold text-foreground">{roleLabels[role]}</p>
        </div>

        <nav className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
