/**
 * The search box on city.lizheng.ai. Matches show as you type (find.ts
 * decides their order), each with how many people they are in touch with;
 * the arrow keys move through them and light each one up, and Enter or a
 * click looks at that person.
 */
import type { Copy } from "./copy";
import { calendar, type Community } from "./data";
import { findMembers, normalizeName } from "./find";
import { escapeHtml } from "./panel";

export function attachSearch(
  input: HTMLInputElement,
  list: HTMLUListElement,
  c: Community,
  t: Copy,
  on: {
    typing(): void;
    /** The highlighted match, to light up. */
    preview(member: number): void;
    choose(member: number): void;
  }
) {
  const names = c.names.map(normalizeName);
  let matches: number[] = [];
  let active = 0;

  const summary = (member: number) => {
    if (c.degree[member]) return t.connected(c.degree[member]);
    const { year, month } = calendar(c, Math.max(0, c.joined[member]));
    return t.joined(year, month);
  };

  const close = () => {
    list.hidden = true;
    input.setAttribute("aria-expanded", "false");
  };

  const highlight = () => {
    for (const [i, element] of [...list.children].entries())
      element.setAttribute("aria-selected", String(i === active));
    if (matches[active] === undefined) return;
    input.setAttribute("aria-activedescendant", `find-${active}`);
    on.preview(matches[active]);
  };

  const show = (query: string) => {
    if (!query) {
      matches = [];
      close();
      return;
    }
    matches = findMembers(c, names, query);
    active = 0;
    list.innerHTML = matches.length
      ? matches
          .map(
            (member, i) =>
              `<li role="option" id="find-${i}" data-member="${member}" aria-selected="${i === active}">${escapeHtml(c.names[member])}<small>${escapeHtml(summary(member))}</small></li>`
          )
          .join("")
      : `<li class="empty">${escapeHtml(t.find.empty(query))}</li>`;
    list.hidden = false;
    input.setAttribute("aria-expanded", "true");
    highlight();
  };

  const choose = (member: number) => {
    close();
    input.value = "";
    input.blur();
    on.choose(member);
  };

  input.addEventListener("input", () => {
    on.typing();
    show(input.value.trim());
  });
  input.addEventListener("keydown", event => {
    if (event.key === "ArrowDown" && matches.length) {
      event.preventDefault();
      active = (active + 1) % matches.length;
      highlight();
    } else if (event.key === "ArrowUp" && matches.length) {
      event.preventDefault();
      active = (active - 1 + matches.length) % matches.length;
      highlight();
    } else if (event.key === "Enter" && matches[active] !== undefined) {
      event.preventDefault();
      choose(matches[active]);
    }
  });
  list.addEventListener("pointerdown", event => {
    const item = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-member]"
    );
    if (!item) return;
    event.preventDefault();
    choose(Number(item.dataset.member));
  });
  input.addEventListener("blur", () => setTimeout(close, 150));

  return {
    /** Puts the matches away and leaves the box. */
    leave() {
      input.blur();
      close();
    },
  };
}
