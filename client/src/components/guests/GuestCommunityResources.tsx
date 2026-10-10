import type { GuestCommunityResource } from "@shared/guest-data";
import { ExternalLink } from "lucide-react";

const groups = [
  { kind: "guest_post", zh: "本人在社区的发帖", en: "Guest posts" },
  {
    kind: "student_resource",
    zh: "学员心得与简历模板",
    en: "Member notes and resume templates",
  },
  { kind: "event", zh: "社区活动", en: "Community events" },
] as const;

export default function GuestCommunityResources({
  resources,
  lang,
}: {
  resources: readonly GuestCommunityResource[];
  lang: "en" | "zh";
}) {
  if (!resources.length) return null;
  return (
    <section id="community-resources" className="mt-14 scroll-mt-24">
      <p className="text-sm uppercase tracking-[0.18em] text-zinc-500">
        Superlinear Academy
      </p>
      <h2 className="mt-2 text-2xl font-bold text-white">
        {lang === "en" ? "Community posts and events" : "社区文章与活动"}
      </h2>
      <p className="mt-3 text-sm leading-7 text-zinc-400">
        {lang === "en"
          ? "Chinese-language posts, resume resources and events on Superlinear Academy."
          : "社区中的分享、学员整理的简历资料，以及相关活动入口。"}
      </p>
      <div className="mt-8 space-y-8">
        {groups.map(group => {
          const items = resources.filter(item => item.kind === group.kind);
          if (!items.length) return null;
          return (
            <div key={group.kind}>
              <h3 className="text-lg font-semibold text-white">
                {lang === "en" ? group.en : group.zh}
              </h3>
              <ul className="mt-3 grid gap-x-8 md:grid-cols-2">
                {items.map(item => (
                  <li key={item.url} className="border-t border-white/10 py-4">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-start gap-2 font-medium leading-6 text-superlinear-on-dark hover:underline"
                    >
                      <span>{item.title}</span>
                      <ExternalLink className="mt-1 h-4 w-4 shrink-0" />
                    </a>
                    {item.author && (
                      <p className="mt-1 text-xs text-zinc-500">
                        {item.author}
                      </p>
                    )}
                    <p className="mt-2 text-sm leading-7 text-zinc-400">
                      {item.summary}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
