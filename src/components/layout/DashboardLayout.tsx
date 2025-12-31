import { ReactNode } from 'react';
import { Header } from './Header';
import { DashboardSidebar } from './DashboardSidebar';
import { UserRole } from '@/types';

interface DashboardLayoutProps {
  children: ReactNode;
  role: UserRole;
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header showAuth={false} />
      <DashboardSidebar role={role} />
      <main className="ml-64 pt-16">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
