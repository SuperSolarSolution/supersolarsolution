import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const today = new Date().toISOString().split('T')[0];

    // Fetch all active SIPs due today or earlier
    const { data: dueSIPs, error: fetchError } = await supabase
      .from('sip_plans')
      .select('*')
      .eq('status', 'active')
      .lte('next_execution_date', today);

    if (fetchError) throw fetchError;

    const results = [];

    for (const sip of dueSIPs || []) {
      try {
        const isMandate = sip.payment_method === 'mandate';

        if (isMandate) {
          // Model realistic 5% auto-debit transaction failure (e.g. gateway error or insufficient bank funds)
          if (Math.random() < 0.05) {
            await supabase.from('sip_executions').insert({
              sip_id: sip.id,
              amount: sip.amount,
              status: 'failed',
              failure_reason: 'AutoPay Mandate Debit failed: Insufficient bank account balance or NPCI timeout',
            });

            await supabase.from('notifications').insert({
              user_id: sip.investor_id,
              type: 'sip_failed',
              title: 'SIP Auto-Debit Failed',
              message: `Your automated SIP debit of ₹${sip.amount} from bank account failed. Please check bank balance.`,
              link: '/dashboard/investor/sips',
              metadata: { sip_id: sip.id, amount: sip.amount },
            });

            // Advance next_execution_date anyway to keep the monthly cycle
            const nextDate = advanceMonth(sip.next_execution_date, sip.sip_date);
            await supabase
              .from('sip_plans')
              .update({ next_execution_date: nextDate })
              .eq('id', sip.id);

            results.push({ sip_id: sip.id, status: 'failed_mandate_debit' });
            continue;
          }

          // Successful Mandate simulation: 
          // 1. Log a deposit transaction from bank account to wallet
          await supabase.from('transactions').insert({
            type: 'deposit',
            amount: sip.amount,
            from_entity: 'Bank Account (Mandate)',
            to_entity: 'Wallet',
            user_id: sip.investor_id,
            status: 'completed',
            reference: `UPI AutoPay eMandate: ${sip.mandate_id || 'mn_dev_auto'}`,
          });

          // 2. Increment wallet balance temporarily so the investment RPC can deduct it
          const { data: profile } = await supabase
            .from('profiles')
            .select('wallet_balance')
            .eq('id', sip.investor_id)
            .single();
            
          const currentBalance = Number(profile?.wallet_balance || 0);
          await supabase
            .from('profiles')
            .update({ wallet_balance: currentBalance + Number(sip.amount) })
            .eq('id', sip.investor_id);
        } else {
          // Standard Wallet Check
          const { data: profile } = await supabase
            .from('profiles')
            .select('wallet_balance')
            .eq('id', sip.investor_id)
            .single();

          if (!profile || Number(profile.wallet_balance) < Number(sip.amount)) {
            // Skip - insufficient balance
            await supabase.from('sip_executions').insert({
              sip_id: sip.id,
              amount: sip.amount,
              status: 'skipped',
              failure_reason: 'Insufficient wallet balance',
            });

            await supabase.from('notifications').insert({
              user_id: sip.investor_id,
              type: 'sip_failed',
              title: 'SIP Skipped',
              message: `Your SIP of ₹${sip.amount} was skipped due to insufficient wallet balance.`,
              link: '/dashboard/investor/sips',
              metadata: { sip_id: sip.id, amount: sip.amount },
            });

            // Advance next_execution_date anyway
            const nextDate = advanceMonth(sip.next_execution_date, sip.sip_date);
            await supabase
              .from('sip_plans')
              .update({ next_execution_date: nextDate })
              .eq('id', sip.id);

            results.push({ sip_id: sip.id, status: 'skipped' });
            continue;
          }
        }

        // Execute investment via RPC (this will deduct the wallet balance and create investment records)
        const expectedReturns = Number(sip.amount) * 0.14; // Use a default IRR estimate
        const { data: investResult, error: investError } = await supabase.rpc('invest_in_asset', {
          p_asset_id: sip.asset_id,
          p_investor_id: sip.investor_id,
          p_amount: sip.amount,
          p_expected_returns: expectedReturns,
        });

        if (investError) throw investError;

        // Log successful execution
        await supabase.from('sip_executions').insert({
          sip_id: sip.id,
          amount: sip.amount,
          status: 'success',
        });

        await supabase.from('notifications').insert({
          user_id: sip.investor_id,
          type: 'sip_executed',
          title: 'SIP Executed',
          message: `Your SIP of ₹${sip.amount} via ${isMandate ? 'Auto-Debit' : 'Wallet'} was invested successfully.`,
          link: '/dashboard/investor/sips',
          metadata: { sip_id: sip.id, amount: sip.amount },
        });

        // Update SIP plan
        const newCount = (sip.executions_count || 0) + 1;
        const newTotal = Number(sip.total_invested) + Number(sip.amount);
        const nextDate = advanceMonth(sip.next_execution_date, sip.sip_date);

        const isCompleted = sip.max_executions && newCount >= sip.max_executions;

        await supabase
          .from('sip_plans')
          .update({
            executions_count: newCount,
            total_invested: newTotal,
            next_execution_date: nextDate,
            status: isCompleted ? 'completed' : 'active',
          })
          .eq('id', sip.id);

        results.push({ sip_id: sip.id, status: 'success' });
      } catch (sipError: any) {
        // Log failed execution
        await supabase.from('sip_executions').insert({
          sip_id: sip.id,
          amount: sip.amount,
          status: 'failed',
          failure_reason: sipError.message,
        });

        results.push({ sip_id: sip.id, status: 'failed', error: sipError.message });
      }
    }

    return new Response(
      JSON.stringify({ processed: results.length, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function advanceMonth(dateStr: string, sipDate: number): string {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + 1);
  // Ensure we don't exceed the month's last day
  const maxDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(sipDate, maxDay));
  return d.toISOString().split('T')[0];
}
