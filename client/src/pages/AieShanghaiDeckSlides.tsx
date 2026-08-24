import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

export const SLIDE_WIDTH = 1280;
export const SLIDE_HEIGHT = 720;

const ASSET_ROOT = "/decks/aie-shanghai-2026/assets";

const C = {
  brand: "#238343",
  deep: "#155D30",
  canvas: "#FBF9F5",
  pale: "#E8EFE5",
  ink: "#17151D",
  body: "#4B4238",
  muted: "#776F67",
  coral: "#FF8B70",
  white: "#FFFFFF",
  line: "#D8D1C5",
};

const FONT =
  'Avenir Next, -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif';

export const SLIDE_META = [
  "让上海的AI工程实践进入全球同行网络",
  "AIE的价值，不只发生在两天现场",
  "上海站不是一场海外会议的平移",
  "协会已有产业纵深，AIE补上国际工程师网络",
  "两条技术主线，围绕生产系统里的真实问题展开",
  "一个接口，接住全球内容、项目运营与上海落地",
  "这条连接，来自长期的技术、内容与社区工作",
  "上海站已经进入交付阶段",
  "最有价值的合作，是把企业、技术人和国际同行接起来",
  "先用一周，跑通一个小而完整的合作包",
] as const;

type TextProps = {
  x: number;
  y: number;
  w: number;
  h?: number;
  size: number;
  color?: string;
  weight?: CSSProperties["fontWeight"];
  lineHeight?: number;
  align?: CSSProperties["textAlign"];
  valign?: "top" | "center" | "bottom";
  children: ReactNode;
  className?: string;
};

function Text({
  x,
  y,
  w,
  h,
  size,
  color = C.body,
  weight = 400,
  lineHeight = 1.15,
  align = "left",
  valign = "top",
  children,
  className,
}: TextProps) {
  return (
    <div
      className={className}
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        display: h ? "flex" : "block",
        flexDirection: "column",
        justifyContent:
          valign === "center"
            ? "center"
            : valign === "bottom"
              ? "flex-end"
              : "flex-start",
        color,
        fontFamily: FONT,
        fontSize: size,
        fontWeight: weight,
        lineHeight,
        letterSpacing: 0,
        textAlign: align,
        whiteSpace: "pre-line",
      }}
    >
      {children}
    </div>
  );
}

function Rect({
  x,
  y,
  w,
  h,
  color,
  radius = 0,
  border,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  radius?: number;
  border?: string;
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        background: color,
        borderRadius: radius,
        border,
      }}
    />
  );
}

function Rule({
  x,
  y,
  w,
  h = 1,
  color = C.line,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  color?: string;
}) {
  return <Rect x={x} y={y} w={w} h={h} color={color} />;
}

function ImageAsset({
  src,
  alt,
  x,
  y,
  w,
  h,
  fit = "cover",
}: {
  src: string;
  alt: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fit?: CSSProperties["objectFit"];
}) {
  return (
    <img
      src={`${ASSET_ROOT}/${src}`}
      alt={alt}
      draggable={false}
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        objectFit: fit,
      }}
    />
  );
}

function SlideShell({
  page,
  section,
  background = C.canvas,
  dark = false,
  children,
}: {
  page: number;
  section: string;
  background?: string;
  dark?: boolean;
  children: ReactNode;
}) {
  const footerColor = dark ? "rgba(255,255,255,.6)" : C.muted;
  return (
    <article
      aria-label={`第${page}页：${SLIDE_META[page - 1]}`}
      style={{
        position: "relative",
        width: SLIDE_WIDTH,
        height: SLIDE_HEIGHT,
        overflow: "hidden",
        background,
        color: dark ? C.white : C.ink,
        fontFamily: FONT,
      }}
    >
      <Text
        x={72}
        y={44}
        w={620}
        h={22}
        size={13}
        color={dark ? C.white : C.brand}
        weight={700}
      >
        {section}
      </Text>
      <ImageAsset
        src={dark ? "superlinear-white.png" : "superlinear-green.png"}
        alt="Superlinear Academy"
        x={1180}
        y={32}
        w={42}
        h={42}
        fit="contain"
      />
      {children}
      <Text x={72} y={685} w={520} h={18} size={11} color={footerColor} weight={700}>
        AIE SHANGHAI 2026  ·  合作会谈
      </Text>
      <Text
        x={1174}
        y={685}
        w={48}
        h={18}
        size={11}
        color={footerColor}
        weight={700}
        align="right"
      >
        {String(page).padStart(2, "0")}
      </Text>
    </article>
  );
}

