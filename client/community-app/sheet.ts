/**
 * On phones the person panel is a bottom sheet. It rests at a peek: who the
 * person is, their figures and the links. Drag it up (or tap its handle or
 * head) for the people they know best; drag it down to go back to the peek,
 * and from the peek down to put it away. On wider screens the panel is a
 * column at the side and the sheet leaves it alone.
 */

export type SheetState = "peek" | "full";

interface SheetOptions {
  /** Whether the panel is a sheet right now (a phone-sized screen). */
  active(): boolean;
  /** Dragged or flicked away: stop looking at the person. */
  onDismiss(): void;
  /** The sheet came to rest somewhere new. */
  onSettle(): void;
  labels: { expand: string; collapse: string };
}

const SETTLE_MS = 320;
// Pixels a finger travels before a press on the sheet becomes a drag.
const SLOP = 6;
// Pixels per millisecond that count as a flick.
const FLICK = 0.5;

export function attachSheet(panel: HTMLElement, options: SheetOptions) {
  let state: SheetState = "peek";
  // How far the sheet is pushed down from fully open, in pixels.
  let offset = 0;

  // The home indicator's strip at the bottom of the screen, which the peek
  // must clear.
  const probe = document.createElement("div");
  probe.style.cssText =
    "position:fixed;left:0;bottom:0;width:0;height:env(safe-area-inset-bottom,0px);visibility:hidden;pointer-events:none";
  document.body.appendChild(probe);

  /** How much of the sheet shows at the peek: down to the links. */
  const peekHeight = () => {
    const end =
      panel.querySelector<HTMLElement>(".panel-actions") ??
      panel.querySelector<HTMLElement>(".panel-head");
    if (!end) return 0;
    const top = panel.getBoundingClientRect().top;
    return end.getBoundingClientRect().bottom - top + 18 + probe.offsetHeight;
  };
  const restOffset = (to: SheetState) =>
    to === "full" ? 0 : Math.max(0, panel.offsetHeight - peekHeight());

  const place = (value: number, animate: boolean) => {
    offset = value;
    panel.classList.toggle("settling", animate);
    panel.style.setProperty("--sheet-y", `${value}px`);
  };

  let settleTimer = 0;
  const settle = (to: SheetState | "away") => {
    window.clearTimeout(settleTimer);
    if (to === "away") {
      place(panel.offsetHeight, true);
      settleTimer = window.setTimeout(options.onDismiss, SETTLE_MS);
      return;
    }
    state = to;
    panel.dataset.sheet = to;
    const handle = panel.querySelector(".sheet-handle");
    handle?.setAttribute("aria-expanded", String(to === "full"));
    handle?.setAttribute(
      "aria-label",
      to === "full" ? options.labels.collapse : options.labels.expand
    );
    place(restOffset(to), true);
    settleTimer = window.setTimeout(options.onSettle, SETTLE_MS);
  };

  // ---------- Dragging the handle or the head ----------
  let drag: {
    id: number;
    y: number;
    from: number;
    moved: boolean;
    samples: [number, number][];
  } | null = null;
  let justDragged = false;

  panel.addEventListener("pointerdown", event => {
    if (!options.active() || event.button > 0) return;
    const target = event.target as HTMLElement;
    const onHandle = !!target.closest(".sheet-handle");
    // Links, buttons and the list keep their own gestures.
    if (
      !onHandle &&
      (!target.closest(".panel-head") || target.closest("a, button"))
    )
      return;
    drag = {
      id: event.pointerId,
      y: event.clientY,
      from: offset,
      moved: false,
      samples: [[event.timeStamp, event.clientY]],
    };
  });

  panel.addEventListener("pointermove", event => {
    if (!drag || event.pointerId !== drag.id) return;
    const dy = event.clientY - drag.y;
    if (!drag.moved) {
      if (Math.abs(dy) < SLOP) return;
      drag.moved = true;
      panel.setPointerCapture(event.pointerId);
      window.clearTimeout(settleTimer);
    }
    drag.samples.push([event.timeStamp, event.clientY]);
    if (drag.samples.length > 5) drag.samples.shift();
    // Above fully open, it gives only a little.
    const next = drag.from + dy;
    place(next < 0 ? next / 4 : next, false);
  });

  const release = (event: PointerEvent) => {
    if (!drag || event.pointerId !== drag.id) return;
    const { moved, samples, from } = drag;
    drag = null;
    if (!moved) return;
    justDragged = true;
    window.setTimeout(() => (justDragged = false), 0);
    if (event.type === "pointercancel") {
      settle(state);
      return;
    }
    const [t0, y0] = samples[0];
    const speed = (event.clientY - y0) / Math.max(16, event.timeStamp - t0);
    const peek = restOffset("peek");
    const away = panel.offsetHeight;
    if (speed < -FLICK) settle("full");
    else if (speed > FLICK) settle(from < peek / 2 ? "peek" : "away");
    else if (offset > peek + (away - peek) * 0.35) settle("away");
    else settle(offset < peek / 2 ? "full" : "peek");
  };
  panel.addEventListener("pointerup", release);
  panel.addEventListener("pointercancel", release);

  // A tap on the handle opens or folds the sheet; a tap on the head at the
  // peek opens it.
  panel.addEventListener("click", event => {
    if (!options.active() || justDragged) return;
    const target = event.target as HTMLElement;
    if (target.closest(".sheet-handle")) {
      settle(state === "full" ? "peek" : "full");
    } else if (
      state === "peek" &&
      target.closest(".panel-head") &&
      !target.closest("a, button")
    ) {
      settle("full");
    }
  });

  window.addEventListener("resize", () => {
    if (!panel.hidden && options.active()) place(restOffset(state), false);
  });

  return {
    /** The height the sheet takes at the peek (0 on wide screens). */
    peekHeight: () => (options.active() ? peekHeight() : 0),
    /** A person was just shown: rise to the peek, from below if it was closed. */
    open(wasHidden: boolean) {
      if (!options.active()) return;
      if (wasHidden) {
        place(panel.offsetHeight, false);
        void panel.offsetHeight;
      }
      settle("peek");
    },
    /** The panel's contents changed in place: keep the sheet where it is. */
    refresh() {
      if (!options.active()) return;
      panel.dataset.sheet = state;
      settle(state);
    },
  };
}
