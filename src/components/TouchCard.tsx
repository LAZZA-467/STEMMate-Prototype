import React, { useState, useRef, useCallback } from 'react';

export interface TouchCardProps extends React.HTMLAttributes<HTMLDivElement> {
  onPress?: (e: React.MouseEvent | React.TouchEvent) => void;
  debounceMs?: number;
  pressScale?: string;
  haptic?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

/**
 * TouchCard: Wraps interactive cards and list items for instant touch feedback
 * and scroll-safe interaction on low-spec mobile devices.
 */
export const TouchCard: React.FC<TouchCardProps> = ({
  onPress,
  onClick,
  debounceMs = 350,
  pressScale = 'scale-[0.985]',
  haptic = true,
  disabled = false,
  className = '',
  children,
  ...rest
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const isDragging = useRef(false);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const debounceTimer = useRef<any>(null);
  const isDebounced = useRef(false);

  const triggerHaptic = useCallback(() => {
    if (haptic && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate?.(6);
      } catch {
        /* ignore */
      }
    }
  }, [haptic]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || isDebounced.current) return;
    setIsPressed(true);
    isDragging.current = false;
    startPos.current = { x: e.clientX, y: e.clientY };
    triggerHaptic();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!startPos.current || isDragging.current) return;
    const deltaX = Math.abs(e.clientX - startPos.current.x);
    const deltaY = Math.abs(e.clientY - startPos.current.y);
    if (deltaX > 10 || deltaY > 10) {
      isDragging.current = true;
      setIsPressed(false);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPressed && !isDragging.current) return;
    setIsPressed(false);
    startPos.current = null;

    if (isDragging.current || disabled || isDebounced.current) {
      return;
    }

    isDebounced.current = true;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      isDebounced.current = false;
    }, debounceMs);

    if (onPress) {
      onPress(e);
    } else if (onClick) {
      onClick(e);
    }
  };

  const handlePointerCancel = () => {
    setIsPressed(false);
    startPos.current = null;
    isDragging.current = false;
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      className={`touch-manipulation select-none outline-none will-change-transform transform-gpu transition-all duration-75 ease-out cursor-pointer ${
        isPressed ? `${pressScale} brightness-95 shadow-xs` : 'scale-100'
      } ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};
