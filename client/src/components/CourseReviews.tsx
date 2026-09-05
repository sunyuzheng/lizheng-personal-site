import { useLanguage } from "@/contexts/LanguageContext";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

// Public Maven learner reviews; Chinese excerpts follow the approved AI Builders translation.
// Employer names identify the individual reviewers, not institutional endorsements.
const reviews = [
  {
    name: "Shuyang",
    company: "OpenAI",
    role: "Member of Technical Staff",
    avatar: "/avatars/shuyang.jpg",
    en: "This course helps you build the right mindset and teach yourself more effectively.",
    zh: "很多课程教具体技巧；这门课帮你建立正确的思维方式，也让你更有效地继续自学。",
  },
  {
    name: "EZ",
    company: "Anthropic",
    role: "Engineer",
    avatar: "/avatars/ez-anthropic.webp",
    en: "There can be different new tools coming, but principles remain!",
    zh: "新工具会不断出现，但原理会留下。",
  },
];

export default function CourseReviews() {
  const { lang } = useLanguage();
  return (
    <div
      className="mt-8"
      aria-label={
        lang === "en" ? "AI Builders learner reviews" : "AI Builders学员评价"
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <p className="text-xs font-medium text-superlinear-deep">
          {lang === "en"
            ? "AI Builders · Learner reviews"
            : "AI Builders · 学员评价"}
        </p>
        <a
          href="https://maven.com/superlinear/aibuilders#reviews"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 text-xs text-superlinear-link hover:text-superlinear-deep"
        >
          {lang === "en" ? "Read on Maven" : "在Maven读原文"}
          <ExternalLink className="size-3.5" />
        </a>
      </div>
      <div className="grid border-y border-[#DDD9D0] md:grid-cols-2">
        {reviews.map((review, index) => (
          <figure
            key={review.name}
            className={cn(
              "flex flex-col py-6",
              index === 0
                ? "md:pr-9"
                : "border-t border-[#DDD9D0] md:border-l md:border-t-0 md:pl-9"
            )}
          >
            <blockquote className="text-base leading-7 text-[#302C25]">
              “{review[lang]}”
            </blockquote>
            <figcaption className="mt-auto flex items-center gap-3 pt-5">
              <img
                src={review.avatar}
                alt={review.name}
                loading="lazy"
                width={40}
                height={40}
                className="size-10 shrink-0 rounded-full object-cover"
              />
              <div>
                <p className="text-lg font-semibold leading-6 text-superlinear-ink">
                  {review.company}
                </p>
                <p className="mt-1 text-xs leading-5 text-[#5C574D]">
                  {review.name} · {review.role}
                </p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="mt-2 text-[11px] leading-5 text-[#777064]">
        {lang === "en"
          ? "Excerpts from individual learners’ public course reviews."
          : "节选自学员公开课程评价，中文为译文。"}
      </p>
    </div>
  );
}
