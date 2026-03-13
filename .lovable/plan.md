

## Solar SIP (Systematic Investment Plan) Feature

### Overview
Allow investors to set up recurring monthly auto-investments into solar assets. SIPs will auto-debit from wallet balance on a chosen date each month and invest into the selected asset. A scheduled edge function processes SIPs monthly.

### Database Changes

**New table: `sip_plans`**
- `id` (uuid, PK)
- `investor_id` (uuid, references auth.users)
- `asset_id` (uuid, references solar_assets)
- `amount` (numeric) — monthly SIP amount
- `sip_date` (integer, 1-28) — day of month to execute
- `status` (enum: `active`, `paused`, `completed`, `cancelled`)
- `next_execution_date` (date)
- `total_invested` (numeric, default 0)
- `executions_count` (integer, default 0)
- `max_executions` (integer, nullable) — optional limit (e.g., 12 months)
- `created_at`, `updated_at` (timestamps)

RLS: investors see/manage own SIPs, admins see all.

**New table: `sip_executions`**
- `id` (uuid, PK)
- `sip_id` (uuid, references sip_plans)
- `amount` (numeric)
- `status` (text: `success`, `failed`, `skipped`)
- `failure_reason` (text, nullable)
- `executed_at` (timestamp)

RLS: investors see own executions via SIP ownership.

### Edge Function: `process-sips`
- Scheduled daily via pg_cron or Supabase cron
- Queries `sip_plans` where `status = 'active'` and `next_execution_date <= today`
- For each SIP: checks wallet balance, calls `invest_in_asset` RPC, logs execution in `sip_executions`, advances `next_execution_date` by 1 month
- If insufficient balance: logs as `skipped`, keeps SIP active

### Frontend Changes

**1. New hook: `src/hooks/useSIPPlans.ts`**
- `useSIPPlans()` — fetch investor's SIP plans with joined asset data
- `useCreateSIP()` — create new SIP plan
- `usePauseSIP()` / `useCancelSIP()` — status mutations

**2. SIP Setup Modal: `src/components/dashboard/investor/SIPSetupModal.tsx`**
- Triggered from asset cards ("Start SIP" button alongside "Invest Now")
- Fields: monthly amount, SIP date (1-28), optional duration (months)
- Shows projected returns over the SIP tenure
- Uses ResponsiveDialog (Drawer on mobile)

**3. SIP Management Page: `src/pages/dashboard/investor/InvestorSIPs.tsx`**
- List of active/paused/completed SIPs with asset details
- Each SIP card shows: asset name, monthly amount, next debit date, total invested so far, execution history
- Actions: Pause, Resume, Cancel
- Execution history expandable per SIP

**4. Asset Cards Update: `src/pages/dashboard/investor/InvestorAssets.tsx`**
- Add "Start SIP" button next to "Invest Now" on each asset card

**5. Navigation Update**
- Add "SIPs" nav item in investor sidebar (`DashboardSidebar.tsx`, `MobileBottomNav.tsx`)
- Add route in `App.tsx`

### Files to Create
- `src/hooks/useSIPPlans.ts`
- `src/components/dashboard/investor/SIPSetupModal.tsx`
- `src/pages/dashboard/investor/InvestorSIPs.tsx`
- `supabase/functions/process-sips/index.ts`

### Files to Modify
- `supabase/config.toml` — add process-sips function config
- `src/App.tsx` — add SIP route
- `src/components/layout/DashboardSidebar.tsx` — add SIP nav link
- `src/components/layout/MobileBottomNav.tsx` — update nav if needed
- `src/pages/dashboard/investor/InvestorAssets.tsx` — add "Start SIP" button

### Flow
```text
Investor → Asset Card → "Start SIP" → Modal (amount, date, duration)
  → Creates sip_plan row → Scheduled function runs daily
  → Checks due SIPs → Deducts wallet → Calls invest_in_asset RPC
  → Logs execution → Advances next date
```

