// @ts-nocheck
import { describe, it, expect, mock, beforeEach, afterEach } from 'bun:test';
import { renderHook, waitFor } from '@testing-library/react';
import { useNotifications } from '../useNotifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Setup mocks using bun:test's mock.module
mock.module('@/contexts/AuthContext', () => ({
  useAuth: mock(),
}));

mock.module('@/integrations/supabase/client', () => ({
  supabase: {
    from: mock(),
  },
}));

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useNotifications', () => {
  beforeEach(() => {
    mock.restore();
  });

  it('should be disabled when user is not authenticated', async () => {
    (useAuth as any).mockReturnValue({ user: null });

    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(true);
    expect(result.current.fetchStatus).toBe('idle');
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('should fetch notifications when user is authenticated', async () => {
    const mockUser = { id: 'user-123' };
    (useAuth as any).mockReturnValue({ user: mockUser });

    const mockNotifications = [
      { id: '1', title: 'Test 1', message: 'Message 1' },
      { id: '2', title: 'Test 2', message: 'Message 2' },
    ];

    const mockLimit = mock().mockResolvedValue({ data: mockNotifications, error: null });
    const mockOrder = mock().mockReturnValue({ limit: mockLimit });
    const mockSelect = mock().mockReturnValue({ order: mockOrder });

    (supabase.from as any).mockReturnValue({ select: mockSelect });

    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(true);
    expect(result.current.fetchStatus).toBe('fetching');

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockNotifications);

    // Verify Supabase chain calls
    expect(supabase.from).toHaveBeenCalledWith('notifications');
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(mockLimit).toHaveBeenCalledWith(50);
  });

  it('should handle errors from Supabase', async () => {
    const mockUser = { id: 'user-123' };
    (useAuth as any).mockReturnValue({ user: mockUser });

    const mockError = new Error('Database error');

    const mockLimit = mock().mockResolvedValue({ data: null, error: mockError });
    const mockOrder = mock().mockReturnValue({ limit: mockLimit });
    const mockSelect = mock().mockReturnValue({ order: mockOrder });

    (supabase.from as any).mockReturnValue({ select: mockSelect });

    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
  });
});