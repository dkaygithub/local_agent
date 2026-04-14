// NemoClaw Discord fix: CONNECT tunnel + token resolution.
// Workaround for https://github.com/NVIDIA/NemoClaw/issues/1738
//
// Inside the sandbox, the OpenShell L7 proxy (10.200.0.1:3128) intercepts all
// egress. Node.js's EnvHttpProxyAgent sends forward-proxy requests for
// gateway.discord.gg, but the proxy expects CONNECT tunnels for WebSocket
// upgrades. This preload script patches https.request to use a proper CONNECT
// tunnel and patches WebSocket.send to inject the real bot token (since the
// openshell:resolve:env: placeholder can't be rewritten inside an encrypted
// CONNECT tunnel).
//
// Usage: NODE_OPTIONS='--require /tmp/discord-proxy-fix.cjs' openclaw gateway run ...
//
// Credit: vibewithsnehal/nemoclaw-discord-fix (Apache-2.0)
'use strict';

const http = require('http');
const tls = require('tls');
const https = require('https');
const fs = require('fs');

const PROXY_HOST = '10.200.0.1';
const PROXY_PORT = 3128;
const PLACEHOLDER = 'openshell:resolve:env:DISCORD_BOT_TOKEN';

// Known ws module paths inside the sandbox
const WS_PATHS = [
  '/usr/local/lib/node_modules/openclaw/node_modules/ws',
  '/usr/local/lib/node_modules/openclaw/node_modules/@buape/carbon/node_modules/ws',
];

// --- Load real token ---
var realToken = null;
try {
  if (fs.existsSync('/tmp/.discord-token')) {
    realToken = fs.readFileSync('/tmp/.discord-token', 'utf8').trim();
    if (!realToken || realToken.indexOf('openshell:') === 0) realToken = null;
  }
} catch (_) {}
if (realToken) process.env.DISCORD_BOT_TOKEN = realToken;

// --- CONNECT tunnel agent ---
function makeConnectAgent(targetHost, targetPort) {
  var agent = new https.Agent({ keepAlive: false, maxSockets: 1 });
  agent.createConnection = function (_opts, cb) {
    var cr = http.request({
      host: PROXY_HOST, port: PROXY_PORT,
      method: 'CONNECT', path: targetHost + ':' + (targetPort || 443),
    });
    cr.on('connect', function (res, socket) {
      if (res.statusCode !== 200) { cb(new Error('CONNECT:' + res.statusCode)); return; }
      var ts = tls.connect({ socket: socket, servername: targetHost, rejectUnauthorized: true },
        function () { cb(null, ts); });
      ts.on('error', cb);
    });
    cr.on('error', cb);
    cr.end();
  };
  return agent;
}

// --- Patch https.request for CONNECT tunnel ---
var origHttpsRequest = https.request;
https.request = function (input, options, callback) {
  var opts = (typeof input === 'object' && !(input instanceof URL)) ? input : {};
  if (typeof input === 'string' || input instanceof URL) {
    try { var u = new URL(input.toString()); opts = { hostname: u.hostname, port: u.port }; } catch (_) {}
    if (typeof options === 'function') { callback = options; options = opts; }
    else { options = Object.assign(opts, options || {}); }
  }
  var reqOpts = options || opts;
  var host = reqOpts.hostname || reqOpts.host || '';
  if (host === 'gateway.discord.gg' || host.endsWith('.discord.gg')) {
    reqOpts.agent = makeConnectAgent(host, reqOpts.port || '443');
    console.log('[proxy-fix] CONNECT tunnel for ' + host);
  }
  return origHttpsRequest.apply(this, arguments);
};

// --- Token replacement helper ---
function maybeReplaceToken(data) {
  if (!realToken || !data) return null;
  var str;
  if (typeof data === 'string') str = data;
  else if (Buffer.isBuffer(data)) str = data.toString('utf8');
  else if (data instanceof ArrayBuffer) str = Buffer.from(data).toString('utf8');
  else if (data instanceof Uint8Array) str = Buffer.from(data).toString('utf8');
  else return null;
  if (str.indexOf(PLACEHOLDER) === -1) return null;
  var fixed = str.split(PLACEHOLDER).join(realToken);
  console.log('[proxy-fix] Token replaced in WebSocket send');
  if (typeof data === 'string') return fixed;
  return Buffer.from(fixed, 'utf8');
}

// --- Directly patch all known ws module instances ---
if (realToken) {
  WS_PATHS.forEach(function (wsPath) {
    try {
      var wsModule = require(wsPath);
      var WS = wsModule.WebSocket || wsModule;
      if (WS && WS.prototype && typeof WS.prototype.send === 'function') {
        var origSend = WS.prototype.send;
        WS.prototype.send = function (data, opts, cb) {
          var fixed = maybeReplaceToken(data);
          if (fixed !== null) data = fixed;
          return origSend.call(this, data, opts, cb);
        };
        console.log('[proxy-fix] ws.send patched: ' + wsPath);
      }
    } catch (e) {
      console.log('[proxy-fix] ws not found at: ' + wsPath + ' (' + e.message + ')');
    }
  });
}

// --- Also patch global WebSocket (Node.js undici) ---
if (typeof globalThis.WebSocket === 'function' && realToken) {
  var origGlobalSend = globalThis.WebSocket.prototype.send;
  globalThis.WebSocket.prototype.send = function (data) {
    var fixed = maybeReplaceToken(data);
    if (fixed !== null) return origGlobalSend.call(this, fixed);
    return origGlobalSend.apply(this, arguments);
  };
  console.log('[proxy-fix] Global WebSocket.send patched');
}

console.log('[proxy-fix] loaded (token: ' + (realToken ? 'yes' : 'NO') + ')');
