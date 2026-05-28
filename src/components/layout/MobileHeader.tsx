import { Sun, Menu } from 'lucide-react';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { useState } from 'react';
import { MobileSideMenu } from './MobileSideMenu';

interface MobileHeaderProps {
  role: UserRole;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function MobileHeader({ role }: MobileHeaderProps) {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full glass-strong shadow-sm md:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <MobileSideMenu role={role} onClose={() => setIsOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Sun className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="leading-none">
            <p className="text-sm font-bold">
              {getGreeting()}, {profile?.full_name?.split(' ')[0] || 'User'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <NotificationBell variant="mobile" />
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/20">
            <span className="text-xs font-semibold text-primary">
              {profile?.full_name?.charAt(0) || 'U'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
