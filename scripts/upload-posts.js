import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";
import MarkdownIt from "markdown-it";
import { codeToHtml } from "shiki";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const POSTS_DIR = path.join(ROOT, "posts");
const NAMESPACE_ID = "171ad16ab08a440ca6d5c96b7b7df66d";

function extractExcerpt(content, maxLength = 150) {
  const lines = content.split("\n");
  const firstParagraph = lines.find((line) => {
    const trimmed = line.trim();
    return trimmed.length > 0 && !trimmed.startsWith("#");
  });
  if (firstParagraph) {
    const cleaned = firstParagraph.trim();
    return cleaned.length > maxLength
      ? cleaned.substring(0, maxLength) + "..."
      : cleaned;
  }
  return "";
}

async function highlightCodeBlocks(html) {
  const codeBlockRegex = /<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g;
  const matches = [...html.matchAll(codeBlockRegex)];
  let result = html;
  for (const match of matches) {
    const [fullMatch, lang, code] = match;
    try {
      const decodedCode = code
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"');
      const highlighted = await codeToHtml(decodedCode, {
        lang,
        themes: { light: "github-light", dark: "github-dark" },
      });
      const wrapped = `<div class="code-block-wrapper"><div class="code-scroll">${highlighted}</div></div>`;
      result = result.replace(fullMatch, wrapped);
    } catch (e) {
      console.warn(`Failed to highlight ${lang}:`, e.message);
    }
  }
  return result;
}

function optimizeImages(html) {
  const imgRegex = /<img\s+([^>]*?)src="([^"]+)"([^>]*?)>/gi;
  return html.replace(imgRegex, (match, prefix, src) => {
    const widthMatch = match.match(/width=["'](\d+)["']/i);
    const heightMatch = match.match(/height=["'](\d+)["']/i);
    const altMatch = match.match(/alt=["']([^"']*)["']/i);
    const width = widthMatch ? parseInt(widthMatch[1], 10) : 800;
    const height = heightMatch ? parseInt(heightMatch[1], 10) : 450;
    const alt = altMatch ? altMatch[1] : "";
    return `<img src="${src}" alt="${alt}" width="${width}" height="${height}" loading="lazy" decoding="async" />`;
  });
}

async function renderMarkdown(content) {
  const md = new MarkdownIt({
    html: true,
    breaks: true,
    linkify: true,
    highlight: (str, lang) => {
      if (lang) {
        return `<pre><code class="language-${lang}">${str.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`;
      }
      return `<pre><code>${str.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`;
    },
  });
  const renderedHtml = md.render(content);
  const withImages = optimizeImages(renderedHtml);
  const withHighlight = await highlightCodeBlocks(withImages);
  return withHighlight;
}

async function main() {
  const isLocal = process.argv.includes("--local");
  const fileNames = await fs.readdir(POSTS_DIR);
  const mdFiles = fileNames.filter((f) => f.endsWith(".md"));

  const posts = [];
  const bulkData = [];

  for (const fileName of mdFiles) {
    const id = fileName.replace(/\.md$/, "");
    const fullPath = path.join(POSTS_DIR, fileName);
    const raw = await fs.readFile(fullPath, "utf8");
    const { data, content } = matter(raw);

    console.log(`Rendering ${id}...`);
    const renderedHtml = await renderMarkdown(content);

    posts.push({
      id,
      title: data.title,
      date:
        data.date instanceof Date
          ? data.date.toISOString().split("T")[0]
          : String(data.date),
      category: data.category,
      excerpt: extractExcerpt(content),
    });

    bulkData.push({
      key: `posts:content:${id}`,
      value: renderedHtml,
    });

    bulkData.push({
      key: `posts:raw:${id}`,
      value: content,
    });
  }

  // Sort by date descending
  posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Add index entry
  bulkData.unshift({
    key: "posts:index",
    value: JSON.stringify(posts),
  });

  // Write temp file for bulk upload
  const tmpFile = path.join(ROOT, ".kv-bulk-upload.json");
  await fs.writeFile(tmpFile, JSON.stringify(bulkData, null, 2));

  console.log(`\nPrepared ${posts.length} posts (pre-rendered) + 1 index`);

  // Upload via wrangler
  const args = [
    "exec", "wrangler", "kv", "bulk", "put", tmpFile,
    "--namespace-id", NAMESPACE_ID,
  ];
  if (isLocal) {
    args.push("--local");
  } else {
    args.push("--remote");
  }

  try {
    const output = execFileSync("pnpm", args, {
      cwd: ROOT,
      encoding: "utf-8",
      stdio: "pipe",
    });
    console.log(output);
    console.log("Upload complete!");
  } finally {
    await fs.unlink(tmpFile).catch(() => {});
  }
}

main().catch((err) => {
  console.error("Upload failed:", err);
  process.exit(1);
});
