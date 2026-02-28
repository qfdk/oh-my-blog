import type MarkdownIt from "markdown-it";
import {codeToHtml} from "shiki";

const DEFAULT_IMG_WIDTH = 800;
const DEFAULT_IMG_HEIGHT = 450;

let markdownParserInstance: MarkdownIt | null = null;

// 使用正则匹配代码块并高亮
async function highlightCodeBlocks(html: string): Promise<string> {
    const codeBlockRegex = /<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g;
    const matches = [...html.matchAll(codeBlockRegex)];

    let result = html;
    for (const match of matches) {
        const [fullMatch, lang, code] = match;
        try {
            // 解码 HTML 实体
            const decodedCode = code
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&amp;/g, '&')
                .replace(/&quot;/g, '"');

            const highlighted = await codeToHtml(decodedCode, {
                lang,
                themes: {
                    light: 'github-light',
                    dark: 'github-dark',
                }
            });

            const wrapped = `<div class="code-block-wrapper"><div class="code-scroll">${highlighted}</div></div>`;
            result = result.replace(fullMatch, wrapped);
        } catch (e) {
            console.warn(`Failed to highlight ${lang}:`, e);
        }
    }

    return result;
}

// 添加图片优化的正则表达式工具
const IMG_REGEX = /<img\s+([^>]*?)src="([^"]+)"([^>]*?)>/gi;

// 创建优化的图片标签，使用Next.js的Image组件
const optimizeImages = (html: string): string => {
    return html.replace(IMG_REGEX, (match, prefix, src) => {
        // 提取宽度和高度，如果有的话
        const widthMatch = match.match(/width=["'](\d+)["']/i);
        const heightMatch = match.match(/height=["'](\d+)["']/i);
        const altMatch = match.match(/alt=["']([^"']*)["']/i);

        const width = widthMatch ? parseInt(widthMatch[1], 10) : DEFAULT_IMG_WIDTH;
        const height = heightMatch ? parseInt(heightMatch[1], 10) : DEFAULT_IMG_HEIGHT;
        const alt = altMatch ? altMatch[1] : '';

        // 构建优化的图片标签，保留原始的响应式样式
        return `<img src="${src}" alt="${alt}" width="${width}" height="${height}" loading="lazy" decoding="async" />`;
    });
};

export const createMarkdownParser = async (): Promise<MarkdownIt> => {
    // 如果实例已存在，直接返回
    if (markdownParserInstance) {
        return markdownParserInstance;
    }

    const MarkdownIt = (await import("markdown-it")).default;

    markdownParserInstance = new MarkdownIt({
        html: true,
        breaks: true,
        linkify: true,
        highlight: (str, lang) => {
            // 先生成带语言class的代码块，稍后用 Shiki 高亮
            if (lang) {
                return `<pre><code class="language-${lang}">${str.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
            }
            return `<pre><code>${str.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
        }
    });

    return markdownParserInstance;
};

// 独立的渲染函数，处理markdown并应用语法高亮
export const renderMarkdown = async (content: string): Promise<string> => {
    const parser = await createMarkdownParser();
    const renderedHtml = parser.render(content);
    const withImages = optimizeImages(renderedHtml);
    const withHighlight = await highlightCodeBlocks(withImages);
    return withHighlight;
};

// 提取文章摘要的工具函数
export function extractExcerpt(content: string, maxLength: number = 150): string {
    // 按行分割内容
    const lines = content.split("\n");

    // 找到第一个不是空行且不是标题的段落
    const firstParagraph = lines.find(line => {
        const trimmedLine = line.trim();
        return trimmedLine.length > 0 && !trimmedLine.startsWith("#");
    });

    // 如果找到段落，截取适当长度
    if (firstParagraph) {
        const cleaned = firstParagraph.trim();
        return cleaned.length > maxLength
            ? cleaned.substring(0, maxLength) + "..."
            : cleaned;
    }

    // 如果没找到合适的段落，返回空字符串
    return "";
}
