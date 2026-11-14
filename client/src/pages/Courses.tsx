import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { useLanguage } from "@/contexts/LanguageContext";
import { withLanguage } from "@/lib/language-url";
import { applyPageSeo } from "@/lib/seo";
import { languageAlternates } from "@shared/page-meta";
import {
  COURSE_COPY,
  COURSE_SITE,
  COURSES_PAGE_META,
  MAVEN_COURSE,
  buildCoursesStructuredData,
} from "@shared/courses";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useEffect } from "react";
import { track } from "@vercel/analytics";
import { Link } from "wouter";

export default function Courses() {
  const { lang } = useLanguage();
  const text = COURSE_COPY[lang];
  useEffect(
    () =>
      applyPageSeo({
        ...COURSES_PAGE_META[lang],
        locale: lang === "en" ? "en_US" : "zh_CN",
        alternates: languageAlternates(
          COURSES_PAGE_META.en.canonical,
          COURSES_PAGE_META.zh.canonical
        ),
        jsonLd: buildCoursesStructuredData(lang),
      }),
    [lang]
  );

  return (
    <div className={`product-guide course-page${lang === "en" ? " l-en" : ""}`}>
      <a className="guide-skip" href="#course-main">
        {lang === "zh" ? "跳到正文" : "Skip to content"}
      </a>
      <SiteHeader current="courses" />
      <main id="course-main">
        <header className="guide-hero guide-wrap course-hero">
          <p className="guide-eyebrow">AI BUILDERS · 2027 EDITION</p>
          <h1>
            {text.title.map(line => (
              <span key={line}>{line}</span>
            ))}
          </h1>
          <p className="course-intro">{text.intro}</p>
          <div className="course-actions">
            <a
              className="course-primary"
              href={COURSE_SITE}
              onClick={() =>
                track("Course Link", {
                  destination: "ai-builders.com",
                  placement: "hero",
                  language: lang,
                })
              }
            >
              {text.primary}
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>
            <a href="#learning-path">
              {text.secondary}
              <ArrowRight size={17} aria-hidden="true" />
            </a>
          </div>
        </header>

        <section
          className="course-path"
          id="learning-path"
          aria-labelledby="path-title"
        >
          <div className="guide-wrap">
            <h2 id="path-title">{text.pathTitle}</h2>
            <p className="course-section-intro">{text.pathIntro}</p>
            <div className="course-grid">
              {text.courses.map((course, index) => (
                <article key={course.id} id={course.id}>
                  <p className="guide-eyebrow">
                    0{index + 1} · {course.language}
                  </p>
                  <h3>{course.name}</h3>
                  <p className="course-role">{course.role}</p>
                  <p>{course.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          className="guide-wrap course-section course-fit"
          aria-labelledby="fit-title"
        >
          <h2 id="fit-title">{text.fitTitle}</h2>
          <p>{text.fit}</p>
        </section>

        <section
          className="guide-wrap course-section"
          aria-labelledby="teachers-title"
        >
          <h2 id="teachers-title">{text.teachersTitle}</h2>
          <div className="course-teachers">
            {text.teachers.map(teacher => (
              <article key={teacher.name}>
                <p className="guide-eyebrow">{teacher.role}</p>
                <h3>{teacher.name}</h3>
                <p>{teacher.body}</p>
                {teacher.href.startsWith("/") ? (
                  <Link href={withLanguage(teacher.href, lang)}>
                    {teacher.link}
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </Link>
                ) : (
                  <a href={teacher.href}>
                    {teacher.link}
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </a>
                )}
              </article>
            ))}
          </div>
        </section>

        <section
          className="guide-wrap course-section course-faq"
          aria-labelledby="faq-title"
        >
          <h2 id="faq-title">{text.faqTitle}</h2>
          {text.faqs.map(faq => (
            <div key={faq.q}>
              <h3>{faq.q}</h3>
              <p>{faq.a}</p>
            </div>
          ))}
          <Link href={withLanguage("/for-agents", lang)}>
            {text.guide}
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </section>

        <section className="course-enroll" aria-labelledby="enroll-title">
          <div className="guide-wrap">
            <h2 id="enroll-title">{text.enrollTitle}</h2>
            <p>{text.enrollIntro}</p>
            <div className="course-actions">
              <a
                className="course-primary"
                href={COURSE_SITE}
                onClick={() =>
                  track("Course Link", {
                    destination: "ai-builders.com",
                    placement: "enrollment",
                    language: lang,
                  })
                }
              >
                {text.primary}
                <ArrowUpRight size={18} aria-hidden="true" />
              </a>
              <a
                href={MAVEN_COURSE}
                onClick={() =>
                  track("Course Link", {
                    destination: "maven.com",
                    placement: "enrollment",
                    language: lang,
                  })
                }
              >
                {text.maven}
                <ArrowUpRight size={17} aria-hidden="true" />
              </a>
            </div>
            <a
              className="course-free"
              href="https://www.superlinear.academy/c/ai-resources"
            >
              {text.free}
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
