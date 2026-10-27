import React, { useState, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

export interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onPress?: (e: React.MouseEvent | React.TouchEvent) => void | Promise<void>;
  debounceMs?: number;
  loading?: boolean;
  loadingText?: string;
  pressScale?: string; // e.g. "scale-[0.96]"
  haptic?: boolean;
  children: React.ReactNode;
}

/**
 * Low-spec mobile optimized interactive touch button.
 * - Instant visual active state on pointerdown/touchstart (zero latency).
 * - Gesture cancellation if user scrolls or drags >10px.
 * - Built-in tap debouncing to prevent accidental double-taps on laggy screens.
 * - Hardware accelerated CSS transform.
 * - Optional micro-haptic tick via navigator.vibrate.
 */
export const TouchButton: React.FC<TouchButtonProps> = ({
  onPress,
  onClick,
  debounceMs = 450,
  loading = false,
  loadingText,
  pressScale = 'scale-[0.96]',
  haptic = true,
  disabled = false,
  className = '',
  children,
  type = 'button',
  ...rest
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [isDebounced, setIsDebounced] = useState(false);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const isDragging = useRef(false);
  const debounceTimer = useRef<any>(null);

  const triggerHaptic = useCallback(() => {
    if (haptic && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate?.(8);
      } catch {
        /* ignore */
      }
    }
  }, [haptic]);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (disabled || loading || isDebounced) return;
    setIsPressed(true);
    isDragging.current = false;
    startPos.current = { x: e.clientX, y: e.clientY };
    triggerHaptic();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!startPos.current || isDragging.current) return;
    const deltaX = Math.abs(e.clientX - startPos.current.x);
    const deltaY = Math.abs(e.clientY - startPos.current.y);
    // If movement exceeds threshold, user is scrolling: cancel press feedback
    if (deltaX > 10 || deltaY > 10) {
      isDragging.current = true;
      setIsPressed(false);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isPressed && !isDragging.current) return;
    setIsPressed(false);
    startPos.current = null;

    if (isDragging.current || disabled || loading || isDebounced) {
      return;
    }

    // Immediate visual debounce lock
    setIsDebounced(true);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setIsDebounced(false);
    }, debounceMs);

    // Fire the action
    if (onPress) {
      const res = onPress(e);
      if (res && typeof res.then === 'function') {
        res.finally(() => setIsDebounced(false));
      }
    } else if (onClick) {
      onClick(e);
    }
  };

  const handlePointerCancel = () => {
    setIsPressed(false);
    startPos.current = null;
    isDragging.current = false;
  };

  // Keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      if (!isPressed && !disabled && !loading && !isDebounced) {
        setIsPressed(true);
      }
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      setIsPressed(false);
      if (!disabled && !loading && !isDebounced) {
        setIsDebounced(true);
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => setIsDebounced(false), debounceMs);
        if (onPress) onPress(e as any);
        else if (onClick) onClick(e as any);
      }
    }
  };

  const isBusy = loading || isDebounced;

  return (
    <button
      type={type}
      disabled={disabled || isBusy}
      aria-busy={isBusy}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      className={`touch-manipulation select-none outline-none will-change-transform transform-gpu transition-all duration-75 ease-out ${
        isPressed ? `${pressScale} brightness-95 filter` : 'scale-100'
      } ${isBusy ? 'opacity-80 pointer-events-none' : ''} ${className}`}
      {...rest}
    >
      {isBusy && loadingText ? (
        <span className="inline-flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>{loadingText}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};