function SlideTitle({ children, size = 48 }: { children: ReactNode; size?: number }) {
  return (
    <Text x={72} y={82} w={1136} h={78} size={size} color={C.ink} weight={700} lineHeight={1.03}>
      {children}
    </Text>
  );
}

function Slide01() {
  return (
    <article
      aria-label={`第1页：${SLIDE_META[0]}`}
      style={{
        position: "relative",
        width: SLIDE_WIDTH,
        height: SLIDE_HEIGHT,
        overflow: "hidden",
        background: C.deep,
        color: C.white,
        fontFamily: FONT,
      }}
    >
      <ImageAsset src="stage.jpg" alt="AI Engineer World’s Fair现场" x={770} y={0} w={510} h={720} />
      <Rect x={748} y={0} w={44} h={720} color={C.brand} />
      <ImageAsset src="aie-white.png" alt="AI Engineer Shanghai" x={72} y={52} w={276} h={86} fit="contain" />
      <ImageAsset src="superlinear-white.png" alt="Superlinear Academy" x={1180} y={32} w={42} h={42} fit="contain" />
      <Text x={72} y={162} w={620} h={34} size={20} color="rgba(255,255,255,.8)" weight={700}>
        与上海市人工智能行业协会的合作会谈
      </Text>
      <Text x={72} y={214} w={640} h={196} size={70} color={C.white} weight={700} lineHeight={0.96}>
        {"让上海的AI工程实践\n进入全球同行网络"}
      </Text>
      <Rule x={72} y={438} w={60} h={7} color={C.coral} />
      <Text x={72} y={476} w={640} h={32} size={21} color={C.white} weight={700}>
        2026年11月5–6日  ·  上海虹桥希尔顿  ·  800人
      </Text>
      <Text x={72} y={523} w={640} h={24} size={13} color="rgba(255,255,255,.72)" weight={700}>
        OPEN SOURCE MODELS & AI INFRA  /  PHYSICAL AI
      </Text>
      <Text x={72} y={685} w={520} h={18} size={11} color="rgba(255,255,255,.6)" weight={700}>
        AIE SHANGHAI 2026  ·  合作会谈
      </Text>
      <Text x={1174} y={685} w={48} h={18} size={11} color="rgba(255,255,255,.6)" weight={700} align="right">
        01
      </Text>
    </article>
  );
}

function Metric({ x, y, value, label }: { x: number; y: number; value: string; label: string }) {
  return (
    <>
      <Text x={x} y={y} w={270} h={62} size={54} color={C.brand} weight={700} valign="bottom">
        {value}
      </Text>
      <Text x={x} y={y + 65} w={270} h={42} size={18} color={C.body} weight={700} lineHeight={1.1}>
        {label}
      </Text>
    </>
  );
}

function Slide02() {
  return (
    <SlideShell page={2} section="01  /  ABOUT AI ENGINEER">
      <SlideTitle size={50}>AIE的价值，不只发生在两天现场</SlideTitle>
      <Text x={72} y={164} w={690} h={70} size={23} lineHeight={1.22}>
        准备充分的stage talk、workshop与live demo，会被专业录制，并继续进入全球技术内容网络。
      </Text>
      <Rule x={72} y={336} w={640} />
      <Rule x={383} y={240} w={1} h={226} />
      <Metric x={72} y={236} value="15,000+" label="位AI工程师线下参与" />
      <Metric x={422} y={236} value="600+" label="位speaker登台" />
      <Metric x={72} y={356} value="10M+" label="2025年talk与workshop观看" />
      <Metric x={422} y={356} value="4" label="个大洲的会议网络" />
      <ImageAsset src="greg.jpg" alt="Greg Brockman在AI Engineer World’s Fair演讲" x={810} y={134} w={398} h={446} />
      <Rect x={810} y={530} w={398} h={50} color={C.deep} />
      <Text x={830} y={545} w={360} h={20} size={14} color={C.white} weight={700}>
        Greg Brockman  ·  AI Engineer World’s Fair
      </Text>
      <Rect x={72} y={535} w={640} h={72} color={C.pale} />
      <Text x={94} y={554} w={596} h={31} size={18} color={C.deep} weight={700}>
        Singapore 2026：1,000+ builders  ·  92 speakers  ·  4 tracks
      </Text>
    </SlideShell>
  );
}

