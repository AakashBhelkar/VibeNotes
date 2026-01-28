import { useRef, useEffect, useCallback } from 'react';

interface SwipeConfig {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
    threshold?: number; // Minimum distance for swipe (default: 50px)
    enabled?: boolean;
}

interface TouchPoint {
    x: number;
    y: number;
    time: number;
}

/**
 * Hook for handling swipe gestures on touch devices
 */
export function useSwipeGesture<T extends HTMLElement = HTMLElement>(
    config: SwipeConfig
) {
    const {
        onSwipeLeft,
        onSwipeRight,
        onSwipeUp,
        onSwipeDown,
        threshold = 50,
        enabled = true,
    } = config;

    const elementRef = useRef<T>(null);
    const touchStartRef = useRef<TouchPoint | null>(null);

    const handleTouchStart = useCallback((e: TouchEvent) => {
        if (!enabled) return;

        const touch = e.touches[0];
        touchStartRef.current = {
            x: touch.clientX,
            y: touch.clientY,
            time: Date.now(),
        };
    }, [enabled]);

    const handleTouchEnd = useCallback((e: TouchEvent) => {
        if (!enabled || !touchStartRef.current) return;

        const touch = e.changedTouches[0];
        const endPoint = {
            x: touch.clientX,
            y: touch.clientY,
            time: Date.now(),
        };

        const deltaX = endPoint.x - touchStartRef.current.x;
        const deltaY = endPoint.y - touchStartRef.current.y;
        const deltaTime = endPoint.time - touchStartRef.current.time;

        // Only register swipe if completed within 300ms
        if (deltaTime > 300) {
            touchStartRef.current = null;
            return;
        }

        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);

        // Determine if horizontal or vertical swipe
        if (absDeltaX > absDeltaY && absDeltaX > threshold) {
            // Horizontal swipe
            if (deltaX > 0 && onSwipeRight) {
                onSwipeRight();
            } else if (deltaX < 0 && onSwipeLeft) {
                onSwipeLeft();
            }
        } else if (absDeltaY > absDeltaX && absDeltaY > threshold) {
            // Vertical swipe
            if (deltaY > 0 && onSwipeDown) {
                onSwipeDown();
            } else if (deltaY < 0 && onSwipeUp) {
                onSwipeUp();
            }
        }

        touchStartRef.current = null;
    }, [enabled, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

    useEffect(() => {
        const element = elementRef.current;
        if (!element || !enabled) return;

        element.addEventListener('touchstart', handleTouchStart, { passive: true });
        element.addEventListener('touchend', handleTouchEnd, { passive: true });

        return () => {
            element.removeEventListener('touchstart', handleTouchStart);
            element.removeEventListener('touchend', handleTouchEnd);
        };
    }, [enabled, handleTouchStart, handleTouchEnd]);

    return elementRef;
}

/**
 * Hook for swipe-to-action on list items
 * Returns the current swipe offset for animation
 */
export function useSwipeToAction(config: {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    leftThreshold?: number;
    rightThreshold?: number;
    enabled?: boolean;
}) {
    const {
        onSwipeLeft,
        onSwipeRight,
        leftThreshold = 80,
        rightThreshold = 80,
        enabled = true,
    } = config;

    const elementRef = useRef<HTMLDivElement>(null);
    const startXRef = useRef<number>(0);
    const currentXRef = useRef<number>(0);
    const isDraggingRef = useRef<boolean>(false);

    const handleTouchStart = useCallback((e: TouchEvent) => {
        if (!enabled) return;

        startXRef.current = e.touches[0].clientX;
        currentXRef.current = 0;
        isDraggingRef.current = true;
    }, [enabled]);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (!enabled || !isDraggingRef.current) return;

        const delta = e.touches[0].clientX - startXRef.current;
        currentXRef.current = delta;

        // Apply transform to element
        const element = elementRef.current;
        if (element) {
            // Limit the swipe distance
            const clampedDelta = Math.max(-100, Math.min(100, delta));
            element.style.transform = `translateX(${clampedDelta}px)`;
            element.style.transition = 'none';
        }
    }, [enabled]);

    const handleTouchEnd = useCallback(() => {
        if (!enabled || !isDraggingRef.current) return;

        isDraggingRef.current = false;
        const delta = currentXRef.current;
        const element = elementRef.current;

        if (element) {
            element.style.transition = 'transform 0.2s ease-out';
            element.style.transform = 'translateX(0)';
        }

        // Trigger action if threshold reached
        if (delta < -leftThreshold && onSwipeLeft) {
            onSwipeLeft();
        } else if (delta > rightThreshold && onSwipeRight) {
            onSwipeRight();
        }

        currentXRef.current = 0;
    }, [enabled, leftThreshold, rightThreshold, onSwipeLeft, onSwipeRight]);

    useEffect(() => {
        const element = elementRef.current;
        if (!element || !enabled) return;

        element.addEventListener('touchstart', handleTouchStart, { passive: true });
        element.addEventListener('touchmove', handleTouchMove, { passive: true });
        element.addEventListener('touchend', handleTouchEnd, { passive: true });

        return () => {
            element.removeEventListener('touchstart', handleTouchStart);
            element.removeEventListener('touchmove', handleTouchMove);
            element.removeEventListener('touchend', handleTouchEnd);
        };
    }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

    return elementRef;
}
