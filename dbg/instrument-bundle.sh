#!/usr/bin/env bash
# Instrument the deployed openclaw bundle inside the bruiser sandbox to log
# tool_call signature capture + injection. Writes diagnostics to
# /tmp/sig-trace.log inside the sandbox.
set -euo pipefail

BUNDLE=/usr/local/lib/node_modules/openclaw/dist/anthropic-vertex-stream-Creoflvi.js
TRACE=/tmp/sig-trace.log

openshell doctor exec -- kubectl exec -n openshell bruiser -- bash -c "
set -e
if ! grep -q 'SIG_TRACE_INSTRUMENTED' $BUNDLE; then
  cp $BUNDLE ${BUNDLE}.preinstrument
fi

python3 - <<'PY'
import re
p = '$BUNDLE'
src = open(p).read()
if 'SIG_TRACE_INSTRUMENTED' in src:
    # strip previous instrumentation by restoring backup
    import shutil, os
    bak = p + '.preinstrument'
    if os.path.exists(bak):
        shutil.copyfile(bak, p)
        src = open(p).read()

tag = '/* SIG_TRACE_INSTRUMENTED */'
# 1) Log entry to extractGoogleThoughtSignature
src = src.replace(
    'function extractGoogleThoughtSignature(toolCall) {',
    'function extractGoogleThoughtSignature(toolCall) {' + tag + '\n\ttry{require(\"fs\").appendFileSync(\"$TRACE\", \"[extract] \"+JSON.stringify(toolCall).slice(0,500)+\"\\\\n\");}catch(e){}',
    1,
)
# 2) Log entry to injectToolCallThoughtSignatures
src = src.replace(
    'function injectToolCallThoughtSignatures(outgoing, context, model) {',
    'function injectToolCallThoughtSignatures(outgoing, context, model) {\n\ttry{const fs=require(\"fs\");const summary=(context.messages||[]).filter(m=>m.role===\"assistant\").slice(-3).map(m=>({provider:m.provider,api:m.api,model:m.model,blocks:(m.content||[]).map(b=>({type:b.type,id:b.id,hasSig:!!b.thoughtSignature,keys:Object.keys(b||{})}))}));fs.appendFileSync(\"$TRACE\", \"[inject] model=\"+model.provider+\"/\"+model.id+\" last3=\"+JSON.stringify(summary)+\"\\\\n\");}catch(e){}',
    1,
)
# 3) Log output of stream after finishCurrentBlock at end (find the 'const hasToolCalls' sentinel)
src = src.replace(
    'const hasToolCalls = output.content.some((block) => block.type === \"toolCall\");',
    'try{require(\"fs\").appendFileSync(\"$TRACE\", \"[stream-end] content=\"+JSON.stringify((output.content||[]).map(b=>({type:b.type,id:b.id,hasSig:!!b.thoughtSignature,sigLen:(b.thoughtSignature||\"\").length})))+\"\\\\n\");}catch(e){}\n\tconst hasToolCalls = output.content.some((block) => block.type === \"toolCall\");',
    1,
)

open(p, 'w').write(src)
print('instrumented', p)
PY
truncate -s 0 $TRACE 2>/dev/null || true
echo 'instrument done'
"
