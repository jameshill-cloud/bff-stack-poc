import { minify } from "html-minifier-terser";

export async function normaliseHtml(html: string): Promise<string> {
  return minify(html, {
    collapseWhitespace: true,
    removeComments: true,
  });
}
