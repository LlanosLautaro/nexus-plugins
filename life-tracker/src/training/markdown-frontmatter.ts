import yaml from "js-yaml";

type FrontmatterRecord = Record<string, unknown>;

function isPlainObject(value: unknown): value is FrontmatterRecord {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

export function extractYamlFrontmatter(source: unknown) {
  const text = String(source || "").replace(/\r\n/g, "\n");
  const lines = text.split("\n");
  if (!lines.length || lines[0].trim() !== "---") {
    return { hasFrontmatter: false, frontmatter: {}, rawFrontmatter: "", body: text, bodyStartLine: 0, parseError: null };
  }
  const delimiterLineIndex = lines.findIndex((line, index) => index > 0 && ["---", "..."].includes(line.trim()));
  if (delimiterLineIndex < 0) {
    return { hasFrontmatter: false, frontmatter: {}, rawFrontmatter: "", body: text, bodyStartLine: 0, parseError: null };
  }
  const rawFrontmatter = lines.slice(1, delimiterLineIndex).join("\n");
  const body = lines.slice(delimiterLineIndex + 1).join("\n");
  try {
    const parsed = rawFrontmatter.trim() ? yaml.load(rawFrontmatter) : {};
    return {
      hasFrontmatter: true,
      frontmatter: isPlainObject(parsed) ? parsed : {},
      rawFrontmatter,
      body,
      bodyStartLine: delimiterLineIndex + 1,
      parseError: null,
    };
  } catch (error) {
    return {
      hasFrontmatter: false,
      frontmatter: {},
      rawFrontmatter: "",
      body: text,
      bodyStartLine: 0,
      parseError: error instanceof Error ? error.message : "Frontmatter YAML invalido.",
    };
  }
}

function stringifyYamlFrontmatter(frontmatter: unknown) {
  if (!isPlainObject(frontmatter) || !Object.keys(frontmatter).length) return "";
  const dumped = yaml.dump(frontmatter, { lineWidth: 120, noRefs: true, sortKeys: false }).trimEnd();
  return dumped ? `---\n${dumped}\n---` : "";
}

export function buildMarkdownDocumentWithFrontmatter({ frontmatter, body }: { frontmatter?: unknown; body?: string | null }) {
  const serializedFrontmatter = stringifyYamlFrontmatter(frontmatter);
  const normalizedBody = typeof body === "string" ? body.trim() : "";
  if (!serializedFrontmatter) return normalizedBody ? `${normalizedBody}\n` : "";
  if (!normalizedBody) return `${serializedFrontmatter}\n`;
  return `${serializedFrontmatter}\n\n${normalizedBody}\n`;
}