function Slide03() {
  return (
    <SlideShell page={3} section="02  /  WHY SHANGHAI" background={C.brand} dark>
      <Text x={72} y={82} w={1136} h={78} size={51} color={C.white} weight={700} lineHeight={1.03}>
        上海站不是一场海外会议的平移
      </Text>
      <Rule x={640} y={212} w={2} h={270} color="rgba(255,255,255,.4)" />
      <Rect x={633} y={332} w={14} h={14} color={C.coral} />
      <Text x={92} y={220} w={460} h={34} size={22} color="rgba(255,255,255,.72)" weight={700}>
        中国团队正在解决
      </Text>
      <Text x={92} y={274} w={460} h={212} size={34} color={C.white} weight={700} lineHeight={1.22}>
        {"算力条件\n数据与评测\n应用场景\n规模化部署"}
      </Text>
      <Text x={724} y={220} w={460} h={34} size={22} color="rgba(255,255,255,.72)" weight={700}>
        国际团队正在解决
      </Text>
      <Text x={724} y={274} w={460} h={212} size={34} color={C.white} weight={700} lineHeight={1.22}>
        {"模型与推理\n工具与架构\n开发者生态\n生产系统可靠性"}
      </Text>
      <Rect x={72} y={538} w={1136} h={86} color={C.deep} />
      <Text x={104} y={558} w={1072} h={46} size={30} color={C.white} weight={700} align="center" valign="center">
        把方法放在同一个现场展示、比较、追问
      </Text>
    </SlideShell>
  );
}

function Slide04() {
  return (
    <SlideShell page={4} section="03  /  COMPLEMENTARY STRENGTHS">
      <SlideTitle size={45}>协会已有产业纵深，AIE补上国际工程师网络</SlideTitle>
      <Rule x={640} y={206} w={1} h={320} />
      <Text x={72} y={206} w={500} h={34} size={22} color={C.deep} weight={700}>
        上海市人工智能行业协会
      </Text>
      <Text x={72} y={258} w={220} h={72} size={62} color={C.brand} weight={700}>
        700+
      </Text>
      <Text x={248} y={286} w={160} h={30} size={22} weight={700}>
        会员企业
      </Text>
      <Text x={72} y={356} w={500} h={118} size={24} lineHeight={1.28}>
        {"产业服务  ·  国际合作\n标准与评测  ·  企业连接\nGDC主办方  ·  WAIC组委会秘书处"}
      </Text>
      <Text x={700} y={206} w={460} h={34} size={22} color={C.deep} weight={700}>
        AI ENGINEER
      </Text>
      <Text x={700} y={266} w={460} h={70} size={30} color={C.ink} weight={700} lineHeight={1.08}>
        全球工程师、研究者与技术创始人
      </Text>
      <Text x={700} y={356} w={460} h={118} size={24} lineHeight={1.28}>
        {"准备充分的stage talk\nworkshop与live demo\n专业录制与会后全球分发"}
      </Text>
      <Rect x={72} y={535} w={1136} h={88} color={C.pale} />
      <Text x={104} y={552} w={1072} h={39} size={28} color={C.deep} weight={700} align="center">
        共同把会员企业里真正值得同行听见的技术进展带到台上
      </Text>
      <Text x={104} y={596} w={1072} h={20} size={15} color={C.muted} align="center">
        与WAIC、GDC互补：更小规模、更高工程师密度、更深技术讨论。
      </Text>
    </SlideShell>
  );
}

