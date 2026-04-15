#!/usr/bin/env bash
# Patch pi-ai's openai-completions.js inside the bruiser sandbox so that
# Gemini 3's thought_signature on tool_calls (via extra_content.google.*)
# round-trips across turns. Without this, Gemini 3 rejects every follow-up
# tool-calling request with a 400.
#
# Idempotent: creates a .prepatch backup on first run; subsequent runs
# restore and re-apply so the patch matches the current source code.
set -euo pipefail

PI_AI=/usr/local/lib/node_modules/openclaw/node_modules/@mariozechner/pi-ai/dist/providers/openai-completions.js

openshell doctor exec -- kubectl exec -n openshell bruiser -- bash -c "
set -e
p='$PI_AI'
if [ ! -f \${p}.prepatch ]; then
  cp \$p \${p}.prepatch
else
  cp \${p}.prepatch \$p
fi

python3 - <<'PY'
import re
p = '$PI_AI'
src = open(p).read()

MARK = '/* PI_AI_GEMINI_SIG_PATCH */'
if MARK in src:
    raise SystemExit('already patched')

# 1. Capture Gemini extra_content.google.thought_signature during streaming.
#    Insert right after the toolCall block-creation inside the stream loop.
src_before = src
src = src.replace(
    'if (currentBlock.type === \"toolCall\") {\n                                if (toolCall.id)',
    'if (currentBlock.type === \"toolCall\") { ' + MARK + '\n                                {\n                                    const sig = toolCall?.extra_content?.google?.thought_signature;\n                                    if (typeof sig === \"string\" && sig.length > 0) {\n                                        currentBlock.thoughtSignature = sig;\n                                    }\n                                }\n                                if (toolCall.id)',
    1,
)
if src == src_before:
    raise SystemExit('stream patch hunk missed')

# 2. Inject saved signatures back into outgoing tool_calls in convertMessages.
#    Replace the reasoning_details branch (which only handles the JSON-wrapped
#    case) with a branch that ALSO attaches extra_content.google.thought_signature
#    when the stored signature is a bare base64 string.
old = (
    '                assistantMsg.tool_calls = toolCalls.map((tc) => ({\n'
    '                    id: tc.id,\n'
    '                    type: \"function\",\n'
    '                    function: {\n'
    '                        name: tc.name,\n'
    '                        arguments: JSON.stringify(tc.arguments),\n'
    '                    },\n'
    '                }));\n'
    '                const reasoningDetails = toolCalls\n'
    '                    .filter((tc) => tc.thoughtSignature)\n'
    '                    .map((tc) => {\n'
    '                    try {\n'
    '                        return JSON.parse(tc.thoughtSignature);\n'
    '                    }\n'
    '                    catch {\n'
    '                        return null;\n'
    '                    }\n'
    '                })\n'
    '                    .filter(Boolean);\n'
    '                if (reasoningDetails.length > 0) {\n'
    '                    assistantMsg.reasoning_details = reasoningDetails;\n'
    '                }\n'
)
new = (
    '                assistantMsg.tool_calls = toolCalls.map((tc) => { ' + MARK + '\n'
    '                    const out = { id: tc.id, type: \"function\", function: { name: tc.name, arguments: JSON.stringify(tc.arguments) } };\n'
    '                    const sig = tc.thoughtSignature;\n'
    '                    if (typeof sig === \"string\" && sig.length > 0) {\n'
    '                        let looksLikeReasoning = false;\n'
    '                        if (sig[0] === \"{\" || sig[0] === \"[\") {\n'
    '                            try {\n'
    '                                const parsed = JSON.parse(sig);\n'
    '                                if (parsed && typeof parsed === \"object\" && parsed.type === \"reasoning.encrypted\") {\n'
    '                                    looksLikeReasoning = true;\n'
    '                                }\n'
    '                            } catch {}\n'
    '                        }\n'
    '                        if (!looksLikeReasoning) {\n'
    '                            out.extra_content = { google: { thought_signature: sig } };\n'
    '                        }\n'
    '                    }\n'
    '                    return out;\n'
    '                });\n'
    '                const reasoningDetails = toolCalls\n'
    '                    .filter((tc) => tc.thoughtSignature)\n'
    '                    .map((tc) => {\n'
    '                    try {\n'
    '                        return JSON.parse(tc.thoughtSignature);\n'
    '                    }\n'
    '                    catch {\n'
    '                        return null;\n'
    '                    }\n'
    '                })\n'
    '                    .filter(Boolean);\n'
    '                if (reasoningDetails.length > 0) {\n'
    '                    assistantMsg.reasoning_details = reasoningDetails;\n'
    '                }\n'
)
if old not in src:
    raise SystemExit('convertMessages patch hunk missed — exact block not found')
src = src.replace(old, new, 1)

open(p, 'w').write(src)
print('patched', p)
PY
echo 'pi-ai patched'
"
