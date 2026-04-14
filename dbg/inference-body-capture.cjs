// Diagnostic preload: captures the full POST body openclaw sends to
// inference.local whenever the upstream returns a 4xx/5xx response.
// Dumps to /tmp/inference-errors.log inside the sandbox.
//
// openclaw uses fetch() (undici) for inference calls, which bypasses
// https.request — so we patch globalThis.fetch.
//
// Usage (added alongside the Discord fix):
//   NODE_OPTIONS='--require /tmp/discord-proxy-fix.cjs --require /tmp/inference-body-capture.cjs ...'
'use strict';

const fs = require('fs');

const LOG = '/tmp/inference-errors.log';
const origFetch = globalThis.fetch;

if (typeof origFetch !== 'function') {
  console.error('[inference-body-capture] no global fetch; preload no-op');
  return;
}

globalThis.fetch = async function patchedFetch(input, init) {
  const url = typeof input === 'string'
    ? input
    : (input && input.url) || '';
  const isInference = /inference\.local/i.test(url);
  const method = ((init && init.method) || (input && input.method) || 'GET').toUpperCase();

  if (!isInference || method !== 'POST') {
    return origFetch(input, init);
  }

  // Capture body early — body may be a string, Buffer, or stream.
  let bodySnapshot = '';
  try {
    const body = init && init.body;
    if (typeof body === 'string') {
      bodySnapshot = body;
    } else if (Buffer.isBuffer(body)) {
      bodySnapshot = body.toString('utf8');
    } else if (body && typeof body === 'object') {
      bodySnapshot = '[non-string body: ' + (body.constructor && body.constructor.name) + ']';
    }
  } catch (e) {
    bodySnapshot = '[capture error: ' + e.message + ']';
  }

  const res = await origFetch(input, init);

  if (res.status >= 400) {
    // Clone so we can also read the response body for logging without
    // consuming the stream for the caller.
    let respBody = '';
    try {
      respBody = await res.clone().text();
    } catch (e) {
      respBody = '[clone failed: ' + e.message + ']';
    }
    const entry = [
      `--- ${new Date().toISOString()} status=${res.status} url=${url} method=${method}`,
      `request-headers: ${JSON.stringify((init && init.headers) || {})}`,
      `request-body (${bodySnapshot.length} chars): ${bodySnapshot}`,
      `response-body: ${respBody}`,
      '',
    ].join('\n');
    try { fs.appendFileSync(LOG, entry); } catch (e) { console.error('[infcap]', e); }
  }

  return res;
};

console.error('[inference-body-capture] installed (fetch-level); logging 4xx/5xx to', LOG);
