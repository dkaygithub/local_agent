#!/usr/bin/env python3
"""
fix_nemoclaw.py — Applies all known NemoClaw fixes from AGENTS.md in one shot.

Fixes applied:
  1. Patch allowedOrigins (add localhost + 127.0.0.1)
  2. Update openclaw to latest
  3. Kill stale gateway processes
  4. Restart gateway with NODE_OPTIONS=--dns-result-order=ipv4first
  5. Print the auth token
  6. Test inference proxy health
  7. Restart port forward (kill stale listeners, start fresh)

Optional (--restart-cluster):
  0. Restart the openshell-cluster-nemoclaw Docker container
     (fixes stale gRPC watch streams, but takes ~30s)

Usage:
  python3 fix_nemoclaw.py              # standard fixes
  python3 fix_nemoclaw.py --restart-cluster  # also restart the K3s cluster
  python3 fix_nemoclaw.py --port 8080  # use a different gateway port
"""

import argparse
import subprocess
import sys
import time
import json


KUBECTL_PREFIX = [
    "openshell", "doctor", "exec", "--",
    "kubectl", "exec", "-n", "openshell", "bruiser", "--",
]

DOCKER_CONTAINER = "openshell-cluster-nemoclaw"


def run(cmd, timeout=30, check=True, capture=True):
    """Run a command, return (returncode, stdout, stderr)."""
    print(f"  $ {' '.join(cmd)}")
    try:
        r = subprocess.run(
            cmd,
            capture_output=capture,
            text=True,
            timeout=timeout,
        )
        if check and r.returncode != 0:
            print(f"  ✗ exit {r.returncode}")
            if r.stderr:
                print(f"    {r.stderr.strip()}")
            return r.returncode, r.stdout or "", r.stderr or ""
        return r.returncode, r.stdout or "", r.stderr or ""
    except subprocess.TimeoutExpired:
        print(f"  ✗ timed out after {timeout}s")
        return -1, "", "timeout"


def kexec(shell_cmd, timeout=30, check=True):
    """kubectl exec a shell command inside the bruiser pod."""
    return run(KUBECTL_PREFIX + ["sh", "-c", shell_cmd], timeout=timeout, check=check)


def step(n, title):
    print(f"\n{'='*60}")
    print(f"  Step {n}: {title}")
    print(f"{'='*60}")


# ── Step 0: Restart cluster (optional) ──────────────────────

def restart_cluster():
    step(0, "Restart openshell-cluster-nemoclaw (gRPC watch stream fix)")
    rc, out, err = run(["docker", "restart", DOCKER_CONTAINER], timeout=60)
    if rc != 0:
        print("  ✗ Failed to restart cluster container.")
        return False
    print("  ✓ Container restarted. Waiting for it to become healthy...")
    for i in range(12):
        time.sleep(5)
        rc, out, _ = run(
            ["docker", "inspect", "--format", "{{.State.Health.Status}}", DOCKER_CONTAINER],
            check=False,
        )
        status = out.strip()
        print(f"    ({(i+1)*5}s) status: {status}")
        if status == "healthy":
            print("  ✓ Cluster is healthy.")
            return True
    print("  ⚠ Cluster did not become healthy within 60s. Continuing anyway.")
    return True


# ── Step 1: Patch allowedOrigins ─────────────────────────────

