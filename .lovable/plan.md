

## Mobile UI/UX Enhancement Plan

Upgrade the mobile experience to feel like a polished native app with better touch interactions, mobile-optimized layouts, and refined visual hierarchy.

### Changes

**1. Dashboard Layout (DashboardLayout.tsx)**
- Remove excess padding on mobile (`p-4` → `px-3 pt-3 pb-2`)
- Ensure smooth scroll with `-webkit-overflow-scrolling: touch` on main content
- Add `overscroll-behavior-y: contain` to prevent pull-to-refresh interference

**2. Investor Dashboard - Mobile Optimization (InvestorDashboard.tsx)**
- Make KPI cards horizontal scrollable on mobile (snap scroll) instead of stacked grid, reducing initial scroll depth
- Hide the "Explore New Assets" button text on mobile, show icon-only
- Reduce heading size on mobile (`text-2xl` → `text-xl`)
- Make the pie chart card and transaction list stack full-width on mobile
- Add a greeting with time-of-day context ("Good morning, Name")

**3. Investor Wallet - App-like Balance Card (InvestorWallet.tsx)**
- Make balance card full-bleed on mobile (negative margin to edges)
- Stack action buttons horizontally as equal-width pill buttons below balance
- Make quick stats a horizontal scroll row on mobile
- Convert referral section into a compact card with share button
- Use bottom sheet (Drawer) for Add Money and Withdraw dialogs on mobile instead of center Dialog

**4. Investor Assets - Card Optimization (InvestorAssets.tsx)**
- Reduce card image placeholder height on mobile (`h-32` → `h-24`)
- Make summary stats a 2x2 compact grid on mobile
- Make filter row horizontally scrollable with chip-style selects
- Smaller card padding on mobile

**5. Investor Investments - Compact Cards (InvestorInvestments.tsx)**
- Reduce card padding on mobile
- Make the 4-column stats grid 2x2 on mobile (already `grid-cols-2 md:grid-cols-4` but needs tighter spacing)
- Smaller text sizes for mobile

**6. Mobile Header Enhancement (MobileHeader.tsx)**
- Add greeting text replacing the logo on dashboard pages ("Hi, {firstName}")
- Slightly reduce header height for more content space

**7. Mobile Bottom Nav Polish (MobileBottomNav.tsx)**
- Add subtle top border/shadow for better separation
- Ensure active indicator pill has smooth spring-like transition

**8. Global Mobile Styles (index.css)**
- Add touch-action manipulation for smoother scrolling
- Add `-webkit-tap-highlight-color: transparent` to remove tap highlights
- Add horizontal scroll snap utilities
- Add mobile-specific card compact styles

**9. Use Drawer for Mobile Dialogs**
- Create a responsive dialog component that renders as Drawer on mobile and Dialog on desktop
- Apply to Add Money, Withdraw, and Invest modals

### Files to Modify
- `src/index.css` - Mobile touch styles, scroll snap utilities
- `src/components/layout/DashboardLayout.tsx` - Tighter mobile padding
- `src/components/layout/MobileHeader.tsx` - Greeting text
- `src/components/layout/MobileBottomNav.tsx` - Border refinement
- `src/pages/dashboard/InvestorDashboard.tsx` - Horizontal scroll KPIs, mobile layout
- `src/pages/dashboard/investor/InvestorWallet.tsx` - Full-bleed balance, Drawer dialogs
- `src/pages/dashboard/investor/InvestorAssets.tsx` - Compact mobile cards
- `src/pages/dashboard/investor/InvestorInvestments.tsx` - Tighter mobile spacing
- `src/components/ui/responsive-dialog.tsx` - New: Dialog on desktop, Drawer on mobile

