const fs = require('fs');
const path = '/usr/local/lib/node_modules/@provos/ironcurtain/dist/config/model-provider.js';
let content = fs.readFileSync(path, 'utf8');
content = content.replace(
  /case 'openai': \{[\s\S]*?\}/m,
  `case 'openai': {
      const { createOllama } = await import('ollama-ai-provider');
      return createOllama({ baseURL: url ? url.replace('/v1', '/api') : 'http://127.0.0.1:11434/api' })(modelId);
  }`
);
fs.writeFileSync(path, content);
console.log('Patched model-provider.js');