function Slide05() {
  return (
    <SlideShell page={5} section="04  /  PROGRAM">
      <SlideTitle size={47}>两条技术主线，围绕生产系统里的真实问题展开</SlideTitle>
      <ImageAsset src="workshop.jpg" alt="AI Engineer GitHub workshop" x={72} y={184} w={540} h={240} />
      <ImageAsset src="robot.jpg" alt="AI Engineer Physical AI现场演示" x={668} y={184} w={540} h={240} />
      <Rect x={72} y={424} w={540} h={7} color={C.brand} />
      <Rect x={668} y={424} w={540} h={7} color={C.coral} />
      <Text x={72} y={454} w={120} h={24} size={14} color={C.brand} weight={700}>TRACK A</Text>
      <Text x={72} y={482} w={540} h={36} size={27} color={C.ink} weight={700}>Open Source Models & AI Infra</Text>
      <Text x={72} y={531} w={540} h={66} size={22} lineHeight={1.22}>
        {"开源模型、推理引擎、本地部署、平台API、评测\n工具链与生产可靠性"}
      </Text>
      <Text x={668} y={454} w={120} h={24} size={14} color={C.coral} weight={700}>TRACK B</Text>
      <Text x={668} y={482} w={540} h={36} size={27} color={C.ink} weight={700}>Physical AI</Text>
      <Text x={668} y={531} w={540} h={66} size={22} lineHeight={1.22}>
        {"VLA、机器人基础模型、机器人数据、仿真与Sim2Real\n部署、安全与现场演示"}
      </Text>
      <Rect x={72} y={620} w={1136} h={39} color={C.deep} />
      <Text x={95} y={630} w={1090} h={20} size={16} color={C.white} weight={700} align="center">
        11月5–6日  ·  上海虹桥希尔顿  ·  800人  ·  中英双语现场
      </Text>
    </SlideShell>
  );
}

function Slide06() {
  const nodes = [
    { x: 116, n: "01", title: "AI Engineer官方", copy: "全球品牌\n内容标准\n录制与国际渠道", color: C.brand },
    { x: 476, n: "02", title: "Standup Partners", copy: "议程与内容判断\n国际嘉宾与赞助\n增长与对外协作", color: C.deep },
    { x: 836, n: "03", title: "Arogo Intelligence", copy: "上海产业合作\n会务与合规\n本地项目落地", color: C.coral },
  ];
  return (
    <SlideShell page={6} section="05  /  OPERATING MODEL">
      <SlideTitle size={44}>一个接口，接住全球内容、项目运营与上海落地</SlideTitle>
      <Rule x={178} y={328} w={924} h={3} />
      {nodes.map(node => (
        <div key={node.n}>
          <Rect x={node.x + 124} y={314} w={28} h={28} color={node.color} radius={14} />
          <Text x={node.x} y={220} w={84} h={34} size={18} color={node.color} weight={700}>{node.n}</Text>
          <Text x={node.x} y={260} w={300} h={42} size={27} color={C.ink} weight={700}>{node.title}</Text>
          <Text x={node.x} y={378} w={300} h={116} size={22} lineHeight={1.28}>{node.copy}</Text>
        </div>
      ))}
      <Text x={476} y={504} w={300} h={24} size={14} color={C.muted} weight={700}>Mengying Li  ·  Yuzheng Sun</Text>
      <Text x={836} y={504} w={300} h={24} size={14} color={C.muted} weight={700}>Jolin  ·  Shanghai</Text>
      <Rect x={72} y={574} w={1136} h={62} color={C.pale} />
      <Text x={104} y={591} w={1072} h={29} size={24} color={C.deep} weight={700} align="center">
        协会合作不需要在多个团队之间来回寻找入口。
      </Text>
    </SlideShell>
  );
}

function Slide07() {
  const careers = [
    ["Amazon", "经济学家"],
    ["Meta", "数据科学家"],
    ["腾讯IEG", "数据与AI副总监  ·  30人团队"],
    ["Statsig", "Principal Data Scientist  ·  公司唯一布道师"],
  ];
  const metrics = [
    ["200+", "中美技术对话"],
    ["400K+", "跨平台关注"],
    ["3,000+", "付费AI Builders学员"],
    ["20,000+", "社区成员  ·  700+项目分享"],
  ];
  return (
    <SlideShell page={7} section="06  /  PROGRAM & COMMUNITY">
      <Rect x={72} y={142} w={366} h={482} color={C.pale} />
      <ImageAsset src="yuzheng.jpg" alt="孙煜征" x={88} y={126} w={334} h={482} />
      <Text x={484} y={104} w={710} h={40} size={25} color={C.brand} weight={700}>孙煜征（课代表立正）</Text>
      <Text x={484} y={148} w={724} h={100} size={44} color={C.ink} weight={700} lineHeight={1.03}>
        这条连接，来自长期的技术、内容与社区工作
      </Text>
      <Text x={484} y={248} w={724} h={32} size={21} color={C.muted} weight={700}>
        Cornell经济学博士  ·  Superlinear Academy创始人  ·  AIE Shanghai合作方
      </Text>
      {careers.map(([company, role], index) => {
        const y = 306 + index * 48;
        return (
          <div key={company}>
            <Text x={484} y={y} w={150} h={28} size={21} color={C.deep} weight={700}>{company}</Text>
            <Text x={642} y={y} w={550} h={28} size={21} weight={700}>{role}</Text>
            <Rule x={484} y={y + 34} w={724} />
          </div>
        );
      })}
      <Rule x={484} y={512} w={724} h={2} color={C.deep} />
      {metrics.map(([value, label], index) => {
        const x = 484 + index * 178;
        return (
          <div key={value}>
            <Text x={x} y={530} w={160} h={38} size={30} color={C.brand} weight={700}>{value}</Text>
            <Text x={x} y={571} w={168} h={45} size={14} weight={700} lineHeight={1.15}>{label}</Text>
          </div>
        );
      })}
      <Rect x={484} y={629} w={724} h={38} color={C.deep} />
      <Text x={504} y={639} w={684} h={20} size={16} color={C.white} weight={700} align="center">
        负责议程方向、内容判断，以及中美技术嘉宾、媒体与开发者社区连接。
      </Text>
    </SlideShell>
  );
}