def patch_origins(port):
    step(1, "Patch allowedOrigins in openclaw.json")
    origins = [f"http://127.0.0.1:{port}", f"http://localhost:{port}"]
    # Write a temp script into the pod, then execute it — avoids sh -c quoting hell
    patch_script = (
        "import json, sys\n"
        "path = '/sandbox/.openclaw/openclaw.json'\n"
        "cfg = json.load(open(path))\n"
        f"cfg['gateway']['controlUi']['allowedOrigins'] = {origins!r}\n"
        "json.dump(cfg, open(path, 'w'), indent=2)\n"
        "print('patched')\n"
    )
    # Write script to /tmp inside the pod via stdin (-i for stdin passthrough)
    write_cmd = [
        "openshell", "doctor", "exec", "--",
        "kubectl", "exec", "-n", "openshell", "bruiser", "-i", "--",
        "sh", "-c", "cat > /tmp/_patch_origins.py",
    ]
    print(f"  $ (writing patch script to /tmp/_patch_origins.py)")
    w = subprocess.run(write_cmd, input=patch_script, text=True, capture_output=True, timeout=15)
    if w.returncode != 0:
        print(f"  ✗ Failed to write patch script: {w.stderr.strip()}")
        return False
    rc, out, _ = kexec("python3 /tmp/_patch_origins.py")
    if rc == 0 and "patched" in out:
        print(f"  ✓ allowedOrigins set to {origins}")
        return True
    print("  ✗ Failed to patch origins.")
    return False


# ── Step 2: Update openclaw ──────────────────────────────────

def update_openclaw():
    step(2, "Update openclaw to latest")
    # Must run as root to bypass Landlock read-only on /sandbox/.openclaw
    rc, out, err = run(
        KUBECTL_PREFIX + ["npm", "i", "-g", "openclaw@latest"],
        timeout=300,
        check=False,
    )
    if rc == 0:
        # Try to extract the installed version from npm output
        for line in (out + err).splitlines():
            if "openclaw@" in line:
                print(f"  ✓ {line.strip()}")
                return True
        print("  ✓ openclaw updated.")
        return True
    print(f"  ✗ Failed to update openclaw.")
    if out:
        print(f"    {out.strip()[:300]}")
    return False


# ── Step 3: Kill stale gateway processes ─────────────────────

def kill_gateway():
    step(3, "Kill stale gateway processes")
    # No ps/pkill/fuser in the pod — scan /proc manually
    find_cmd = (
        'for p in /proc/[0-9]*/cmdline; do '
        '  if cat "$p" 2>/dev/null | tr "\\0" " " | grep -q "openclaw.*gateway\\|gateway.*openclaw"; then '
        '    echo "${p%/cmdline}"; '
        '  fi; '
        'done'
    )
    rc, out, _ = kexec(find_cmd, check=False)
    pids = []
    for line in out.strip().splitlines():
        # line looks like /proc/1234
        pid = line.strip().split("/")[-1]
        if pid.isdigit():
            pids.append(pid)
    if not pids:
        print("  ✓ No stale gateway processes found.")
        return True
    print(f"  Found gateway PIDs: {', '.join(pids)}")
    rc, _, _ = kexec(f"kill {' '.join(pids)}", check=False)
    time.sleep(2)
    print(f"  ✓ Killed {len(pids)} process(es).")
    return True


# ── Step 4: Start gateway ────────────────────────────────────

def start_gateway(port):
    step(4, f"Start gateway (port {port}, ipv4first)")
    cmd = (
        f"HOME=/sandbox "
        f"NODE_OPTIONS=--dns-result-order=ipv4first "
        f"openclaw gateway run --port {port} "
        f"> /tmp/gateway.log 2>&1 & "
        f"sleep 3; head -20 /tmp/gateway.log"
    )
    rc, out, _ = kexec(cmd, timeout=30, check=False)
    if out:
        print(f"  Gateway log:\n    " + "\n    ".join(out.strip().splitlines()))
    # Check if it's actually listening
    rc2, out2, _ = kexec(
        f'cat /proc/net/tcp 2>/dev/null | grep ":{port:04X}" | head -1',
        check=False,
    )
    if out2.strip():
        print(f"  ✓ Gateway is listening on port {port}.")
        return True
    else:
        print(f"  ⚠ Could not confirm gateway is listening. Check /tmp/gateway.log inside the pod.")
        return True


# ── Step 5: Print auth token ─────────────────────────────────

