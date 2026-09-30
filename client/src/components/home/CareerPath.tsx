import type { Lang } from "@/contexts/LanguageContext";
import { Fragment } from "react";
import { HOME_COPY } from "./content";

export interface CareerStep {
  org: string;
  /** Latin organization names use the numeral serif. */
  latin: boolean;
  role: readonly string[];
}

/**
 * The career timeline band. The last step is highlighted as the present.
 * About passes its own, more detailed steps.
 */
export default function CareerPath({
  lang,
  steps = HOME_COPY[lang].career.steps,
  id,
}: {
  lang: Lang;
  steps?: readonly CareerStep[];
  id?: string;
}) {
  const t = HOME_COPY[lang].career;
  return (
    <section className="lz-career" aria-label={t.label} id={id}>
      <div className="wrap">
        <div className="lz-career-head">
          <b>{t.title}</b>
          <span>{t.line}</span>
        </div>
        <ol className="lz-cpath">
          {steps.map((step, index) => (
            <li
              key={step.org}
              className={index === steps.length - 1 ? "now" : undefined}
            >
              <b className={step.latin ? "lat" : undefined}>{step.org}</b>
              <span>
                {step.role.map((line, lineIndex) => (
                  <Fragment key={line}>
                    {lineIndex > 0 && <br />}
                    {line}
                  </Fragment>
                ))}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
