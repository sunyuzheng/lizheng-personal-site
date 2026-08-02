import { createHash } from "node:crypto";
import { Resolver, lookup } from "node:dns/promises";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

type NameserverSet = "current" | "target" | "skip";
type RecordType = "A" | "CNAME" | "TXT" | "MX";

interface MxValue {
  priority: number;
  exchange: string;
}

interface DnsRecord {
  name: string;
  type: RecordType;
  ttl?: number;
  minimumValues?: number;
  values?: Array<string | MxValue>;
  valueSha256?: string;
}

interface HttpCheck {
  url: string;
  status: number;
  finalUrl: string;
  titleContains?: string;
  canonical?: string;
}

interface DomainConfig {
  domain: string;
  lifecyclePhase: string;
  nameservers: {
    current: string[];
    target: string[];
  };
  routingRecords: {
    current: DnsRecord[];
    target: DnsRecord[];
  };
  records: DnsRecord[];
  httpChecks: HttpCheck[];
}

interface Options {
  server?: string;
  nameserverSet?: NameserverSet;
  dnsOnly: boolean;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.resolve(
  __dirname,
  "../docs/ops/domain/lizheng.ai.records.json"
);

function parseOptions(): Options {
  const args = process.argv.slice(2);
  const options: Options = {
    dnsOnly: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];

    if (argument === "--") {
      continue;
    }

    if (argument === "--server") {
      const value = args[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("--server requires a nameserver hostname or IP");
      }
      options.server = value;
      index += 1;
      continue;
    }

    if (argument === "--ns") {
      const value = args[index + 1] as NameserverSet | undefined;
      if (!value || !["current", "target", "skip"].includes(value)) {
        throw new Error("--ns must be current, target or skip");
      }
      options.nameserverSet = value;
      index += 1;
      continue;
    }

    if (argument === "--dns-only") {
      options.dnsOnly = true;
      continue;
    }

    throw new Error(`Unknown argument: ${argument}`);
  }

  return options;
}

function normalizeDnsName(value: string): string {
  return value.toLowerCase().replace(/\.$/, "");
}

function fqdn(name: string, domain: string): string {
  return name === "@" ? domain : `${name}.${domain}`;
}

function sorted(values: string[]): string[] {
  return [...values].sort((left, right) => left.localeCompare(right));
}

function sameStrings(actual: string[], expected: string[]): boolean {
  return JSON.stringify(sorted(actual)) === JSON.stringify(sorted(expected));
}

function extractHtmlValue(
  html: string,
  expression: RegExp
): string | undefined {
  return html.match(expression)?.[1]?.trim();
}

async function createResolver(server?: string): Promise<Resolver> {
  const resolver = new Resolver();
  if (!server) return resolver;

  const address = (await lookup(server)).address;
  resolver.setServers([address]);
  return resolver;
}

async function checkDnsRecord(
  resolver: Resolver,
  domain: string,
  record: DnsRecord
): Promise<void> {
  const hostname = fqdn(record.name, domain);

  if (record.type === "A") {
    const actual = await resolver.resolve4(hostname);
    if (record.minimumValues && actual.length < record.minimumValues) {
      throw new Error(
        `${hostname} A expected at least ${record.minimumValues} answer(s), received ${actual.length}`
      );
    }
    if (!record.values) return;

    const expected = (record.values || []) as string[];
    if (!sameStrings(actual, expected)) {
      throw new Error(`${hostname} A expected ${expected}, received ${actual}`);
    }
    return;
  }

  if (record.type === "CNAME") {
    const actual = (await resolver.resolveCname(hostname)).map(
      normalizeDnsName
    );
    const expected = ((record.values || []) as string[]).map(normalizeDnsName);
    if (!sameStrings(actual, expected)) {
      throw new Error(
        `${hostname} CNAME expected ${expected}, received ${actual}`
      );
    }
    return;
  }

  if (record.type === "TXT") {
    const actual = (await resolver.resolveTxt(hostname)).map(parts =>
      parts.join("")
    );

    if (record.valueSha256) {
      const hashes = actual.map(value =>
        createHash("sha256").update(value).digest("hex")
      );
      if (!hashes.includes(record.valueSha256)) {
        throw new Error(`${hostname} TXT hash did not match`);
      }
      return;
    }

    const expected = (record.values || []) as string[];
    if (!sameStrings(actual, expected)) {
      throw new Error(`${hostname} TXT did not match`);
    }
    return;
  }

  const actual = (await resolver.resolveMx(hostname))
    .map(value => ({
      priority: value.priority,
      exchange: normalizeDnsName(value.exchange),
    }))
    .sort((left, right) =>
      `${left.priority}:${left.exchange}`.localeCompare(
        `${right.priority}:${right.exchange}`
      )
    );
  const expected = ((record.values || []) as MxValue[])
    .map(value => ({
      priority: value.priority,
      exchange: normalizeDnsName(value.exchange),
    }))
    .sort((left, right) =>
      `${left.priority}:${left.exchange}`.localeCompare(
        `${right.priority}:${right.exchange}`
      )
    );

  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `${hostname} MX expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`
    );
  }
}

