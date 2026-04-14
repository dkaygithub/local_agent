import express from 'express';
import { randomUUID } from 'node:crypto';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { registerTools } from './tools.js';
import { getClient, getSession, initSession, saveSession } from './session.js';

const PORT = Number(process.env.PORT ?? 4321);
const HOST = process.env.HOST ?? '0.0.0.0';
const TOKEN_FILE = process.env.HEB_TOKEN_FILE ?? '/secrets/tokens.json';

const STRIP_KEYS = new Set(['$schema', '$id', 'definitions', '$defs']);

function stripMeta(node: unknown): void {
  if (Array.isArray(node)) {
    for (const item of node) stripMeta(item);
    return;
  }
  if (node && typeof node === 'object') {
    const obj = node as Record<string, unknown>;
    for (const k of Object.keys(obj)) {
      if (STRIP_KEYS.has(k)) delete obj[k];
      else stripMeta(obj[k]);
    }
  }
}

function sanitizeToolsListMessage(message: unknown): void {
  if (!message || typeof message !== 'object') return;
  const m = message as { result?: { tools?: Array<{ inputSchema?: unknown }> } };
  const tools = m.result?.tools;
  if (!Array.isArray(tools)) return;
  for (const tool of tools) {
    if (tool && tool.inputSchema) stripMeta(tool.inputSchema);
  }
}

function buildServer(): McpServer {
  const server = new McpServer(
    { name: 'heb-mcp', version: '0.1.0' },
    { capabilities: { tools: {} } },
  );
  registerTools(server, () => getClient(), {
    saveSession,
    sessionStatusSource: `OAuth (${TOKEN_FILE})`,
  });
  return server;
}

async function main() {
  const client = initSession();
  console.error(
    client ? '[heb] startup: loaded session' : '[heb] startup: no tokens found. Run bootstrap.ts on the host first.',
  );

  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.get('/healthz', (_req, res) => {
    const session = getSession();
    res.json({ ok: true, hasSession: !!session, expiresAt: session?.expiresAt });
  });

  const transports = new Map<string, StreamableHTTPServerTransport>();

  app.all('/mcp', async (req, res) => {
    const sid = (req.header('mcp-session-id') ?? '').trim();
    let transport = sid ? transports.get(sid) : undefined;

    if (!transport) {
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (id: string) => {
          transports.set(id, transport!);
        },
      });
      transport.onclose = () => {
        if (transport!.sessionId) transports.delete(transport!.sessionId);
      };
      // Gemini's OpenAI-compat endpoint rejects tool parameter schemas that
      // carry `$schema`/`$id`/`definitions` (the MCP SDK's zod-to-json-schema
      // output includes `$schema` by default). Strip those keys on tools/list
      // responses on the way out.
      const origSend = transport.send.bind(transport);
      transport.send = async (message, options) => {
        sanitizeToolsListMessage(message);
        return origSend(message, options);
      };
      // One McpServer per session — McpServer.connect can only be called once.
      const server = buildServer();
      await server.connect(transport);
    }

    try {
      await transport.handleRequest(req, res, req.body);
    } catch (err) {
      console.error('[heb] /mcp error:', err);
      if (!res.headersSent) res.status(500).json({ error: String(err) });
    }
  });

  app.listen(PORT, HOST, () => {
    console.error(`[heb] listening on http://${HOST}:${PORT}/mcp`);
  });
}

main().catch((err) => {
  console.error('[heb] fatal:', err);
  process.exit(1);
});
