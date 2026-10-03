// The public answer pages at /ask (shared/ask-public-page.ts): load the serif titles without
// holding up the first paint, and count which links people follow there in Vercel Analytics
// (event "Ask Page Link": the page, and where the link goes).
(function () {
  var fonts = document.createElement("link");
  fonts.rel = "stylesheet";
  fonts.href = "/fonts/serif.css";
  document.head.appendChild(fonts);
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  var page = location.pathname === "/ask" ? "index" : "question";
  document.addEventListener("click", function (event) {
    var link = event.target && event.target.closest ? event.target.closest("a[data-to]") : null;
    if (link) window.va("event", { name: "Ask Page Link", data: { page: page, to: link.getAttribute("data-to") } });
  });
})();
