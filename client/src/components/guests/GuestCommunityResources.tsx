import type { GuestCommunityResource } from "@shared/guest-data";

const groups = [
  { kind: "guest_post", zh: "本人在社区的发帖", en: "Guest posts" },
  { kind: "student_resource", zh: "学员心得与简历模板", en: "Member notes and resume templates" },
  { kind: "event", zh: "社区活动", en: "Community events" },
] as const;

/** Posts, member resources and events on Superlinear Academy that concern the guest. */
export default function GuestCommunityResources({
  resources,
  lang,
}: {
  resources: readonly GuestCommunityResource[];
  lang: "en" | "zh";
}) {
  if (!resources.length) return null;
  return (
    <section id="community-resources" className="lz-guest-section" style={{ scrollMarginTop: 96 }}>
      <h2>{lang === "en" ? "Community posts and events" : "社区文章与活动"}</h2>
      <p className="lz-guest-section-note">
        {lang === "en"
          ? "Chinese-language posts, resume resources and events on Superlinear Academy."
          : "超线性学院社区里的分享、学员整理的简历资料，以及相关活动。"}
      </p>
      {groups.map(group => {
        const items = resources.filter(item => item.kind === group.kind);
        if (!items.length) return null;
        return (
          <div key={group.kind} style={{ marginTop: 28 }}>
            <h3>{lang === "en" ? group.en : group.zh}</h3>
            <ul className="lz-guest-resources">
              {items.map(item => (
                <li key={item.url}>
                  <a href={item.url} target="_blank" rel="noopener noreferrer">{item.title} ↗</a>
                  {item.author && <p>{item.author}</p>}
                  <p>{item.summary}</p>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </section>
  );
}
