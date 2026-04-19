#!/usr/bin/env python3
"""Dump full request + response body for checkout-related ops in the HEB HAR."""
import json
import sys
from urllib.parse import urlparse

if len(sys.argv) < 2:
    sys.exit("usage: dump_checkout_entries.py <path-to-har>")
HAR = sys.argv[1]
TARGET_OPS = {"checkoutCart", "commitCheckout", "ReserveTimeslot", "cartEstimated",
              "ModifiableOrderDetailsRequest", "creditCardsList", "ShippingAddresses",
              "cartItemV2", "historicCashbackEstimate"}


def extract_op(req):
    pd = req.get("postData") or {}
    text = pd.get("text") or ""
    try:
        j = json.loads(text)
    except Exception:
        return None, text
    if isinstance(j, list):
        op = ",".join(str(x.get("operationName")) for x in j)
        return op, j
    return j.get("operationName"), j


def main():
    with open(HAR) as f:
        har = json.load(f)
    printed = set()
    for i, e in enumerate(har["log"]["entries"]):
        req = e["request"]
        url = req["url"]
        if "/graphql" not in url or "heb.com" not in urlparse(url).netloc:
            continue
        op, body = extract_op(req)
        if op not in TARGET_OPS:
            continue
        if op in printed and op not in {"checkoutCart", "commitCheckout"}:
            continue
        printed.add(op)
        res = e["response"]
        resp_text = res.get("content", {}).get("text") or ""
        print("=" * 100)
        print(f"[{i:3d}] op={op} status={res['status']} url={url}")
        print("-- REQUEST BODY --")
        print(json.dumps(body, indent=2)[:4000])
        print("-- RESPONSE BODY (truncated) --")
        try:
            parsed = json.loads(resp_text)
            print(json.dumps(parsed, indent=2)[:6000])
        except Exception:
            print(resp_text[:6000])
        print()


if __name__ == "__main__":
    main()