function Slide08() {
  return (
    <SlideShell page={8} section="07  /  CURRENT PROGRESS">
      <SlideTitle size={52}>上海站已经进入交付阶段</SlideTitle>
      <Text x={72} y={210} w={180} h={92} size={84} color={C.brand} weight={700}>21</Text>
      <Text x={240} y={252} w={260} h={38} size={27} color={C.ink} weight={700}>位已确认嘉宾</Text>
      <Rule x={72} y={322} w={486} />
      <Text x={72} y={348} w={180} h={92} size={84} color={C.deep} weight={700}>7</Text>
      <Text x={240} y={390} w={310} h={38} size={27} color={C.ink} weight={700}>家已确认赞助合作方</Text>
      <Text x={72} y={486} w={140} h={24} size={14} color={C.coral} weight={700}>代表团队</Text>
      <Text x={72} y={518} w={520} h={102} size={19} weight={700} lineHeight={1.32}>
        {"World Labs  ·  Cursor  ·  Vercel  ·  1Password\nOllama  ·  Google Gemini  ·  Cerebras  ·  Exa\nHeyGen  ·  Kimi  ·  LanceDB  ·  Daytona"}
      </Text>
      <Text x={72} y={628} w={420} h={20} size={14} color={C.muted}>代表团队以最终官宣为准</Text>
      <ImageAsset src="launch.png" alt="AI Engineer Shanghai 2026官方发布视觉" x={636} y={174} w={572} h={322} />
      <Rect x={636} y={524} w={572} h={104} color={C.pale} />
      <Text x={660} y={548} w={524} h={64} size={22} color={C.deep} weight={700} lineHeight={1.2}>
        {"场地、技术主线、中英双语交付与基本规模已经确定。\n议程、中国头部嘉宾与产业合作继续补强中。"}
      </Text>
    </SlideShell>
  );
}

function Slide09() {
  const steps = [
    { x: 72, n: "01", title: "协会定向推荐", copy: "会员企业\n技术领军人", color: C.brand },
    { x: 366, n: "02", title: "议程内容评审", copy: "人＋为什么\n一项值得讲清的进展", color: C.deep },
    { x: 660, n: "03", title: "上海现场", copy: "stage talk\ndemo  ·  workshop", color: C.coral },
    { x: 954, n: "04", title: "会后继续传播", copy: "AIE全球内容渠道\n媒体与同行网络", color: C.brand },
  ];
  const benefits = ["合作称谓与品牌呈现", "会员专属票务福利", "选择性闭门交流", "渠道素材与会后归因"];
  return (
    <SlideShell page={9} section="08  /  PARTNERSHIP MECHANISM">
      <SlideTitle size={43}>最有价值的合作，是把企业、技术人和国际同行接起来</SlideTitle>
      <Rule x={150} y={328} w={980} h={3} />
      {steps.map(step => (
        <div key={step.n}>
          <Rect x={step.x + 118} y={314} w={28} h={28} color={step.color} radius={14} />
          <Text x={step.x} y={216} w={260} h={28} size={17} color={step.color} weight={700}>{step.n}</Text>
          <Text x={step.x} y={254} w={260} h={62} size={25} color={C.ink} weight={700} lineHeight={1.05}>{step.title}</Text>
          <Text x={step.x} y={374} w={260} h={82} size={22} lineHeight={1.2}>{step.copy}</Text>
        </div>
      ))}
      <Rect x={72} y={500} w={1136} h={88} color={C.pale} />
      {benefits.map((benefit, index) => (
        <div key={benefit}>
          {index > 0 ? <Rule x={354 + (index - 1) * 276} y={514} w={1} h={52} color="rgba(21,93,48,.25)" /> : null}
          <Text x={94 + index * 276} y={523} w={250} h={26} size={21} color={C.deep} weight={700} align="center">
            {benefit}
          </Text>
        </div>
      ))}
      <Rect x={72} y={602} w={1136} h={48} color="#FFF0EB" />
      <Text x={94} y={614} w={1092} h={26} size={17} color="#8B4638" weight={700} align="center">
        推荐不自动等于演讲席位  ·  赞助与议程分开评审  ·  品牌与联合宣发须最终审批
      </Text>
    </SlideShell>
  );
}

