"""Check the 3D jacket viewers on a running copy of the site.

Usage:  python3 -I scripts/check-viewers.py <url> [--runs N]
        e.g. python3 -I scripts/check-viewers.py http://127.0.0.1:8765/
             python3 -I scripts/check-viewers.py https://www.oldnew.club/

Needs Playwright for Python (already on both Macs) and macOS `sips`.

Checks (each prints PASS or FAIL, exit code 1 on any FAIL):
  1. Desktop, cold cache, N runs: all 4 jackets draw, 0 console errors.
  2. Phone: scrolling down draws each jacket in turn; jackets far
     off screen are torn down (no pile-up of WebGL canvases).
  3. Failure path: if a model will not load, "Tap to retry" shows,
     the site does NOT retry on its own, and a tap loads it.
"""
import os
import struct
import subprocess
import sys
import tempfile

from playwright.sync_api import sync_playwright

RED = (194, 14, 14)  # page background, #c20e0e
IPHONE_UA = (
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 "
    "(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
)

failures = []


def report(ok, label, detail=""):
    print(f"{'PASS' if ok else 'FAIL'}  {label}  {detail}")
    if not ok:
        failures.append(label)


def drawn_share(png_bytes):
    """Share of pixels (0-1) that are NOT the red background.
    A drawn jacket covers a good part of its box; an empty box is ~0."""
    with tempfile.TemporaryDirectory() as tmp:
        png, bmp = os.path.join(tmp, "a.png"), os.path.join(tmp, "a.bmp")
        open(png, "wb").write(png_bytes)
        subprocess.run(["sips", "-s", "format", "bmp", png, "--out", bmp],
                       capture_output=True, check=True)
        data = open(bmp, "rb").read()
    offset = struct.unpack_from("<I", data, 10)[0]
    width, height = struct.unpack_from("<ii", data, 18)
    bpp = struct.unpack_from("<H", data, 28)[0] // 8
    row = (width * bpp + 3) & ~3
    off_red = 0
    for y in range(abs(height)):
        for x in range(0, width, 2):  # every other pixel is plenty
            b, g, r = data[offset + y * row + x * bpp: offset + y * row + x * bpp + 3]
            if abs(r - RED[0]) + abs(g - RED[1]) + abs(b - RED[2]) > 60:
                off_red += 1
    return off_red / (abs(height) * ((width + 1) // 2))


def jacket_shares(page):
    return [drawn_share(el.screenshot()) for el in page.query_selector_all(".jacket")]


def check_desktop(browser, url, runs):
    for run in range(1, runs + 1):
        ctx = browser.new_context(viewport={"width": 1440, "height": 900})  # fresh = cold cache
        page = ctx.new_page()
        errors = []
        page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.goto(url, wait_until="load")
        page.wait_for_timeout(8000)
        shares = jacket_shares(page)
        drawn = sum(s > 0.05 for s in shares)
        report(drawn == 4 and not errors, f"desktop cold run {run}: {drawn}/4 jackets drawn, {len(errors)} console errors",
               " ".join(f"{s:.0%}" for s in shares) + (f" first error: {errors[0]}" if errors else ""))
        ctx.close()


def check_phone_scroll(browser, url):
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, user_agent=IPHONE_UA,
                              is_mobile=True, has_touch=True, device_scale_factor=2)
    page = ctx.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.goto(url, wait_until="load")
    page.wait_for_timeout(4000)
    jackets = page.query_selector_all(".jacket")
    most_canvases = 0
    for i, el in enumerate(jackets):
        el.scroll_into_view_if_needed()
        page.wait_for_timeout(5000)
        share = drawn_share(el.screenshot())
        live = page.evaluate("document.querySelectorAll('.jacket canvas').length")
        most_canvases = max(most_canvases, live)
        report(share > 0.05, f"phone: jacket {i + 1} drawn after scrolling to it", f"{share:.0%}, {live} canvases live")
    report(most_canvases <= 3, f"phone: off-screen jackets torn down (max {most_canvases} live canvases)")
    report(not errors, f"phone: {len(errors)} page errors", errors[0] if errors else "")
    ctx.close()


def check_failure_path(browser, url):
    ctx = browser.new_context(viewport={"width": 1440, "height": 900})
    page = ctx.new_page()
    requests = []
    page.on("request", lambda r: requests.append(r.url) if r.url.endswith("sun-ghost.glb") else None)
    # Make one model fail to load
    page.route("**/sun-ghost.glb", lambda route: route.abort())
    page.goto(url, wait_until="load")
    page.wait_for_timeout(8000)
    sun = page.query_selector_all(".jacket")[3]
    has_retry = sun.query_selector(".jacket-error") is not None
    report(has_retry, "failure: 'Tap to retry' shows when a model fails")
    tried = len(requests)
    page.wait_for_timeout(5000)
    report(len(requests) == tried, f"failure: no automatic retries ({tried} request(s), then {len(requests) - tried} more in 5s)")
    # Let the model load again, then tap retry
    page.unroute("**/sun-ghost.glb")
    if has_retry:
        sun.query_selector(".jacket-error").click()
        page.wait_for_timeout(6000)
        share = drawn_share(sun.screenshot())
        report(share > 0.05 and sun.query_selector(".jacket-error") is None,
               "failure: tapping retry loads the jacket", f"{share:.0%}")
    ctx.close()


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    url = sys.argv[1]
    runs = int(sys.argv[sys.argv.index("--runs") + 1]) if "--runs" in sys.argv else 3
    with sync_playwright() as p:
        browser = p.chromium.launch()
        check_desktop(browser, url, runs)
        check_phone_scroll(browser, url)
        check_failure_path(browser, url)
        browser.close()
    print(f"\n{'ALL PASS' if not failures else f'{len(failures)} FAILED'}")
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
