import { formatDistanceToNow } from 'date-fns';
import {
  TrendingUp, Wallet, XCircle, Sun, ShieldCheck, ShieldX,
  CalendarCheck, CalendarX, CheckCircle2, Gift, Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Notification, NotificationType } from '@/hooks/useNotifications';

const ICONS: Record<NotificationType, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  return_credited: { icon: TrendingUp, color: 'text-green-600 bg-green-500/10' },
  withdrawal_processed: { icon: Wallet, color: 'text-blue-600 bg-blue-500/10' },
  withdrawal_rejected: { icon: XCircle, color: 'text-destructive bg-destructive/10' },
  new_asset: { icon: Sun, color: 'text-amber-600 bg-amber-500/10' },
  kyc_approved: { icon: ShieldCheck, color: 'text-green-600 bg-green-500/10' },
  kyc_rejected: { icon: ShieldX, color: 'text-destructive bg-destructive/10' },
  sip_executed: { icon: CalendarCheck, color: 'text-primary bg-primary/10' },
  sip_failed: { icon: CalendarX, color: 'text-destructive bg-destructive/10' },
  investment_confirmed: { icon: CheckCircle2, color: 'text-green-600 bg-green-500/10' },
  referral_bonus: { icon: Gift, color: 'text-purple-600 bg-purple-500/10' },
  general: { icon: Bell, color: 'text-muted-foreground bg-muted' },
};

interface Props {
  notification: Notification;
  onClick: () => void;
}

export function NotificationItem({ notification, onClick }: Props) {
  const { icon: Icon, color } = ICONS[notification.type] ?? ICONS.general;
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-3 py-3 flex gap-3 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0',
        !notification.read && 'bg-primary/5'
      )}
    >
      <div className={cn('h-9 w-9 rounded-full flex items-center justify-center shrink-0', color)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold leading-tight">{notification.title}</p>
          {!notification.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.message}</p>
        <p className="text-[10px] text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </p>
      </div>
    </button>
  );
}