function Slide10() {
  const decisions = [
    ["01", "合作称谓的审批路径"],
    ["02", "双方各1位执行owner"],
    ["03", "3–5位技术人选＋一批目标会员企业"],
    ["04", "公众号、会员群与定向通知的排期"],
  ];
  return (
    <SlideShell page={10} section="09  /  DECISION" background={C.deep} dark>
      <Text x={72} y={82} w={1136} h={78} size={50} color={C.white} weight={700} lineHeight={1.03}>
        先用一周，跑通一个小而完整的合作包
      </Text>
      {decisions.map(([number, label], index) => {
        const y = 204 + index * 76;
        return (
          <div key={number}>
            <Text x={88} y={y} w={74} h={42} size={23} color={C.coral} weight={700} valign="center">{number}</Text>
            <Text x={176} y={y} w={820} h={42} size={28} color={C.white} weight={700} valign="center">{label}</Text>
            <Rule x={88} y={y + 50} w={908} color="rgba(255,255,255,.2)" />
          </div>
        );
      })}
      <Rect x={1036} y={205} w={172} h={310} color={C.brand} />
      <Text x={1062} y={232} w={120} h={22} size={13} color="rgba(255,255,255,.67)" weight={700} align="center">NEXT</Text>
      <Text x={1054} y={284} w={136} h={82} size={34} color={C.white} weight={700} align="center" lineHeight={1}>
        {"2个\n工作日"}
      </Text>
      <Rule x={1064} y={384} w={116} color="rgba(255,255,255,.4)" />
      <Text x={1054} y={412} w={136} h={48} size={38} color={C.white} weight={700} align="center">1周</Text>
      <Text x={1054} y={464} w={136} h={46} size={16} color="rgba(255,255,255,.8)" weight={700} align="center" lineHeight={1.15}>
        {"完成第一轮\n合作运行"}
      </Text>
      <Rect x={72} y={568} w={1136} h={74} color={C.canvas} />
      <Text x={104} y={586} w={1072} h={38} size={31} color={C.deep} weight={700} align="center">
        跑通第一轮，再决定如何扩大。
      </Text>
    </SlideShell>
  );
}

const SLIDES = [
  Slide01,
  Slide02,
  Slide03,
  Slide04,
  Slide05,
  Slide06,
  Slide07,
  Slide08,
  Slide09,
  Slide10,
] as const;

export function NativeSlide({ index }: { index: number }) {
  const Component = SLIDES[index] ?? Slide01;
  return <Component />;
}

export function SlideViewport({
  index,
  className = "",
}: {
  index: number;
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const resize = () => {
      const nextScale = Math.min(
        host.clientWidth / SLIDE_WIDTH,
        host.clientHeight / SLIDE_HEIGHT
      );
      if (Number.isFinite(nextScale) && nextScale > 0) setScale(nextScale);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={hostRef}
      className={`flex items-center justify-center overflow-hidden ${className}`}
    >
      <div
        style={{
          position: "relative",
          width: SLIDE_WIDTH * scale,
          height: SLIDE_HEIGHT * scale,
          flex: "0 0 auto",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: SLIDE_WIDTH,
            height: SLIDE_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <NativeSlide index={index} />
        </div>
      </div>
    </div>
  );
}
