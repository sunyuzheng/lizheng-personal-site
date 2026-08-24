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
  "把全球AI工程师网络与上海产业生态连接起来",
  "上海站由三组长期积累共同推进",
  "孟颖、Yuzheng和Jolin各自负责一块不可替代的工作",
  "AIE把工程师、研究者、创始人与CTO带到同一个技术现场",
  "上海站不是一场海外会议的平移",
  "在协会已有平台上，再增加一层高密度工程实践交流",
  "上海站已启动，并进入更深的本地协作阶段",
  "合作方案应该从协会会员企业的真实需求出发",
  "双方先从一个边界清楚、能执行的合作包开始",
  "先确认四件事，再用一周跑通第一轮",
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
}: TextProps) {
  return (
    <div
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
  const footerColor = dark ? "rgba(255,255,255,.62)" : C.muted;
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
      <Text x={72} y={44} w={620} h={22} size={13} color={dark ? C.white : C.brand} weight={700}>
        {section}
      </Text>
      <ImageAsset
        src={dark ? "aie-white.png" : "aie-black.png"}
        alt="AI Engineer Shanghai"
        x={1054}
        y={30}
        w={168}
        h={48}
        fit="contain"
      />
      {children}
      <Text x={72} y={685} w={760} h={18} size={11} color={footerColor} weight={700}>
        AI ENGINEER  ·  STANDUP PARTNERS  ·  AROGO INTELLIGENCE
      </Text>
      <Text x={1174} y={685} w={48} h={18} size={11} color={footerColor} weight={700} align="right">
        {String(page).padStart(2, "0")}
      </Text>
    </article>
  );
}