def print_token():
    step(5, "Retrieve auth token")
    rc, out, _ = kexec("grep OPENCLAW_GATEWAY_TOKEN /sandbox/.bashrc", check=False)
    if rc == 0 and "OPENCLAW_GATEWAY_TOKEN" in out:
        # Extract just the token value
        for line in out.strip().splitlines():
            if "OPENCLAW_GATEWAY_TOKEN" in line:
                token = line.split("=", 1)[-1].strip().strip("'\"")
                print(f"  ✓ Token: {token}")
                return token
    print("  ✗ Could not find OPENCLAW_GATEWAY_TOKEN in /sandbox/.bashrc")
    return None


# ── Step 6: Test inference proxy ──────────────────────────────

def test_inference():
    step(6, "Test inference proxy")
    rc, out, _ = kexec(
        'HTTPS_PROXY=http://10.200.0.1:3128 curl -sk --max-time 10 https://inference.local/v1/models',
        timeout=20,
        check=False,
    )
    if rc == 0 and out.strip():
        try:
            data = json.loads(out.strip())
            models = [m.get("id", m) for m in data.get("data", data.get("models", []))]
            print(f"  ✓ Inference proxy is healthy. Models: {', '.join(str(m) for m in models[:5])}")
            return True
        except (json.JSONDecodeError, AttributeError):
            print(f"  ✓ Inference proxy responded (non-JSON): {out.strip()[:200]}")
            return True
    print("  ✗ Inference proxy unreachable or returned empty response.")
    print("    Check API key: nemoclaw credentials list")
    return False


# ── Step 7: Restart port forward ──────────────────────────────

def restart_forward(port):
    step(7, f"Restart port forward (port {port})")
    # Stop any existing openshell forward
    run(["openshell", "forward", "stop", str(port), "bruiser"], check=False)
    time.sleep(1)
    # Kill anything still holding the port on the host
    rc, out, _ = run(["lsof", "-t", f"-i:{port}", "-sTCP:LISTEN"], check=False)
    stale_pids = [p.strip() for p in out.strip().splitlines() if p.strip().isdigit()]
    if stale_pids:
        print(f"  Killing stale listener(s) on port {port}: PID {', '.join(stale_pids)}")
        for pid in stale_pids:
            run(["kill", pid], check=False)
        time.sleep(1)
    # Start fresh forward
    rc, out, err = run(
        ["openshell", "forward", "start", "--background", f"0.0.0.0:{port}", "bruiser"],
        check=False,
    )
    if rc != 0:
        print(f"  ✗ Failed to start forward: {(err or out).strip()}")
        return False
    # Verify with curl
    time.sleep(1)
    rc, _, _ = run(["curl", "-sk", "-o", "/dev/null", "-w", "%{http_code}",
                     f"http://127.0.0.1:{port}/"], check=False)
    if rc == 0:
        print(f"  ✓ Port forward active — http://localhost:{port}/ is reachable.")
        return True
    print(f"  ⚠ Forward started but curl check failed. UI may still work in browser.")
    return True


# ── Main ──────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Apply all NemoClaw fixes from AGENTS.md")
    parser.add_argument("--restart-cluster", action="store_true",
                        help="Also restart the K3s cluster container (fixes stale gRPC streams)")
    parser.add_argument("--port", type=int, default=18789,
                        help="Gateway port (default: 18789)")
    args = parser.parse_args()

    print("╔══════════════════════════════════════════════════════════╗")
    print("║            fix_nemoclaw.py — Full Reset Script          ║")
    print("╚══════════════════════════════════════════════════════════╝")

    if args.restart_cluster:
        restart_cluster()

    patch_origins(args.port)
    update_openclaw()
    kill_gateway()
    start_gateway(args.port)
    token = print_token()
    test_inference()
    restart_forward(args.port)

    print(f"\n{'='*60}")
    print("  Done. Open http://localhost:{}/".format(args.port))
    if token:
        print(f"  Token: {token}")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
