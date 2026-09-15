import type { GuestInsight } from "@shared/guest-insights";
import { ArrowUpRight } from "lucide-react";

export default function GuestInsightCard({
  article,
}: {
  article: GuestInsight;
}) {
  return (
    <article
      lang="en"
      className="mt-10 rounded-3xl border border-superlinear-on-dark/25 bg-superlinear-on-dark/[0.045] p-6 sm:p-8 lg:p-10"
    >
      <div className="grid gap-6 md:grid-cols-[0.28fr_1fr] md:gap-10">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-superlinear-on-dark">
            English insights
          </p>
          <p className="mt-2 text-xs leading-6 text-zinc-400">
            {article.readTimeMinutes
              ? `${article.readTimeMinutes} min read · `
              : ""}
            Superlinear Academy
          </p>
          {article.status === "draft" ? (
            <p className="mt-2 text-xs text-amber-200">
              Local editorial preview
            </p>
          ) : null}
        </div>
        <div className="min-w-0">
          <h2 className="max-w-3xl text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl">
            {article.title}
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-300">
            {article.summary}
          </p>
          {article.takeaways?.length ? (
            <ul className="mt-5 max-w-3xl space-y-2 border-l border-superlinear-on-dark/35 pl-5 text-sm leading-6 text-zinc-300">
              {article.takeaways.map(takeaway => (
                <li key={takeaway}>{takeaway}</li>
              ))}
            </ul>
          ) : null}
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-semibold text-superlinear-on-dark underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-superlinear-on-dark"
          >
            {article.status === "published"
              ? "Read the English insights"
              : "Read the local article draft"}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  );
}
