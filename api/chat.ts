export const config = {
  runtime: "edge",
};

const SYSTEM_PROMPT = `你是一位深谙《真本事：从会工作到会赚钱》（孙煜征著）全书精髓的智能顾问。这本书的核心理念是：大多数人的职场困境不是不够努力，而是在用错误的思维模式拼命。你的任务是用书中经过亚马逊、Meta、腾讯等顶级公司实战验证的思维框架，帮用户看清问题本质，并给出具体可行的建议。

## 你的工作方式

当用户描述一个职场情境、问题或困惑时，请遵循以下三步：

### 第一步：思维诊断
先识别用户的描述中是否存在以下三种思维陷阱，指出并解释：

- **客体思维**：把责任归咎于外界（老板不公平、大环境太差、公司有问题），而非从自身可控因素出发
- **固定型思维**：认为能力已经固定，遇到挑战就退缩或找借口，而非思考"我怎么才能做到"
- **打分思维**：用单一维度（分数、头衔、薪资）衡量复杂问题，忽视多维因素

如果没有明显陷阱，可以直接进入第二步。

### 第二步：匹配框架
根据问题类型，调用最适用的框架：

| 问题类型 | 适用框架 |
|---------|---------|
| 职业选择/跳槽/换行业 | 道天地将法 |
| 工作效率/时间分配 | 10% 核心价值 |
| 升职加薪/个人定价 | 个人价值公式（市场+产品+杠杆） |
| 副业/赚钱起步 | 手艺思维 + 个人价值公式 |
| 财务规划/投资 | 财务自由公式 + 投资陷阱识别 |
| 人际/与老板关系 | 杠杆原理 + 主体思维 |

### 第三步：给出行动建议
结合用户的具体情境，给出 2-4 条具体、可立即执行的建议。做到：
- **具体**：不说"努力提升能力"，而说"在下次周报里，把你的产出从'完成了X报告'改成'X报告帮团队节省了Y小时'"
- **有依据**：引用书中的逻辑来解释为什么这样做
- **可验证**：让用户知道做了之后会有什么可观察的变化

## 核心原则

1. **个人价值由市场需求决定**，不是由努力程度或技能难度决定
2. **赚钱是一门手艺**：需要实践、反馈、迭代，不能只靠学理论
3. **行动 > 思考 > 求知**，比例至少是 6:3:1
4. **主体思维**：永远从"我能做什么"出发，而不是"他们应该怎样"
5. **劳动价值三层次**：投入层（我做了什么）→ 产出层（我做出了什么）→ 成果层（我带来了什么结果）——大多数人卡在投入层

回答时用中文，简洁而有力，避免废话。`;

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  "https://www.lizheng.ai",
  "https://lizheng.ai",
  "http://localhost:3000",
  "http://localhost:5173",
];

// Per-IP rate limit: max 20 requests per 10 minutes (Edge in-memory, resets on cold start)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_TURNS = 10;

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT) return false;

  entry.count += 1;
  return true;
}

export default async function handler(req: Request): Promise<Response> {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  // Rate limiting by IP
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("cf-connecting-ip") ??
    "unknown";

  if (!checkRateLimit(ip)) {
    return new Response(
      JSON.stringify({ error: "Too many requests, please try again later." }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Service temporarily unavailable." }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  let body: { message: string; history?: Array<{ role: string; content: string }> };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { message, history = [] } = body;

  // Input validation
  if (!message?.trim()) {
    return new Response(JSON.stringify({ error: "Message is required." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (typeof message !== "string" || message.length > MAX_MESSAGE_LENGTH) {
    return new Response(
      JSON.stringify({ error: `Message must be under ${MAX_MESSAGE_LENGTH} characters.` }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const messages = [
    ...history
      .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-MAX_HISTORY_TURNS * 2),
    { role: "user", content: message.trim() },
  ];

  const upstream = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    }),
  });

  if (!upstream.ok) {
    return new Response(
      JSON.stringify({ error: "Service temporarily unavailable." }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const data = await upstream.json() as { content?: Array<{ text: string }> };
  const content = data.content?.[0]?.text ?? "抱歉，没有收到回复，请重试。";

  return new Response(JSON.stringify({ content }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
