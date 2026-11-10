import { useLanguage } from "@/contexts/LanguageContext";
import { Quotation } from "@/components/home/Peers";

// Public Maven learner reviews; Chinese text translates the selected excerpts.
// EZ: use the opening course evaluation, not the following general view about tools.
// Source: course-marketing-system/05_assets/proof-library/processed/maven-review-shortlist.json
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
    en: "I love how the course is being structured, it not only use live demo, but also include lots of principles to help build mental models how we can best leverage AI to build!",
    zh: "我很喜欢这门课的设计：既有现场演示，也讲了很多原理，帮助我们建立如何更好地用AI做东西的思维模型。",
  },
];

/** Two learners' words, set like the peers' quotations, with the way to the originals on Maven. */
export default function CourseReviews() {
  const { lang } = useLanguage();
  return (
    <div
      aria-label={
        lang === "en" ? "AI Builders learner reviews" : "AI Builders学员评价"
      }
    >
      <ul className="peer-list">
        {reviews.map(review => (
          <li key={review.name}>
            <figure>
              <blockquote>
                <Quotation text={review[lang]} />
              </blockquote>
              <figcaption>
                <img
                  src={review.avatar}
                  alt=""
                  loading="lazy"
                  width={44}
                  height={44}
                />
                <span>
                  <b>{review.company}</b>
                  <small>
                    {review.name} · {review.role}
                  </small>
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
      <p className="source">
        <span>
          {lang === "en"
            ? "Excerpts from individual learners’ public course reviews."
            : "节选自学员公开课程评价，中文为译文。"}
        </span>
        <a
          className="lz-link"
          href="https://maven.com/superlinear/aibuilders#reviews"
          target="_blank"
          rel="noopener noreferrer"
        >
          {lang === "en" ? "Read on Maven" : "在Maven读原文"}{" "}
          <i aria-hidden="true">→</i>
        </a>
      </p>
    </div>
  );
}
