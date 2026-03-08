import * as React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

interface ResponsiveDialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ResponsiveDialog({ children, open, onOpenChange }: ResponsiveDialogProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        {children}
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog>
  );
}

export function ResponsiveDialogTrigger({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
  const isMobile = useIsMobile();
  if (isMobile) return <DrawerTrigger asChild={asChild}>{children}</DrawerTrigger>;
  return <DialogTrigger asChild={asChild}>{children}</DialogTrigger>;
}

export function ResponsiveDialogContent({ children, className }: { children: React.ReactNode; className?: string }) {
  const isMobile = useIsMobile();
  if (isMobile) {
    return (
      <DrawerContent className={className}>
        <div className="max-h-[85vh] overflow-y-auto px-4 pb-6">
          {children}
        </div>
      </DrawerContent>
    );
  }
  return <DialogContent className={className}>{children}</DialogContent>;
}

export function ResponsiveDialogHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  const isMobile = useIsMobile();
  if (isMobile) return <DrawerHeader className={className}>{children}</DrawerHeader>;
  return <DialogHeader className={className}>{children}</DialogHeader>;
}

export function ResponsiveDialogTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  const isMobile = useIsMobile();
  if (isMobile) return <DrawerTitle className={className}>{children}</DrawerTitle>;
  return <DialogTitle className={className}>{children}</DialogTitle>;
}

export function ResponsiveDialogDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  const isMobile = useIsMobile();
  if (isMobile) return <DrawerDescription className={className}>{children}</DrawerDescription>;
  return <DialogDescription className={className}>{children}</DialogDescription>;
}

export function ResponsiveDialogFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  const isMobile = useIsMobile();
  if (isMobile) return <DrawerFooter className={className}>{children}</DrawerFooter>;
  return <DialogFooter className={className}>{children}</DialogFooter>;
}
