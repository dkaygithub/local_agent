# AGENTS.md — local_agent setup playbook

Pointers for an automated setup agent picking this repo up on a fresh
machine. The per-subproject AGENTS.md files (e.g. `nemoclaw_agent/`)
cover subsystem specifics; this file only documents cross-cutting
conventions that aren't obvious from the code.

## Submodule branching strategy (heb-sdk-unofficial)

The `heb-sdk-unofficial/` submodule is our fork of the upstream SDK,
vendored as source for the HEB MCP server. Each in-flight change
against upstream lives on **its own PR branch off `main`** so each one
can be opened as an independent pull request. The parent repo does not
track any PR branch directly — instead it tracks a dedicated
integration branch that merges them.

### Branches on `origin` (dkaygithub/heb-sdk-unofficial)

| Branch                       | Purpose                                      |
|------------------------------|----------------------------------------------|
| `main`                       | Fork default; tracks upstream                |
| `feat/<topic>` (e.g. `feat/checkout-cart-commit`, `feat/product-image`) | One branch per in-flight PR, always off `main` |
| `dev/stack`                  | Octopus merge of every active `feat/*` branch |

### What the parent repo tracks

The parent's submodule pointer always references the **tip of
`dev/stack`**. That keeps `git clone --recurse-submodules` resolvable
from `origin` alone — no extra fetch config, no local-only SHAs.

### Adding a new PR branch

```
cd heb-sdk-unofficial
git fetch origin
git switch -c feat/<topic> origin/main
# ... commits ...
git push -u origin feat/<topic>

# re-roll the integration branch
git switch dev/stack
git reset --hard origin/main
git merge --no-ff feat/checkout-cart-commit feat/product-image feat/<topic> \
  -m "merge feat/* branches for local dev stack"
git push --force-with-lease origin dev/stack

# bump the parent pointer
cd ..
git add heb-sdk-unofficial
git commit -m "chore(heb-sdk): roll dev/stack to include feat/<topic>"
```

### When an upstream PR merges

Delete the feature branch locally + on origin, re-roll `dev/stack` off
fresh `origin/main`, push, and bump the parent pointer.

## Vendor overlay (heb/vendor/heb-sdk-dist)

`heb/` depends on `heb-sdk-unofficial` via npm by name, but at build
time `heb/Dockerfile` overlays the vendored `heb/vendor/heb-sdk-dist/`
directory onto `node_modules/heb-sdk-unofficial/dist/`. This exists
because our SDK changes aren't published to npm yet.

**Any time you change the SDK, rebuild and refresh the overlay:**

```
cd heb-sdk-unofficial/packages/heb-sdk
pnpm install                   # one-time per machine
npx tsup src/index.ts --format cjs,esm --clean --tsconfig tsconfig.json
npx tsc --declaration --emitDeclarationOnly --outDir dist
cp dist/src/*.d.ts dist/src/*.d.ts.map dist/
rm -rf ../../../heb/vendor/heb-sdk-dist/*
cp -r dist/* ../../../heb/vendor/heb-sdk-dist/
cd ../../../heb && docker compose up -d --build
```

The full `dist/` (bundled `index.js`/`index.cjs` + per-file `.d.ts`
files) must be committed alongside the submodule pointer bump —
otherwise a fresh Docker build would pick up stale code.

## Cloning on a fresh machine

```
git clone --recurse-submodules https://github.com/dkaygithub/local_agent.git
cd local_agent
# sanity check: submodule should be on detached HEAD at dev/stack's tip
git -C heb-sdk-unofficial log --oneline -1
```

If `--recurse-submodules` was forgotten: `git submodule update --init --recursive`.

## Dbg scripts

Any one-off script written during a session lives in `dbg/` before it
runs (never in `/tmp` or arbitrary paths). Repeatable smoke tests stay
checked in; genuinely single-use scratch gets deleted on cleanup.
