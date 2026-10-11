/**
 * A person on city.lizheng.ai, in words: the card that follows the pointer
 * (name, when they joined, their posts, comments and connections) and the
 * panel that opens when you look at someone, with the same card on top, then
 * their profile and a link to this view, the mix of their ties and the people
 * they know best. On phones the panel is a bottom sheet (sheet.ts).
 */
import { formatNumber, type Copy } from "./copy";
import { calendar, type Community, type Neighbour } from "./data";
import { profileUrl } from "./source";

export const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    ch =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[ch]!
  );

/** The picture sheet that faces come from (shared with the renderer). */
export interface FaceSheet {
  /** Its address, or "" when there is none. */
  url: string;
  /** Asks for it to be loaded, the first time a face is needed. */
  load(): void;
}

export class PersonPanel {
  /** The person shown, or -1. */
  member = -1;
  private showAll = false;

  constructor(
    private element: HTMLElement,
    private c: Community,
    private t: Copy,
    private faces: FaceSheet,
    private neighbours: (member: number) => Neighbour[],
    private on: {
      /** Someone in the list was chosen. */
      walk(member: number): void;
      close(): void;
      /** The panel's contents changed in place ("more"). */
      changed(): void;
    }
  ) {
    element.addEventListener("click", event => this.click(event));
  }

  name(member: number) {
    return this.c.names[member] || this.t.noName;
  }

  /** The card that follows the pointer: name, when they joined, figures. */
  cardHtml(member: number) {
    return `<b>${escapeHtml(this.name(member))}</b><span>${escapeHtml(this.joined(member))}</span>${this.figuresHtml(member)}`;
  }

  show(member: number) {
    this.member = member;
    this.showAll = false;
    this.render();
  }

  hide() {
    this.member = -1;
    this.element.hidden = true;
  }

  private joined(member: number) {
    const { year, month } = calendar(
      this.c,
      Math.max(0, this.c.joined[member])
    );
    return this.t.joined(year, month);
  }

  /** Posts, comments and the people they are in touch with; zeros left out. */
  private figuresHtml(member: number) {
    const { c, t } = this;
    const shown = (
      [
        [c.posts[member], t.figures.posts],
        [c.comments[member], t.figures.comments],
        [c.degree[member], t.figures.connections],
      ] as const
    ).filter(([value]) => value > 0);
    if (!shown.length) return "";
    return `<span class="figures">${shown
      .map(
        ([value, label]) =>
          `<span class="figure"><b>${formatNumber(value)}</b><small>${escapeHtml(label(value))}</small></span>`
      )
      .join("")}</span>`;
  }

  /** A face from the picture sheet, or the person's initial. */
  private faceHtml(member: number, size: number) {
    const { c } = this;
    const cell = c.avatarCell[member];
    if (cell < 0 || !c.avatars || !this.faces.url) {
      const name = c.names[member];
      const initial = name ? [...name][0].toUpperCase() : "·";
      return `<span class="face" aria-hidden="true">${escapeHtml(initial)}</span>`;
    }
    this.faces.load();
    const { columns, rows } = c.avatars;
    const style = `background-image:url('${this.faces.url}');background-size:${columns * size}px ${rows * size}px;background-position:-${(cell % columns) * size}px -${Math.floor(cell / columns) * size}px`;
    return `<span class="face photo" aria-hidden="true" style="${style}"></span>`;
  }

  private render() {
    const { c, t, member } = this;
    const neighbours = this.neighbours(member);
    const counts = [0, 0, 0, 0];
    for (const { pair } of neighbours) counts[c.tie[pair]]++;
    const total = neighbours.length;
    const shown = this.showAll ? neighbours : neighbours.slice(0, 40);
    const rows = shown
      .map(({ member: other, pair }) => {
        const since = calendar(c, c.pairFirst[pair]);
        const detail = [
          t.pairDetail(c.pairComments[pair], c.likes[pair]),
          t.since(since.year, since.month),
        ]
          .filter(Boolean)
          .join(" · ");
        return `<li><button type="button" data-member="${other}">${this.faceHtml(other, 26)}<span><span class="who">${escapeHtml(this.name(other))}</span><span class="detail">${escapeHtml(detail)}</span></span><span class="kind k${c.tie[pair]}">${t.ties[c.tie[pair] - 1]}</span></button></li>`;
      })
      .join("");
    const mix = total
      ? `<div class="mix" aria-hidden="true">${[3, 2, 1]
          .map(k =>
            counts[k]
              ? `<i class="m${k}" style="width:${((counts[k] / total) * 100).toFixed(2)}%"></i>`
              : ""
          )
          .join("")}</div><div class="mix-key">${[3, 2, 1]
          .map(k =>
            counts[k]
              ? `<span>${t.ties[k - 1]}<b>${formatNumber(counts[k])}</b></span>`
              : ""
          )
          .join("")}</div>`
      : "";
    const profile = c.linked[member]
      ? `<a href="${profileUrl(c.linked[member])}" target="_blank" rel="noopener">${t.profile} ↗</a>`
      : "<span></span>";
    this.element.innerHTML = `
      <button type="button" class="sheet-handle" aria-expanded="false" aria-label="${t.sheet.expand}"></button>
      <div class="panel-head">
        <button type="button" class="text-button panel-close" data-close>${t.close}</button>
        <div class="person">
          ${this.faceHtml(member, 52)}
          <div>
            <h2>${escapeHtml(this.name(member))}${c.staff.has(member) ? `<span class="badge">${t.staff}</span>` : ""}</h2>
            <p>${escapeHtml(this.joined(member))}</p>
          </div>
        </div>
        ${this.figuresHtml(member) || `<p class="alone">${t.alone}</p>`}
        <div class="panel-actions">${profile}<button type="button" class="text-button" data-share>${t.share}</button></div>
        ${mix}
      </div>
      <div class="panel-body">
        ${total ? `<h3>${t.closest}</h3><ul class="people">${rows}</ul>` : ""}
        ${!this.showAll && total > shown.length ? `<button type="button" class="text-button more" data-more>${t.more(total - shown.length)}</button>` : ""}
      </div>`;
    this.element.hidden = false;
  }

  private click(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const person = target.closest<HTMLElement>("[data-member]");
    if (person) {
      this.on.walk(Number(person.dataset.member));
    } else if (target.closest("[data-close]")) {
      this.on.close();
    } else if (target.closest("[data-more]")) {
      this.showAll = true;
      this.render();
      this.on.changed();
    } else {
      const share = target.closest<HTMLButtonElement>("[data-share]");
      if (!share) return;
      const url = `${location.origin}${location.pathname}#${this.c.linked[this.member]}`;
      navigator.clipboard?.writeText(url).then(
        () => {
          share.textContent = this.t.copied;
          setTimeout(() => (share.textContent = this.t.share), 1600);
        },
        () => {}
      );
    }
  }
}
