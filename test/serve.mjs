// A tiny static file server for the self-test. It serves one folder on
// localhost so the Action can build an AgentDoc from a real address.
// Usage: node test/serve.mjs <folder> <port>
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, normalize, resolve, sep } from "node:path";

const root = resolve(process.argv[2] ?? ".");
const port = Number(process.argv[3] ?? 8787);

createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  const file = normalize(join(root, path));
  if (file !== root && !file.startsWith(root + sep)) {
    res.writeHead(403).end();
    return;
  }
  try {
    const body = await readFile(file);
    const type = file.endsWith(".json") ? "application/json" : "application/octet-stream";
    res.writeHead(200, { "content-type": type }).end(body);
  } catch {
    res.writeHead(404, { "content-type": "text/plain" }).end("not found\n");
  }
}).listen(port, () => {
  console.log(`Serving ${root} on http://localhost:${port}`);
});
