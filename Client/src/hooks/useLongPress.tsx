import { useRef, useCallback } from "react";

interface UseLongPressOptions {
  onLongPress?: () => void;
  onShortPress?: () => void;
  longPressDuration?: number;
  movementThreshold?: number;
}

interface LongPressHandlers {
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export const useLongPress = ({
  onLongPress,
  onShortPress,
  longPressDuration = 500,
  movementThreshold = 10,
}: UseLongPressOptions): LongPressHandlers => {
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const startPos = useRef({ x: 0, y: 0 });
  const isLongPressing = useRef(false);
  const hasMovedTooMuch = useRef(false);
  const startTime = useRef<number>(0);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    isLongPressing.current = false;
    hasMovedTooMuch.current = false;
  }, []);

  const handleLongPressStart = useCallback(
    (clientX: number, clientY: number) => {
      if (!onLongPress && !onShortPress) return;

      clearLongPressTimer();

      startPos.current = { x: clientX, y: clientY };
      startTime.current = Date.now();
      hasMovedTooMuch.current = false;
      isLongPressing.current = true;

      if (onLongPress) {
        longPressTimer.current = setTimeout(() => {
          if (isLongPressing.current && !hasMovedTooMuch.current) {
            onLongPress();
            clearLongPressTimer();
          }
        }, longPressDuration);
      }
    },
    [onLongPress, onShortPress, longPressDuration, clearLongPressTimer]
  );

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isLongPressing.current) return;

      const deltaX = Math.abs(clientX - startPos.current.x);
      const deltaY = Math.abs(clientY - startPos.current.y);

      if (deltaX > movementThreshold || deltaY > movementThreshold) {
        hasMovedTooMuch.current = true;
        clearLongPressTimer();
      }
    },
    [movementThreshold, clearLongPressTimer]
  );

  const handleLongPressEnd = useCallback(() => {
    const pressDuration = Date.now() - startTime.current;

    if (
      isLongPressing.current &&
      !hasMovedTooMuch.current &&
      pressDuration < longPressDuration &&
      onShortPress
    ) {
      onShortPress();
    }

    clearLongPressTimer();
  }, [longPressDuration, onShortPress, clearLongPressTimer]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      handleLongPressStart(e.clientX, e.clientY);
    },
    [handleLongPressStart]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    },
    [handleMove]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      handleLongPressEnd();
    },
    [handleLongPressEnd]
  );

  const handleMouseLeave = useCallback(() => {
    clearLongPressTimer();
  }, [clearLongPressTimer]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      handleLongPressStart(touch.clientX, touch.clientY);
    },
    [handleLongPressStart]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    },
    [handleMove]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      handleLongPressEnd();
    },
    [handleLongPressEnd]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (onLongPress) {
        e.preventDefault();
      }
    },
    [onLongPress]
  );

  return {
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
    onMouseLeave: handleMouseLeave,
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onContextMenu: handleContextMenu,
  };
};
