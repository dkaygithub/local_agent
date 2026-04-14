#!/usr/bin/env tsx
/**
 * One-shot host-side PKCE login for H-E-B mobile OAuth.
 *
 * Runs on the host (WSL2), never inside the sandbox. Produces
 * ~/projects/local_agent/heb/tokens.json with mode 0600. The Docker
 * container bind-mounts that file read-write so refresh can persist.
 *
 * Flow:
 *   1. createOAuthContext() → buildAuthUrl() → print URL.
 *   2. User signs in in a browser. The redirect
 *      com.heb.myheb://oauth2redirect?code=...&state=... will fail to open
 *      (mobile deep link). User copies the URL from the browser address
 *      bar and pastes it back here.
 *   3. exchangeCode() → upsertUser() → write tokens.json atomically.
 */

import fsp from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import {
  buildAuthUrl,
  createOAuthContext,
  exchangeCode,
  upsertUser,
} from 'heb-auth-unofficial';

const TOKEN_FILE = path.resolve(
  process.env.HEB_TOKEN_FILE ?? path.join(process.cwd(), 'tokens.json'),
);

const SKIP_UPSERT = process.argv.includes('--skip-upsert');

async function writeTokensAtomic(file: string, data: unknown): Promise<void> {
  const dir = path.dirname(file);
  await fsp.mkdir(dir, { recursive: true });
  const tmp = path.join(dir, `.tokens.${process.pid}.${Date.now()}.tmp`);
  await fsp.writeFile(tmp, JSON.stringify(data, null, 2), { mode: 0o600 });
  await fsp.rename(tmp, file);
}

function parseCodeAndState(raw: string): { code: string; state: string | null } {
  const trimmed = raw.trim();
  // Accept either the full URL or a pasted query string.
  let query = trimmed;
  const qIdx = trimmed.indexOf('?');
  if (qIdx !== -1) query = trimmed.slice(qIdx + 1);
  const params = new URLSearchParams(query);
  const code = params.get('code');
  if (!code) throw new Error(`no code= found in pasted input: ${trimmed.slice(0, 80)}…`);
  return { code, state: params.get('state') };
}

async function main() {
  const context = createOAuthContext();
  const url = buildAuthUrl(context);

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  H-E-B OAuth bootstrap');
  console.log('═══════════════════════════════════════════════════════════════\n');
  console.log('1. Open this URL in a browser and sign in:\n');
  console.log(`   ${url.toString()}\n`);
  console.log('2. After signing in, the browser will try to open a link like');
  console.log('   com.heb.myheb://oauth2redirect?code=...&state=...');
  console.log('   It will fail to navigate — that\'s expected.');
  console.log('3. Copy the URL from the browser address bar and paste it below.\n');

  const rl = readline.createInterface({ input, output });
  const pasted = await rl.question('Paste redirect URL (or just the ?code=...&state=... part): ');
  rl.close();

  const { code, state } = parseCodeAndState(pasted);
  if (state && state !== context.state) {
    throw new Error(`state mismatch: expected ${context.state}, got ${state}`);
  }

  console.log('\n→ Exchanging code for tokens…');
  const tokens = await exchangeCode({ code, codeVerifier: context.codeVerifier });

  if (!SKIP_UPSERT && tokens.id_token) {
    console.log('→ Upserting mobile profile…');
    try {
      const result = await upsertUser({
        accessToken: tokens.access_token,
        idToken: tokens.id_token,
      });
      if (!result.ok) console.warn('  upsert returned errors:', result.errors);
    } catch (err) {
      console.warn('  upsert failed (continuing):', err);
    }
  }

  const expiresAt = tokens.expires_in
    ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
    : undefined;

  await writeTokensAtomic(TOKEN_FILE, {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    id_token: tokens.id_token,
    token_type: tokens.token_type,
    scope: tokens.scope,
    expires_in: tokens.expires_in,
    expires_at: expiresAt,
  });

  console.log(`\n✓ Wrote tokens to ${TOKEN_FILE} (0600)`);
  console.log(`  expires_at: ${expiresAt ?? 'unknown'}`);
  console.log('\nNext: docker compose up -d --build');
}

main().catch((err) => {
  console.error('\n✗ bootstrap failed:', err);
  process.exit(1);
});
