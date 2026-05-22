import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from './use-mobile';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

const MOBILE_BREAKPOINT = 768;

describe('useIsMobile', () => {
  let addEventListenerSpy: ReturnType<typeof vi.fn>;
  let removeEventListenerSpy: ReturnType<typeof vi.fn>;
  const originalInnerWidth = window.innerWidth;

  beforeEach(() => {
    addEventListenerSpy = vi.fn();
    removeEventListenerSpy = vi.fn();

    // Mock matchMedia implementation for this test suite
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // Deprecated
      removeListener: vi.fn(), // Deprecated
      addEventListener: addEventListenerSpy,
      removeEventListener: removeEventListenerSpy,
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    // Restore window.innerWidth to its original value
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
    vi.restoreAllMocks();
  });

  const setWindowWidth = (width: number) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
  };

  it('should return true when window width is less than the breakpoint', () => {
    setWindowWidth(MOBILE_BREAKPOINT - 100);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('should return false when window width is equal to or greater than the breakpoint', () => {
    setWindowWidth(MOBILE_BREAKPOINT);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    setWindowWidth(MOBILE_BREAKPOINT + 100);
    const { result: result2 } = renderHook(() => useIsMobile());
    expect(result2.current).toBe(false);
  });

  it('should update state when media query match changes', () => {
    setWindowWidth(MOBILE_BREAKPOINT + 100);
    const { result } = renderHook(() => useIsMobile());

    // Initially false
    expect(result.current).toBe(false);

    // Simulate window resize and media query event firing
    act(() => {
      setWindowWidth(MOBILE_BREAKPOINT - 100);
      // Find the registered change listener and trigger it
      const changeListener = addEventListenerSpy.mock.calls.find(call => call[0] === 'change')?.[1];
      if (changeListener) {
        changeListener(new Event('change'));
      }
    });

    // Should update to true
    expect(result.current).toBe(true);
  });

  it('should add event listener on mount and remove on unmount', () => {
    const { unmount } = renderHook(() => useIsMobile());

    expect(window.matchMedia).toHaveBeenCalledWith(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
