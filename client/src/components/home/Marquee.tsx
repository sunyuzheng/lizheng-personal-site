import { prefersReducedMotion } from "@/lib/scroll";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * A strip that drifts slowly on its own and can be dragged, swiped or scrolled
 * to move faster. The content is rendered twice so the loop is seamless; the
 * second copy is hidden from assistive technology and keyboard focus.
 */
export default function Marquee({
  className,
  label,
  speed,
  children,
}: {
  className: string;
  label?: string;
  /** Pixels per second while drifting. */
  speed: number;
  children: (loopCopy: boolean) => ReactNode;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const copy = copyRef.current;
    if (!scroller || !copy) return;
    const reduced = prefersReducedMotion();

    let offset = scroller.scrollLeft;
    let lastSet = offset;
    let lastTime = 0;
    let frame = 0;
    let visible = false;
    let hovered = false;
    let holdUntil = 0;
    let dragging = false;
    let moved = 0;
    let startX = 0;
    let startScroll = 0;

    // One copy's width; scrolling by exactly this much looks like no change.
    const period = () => copy.offsetWidth;
    const wrap = () => {
      const width = period();
      if (!width || reduced) return;
      if (offset >= width) offset -= width;
      else if (offset < 1) offset += width;
    };

    const tick = (time: number) => {
      frame = 0;
      if (!visible) return;
      const dt = lastTime ? Math.min(64, time - lastTime) : 0;
      lastTime = time;
      // Anything that moved the strip besides us (drag, swipe, trackpad,
      // keyboard focus) pauses the drift for a moment.
      if (Math.abs(scroller.scrollLeft - lastSet) > 1.5) {
        offset = scroller.scrollLeft;
        holdUntil = time + 1600;
      } else if (!hovered && !dragging && time > holdUntil) {
        offset += (speed * dt) / 1000;
      }
      wrap();
      if (Math.abs(offset - scroller.scrollLeft) >= 0.5) {
        scroller.scrollLeft = offset;
      }
      lastSet = scroller.scrollLeft;
      frame = requestAnimationFrame(tick);
    };
    const start = () => {
      if (!frame && visible) {
        lastTime = 0;
        frame = requestAnimationFrame(tick);
      }
    };

    // Mouse drag; touch and trackpads scroll natively.
    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      dragging = true;
      moved = 0;
      startX = event.clientX;
      startScroll = scroller.scrollLeft;
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      const dx = event.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      if (moved > 4) {
        scroller.classList.add("dragging");
        scroller.scrollLeft = startScroll - dx;
        offset = scroller.scrollLeft;
        wrap();
        if (offset !== scroller.scrollLeft) {
          // Keep the drag continuous across the seam.
          startScroll += offset - scroller.scrollLeft;
          scroller.scrollLeft = offset;
        }
        lastSet = scroller.scrollLeft;
        holdUntil = performance.now() + 1600;
      }
    };
    const endDrag = () => {
      dragging = false;
      scroller.classList.remove("dragging");
    };
    // A drag should not also open the link it started on.
    const onClick = (event: MouseEvent) => {
      if (moved > 4) {
        event.preventDefault();
        event.stopPropagation();
        moved = 0;
      }
    };
    const onEnter = () => (hovered = true);
    const onLeave = () => {
      hovered = false;
      endDrag();
    };

    scroller.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", endDrag);
    scroller.addEventListener("click", onClick, true);
    scroller.addEventListener("pointerenter", onEnter);
    scroller.addEventListener("pointerleave", onLeave);
    scroller.addEventListener("focusin", onEnter);
    scroller.addEventListener("focusout", onLeave);

    const observer = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting) && !reduced;
      if (visible) start();
    });
    observer.observe(scroller);

    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
      scroller.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", endDrag);
      scroller.removeEventListener("click", onClick, true);
      scroller.removeEventListener("pointerenter", onEnter);
      scroller.removeEventListener("pointerleave", onLeave);
      scroller.removeEventListener("focusin", onEnter);
      scroller.removeEventListener("focusout", onLeave);
    };
  }, [speed]);

  return (
    <div
      ref={scrollerRef}
      className={`marquee ${className}`}
      role="group"
      aria-label={label}
    >
      <div className="marquee-track">
        <div ref={copyRef} className="marquee-copy">
          {children(false)}
        </div>
        <div className="marquee-copy" aria-hidden="true">
          {children(true)}
        </div>
      </div>
    </div>
  );
}
