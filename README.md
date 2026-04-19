# local_agent

A personal workbench for running AI coding/control agents on my own hardware, with host-side credential isolation, egress policy, and vendored MCP bridges. Each sub-directory is an independent experiment or deployment — they share the repo for convenience, not because they compose into a single product.

## Sub-projects

- **`nemoclaw_agent/`** — NemoClaw (Claude Code in a sandbox) setup: native WSL2 workflow, Discord gateway proxy, bruiser policies, onboarding scripts. See `nemoclaw_agent/AGENTS.md`.
- **`heb/`** — MCP server bridging Claude Code to H-E-B grocery ordering. Host-side OAuth, vendored SDK overlay, cart + checkout tools. See `heb/` sources.
- **`ironcurtain_agent/`** — Experimental agent harness around the [provos/ironcurtain](https://github.com/provos/ironcurtain) Signal bridge (submodule).
- **`resonantos/`** — ResonantOS fork integration (submodule → `dkaygithub/resonantos-alpha`) wired up with an openclaw launcher.
- **`heb-sdk-unofficial/`** — Submodule: fork of `iHildy/heb-sdk-unofficial` on `feat/checkout-cart-commit`, vendored as source for the HEB MCP server.
- **`design/`** — Architecture notes and three candidate setups (ResonantOS / LangGraph / NemoClaw) covering supply chain, input security, cognitive alignment, authorization, infra, observability, and human-in-the-loop.
- **`dbg/`** — Ad-hoc debugging scripts, policy YAMLs, patches, and one-off tooling for the above. Nothing here is production — it's the scratch drawer.

## Gitignored by design

`openclaw/` and `pi-mono/` are local working copies of upstream projects kept outside this repo's history. `.har` captures are excluded so request traces with live cookies/tokens never get committed.

## Cloning

```
git clone --recurse-submodules https://github.com/dkaygithub/local_agent.git
```

## Status

Active, evolving, and deliberately messy. Not a product. Use at your own risk — no license is attached yet, so no usage rights are granted.
