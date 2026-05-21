
## In-App Notification Center

### Overview
Build a centralized notification system with a bell icon (desktop header + mobile header), unread count badge, dropdown/drawer feed, and real-time delivery via Supabase Realtime. Auto-generate notifications for key events (returns credited, withdrawals processed, new assets, KYC updates, SIP executions). Also fire toast alerts ("app notifications") in real-time when events occur.

### Database Changes

**New table: `notifications`**
- `id` (uuid, PK)
- `user_id` (uuid, references auth.users) — recipient
- `type` (enum: `return_credited`, `withdrawal_processed`, `withdrawal_rejected`, `new_asset`, `kyc_approved`, `kyc_rejected`, `sip_executed`, `sip_failed`, `investment_confirmed`, `referral_bonus`, `general`)
- `title` (text)
- `message` (text)
- `link` (text, nullable) — deep link route (e.g. `/dashboard/investor/wallet`)
- `metadata` (jsonb, nullable) — extra context (amount, asset_id, etc.)
- `read` (boolean, default false)
- `created_at` (timestamp)

RLS:
- Users can SELECT/UPDATE (mark read) their own notifications
- System inserts via SECURITY DEFINER functions / triggers / edge functions
- Admins can SELECT all

Indexes: `(user_id, created_at DESC)`, `(user_id, read)`

Enable Supabase Realtime on `notifications` (REPLICA IDENTITY FULL + add to `supabase_realtime` publication).

### Auto-Generation Triggers

**1. Withdrawal processed** — trigger on `withdrawal_requests` UPDATE when status changes → insert `withdrawal_processed` or `withdrawal_rejected` notification.

**2. KYC update** — trigger on `profiles` UPDATE when `kyc_status` changes → insert `kyc_approved`/`kyc_rejected` notification.

**3. New asset available** — trigger on `solar_assets` INSERT (status = `funding_open`) → broadcast to all investors (insert one row per investor with `role='investor'`).

**4. Returns credited** — trigger on `transactions` INSERT where type IN (`return`, `referral_bonus`) → insert `return_credited`/`referral_bonus` notification.

**5. SIP execution** — extend `process-sips` edge function to insert `sip_executed` or `sip_failed` notification after each execution log.

**6. Investment confirmed** — extend `invest_in_asset` RPC to insert `investment_confirmed` notification.

### Frontend Changes

**1. New hook: `src/hooks/useNotifications.ts`**
- `useNotifications()` — fetch user's notifications (latest 50), with unread count
- `useUnreadCount()` — lightweight count query
- `useMarkAsRead()` / `useMarkAllAsRead()` — mutations
- Subscribes to Supabase Realtime channel on `notifications` filtered by `user_id`:
  - On INSERT: invalidate query + fire `sonner` toast (clickable, navigates to `link`)
  - On UPDATE: invalidate query

**2. New component: `src/components/notifications/NotificationBell.tsx`**
- Bell icon with animated unread badge (red dot + count)
- Opens `Popover` on desktop, `Drawer` (Sheet bottom) on mobile via `ResponsiveDialog` pattern
- Shows notification list with icons per type, time-ago, unread highlight
- "Mark all as read" action + per-item click → mark read + navigate to `link`
- Empty state when no notifications

**3. New component: `src/components/notifications/NotificationItem.tsx`**
- Icon (by type), title, message, time-ago, unread dot

**4. Integration**
- `MobileHeader.tsx` — replace static Bell button with `<NotificationBell />` (mounts the real count + dropdown)
- `Header.tsx` (desktop) — add `<NotificationBell />` next to user menu

**5. Toast realtime alerts**
- Realtime subscription lives at the layout level (mounted in `DashboardLayout`) so toasts fire on any dashboard route
- Uses existing `sonner` toaster with action button to deep-link

### Files to Create
- `src/hooks/useNotifications.ts`
- `src/components/notifications/NotificationBell.tsx`
- `src/components/notifications/NotificationItem.tsx`

### Files to Modify
- `src/components/layout/MobileHeader.tsx` — swap Bell for NotificationBell
- `src/components/layout/Header.tsx` — add NotificationBell
- `src/components/layout/DashboardLayout.tsx` — mount realtime toast subscriber
- `supabase/functions/process-sips/index.ts` — insert notification on each execution

### Migration (SQL)
- Create `notification_type` enum + `notifications` table
- RLS policies
- Triggers: `withdrawal_requests`, `profiles` (kyc), `solar_assets` (insert), `transactions` (insert), plus update `invest_in_asset` RPC
- Enable realtime publication

### Flow
```text
Event (withdrawal approved, KYC change, new asset, return credited, SIP run)
  → DB trigger / edge function inserts row in `notifications`
  → Supabase Realtime pushes INSERT to subscribed clients
  → useNotifications hook: invalidate cache + sonner toast
  → Bell badge updates instantly; user clicks → opens panel → marks read → deep-links
```
