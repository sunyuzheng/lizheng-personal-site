/** Words on city.lizheng.ai. Chinese is the default; English lives at /en. */

export type Lang = "zh" | "en";

const fmt = (value: number) => value.toLocaleString("en-US");
const MONTHS_EN = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export interface Copy {
  htmlLang: string;
  title: string;
  description: string;
  eyebrow: string;
  heading: string;
  lede: string;
  stats: { members: string; pairs: string };
  ties: [string, string, string];
  rings: string;
  hint: string;
  /** On touch screens, where a first tap zooms in. */
  hintTouch: string;
  rotateHint: string;
  zoom: { label: string; in: string; out: string; all: string };
  sheet: { collapse: string; expand: string };
  month: (year: number, month: number) => string;
  ringLabel: (year: number, month: number) => string;
  growth: (members: number, pairs: number) => string;
  play: string;
  pause: string;
  replay: string;
  skip: string;
  find: {
    label: string;
    placeholder: string;
    empty: (query: string) => string;
  };
  random: string;
  join: string;
  note: (date: string) => string;
  home: string;
  date: (iso: string) => string;
  close: string;
  joined: (year: number, month: number) => string;
  connected: (count: number) => string;
  alone: string;
  activity: (posts: number, comments: number) => string;
  closest: string;
  pairDetail: (comments: number, likes: number) => string;
  since: (year: number, month: number) => string;
  more: (count: number) => string;
  profile: string;
  share: string;
  copied: string;
  staff: string;
  noName: string;
  canvasLabel: (members: number, pairs: number) => string;
  fallback: string;
  loading: string;
  failed: string;
}

const zh: Copy = {
  htmlLang: "zh-CN",
  title: "我们在建一座城｜超线性学院社区地图",
  description:
    "超线性学院的每一位成员是一盏灯；谁给谁留过言、点过赞，两盏灯之间就亮起一条线。看看这座城是怎么一圈一圈长起来的。",
  eyebrow: "超线性学院 · Superlinear Academy",
  heading: "我们在建一座城",
  lede: "每一盏灯是一位成员。谁给谁留过言、点过赞，两盏灯之间就亮起一条线。",
  stats: { members: "位成员", pairs: "条连接" },
  ties: ["点赞之交", "聊过几句", "常来常往"],
  rings: "越靠中间，来得越早",
  hint: "点一盏灯，看TA和谁连着",
  hintTouch: "点一下放大，再点一盏灯，看TA和谁连着",
  rotateHint: "按住右键或Shift拖动，可以转动这座城",
  zoom: { label: "缩放", in: "放大", out: "缩小", all: "全城" },
  sheet: { collapse: "收起", expand: "展开" },
  month: (year, month) => `${year}年${month}月`,
  ringLabel: (year, month) =>
    month === 1 ? `${year}年` : `${year}年${month}月`,
  growth: (members, pairs) => `${fmt(members)}位成员 · ${fmt(pairs)}条连接`,
  play: "播放",
  pause: "暂停",
  replay: "重播",
  skip: "跳过",
  find: {
    label: "按名字找一位成员",
    placeholder: "找一个人",
    empty: query => `没有找到“${query}”`,
  },
  random: "随机遇见一位",
  join: "免费加入，一起建这座城",
  note: date => `数据更新于${date}。连接来自帖子里的评论和点赞，不含私信。`,
  home: "立正的主页",
  date: iso => {
    const [y, m, d] = iso.split("-").map(Number);
    return `${y}年${m}月${d}日`;
  },
  close: "关闭",
  joined: (year, month) => `${year}年${month}月加入`,
  connected: count => `和${fmt(count)}人有来往`,
  alone: "还没有和人来往",
  activity: (posts, comments) =>
    [posts ? `发帖${fmt(posts)}` : "", comments ? `评论${fmt(comments)}` : ""]
      .filter(Boolean)
      .join(" · "),
  closest: "来往最多的人",
  pairDetail: (comments, likes) =>
    [
      comments ? `评论${fmt(comments)}次` : "",
      likes ? `点赞${fmt(likes)}次` : "",
    ]
      .filter(Boolean)
      .join(" · "),
  since: (year, month) => `${year}年${month}月起`,
  more: count => `还有${fmt(count)}人`,
  profile: "打开TA的主页",
  share: "复制这张图的链接",
  copied: "链接已复制",
  staff: "团队",
  noName: "一位成员",
  canvasLabel: (members, pairs) =>
    `超线性学院社区地图：${fmt(members)}位成员，${fmt(pairs)}条连接。越靠中间的人加入得越早。`,
  fallback:
    "这个浏览器画不出这座城（需要WebGL2）。换一个浏览器，或者去立正的主页看看社区地图。",
  loading: "城里的灯正在亮起",
  failed: "数据没有加载出来，刷新一下试试。",
};

