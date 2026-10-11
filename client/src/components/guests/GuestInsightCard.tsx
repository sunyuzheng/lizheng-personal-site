import type { GuestInsight } from "@shared/guest-insights";

/** An English article about the guest, published on Superlinear Academy's Substack. */
export default function GuestInsightCard({ article }: { article: GuestInsight }) {
  return (
    <article lang="en" className="lz-guest-insight">
      <p className="lz-guest-insight-kicker">
        English insights · {article.readTimeMinutes ? `${article.readTimeMinutes} min read · ` : ""}Superlinear Academy
        {article.status === "draft" ? " · Local editorial preview" : ""}
      </p>
      <h2>{article.title}</h2>
      <p className="lz-guest-insight-summary">{article.summary}</p>
      {article.takeaways?.length ? (
        <ul>{article.takeaways.map(takeaway => <li key={takeaway}>{takeaway}</li>)}</ul>
      ) : null}
      <a className="lz-guest-link" href={article.url} target="_blank" rel="noopener noreferrer">
        {article.status === "published" ? "Read the English insights ↗" : "Read the local article draft ↗"}
      </a>
    </article>
  );
}