function SlideTitle({ children, size = 48 }: { children: ReactNode; size?: number }) {
  return (
    <Text x={72} y={82} w={1136} h={80} size={size} color={C.ink} weight={700} lineHeight={1.03}>
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
      <ImageAsset src="stage.jpg" alt="AI Engineer World’s Fair现场" x={790} y={0} w={490} h={720} />
      <Rect x={754} y={0} w={60} h={720} color={C.brand} />
      <ImageAsset src="aie-white.png" alt="AI Engineer Shanghai" x={72} y={48} w={276} h={86} fit="contain" />
      <Text x={72} y={158} w={650} h={32} size={20} color="rgba(255,255,255,.82)" weight={700}>
        AIE Shanghai 2026 × 上海市人工智能行业协会
      </Text>
      <Text x={72} y={214} w={650} h={190} size={55} color={C.white} weight={700} lineHeight={0.98}>
        {"把全球AI工程师网络\n与上海产业生态连接起来"}
      </Text>
      <Rule x={72} y={430} w={62} h={7} color={C.coral} />
      <Text x={72} y={468} w={650} h={32} size={21} color={C.white} weight={700}>
        2026年11月5–6日  ·  上海虹桥希尔顿  ·  800人
      </Text>
      <Text x={72} y={514} w={650} h={24} size={13} color="rgba(255,255,255,.72)" weight={700}>
        OPEN SOURCE MODELS & AI INFRA  /  PHYSICAL AI
      </Text>
      <Text x={72} y={604} w={650} h={22} size={14} color="rgba(255,255,255,.72)" weight={700}>
        项目团队  ·  AI Engineer  ·  Standup Partners  ·  Arogo Intelligence
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

function Slide02() {
  const groups = [
    { x: 72, number: "01", title: "AI Engineer 官方", body: "全球品牌与会议网络\n内容标准与专业录制\n国际渠道与会后分发", color: C.brand },
    { x: 448, number: "02", title: "Standup Partners", body: "国际嘉宾与赞助商网络\nprogram、增长与商业化\n对外合作与项目协同", color: C.deep },
    { x: 824, number: "03", title: "Arogo Intelligence", body: "国内市场与上海企业合作\n产业生态与高层沟通\n会务与项目落地", color: C.coral },
  ];

  return (
    <SlideShell page={2} section="01  /  TEAM & OPERATING MODEL">
      <SlideTitle size={47}>上海站由三组长期积累共同推进</SlideTitle>
      <Text x={72} y={164} w={1136} h={54} size={22} color={C.body} lineHeight={1.2}>
        美国团队负责全球品牌、内容与国际资源；中国团队负责国内市场、上海产业合作与项目落地。
      </Text>
      <Rule x={150} y={324} w={980} h={3} color={C.line} />
      {groups.map(group => (
        <div key={group.number}>
          <Text x={group.x} y={244} w={74} h={24} size={14} color={group.color} weight={700}>{group.number}</Text>
          <Text x={group.x} y={274} w={330} h={46} size={27} color={C.ink} weight={700}>{group.title}</Text>
          <Rect x={group.x + 132} y={311} w={26} h={26} color={group.color} radius={13} />
          <Text x={group.x} y={374} w={330} h={126} size={22} color={C.body} weight={500} lineHeight={1.3}>{group.body}</Text>
        </div>
      ))}
      <Rect x={72} y={554} w={1136} h={78} color={C.pale} />
      <Text x={100} y={571} w={1080} h={44} size={27} color={C.deep} weight={700} align="center" valign="center">
        全球资源带进来，本地团队把它落进上海企业与产业生态。
      </Text>
    </SlideShell>
  );
}

function TeamColumn({ x, name, identity, proof, role, color }: { x: number; name: string; identity: string; proof: string; role: string; color: string }) {
  return (
    <div>
      <Rect x={x} y={190} w={340} h={8} color={color} />
      <Text x={x} y={222} w={340} h={42} size={29} color={C.ink} weight={700}>{name}</Text>
      <Text x={x} y={274} w={340} h={52} size={17} color={color} weight={700} lineHeight={1.22}>{identity}</Text>
      <Rule x={x} y={340} w={340} />
      <Text x={x} y={368} w={340} h={126} size={19} color={C.body} lineHeight={1.28}>{proof}</Text>
      <Rect x={x} y={518} w={340} h={94} color={C.pale} />
      <Text x={x + 20} y={536} w={300} h={58} size={18} color={C.deep} weight={700} lineHeight={1.2}>{role}</Text>
    </div>
  );
}

function Slide03() {
  return (
    <SlideShell page={3} section="02  /  CORE TEAM">
      <SlideTitle size={43}>孟颖、Yuzheng和Jolin，各自负责一块不可替代的工作</SlideTitle>
      <TeamColumn x={72} name="李孟颖  Mengying Li" identity="增长 · 数据 · 商业化" proof="曾在Notion、MotherDuck、Braintrust等科技公司负责增长与数据；长期服务developer tools与B2B SaaS，也是a16z Scout和天使投资人。" role="AIE Shanghai：国际增长、赞助商合作、数据与商业化机制" color={C.brand} />
      <TeamColumn x={470} name="孙煜征  Yuzheng Sun" identity="PROGRAM · 技术内容 · 中美连接" proof="曾任Amazon经济学家、Meta数据科学家、腾讯IEG数据与AI副总监；OpenAI收购团队早期成员；现为Superlinear Academy创始人。" role="AIE Shanghai：program方向、内容判断、技术嘉宾与开发者社区连接" color={C.deep} />
      <TeamColumn x={868} name="Jolin  ·  Arogo" identity="上海产业合作 · 项目落地" proof="13年微软中国工作经历，覆盖解决方案销售、企业客户与总裁办公室业务运营；组织过多次2,000+人大型活动。" role="AIE Shanghai：本地企业与产业合作、高层沟通、会务与落地" color={C.coral} />
    </SlideShell>
  );
}

function Slide04() {
  const metrics = [
    { x: 72, value: "15,000+", label: "位AI工程师线下参与" },
    { x: 242, value: "600+", label: "位speaker登台" },
    { x: 412, value: "10M+", label: "2025年内容观看" },
    { x: 582, value: "4", label: "个大洲的会议网络" },
  ];

  return (
    <SlideShell page={4} section="03  /  ABOUT AI ENGINEER">
      <SlideTitle size={43}>AIE把工程师、研究者、创始人与CTO带到同一个技术现场</SlideTitle>
      <Text x={72} y={166} w={680} h={86} size={22} color={C.body} lineHeight={1.28}>
        围绕模型、Agent、开发者工具、基础设施与生产部署，分享真正跑起来的系统、demo、trade-off与failure case。
      </Text>
      <Rect x={72} y={278} w={680} h={78} color={C.pale} />
      <Text x={96} y={296} w={632} h={46} size={20} color={C.deep} weight={700} lineHeight={1.2}>
        准备充分的stage talk、workshop与live demo会被专业录制，并继续进入全球技术内容网络。
      </Text>
      <ImageAsset src="greg.jpg" alt="Greg Brockman在AI Engineer World’s Fair演讲" x={800} y={146} w={408} h={386} />
      <Rect x={800} y={482} w={408} h={50} color={C.deep} />
      <Text x={820} y={497} w={368} h={20} size={14} color={C.white} weight={700}>Greg Brockman  ·  AI Engineer World’s Fair</Text>
      <Rule x={72} y={410} w={680} />
      {metrics.map(metric => (
        <div key={metric.value + metric.x}>
          <Text x={metric.x} y={438} w={160} h={54} size={38} color={C.brand} weight={700} valign="bottom">{metric.value}</Text>
          <Text x={metric.x} y={500} w={160} h={46} size={15} color={C.body} weight={700} lineHeight={1.15}>{metric.label}</Text>
        </div>
      ))}
      <Rect x={72} y={574} w={1136} h={58} color={C.deep} />
      <Text x={96} y={591} w={1088} h={26} size={18} color={C.white} weight={700} align="center">
        Singapore 2026  ·  1,000+ builders  ·  92 speakers  ·  新加坡外交部长与OpenAI、DeepMind等团队同场
      </Text>
    </SlideShell>
  );
}

function Slide05() {
  return (
    <SlideShell page={5} section="04  /  WHY SHANGHAI" background={C.brand} dark>
      <Text x={72} y={86} w={1136} h={76} size={51} color={C.white} weight={700} lineHeight={1.02}>上海站不是一场海外会议的平移</Text>
      <Rule x={640} y={208} w={2} h={280} color="rgba(255,255,255,.35)" />
      <Rect x={633} y={337} w={16} h={16} color={C.coral} />
      <Text x={92} y={220} w={460} h={34} size={21} color="rgba(255,255,255,.72)" weight={700}>中国团队带到现场</Text>
      <Text x={92} y={274} w={460} h={212} size={34} color={C.white} weight={700} lineHeight={1.22}>{"产业条件与算力\n数据、评测与场景\n规模化部署经验\n快速演进的应用生态"}</Text>
      <Text x={724} y={220} w={460} h={34} size={21} color="rgba(255,255,255,.72)" weight={700}>国际团队带到现场</Text>
      <Text x={724} y={274} w={460} h={212} size={34} color={C.white} weight={700} lineHeight={1.22}>{"模型、推理与架构\n开发者工具与平台\n生产系统可靠性\n全球工程师同行网络"}</Text>
      <Rect x={72} y={540} w={1136} h={88} color={C.deep} />
      <Text x={104} y={558} w={1072} h={52} size={29} color={C.white} weight={700} align="center" valign="center">让中西方团队围绕同一组工程问题，面对面展示、比较与追问。</Text>
    </SlideShell>
  );
}

function Slide06() {
  const rows = [
    { y: 204, label: "WAIC", title: "全球产业、战略、治理与政产学研广度", detail: "让上海成为全球人工智能产业与治理的重要交流平台", color: C.deep },
    { y: 330, label: "GDC", title: "开发者生态、前沿探索与社区倡议", detail: "连接开发者、开源项目、青年人才与创新实践", color: C.brand },
    { y: 456, label: "AIE SHANGHAI", title: "高密度工程实践、准备充分的stage talk与全球内容传播", detail: "在800人规模里深入生产系统、技术判断、demo与failure case", color: C.coral },
  ];
  return (
    <SlideShell page={6} section="05  /  COMPLEMENTARY POSITIONING">
      <SlideTitle size={42}>在协会已有平台上，再增加一层高密度工程实践交流</SlideTitle>
      {rows.map(row => (
        <div key={row.label}>
          <Rect x={72} y={row.y} w={224} h={94} color={row.color} />
          <Text x={92} y={row.y + 22} w={184} h={50} size={21} color={C.white} weight={700} align="center" valign="center">{row.label}</Text>
          <Text x={336} y={row.y + 4} w={836} h={42} size={26} color={C.ink} weight={700} valign="center">{row.title}</Text>
          <Text x={336} y={row.y + 54} w={836} h={34} size={18} color={C.body}>{row.detail}</Text>
          <Rule x={336} y={row.y + 98} w={836} />
        </div>
      ))}
      <Text x={72} y={608} w={1136} h={34} size={24} color={C.deep} weight={700} align="center">补充，不是替代；共同让上海的技术进展被更多同行看见。</Text>
    </SlideShell>
  );
}

function Slide07() {
  return (
    <SlideShell page={7} section="06  /  CURRENT PROGRESS">
      <SlideTitle size={44}>上海站已启动，并进入更深的本地协作阶段</SlideTitle>
      <Text x={72} y={190} w={96} h={30} size={14} color={C.coral} weight={700}>EVENT</Text>
      <Text x={72} y={228} w={510} h={92} size={27} color={C.ink} weight={700} lineHeight={1.26}>{"11月5–6日  ·  上海虹桥希尔顿\n800人  ·  中英双语现场"}</Text>
      <Rule x={72} y={342} w={510} />
      <Text x={72} y={374} w={230} h={72} size={64} color={C.brand} weight={700}>20+</Text>
      <Text x={214} y={407} w={280} h={34} size={23} color={C.ink} weight={700}>位已确认嘉宾</Text>
      <Text x={72} y={472} w={230} h={72} size={64} color={C.deep} weight={700}>7</Text>
      <Text x={178} y={505} w={320} h={34} size={23} color={C.ink} weight={700}>家已确认赞助合作方</Text>
      <Text x={72} y={574} w={510} h={54} size={16} color={C.muted} lineHeight={1.22}>已确认嘉宾来自World Labs、Cursor、Vercel、Kimi等团队；公开名单以最终官宣为准。</Text>
      <ImageAsset src="launch.png" alt="AI Engineer Shanghai 2026官方发布图" x={632} y={178} w={576} h={324} />
      <Rect x={632} y={530} w={276} h={98} color={C.pale} />
      <Text x={654} y={548} w={232} h={64} size={18} color={C.deep} weight={700} lineHeight={1.18}>{"TRACK A\nOpen Source Models & AI Infra"}</Text>
      <Rect x={932} y={530} w={276} h={98} color="#FFF0EB" />
      <Text x={954} y={548} w={232} h={64} size={18} color="#8B4638" weight={700} lineHeight={1.18}>{"TRACK B\nPhysical AI"}</Text>
    </SlideShell>
  );
}

function Slide08() {
  const questions = [
    { x: 72, y: 210, number: "01", title: "今年优先项", body: "在协会今年的企业服务、国际合作与开发者活动中，AIE Shanghai最能补上哪一块？" },
    { x: 658, y: 210, number: "02", title: "会员企业匹配", body: "围绕两条track，哪些企业最能代表上海正在发生的技术进展？" },
    { x: 72, y: 390, number: "03", title: "技术领军人", body: "哪些创始人、CTO、研究或工程负责人，有一项值得向同行讲清楚的进展？" },
    { x: 658, y: 390, number: "04", title: "合作与审批机制", body: "合作称谓、官方渠道、定向邀约与国际合作，各自需要怎样的流程和排期？" },
  ];
  return (
    <SlideShell page={8} section="07  /  LISTEN FIRST" background={C.deep} dark>
      <Text x={72} y={86} w={1136} h={90} size={47} color={C.white} weight={700} lineHeight={1.02}>合作方案应该从协会会员企业的真实需求出发</Text>
      {questions.map(question => (
        <div key={question.number}>
          <Text x={question.x} y={question.y} w={72} h={24} size={14} color={C.coral} weight={700}>{question.number}</Text>
          <Text x={question.x} y={question.y + 32} w={510} h={36} size={25} color={C.white} weight={700}>{question.title}</Text>
          <Text x={question.x} y={question.y + 80} w={510} h={78} size={19} color="rgba(255,255,255,.74)" lineHeight={1.25}>{question.body}</Text>
          <Rule x={question.x} y={question.y + 158} w={510} color="rgba(255,255,255,.22)" />
        </div>
      ))}
      <Rect x={72} y={584} w={1136} h={54} color={C.brand} />
      <Text x={96} y={599} w={1088} h={26} size={21} color={C.white} weight={700} align="center">我们先听协会判断，再共同确定合作范围。</Text>
    </SlideShell>
  );
}

function Slide09() {
  const association = ["确认协办单位 / 生态合作伙伴称谓及审批路径", "通过官方公众号、会员群与定向通知触达企业", "围绕两条track推荐会员企业与3–5位技术人选", "共同确认渠道排期与会员福利的对外口径"];
  const aie = ["协会会员专属8折票务福利，适用范围待确认", "为入选内容提供专业录制与会后全球传播", "提供经审批的宣传素材、专属链接与使用报告", "在容量内安排选择性的国际嘉宾 / 产业交流"];
  return (
    <SlideShell page={9} section="08  /  FIRST COOPERATION PACKAGE">
      <SlideTitle size={43}>双方先从一个边界清楚、能执行的合作包开始</SlideTitle>
      <Text x={72} y={190} w={520} h={34} size={20} color={C.brand} weight={700}>协会可以提供</Text>
      <Text x={668} y={190} w={520} h={34} size={20} color={C.deep} weight={700}>AIE Shanghai可以提供</Text>
      <Rule x={640} y={186} w={2} h={352} />
      {association.map((item, index) => { const y = 246 + index * 76; return <div key={item}><Text x={72} y={y} w={42} h={28} size={16} color={C.coral} weight={700}>{String(index + 1).padStart(2, "0")}</Text><Text x={122} y={y} w={470} h={54} size={20} color={C.body} weight={700} lineHeight={1.22}>{item}</Text></div>; })}
      {aie.map((item, index) => { const y = 246 + index * 76; return <div key={item}><Text x={668} y={y} w={42} h={28} size={16} color={C.coral} weight={700}>{String(index + 1).padStart(2, "0")}</Text><Text x={718} y={y} w={470} h={54} size={20} color={C.body} weight={700} lineHeight={1.22}>{item}</Text></div>; })}
      <Rect x={72} y={576} w={1136} h={58} color={C.pale} />
      <Text x={96} y={592} w={1088} h={28} size={17} color={C.deep} weight={700} align="center">嘉宾推荐仍按统一内容标准评审；赞助合作与speaker program分别确认。</Text>
    </SlideShell>
  );
}

function Slide10() {
  const decisions = [["01", "合作称谓与审批路径"], ["02", "双方各1位日常执行联系人"], ["03", "第一批目标企业与3–5位技术人选"], ["04", "渠道排期、会员福利与商务规则"]];
  const owners = [["Mengying", "AIE授权、国际合作、赞助与公开名单"], ["Jolin / Arogo", "协会接口、上海产业合作与项目落地"], ["Yuzheng", "program、内容判断与高价值技术连接"], ["高宁团队BD owner", "合同、票务、折扣码与商务往返"]];
  return (
    <SlideShell page={10} section="09  /  DECISION & NEXT STEP" background={C.deep} dark>
      <Text x={72} y={86} w={1136} h={82} size={50} color={C.white} weight={700} lineHeight={1.02}>先确认四件事，再用一周跑通第一轮</Text>
      {decisions.map((decision, index) => { const y = 212 + index * 78; return <div key={decision[0]}><Text x={82} y={y} w={62} h={38} size={20} color={C.coral} weight={700} valign="center">{decision[0]}</Text><Text x={158} y={y} w={514} h={38} size={25} color={C.white} weight={700} valign="center">{decision[1]}</Text><Rule x={82} y={y + 50} w={590} color="rgba(255,255,255,.22)" /></div>; })}
      <Rect x={720} y={202} w={488} h={338} color={C.brand} />
      <Text x={750} y={226} w={428} h={26} size={15} color="rgba(255,255,255,.7)" weight={700}>PROJECT OWNERS</Text>
      {owners.map((owner, index) => { const y = 274 + index * 64; return <div key={owner[0]}><Text x={750} y={y} w={158} h={24} size={17} color={C.white} weight={700}>{owner[0]}</Text><Text x={920} y={y} w={258} h={42} size={15} color="rgba(255,255,255,.82)" lineHeight={1.18}>{owner[1]}</Text></div>; })}
      <Rect x={72} y={582} w={1136} h={58} color={C.canvas} />
      <Text x={96} y={598} w={1088} h={28} size={25} color={C.deep} weight={700} align="center">跑通第一轮，再决定如何扩大。</Text>
    </SlideShell>
  );
}

const SLIDES = [Slide01, Slide02, Slide03, Slide04, Slide05, Slide06, Slide07, Slide08, Slide09, Slide10] as const;

export function NativeSlide({ index }: { index: number }) {
  const Component = SLIDES[index] ?? Slide01;
  return <Component />;
}

export function SlideViewport({ index, className = "" }: { index: number; className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const resize = () => {
      const nextScale = Math.min(host.clientWidth / SLIDE_WIDTH, host.clientHeight / SLIDE_HEIGHT);
      if (Number.isFinite(nextScale) && nextScale > 0) setScale(nextScale);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={hostRef} className={`flex items-center justify-center overflow-hidden ${className}`}>
      <div style={{ position: "relative", width: SLIDE_WIDTH * scale, height: SLIDE_HEIGHT * scale, flex: "0 0 auto" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: SLIDE_WIDTH, height: SLIDE_HEIGHT, transform: `scale(${scale})`, transformOrigin: "top left" }}>
          <NativeSlide index={index} />
        </div>
      </div>
    </div>
  );
}
