import { useCallback, useEffect, useRef, useState } from "react";

interface Options {
  total: number;
  autoplayMs?: number;
  loop?: boolean;
  dragThreshold?: number; // px to trigger slide change, default: 50
}

export function useCarousel({
  total,
  autoplayMs = 5000,
  loop = true,
  dragThreshold = 50,
}: Options) {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dragStartX = useRef<number | null>(null);

  const next = useCallback(() => {
    setCurrent((i) => (loop ? (i + 1) % total : Math.min(i + 1, total - 1)));
  }, [total, loop]);

  const prev = useCallback(() => {
    setCurrent((i) =>
      loop ? (i - 1 + total) % total : Math.max(i - 1, 0)
    );
  }, [total, loop]);

  const goTo = useCallback((i: number) => setCurrent(i), []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
  }, []);

  const startTimer = useCallback(() => {
    if (!autoplayMs) return;
    stopTimer();
    setProgress(0);

    const step = 50;
    progressRef.current = setInterval(() => {
      setProgress((p) => p + (step / autoplayMs) * 100);
    }, step);

    timerRef.current = setTimeout(() => {
      next();
      setProgress(0);
    }, autoplayMs);
  }, [autoplayMs, next, stopTimer]);

  useEffect(() => {
    if (playing) startTimer();
    else stopTimer();
    return stopTimer;
  }, [playing, current, startTimer, stopTimer]);

  const pause = useCallback(() => setPlaying(false), []);
  const play = useCallback(() => setPlaying(true), []);
  const toggle = useCallback(() => setPlaying((p) => !p), []);

  // --- drag handlers ---

  const onDragStart = useCallback(
    (e: React.PointerEvent) => {
      dragStartX.current = e.clientX;
      setIsDragging(true);
      setDragOffset(0);
      pause();
    },
    [pause]
  );

  const onDragMove = useCallback((e: React.PointerEvent) => {
    if (dragStartX.current === null) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDragOffset(e.clientX - dragStartX.current);
  }, []);

  const onDragEnd = useCallback(
    (e: React.PointerEvent) => {
      if (dragStartX.current === null) return;
      const delta = e.clientX - dragStartX.current;

      if (delta < -dragThreshold) next();
      else if (delta > dragThreshold) prev();

      dragStartX.current = null;
      setIsDragging(false);
      setDragOffset(0);
      play();
    },
    [dragThreshold, next, prev, play]
  );

  return {
    current, next, prev, goTo,
    pause, play, toggle, playing, progress,
    dragOffset, isDragging,
    dragHandlers: { onPointerDown: onDragStart, onPointerMove: onDragMove, onPointerUp: onDragEnd, onPointerCancel: onDragEnd },
  };
}