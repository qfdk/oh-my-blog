import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";

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

    posts.push({
      id,
      title: data.title,
      date: data.date instanceof Date
        ? data.date.toISOString().split("T")[0]
        : String(data.date),
      category: data.category,
      excerpt: extractExcerpt(content),
    });

    bulkData.push({
      key: `posts:content:${id}`,
      value: content,
    });
  }

  // Sort by date descending
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Add index entry
  bulkData.unshift({
    key: "posts:index",
    value: JSON.stringify(posts),
  });

  // Write temp file for bulk upload
  const tmpFile = path.join(ROOT, ".kv-bulk-upload.json");
  await fs.writeFile(tmpFile, JSON.stringify(bulkData, null, 2));

  console.log(`Prepared ${posts.length} posts + 1 index for upload`);

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
