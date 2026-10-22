import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".txt": "text/plain",
  ".xml": "application/xml",
};

async function resolveFile(root, urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch {
    return null;
  }
  const file = path.resolve(root, "." + decoded);
  if (file !== root && !file.startsWith(root + path.sep)) return null;
  const stat = await fs.stat(file).catch(() => null);
  if (stat?.isDirectory()) return resolveFile(root, path.posix.join(urlPath, "index.html"));
  if (stat?.isFile()) return file;
  if (!path.extname(file)) return resolveFile(root, urlPath + ".html");
  return null;
}

export async function serve(folder) {
  const root = path.resolve(folder);
  const server = http.createServer(async (request, response) => {
    const { pathname } = new URL(request.url, "http://localhost");
    const file = await resolveFile(root, pathname);
    if (!file) {
      response.writeHead(404, { "content-type": "text/plain" });
      response.end("Not found");
      return;
    }
    response.writeHead(200, { "content-type": types[path.extname(file)] ?? "application/octet-stream" });
    response.end(await fs.readFile(file));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  return {
    url: `http://127.0.0.1:${server.address().port}/`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}