async function checkNameservers(
  resolver: Resolver,
  config: DomainConfig,
  nameserverSet: Exclude<NameserverSet, "skip">
): Promise<void> {
  const actual = (await resolver.resolveNs(config.domain)).map(
    normalizeDnsName
  );
  const expected = config.nameservers[nameserverSet].map(normalizeDnsName);
  if (!sameStrings(actual, expected)) {
    throw new Error(
      `${config.domain} NS expected ${expected}, received ${actual}`
    );
  }
}

async function checkHttp(check: HttpCheck): Promise<void> {
  const response = await fetch(check.url, {
    redirect: "follow",
    signal: AbortSignal.timeout(15_000),
    headers: {
      "user-agent": "lizheng.ai-domain-verifier/1.0",
    },
  });

  if (response.status !== check.status) {
    throw new Error(
      `${check.url} expected HTTP ${check.status}, received ${response.status}`
    );
  }

  if (response.url !== check.finalUrl) {
    throw new Error(
      `${check.url} expected final URL ${check.finalUrl}, received ${response.url}`
    );
  }

  if (!check.titleContains && !check.canonical) return;

  const html = await response.text();
  if (check.titleContains) {
    const title = extractHtmlValue(html, /<title>([^<]*)<\/title>/i);
    if (!title?.includes(check.titleContains)) {
      throw new Error(
        `${check.url} title expected to contain ${check.titleContains}, received ${title || "<missing>"}`
      );
    }
  }

  if (check.canonical) {
    const canonical = extractHtmlValue(
      html,
      /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i
    );
    if (canonical !== check.canonical) {
      throw new Error(
        `${check.url} canonical expected ${check.canonical}, received ${canonical || "<missing>"}`
      );
    }
  }
}

async function main() {
  const config = JSON.parse(
    fs.readFileSync(CONFIG_PATH, "utf8")
  ) as DomainConfig;
  const options = parseOptions();
  const resolver = await createResolver(options.server);
  const nameserverSet =
    options.nameserverSet ??
    (config.lifecyclePhase === "vercel-active" ? "target" : "current");
  const recordProfile =
    nameserverSet === "target"
      ? config.routingRecords.target
      : config.routingRecords.current;
  const failures: string[] = [];

  console.log(
    `Checking ${config.domain} via ${options.server || "system DNS"} (${config.lifecyclePhase})`
  );

  if (nameserverSet !== "skip") {
    try {
      await checkNameservers(resolver, config, nameserverSet);
      console.log(`✓ NS (${nameserverSet})`);
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error));
      console.error(`✗ NS (${nameserverSet})`);
    }
  }

  for (const record of [...recordProfile, ...config.records]) {
    const label = `${fqdn(record.name, config.domain)} ${record.type}`;
    try {
      await checkDnsRecord(resolver, config.domain, record);
      console.log(`✓ ${label}`);
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error));
      console.error(`✗ ${label}`);
    }
  }

  if (!options.dnsOnly) {
    for (const check of config.httpChecks) {
      try {
        await checkHttp(check);
        console.log(`✓ ${check.url}`);
      } catch (error) {
        failures.push(error instanceof Error ? error.message : String(error));
        console.error(`✗ ${check.url}`);
      }
    }
  }

  if (failures.length > 0) {
    console.error("\nFailures:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
    return;
  }

  console.log("\nAll domain checks passed.");
}

await main();
