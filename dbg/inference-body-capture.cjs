// Diagnostic preload (enhanced): captures request+response bodies for ALL
// POSTs to inference.local. Response bodies are buffered via res.clone().
// Streaming SSE responses are logged in full. Logs to /tmp/inference-all.log
// (one record per call) and keeps the old 4xx/5xx log at /tmp/inference-errors.log.
'use strict';

const fs = require('fs');

const ALL_LOG = '/tmp/inference-all.log';
const ERR_LOG = '/tmp/inference-errors.log';
const origFetch = globalThis.fetch;

if (typeof origFetch !== 'function') {
  console.error('[inference-body-capture] no global fetch; preload no-op');
  return;
}

globalThis.fetch = async function patchedFetch(input, init) {
  const url = typeof input === 'string' ? input : (input && input.url) || '';
  const isInference = /inference\.local/i.test(url);
  const method = ((init && init.method) || (input && input.method) || 'GET').toUpperCase();

  if (!isInference || method !== 'POST') {
    return origFetch(input, init);
  }

  let bodySnapshot = '';
  try {
    const body = init && init.body;
    if (typeof body === 'string') bodySnapshot = body;
    else if (Buffer.isBuffer(body)) bodySnapshot = body.toString('utf8');
    else if (body && typeof body === 'object') bodySnapshot = '[non-string body: ' + (body.constructor && body.constructor.name) + ']';
  } catch (e) {
    bodySnapshot = '[capture error: ' + e.message + ']';
  }

  const res = await origFetch(input, init);

  // Always clone and buffer response for diag.
  let respBody = '';
  try {
    respBody = await res.clone().text();
  } catch (e) {
    respBody = '[clone failed: ' + e.message + ']';
  }

  const entry = [
    `--- ${new Date().toISOString()} status=${res.status} url=${url} method=${method}`,
    `request-body (${bodySnapshot.length} chars): ${bodySnapshot.slice(0, 200000)}`,
    `response-body (${respBody.length} chars): ${respBody.slice(0, 200000)}`,
    '',
  ].join('\n');

  try { fs.appendFileSync(ALL_LOG, entry); } catch (e) { console.error('[infcap]', e); }
  if (res.status >= 400) {
    try { fs.appendFileSync(ERR_LOG, entry); } catch (e) {}
  }

  return res;
};

console.error('[inference-body-capture] installed (fetch-level) -> ', ALL_LOG);
