#!/usr/bin/env node
// Test WebSocket connection to Discord gateway
// Run inside bruiser: node /tmp/test_discord_ws.js

const https = require('https');
const dns = require('dns');

// Test 1: DNS resolution
console.log('=== DNS Test ===');
dns.resolve4('gateway.discord.gg', (err, addrs) => {
  if (err) console.log('IPv4 DNS FAILED:', err.message);
  else console.log('IPv4 addresses:', addrs);
});
dns.resolve6('gateway.discord.gg', (err, addrs) => {
  if (err) console.log('IPv6 DNS FAILED:', err.message);
  else console.log('IPv6 addresses:', addrs);
});

// Test 2: HTTPS connection (proxy CONNECT)
setTimeout(() => {
  console.log('\n=== HTTPS Connect Test ===');
  const req = https.request({
    host: 'gateway.discord.gg',
    port: 443,
    path: '/?v=10&encoding=json',
    method: 'GET',
    headers: { 'User-Agent': 'DiscordBot (test, 1.0)' },
    timeout: 5000,
  }, (res) => {
    console.log('Status:', res.statusCode);
    res.destroy();
  });
  req.on('error', (e) => console.log('HTTPS error:', e.message));
  req.on('timeout', () => { console.log('HTTPS timeout'); req.destroy(); });
  req.end();
}, 1000);
