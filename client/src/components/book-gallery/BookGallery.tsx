import { useEffect, useRef } from "react";
import type { Lang } from "@/contexts/LanguageContext";
import { FLP_READ_URL } from "@shared/book-links";
import assets from "./assets.json";

export default function BookGallery({ lang }: { lang: Lang }) {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = container.current;
    if (!host) return;
    let active = true,
      unmount: (() => void) | undefined;
    import("./install-gallery")
      .then(({ installGallery }) => {
        if (active) unmount = installGallery(host, lang);
      })
      .catch(() => {
        if (active) host.dataset.mode = "static";
      });
    return () => {
      active = false;
      unmount?.();
    };
  }, [lang]);
  const english = lang === "en";
  return (
    <div
      ref={container}
      className="books-gallery"
      lang={english ? "en" : "zh-CN"}
    >
      <section className="book-gallery-fallback">
        <header>
          <a href={english ? "/en" : "/"}>
            {english ? "Yuzheng Sun / Books & publishing" : "孙煜征 / 书与出版"}
          </a>
          <a href={english ? "/books" : "/en/books"}>
            {english ? "中文" : "EN"}
          </a>
        </header>
        <h1 lang="en">Feels Like Progress</h1>
        <a className="book-gallery-print" href={FLP_READ_URL}>
          <img
            src={assets.cover}
            alt="Feels Like Progress"
            width="550"
            height="850"
          />
        </a>
        <footer>
          <a href={FLP_READ_URL}>
            {english ? "Read the free sample" : "免费读开头"}
          </a>
          <a href="#flp">
            {english ? "Books and publishing" : "书目与出版故事"}
          </a>
        </footer>
      </section>
    </div>
  );
}