const en: Copy = {
  htmlLang: "en",
  title: "We're building a city · Superlinear Academy community map",
  description:
    "Every member of Superlinear Academy is a light. When one comments on or likes another's post, a line lights up between them. Watch the city grow, ring by ring.",
  eyebrow: "Superlinear Academy",
  heading: "We're building a city",
  lede: "Every light is a member. When one comments on or likes another's post, a line lights up between them.",
  stats: {
    members: "members",
    pairs: "connections",
  },
  ties: ["Likes", "Conversations", "Regulars"],
  rings: "Earlier members sit nearer the middle",
  hint: "Click a light to see who they're connected to",
  hintTouch: "Tap to zoom in, then tap a light to see who they're connected to",
  rotateHint: "Right-drag or Shift-drag to turn the city",
  zoom: { label: "Zoom", in: "Zoom in", out: "Zoom out", all: "Whole city" },
  sheet: { collapse: "Collapse", expand: "Expand" },
  month: (year, month) => `${MONTHS_EN[month - 1]} ${year}`,
  ringLabel: (year, month) =>
    month === 1 ? `${year}` : `${MONTHS_EN[month - 1]} ${year}`,
  growth: (members, pairs) =>
    `${fmt(members)} members · ${fmt(pairs)} connections`,
  play: "Play",
  pause: "Pause",
  replay: "Replay",
  skip: "Skip",
  find: {
    label: "Find a member by name",
    placeholder: "Find someone",
    empty: query => `No one called “${query}”`,
  },
  random: "Meet someone at random",
  join: "Join free and help build it",
  note: date =>
    `Updated ${date}. Lines come from comments and likes on posts, never private messages.`,
  home: "Yuzheng's homepage",
  date: iso => {
    const [y, m, d] = iso.split("-").map(Number);
    return `${MONTHS_EN[m - 1]} ${d}, ${y}`;
  },
  close: "Close",
  joined: (year, month) => `Joined ${MONTHS_EN[month - 1]} ${year}`,
  connected: count =>
    `Connected with ${fmt(count)} ${count === 1 ? "person" : "people"}`,
  alone: "No connections yet",
  activity: (posts, comments) =>
    [
      posts ? `${fmt(posts)} ${posts === 1 ? "post" : "posts"}` : "",
      comments
        ? `${fmt(comments)} ${comments === 1 ? "comment" : "comments"}`
        : "",
    ]
      .filter(Boolean)
      .join(" · "),
  closest: "Most in touch with",
  pairDetail: (comments, likes) =>
    [
      comments
        ? `${fmt(comments)} ${comments === 1 ? "comment" : "comments"}`
        : "",
      likes ? `${fmt(likes)} ${likes === 1 ? "like" : "likes"}` : "",
    ]
      .filter(Boolean)
      .join(" · "),
  since: (year, month) => `since ${MONTHS_EN[month - 1]} ${year}`,
  more: count => `${fmt(count)} more`,
  profile: "Open their profile",
  share: "Copy a link to this view",
  copied: "Link copied",
  staff: "Team",
  noName: "A member",
  canvasLabel: (members, pairs) =>
    `Superlinear Academy community map: ${fmt(members)} members and ${fmt(pairs)} connections. Earlier members sit nearer the middle.`,
  fallback:
    "This browser can't draw the city (it needs WebGL2). Try another browser, or see the map on Yuzheng's homepage.",
  loading: "The city's lights are coming on",
  failed: "The data didn't load. Try refreshing.",
};

export const COPY: Record<Lang, Copy> = { zh, en };

export const formatNumber = fmt;
