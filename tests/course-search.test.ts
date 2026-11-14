import { describe, expect, it } from "vitest";
import {
  COURSE_COPY,
  COURSE_ID,
  COURSE_SITE,
  COURSES_PAGE_META,
  YAGE_ID,
  buildCoursesStructuredData,
} from "../shared/courses";
import { PERSON_ID, SUPERLINEAR_ID } from "../shared/structured-data";
import { withLanguage } from "../client/src/lib/language-url";

describe("course discovery across the personal and course sites", () => {
  it.each(["zh", "en"] as const)(
    "keeps the %s page, instructor identities, and course destination consistent",
    lang => {
      const meta = COURSES_PAGE_META[lang];
      expect(withLanguage("/courses", lang)).toBe(
        new URL(meta.canonical).pathname
      );
      const graph = buildCoursesStructuredData(lang)["@graph"] as Array<
        Record<string, unknown>
      >;
      const page = graph.find(node => node["@type"] === "WebPage")!;
      const course = graph.find(node => node["@id"] === COURSE_ID)! as {
        url: string;
        author: Array<{ "@id": string }>;
        provider: { "@id": string };
        hasPart: Array<{ name: string; inLanguage: string | string[] }>;
        offers?: unknown;
      };
      expect(page.url).toBe(meta.canonical);
      expect(page.mainEntity).toEqual({ "@id": COURSE_ID });
      expect(course.url).toBe(COURSE_SITE);
      expect(course.author).toEqual([{ "@id": PERSON_ID }, { "@id": YAGE_ID }]);
      expect(course.provider).toEqual({ "@id": SUPERLINEAR_ID });
      for (const author of course.author)
        expect(graph.some(node => node["@id"] === author["@id"])).toBe(true);
      expect(course.hasPart.map(part => part.name)).toEqual(
        COURSE_COPY[lang].courses.map(part => part.name)
      );
      expect(
        course.hasPart
          .filter(part => Array.isArray(part.inLanguage))
          .map(part => part.name)
      ).toEqual(["AI Builders", "AI Architect"]);
      // This guide should not create a second checkout or a drifting price offer.
      expect(course.offers).toBeUndefined();
    }
  );
});
