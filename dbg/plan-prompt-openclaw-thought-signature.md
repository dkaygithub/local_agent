# Prompt: Plan an upstream openclaw PR to fix Gemini 3 `thought_signature` round-tripping

Use this as the seed prompt the next time we resume planning. It captures
current state so a fresh session can pick up cold.

---

## Goal

Design a clean, upstream-PR-quality fix in **openclaw/openclaw** so that
`gemini-3-flash-preview` (and future Gemini 3 models) work through the
OpenAI-compat endpoint when tools are in play. The fix must round-trip
`thought_signature` on `tool_calls` between turns. No hacks, no
monkey-patches in our local preload — that code path (`dbg/inference-body-capture.cjs`,
`nemoclaw_agent/restart-gateway.sh`) is diagnostic only and must be removed
once the upstream fix lands.

## Observed failure

- Symptom: Discord bot (bruiser) shows typing, never replies.
- Gateway log: `embedded_run_agent_end ... isError:true ... error:"400 status code (no body)"` for `model:gemini-3-flash-preview provider:inference`.
- Captured response body (via our fetch-level preload):
  > "Function call is missing a thought_signature in functionCall parts.
  > This is required for tools to work correctly... Additional data,
  > function call `default_api:exec`, position 44."
- HEB MCP (23 tools) doesn't *cause* the bug; it just puts the agent into
  tool-calling turns every interaction, so the bug fires every @mention.

## Upstream landscape (already researched)

All open, no PRs as of 2026-04-14:

- openclaw/openclaw#53658 — "Google OpenAI-compat fallback 400 from unsupported `store` + missing `thought_signature` during replay" (our exact root cause)
- openclaw/openclaw#34008 — Gemini 3 via Ollama Cloud OpenAI-compat, same failure (stale)
- openclaw/openclaw#841 — notes openclaw strips `thought_signature` (snake_case) only when value looks like `msg_*`; misses Gemini's real format
- openclaw/openclaw#5001 — camelCase `thoughtSignature` not stripped
- NVIDIA/NemoClaw#1752 — downstream report; same symptom, no fix
- Related prior art: run-llama/llama_index#19891 (Gemini thought-sig serialization fix merged), pydantic/pydantic-ai#2293 + #3481

Implication: a real PR is welcome. The existing snake_case + `msg_*` filter
shows openclaw already has partial signature-handling code — extend it, don't
replace it.

## Out of scope / constraints

- No downgrade to `gemini-2.5-flash`. User explicitly vetoed.
- No fetch-layer monkey-patch as the *final* solution. It's fine as a
  temporary bridge so bruiser is usable while the PR is in review, but the
  plan should treat it as throwaway.
- Don't touch NemoClaw — the bug is in openclaw, not the sandbox runtime.

## Phase 1 research the planner still needs to do

1. **Find openclaw source.** It isn't cloned under `~/projects/local_agent/`.
   Clone `openclaw/openclaw` into `~/projects/local_agent/openclaw/` (fresh
   working copy, dedicated branch for the PR). Confirm the repo layout.
2. **Locate the Gemini OpenAI-compat provider** in openclaw. Likely under
   `src/providers/` or `packages/core/src/providers/`. Find:
   - Where assistant messages are parsed from the provider response (the
     place the `thought_signature` arrives).
   - Where the message history is serialized into the next request body
     (the place it needs to be echoed back).
   - The existing `msg_*`-shaped snake_case strip referenced in #841 — read
     it so the fix extends rather than fights it.
3. **Confirm the field shape.** Per Google docs, in OpenAI-compat mode the
   signature rides on `tool_calls[].function.thought_signature` (or a
   `extra_body`-like passthrough). Verify by inspecting the raw response
   bodies we've already captured in `/tmp/inference-errors.log` inside the
   bruiser sandbox (pull one down if needed).
4. **Check tests.** Does openclaw have provider-level integration tests with
   recorded fixtures (VCR-style)? The PR will need a regression test; the
   plan should specify where it goes.
5. **Check CONTRIBUTING.md / PR template.** Match upstream conventions
   (DCO, changeset files, commit style).

## Phase 2 design questions the plan must answer

- **Where does the signature live in openclaw's internal message model?**
  Is there an existing `assistantMessage.toolCalls[].metadata` bag we can
  stash it in, or do we need to add a field? Name it generically (not
  Gemini-specific) so Anthropic `thinking` signatures and Bedrock equivalents
  (#45010, #24612) could reuse the same slot later.
- **Serialization symmetry.** Parser reads `thought_signature` → internal
  field → serializer writes it back on the next request. Both sides must
  round-trip byte-exact (Gemini rejects any mutation).
- **Sequential vs parallel tool calls.** Per Google docs, only the *first*
  functionCall in a parallel batch carries the signature; subsequent ones
  don't. Make sure the replay doesn't invent signatures or drop the real one.
- **The `store: false` sibling bug (#53658).** Should this PR also fix the
  unsupported `store` field, or stay narrowly scoped to signatures? Lean
  narrow — one PR, one concern — but flag it.
- **Backward compatibility.** Older Gemini models (2.5 and below) don't emit
  signatures. The fix must be a no-op for them.

## Phase 3 deliverables for the plan

- File paths in openclaw that will be modified, with brief per-file notes.
- New test(s): name, location, what scenario they cover.
- A cleanup checklist for *our* repo:
  - Remove `--require /tmp/inference-body-capture.cjs` from `nemoclaw_agent/restart-gateway.sh`.
  - Re-enable `tools.web.search` + `tools.web.fetch` in `/sandbox/.openclaw/openclaw.json` (backup at `.bak`).
  - Revisit `heb/src/server.ts` schema stripper — keep it (correct hardening), but update the memory `project_heb_mcp_gemini_400.md` to note the real root cause was thought_signature, not schemas.
- End-to-end verification plan:
  1. Build the patched openclaw locally.
  2. Swap the sandbox's openclaw binary (or npm-link it) with the patched build.
  3. Restart the gateway, @mention bruiser with a HEB query that forces tool use.
  4. Confirm reply posts; confirm `/tmp/inference-errors.log` stays empty.
  5. Run openclaw's own test suite.
- PR-writing checklist: reference the upstream issues that get closed,
  include the captured 400 body as evidence, explain the round-trip design,
  call out the parallel-calls edge case.

## Safety / branching plan

Before starting work we should:
- `git checkout -b wip/thought-signature-fix` in **this** repo
  (`nemoclaw_agent`) so the diagnostic state (fetch preload wiring,
  `heb/src/server.ts` stripper, scrubbed docs) is preserved on a branch.
- Clone openclaw fresh into `~/projects/local_agent/openclaw/` and cut a PR
  branch there (`fix/gemini-thought-signature-round-trip` or similar).

## Memory hygiene

After the fix lands and is verified, update:
- `memory/project_heb_mcp_gemini_400.md` — correct the root-cause attribution.
- Add a new memory noting openclaw is cloned at `~/projects/local_agent/openclaw/` for future sessions.
