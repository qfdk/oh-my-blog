declare module "cloudflare:workers" {
  interface CloudflareEnv {
    BLOG_POSTS: KVNamespace;
    ASSETS: Fetcher;
    IMAGES: {
      input(stream: ReadableStream): {
        transform(options: Record<string, unknown>): {
          output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
        };
      };
    };
  }
  export const env: CloudflareEnv;
}
