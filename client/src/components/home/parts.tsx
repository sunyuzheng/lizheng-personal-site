import { scrollToSection } from "@/lib/scroll";
import { Fragment, type ReactNode } from "react";
import type { Inline } from "./content";

export const EXTERNAL = {
  target: "_blank",
  rel: "noopener noreferrer",
} as const;

/** Headings are authored as explicit lines; breaks stay where the design put them. */
export function Lines({ lines }: { lines: readonly string[] }) {
  return (
    <>
      {lines.map((line, index) => (
        <Fragment key={line}>
          {index > 0 && <br />}
          {line}
        </Fragment>
      ))}
    </>
  );
}

/**
 * Chinese titles break anywhere by default, which can split a word across
 * lines. Phrases keeps each phrase together: it breaks after Chinese
 * punctuation or at an explicit "|" in the copy. A phrase longer than the line
 * still wraps inside itself, so this never causes overflow.
 */
export function Phrases({ text }: { text: string }) {
  const parts = text
    .split("|")
    .flatMap(part => part.match(/[^，：；、？！]+[，：；、？！]*/g) ?? [part]);
  if (parts.length < 2) return <>{text}</>;
  return (
    <>
      {parts.map((part, index) => (
        <span key={index} className="phrase">
          {part}
        </span>
      ))}
    </>
  );
}

export function RichText({ value }: { value: readonly Inline[] }) {
  return (
    <>
      {value.map((part, index) => {
        if (typeof part === "string") {
          return <Fragment key={index}>{part}</Fragment>;
        }
        if ("strong" in part) return <b key={index}>{part.strong}</b>;
        return (
          <a key={index} href={part.href} {...EXTERNAL}>
            {part.link}
          </a>
        );
      })}
    </>
  );
}

/** An in-page link that scrolls smoothly and still works without JavaScript. */
export function SectionLink({
  to,
  className,
  children,
}: {
  to: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={`#${to}`}
      className={className}
      onClick={event => {
        event.preventDefault();
        scrollToSection(to);
      }}
    >
      {children}
    </a>
  );
}

export function Arrow() {
  return <i aria-hidden="true">→</i>;
}
