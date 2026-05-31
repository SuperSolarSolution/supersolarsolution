// @ts-nocheck
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRazorpay } from '../useRazorpay';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const queryClient = new QueryClient();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('useRazorpay', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    delete window.Razorpay;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should handle Razorpay SDK load failure', async () => {
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const el = originalCreateElement(tagName);
      if (tagName.toLowerCase() === 'script') {
        setTimeout(() => {
          if (el.onerror) {
            el.onerror(new Event('error') as any);
          }
        }, 0);
      }
      return el;
    });

    const onError = vi.fn();
    const { result } = renderHook(() => useRazorpay({ onError }), { wrapper });

    await act(async () => {
      try {
        await result.current.pay(100, 'user-1', 'Test User', 'test@example.com');
      } catch (e: any) {
        expect(e.message).toBe('Failed to load Razorpay SDK');
      }
    });

    expect(onError).toHaveBeenCalledWith('Failed to load Razorpay SDK');
    expect(result.current.isPending).toBe(false);
  });
});