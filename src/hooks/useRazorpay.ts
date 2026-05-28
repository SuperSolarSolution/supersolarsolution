import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

declare global {
  interface Window {
    Razorpay: any;
  }
}

let loadScriptPromise: Promise<boolean> | null = null;

function loadRazorpayScript(): Promise<boolean> {
  if (loadScriptPromise) {
    return loadScriptPromise;
  }

  loadScriptPromise = new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => {
      loadScriptPromise = null;
      resolve(false);
    };
    document.body.appendChild(script);
  });

  return loadScriptPromise;
}

interface UseRazorpayOptions {
  onSuccess?: (amount: number) => void;
  onError?: (error: string) => void;
}

export function useRazorpay({ onSuccess, onError }: UseRazorpayOptions = {}) {
  const [isPending, setIsPending] = useState(false);
  const queryClient = useQueryClient();

  const pay = async (amount: number, userId: string, userName: string, userEmail: string) => {
    setIsPending(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Failed to load Razorpay SDK');

      // Create order via edge function
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke('razorpay-order', {
        body: { action: 'create_order', amount, user_id: userId },
      });

      if (res.error) throw new Error(res.error.message);
      const { order_id, key_id } = res.data;

      // Open Razorpay checkout
      return new Promise<void>((resolve, reject) => {
        const options = {
          key: key_id,
          amount: Math.round(amount * 100),
          currency: 'INR',
          name: 'S³ - Super Solar Solutions',
          description: 'Add Money to Wallet',
          order_id,
          prefill: { name: userName, email: userEmail },
          handler: async (response: any) => {
            try {
              // Verify payment
              const verifyRes = await supabase.functions.invoke('razorpay-order', {
                body: {
                  action: 'verify_payment',
                  order_id: response.razorpay_order_id,
                  payment_id: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                  user_id: userId,
                  amount,
                },
              });

              if (verifyRes.error) throw new Error(verifyRes.error.message);

              queryClient.invalidateQueries({ queryKey: ['transactions'] });
              queryClient.invalidateQueries({ queryKey: ['profiles'] });
              onSuccess?.(amount);
              resolve();
            } catch (err: any) {
              onError?.(err.message);
              reject(err);
            } finally {
              setIsPending(false);
            }
          },
          modal: {
            ondismiss: () => {
              setIsPending(false);
              reject(new Error('Payment cancelled'));
            },
          },
          theme: { color: '#16a34a' },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      });
    } catch (err: any) {
      setIsPending(false);
      onError?.(err.message);
      throw err;
    }
  };

  return { pay, isPending };
}
