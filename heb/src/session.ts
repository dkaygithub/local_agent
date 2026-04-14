import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import {
  HEBClient,
  createTokenSession,
  isSessionValid,
  updateTokenSession,
  type HEBAuthTokens,
  type HEBCookies,
  type HEBSession,
} from 'heb-sdk-unofficial';
import { refreshTokens, type HebTokenResponse } from 'heb-auth-unofficial';

const TOKEN_FILE = process.env.HEB_TOKEN_FILE ?? '/secrets/tokens.json';

type StoredTokens = {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  token_type?: string;
  scope?: string;
  expires_in?: number;
  expires_at?: string;
  store_id?: string;
};

function tokensFromStored(stored: StoredTokens): HEBAuthTokens {
  return {
    accessToken: stored.access_token,
    refreshToken: stored.refresh_token,
    idToken: stored.id_token,
    tokenType: stored.token_type,
    scope: stored.scope,
    expiresIn: stored.expires_in,
    expiresAt: stored.expires_at ? new Date(stored.expires_at) : undefined,
  };
}

function storedFromSession(session: HEBSession, prev: StoredTokens): StoredTokens {
  const t = session.tokens;
  if (!t) return prev;
  return {
    access_token: t.accessToken,
    refresh_token: t.refreshToken ?? prev.refresh_token,
    id_token: t.idToken ?? prev.id_token,
    token_type: t.tokenType ?? prev.token_type,
    scope: t.scope ?? prev.scope,
    expires_in: t.expiresIn ?? prev.expires_in,
    expires_at: t.expiresAt ? t.expiresAt.toISOString() : prev.expires_at,
    store_id: prev.store_id,
  };
}

async function writeTokensAtomic(stored: StoredTokens): Promise<void> {
  const dir = path.dirname(TOKEN_FILE);
  const tmp = path.join(dir, `.tokens.${process.pid}.${Date.now()}.tmp`);
  const body = JSON.stringify(stored, null, 2);
  try {
    await fsp.writeFile(tmp, body, { mode: 0o600 });
    await fsp.rename(tmp, TOKEN_FILE);
  } catch (err) {
    // Bind-mounted single files (Docker) can't be replaced via rename(2).
    // Fall back to in-place overwrite — non-atomic, but acceptable for OAuth tokens.
    try { await fsp.unlink(tmp); } catch { /* ignore */ }
    await fsp.writeFile(TOKEN_FILE, body, { mode: 0o600 });
  }
}

let currentStored: StoredTokens | null = null;
let currentSession: HEBSession | null = null;
let currentClient: HEBClient | null = null;

function loadStored(): StoredTokens | null {
  try {
    if (!fs.existsSync(TOKEN_FILE)) return null;
    const raw = fs.readFileSync(TOKEN_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as StoredTokens;
    if (!parsed.access_token) {
      console.error(`[heb] tokens file missing access_token: ${TOKEN_FILE}`);
      return null;
    }
    return parsed;
  } catch (err) {
    console.error('[heb] failed to read tokens:', err);
    return null;
  }
}

function buildSession(stored: StoredTokens): HEBSession {
  const session = createTokenSession(tokensFromStored(stored), {
    cookies: stored.store_id ? { sat: '', reese84: '', incap_ses: '', CURR_SESSION_STORE: stored.store_id } : undefined,
  });

  session.refresh = async () => {
    if (!session.tokens?.refreshToken) {
      throw new Error('no refresh_token available');
    }
    const fresh: HebTokenResponse = await refreshTokens({ refreshToken: session.tokens.refreshToken });
    updateTokenSession(session, {
      accessToken: fresh.access_token,
      refreshToken: fresh.refresh_token ?? session.tokens.refreshToken,
      idToken: fresh.id_token,
      tokenType: fresh.token_type,
      scope: fresh.scope,
      expiresIn: fresh.expires_in,
    });
    const next = storedFromSession(session, currentStored ?? stored);
    currentStored = next;
    await writeTokensAtomic(next);
    console.error(`[heb] refreshed tokens (expires ${next.expires_at})`);
  };

  return session;
}

export function initSession(): HEBClient | null {
  currentStored = loadStored();
  if (!currentStored) {
    currentSession = null;
    currentClient = null;
    return null;
  }
  currentSession = buildSession(currentStored);
  currentClient = new HEBClient(currentSession);
  return currentClient;
}

export function getClient(): HEBClient | null {
  return currentClient;
}

export function getSession(): HEBSession | null {
  return currentSession;
}

export async function saveSession(session: HEBSession): Promise<void> {
  if (!currentStored) return;
  const next = storedFromSession(session, currentStored);
  currentStored = next;
  await writeTokensAtomic(next);
}

export function getSessionStatus(session: HEBSession | null, options?: { source?: string }): string {
  const source = options?.source ?? `OAuth (${TOKEN_FILE})`;
  if (!session) return `[${source}] No session loaded.`;
  const expiresAt = session.expiresAt;
  const storeId = session.cookies?.CURR_SESSION_STORE ?? 'not set';
  if (!isSessionValid(session)) {
    return `[${source}] OAuth session expired${expiresAt ? ` at ${expiresAt.toISOString()}` : ''}.`;
  }
  const mode = session.authMode === 'bearer' ? 'OAuth' : 'Cookie';
  return `[${source}] ${mode} session valid until ${expiresAt?.toISOString() ?? 'unknown'}. Store: ${storeId}`;
}

export function saveSessionToFile(_cookies: HEBCookies): void {
  // Intentional no-op: we persist via saveSession() (passed to tools as options.saveSession).
  // tools.ts only falls back to this if neither saveSession nor saveCookies is provided.
}
