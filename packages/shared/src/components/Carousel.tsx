import { Children } from "react";
import type { ReactNode } from "react";
import { useCarousel } from "./useCarousel";
import { Pause, Play, ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselProps {
  children: ReactNode;
  autoplayMs?: number;
  loop?: boolean;
  showProgress?: boolean;
  showNav?: boolean;
  showDots?: boolean;
  showControls?: boolean;
  bordered?: boolean;
}

export function Carousel({
  children,
  autoplayMs = 5000,
  loop = true,
  showProgress = false,
  showNav = false,
  showDots = true,
  showControls = false,
  bordered = true
}: CarouselProps) {
  const slides = Children.toArray(children);
  const {
    current, next, prev, goTo,
    pause, play, toggle, playing, progress,
    dragOffset, isDragging, dragHandlers,
  } = useCarousel({ total: slides.length, autoplayMs, loop });

  return (
    <div
      className={`rounded-xl overflow-hidden transition-all ${bordered ? "border border-border" : ""
        }`}
      onMouseEnter={pause}
      onMouseLeave={play}
      onFocus={pause}
      onBlur={play}
    >
      {showProgress && (
        <div className="h-0.5 bg-border/30">
          <div
            className="h-full bg-foreground transition-none"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="overflow-hidden cursor-grab active:cursor-grabbing" {...dragHandlers}>
        <div
          className={`flex ${isDragging ? "" : "transition-transform duration-300 ease-out"}`}
          style={{ transform: `translateX(calc(-${current * 100}% + ${dragOffset}px))` }}
        >
          {slides.map((slide, i) => (
            <div key={i} className="min-w-full select-none">
              {slide}
            </div>
          ))}
        </div>
      </div>

      {(showNav || showDots || showControls) && (
        <div className={`flex items-center justify-between px-4 py-2.5 ${bordered ? "border-t border-border/40" : ""
          }`}>
          {showNav ? (
            <button
              onClick={prev}
              className="p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft size={18} />
            </button>
          ) : (
            <div />
          )}

          {showDots && (
            <div className="flex gap-1.5 items-center">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`h-1.5 rounded-full transition-all duration-200 ${i === current
                    ? "w-5 bg-foreground"
                    : "w-1.5 bg-border hover:bg-foreground/40"
                    }`}
                />
              ))}
            </div>
          )}

          <div className="flex items-center gap-1">
            {showControls && (
              <button
                onClick={toggle}
                className="p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                {playing ? <Pause size={14} /> : <Play size={14} />}
              </button>
            )}
            {showNav && (
              <button
                onClick={next}
                className="p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <ChevronRight size={18} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}