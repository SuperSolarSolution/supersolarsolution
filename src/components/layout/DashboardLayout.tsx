import { ReactNode } from 'react';
import { Header } from './Header';
import { DashboardSidebar } from './DashboardSidebar';
import { MobileHeader } from './MobileHeader';
import { MobileBottomNav } from './MobileBottomNav';
import { UserRole } from '@/types';

interface DashboardLayoutProps {
  children: ReactNode;
  role: UserRole;
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Layout */}
      <div className="hidden md:block">
        <Header showAuth={false} />
        <DashboardSidebar role={role} />
        <main className="ml-64 pt-16">
          <div className="p-6 animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col min-h-screen">
        <MobileHeader role={role} />
        <main className="flex-1 pb-20 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="px-3 pt-3 pb-2 animate-fade-in">
            {children}
          </div>
        </main>
        <MobileBottomNav role={role} />
      </div>
    </div>
  );
}
