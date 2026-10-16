"""
Browser playthrough of every game, persistence, progress, export/import and clearing data.

Usage:
  bun tests/e2e/dump-answers.ts /tmp/cm-answers.json
  bun run dev            # serves http://localhost:5173
  python3 tests/e2e/playthrough.py [base-url] [answers.json] [screenshot-dir]

Requires: pip install playwright && playwright install chromium
"""
import json, sys, os, re
from playwright.sync_api import sync_playwright, expect

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5173/"
KEY = json.load(open(sys.argv[2] if len(sys.argv) > 2 else "/tmp/cm-answers.json"))
SHOTS = sys.argv[3] if len(sys.argv) > 3 else "/tmp/cm-shots"
os.makedirs(SHOTS, exist_ok=True)
problems = []


def check(cond, msg):
    if not cond:
        problems.append(msg)
        print("FAIL:", msg)
    else:
        print("ok:", msg)


def shot(page, name):
    page.screenshot(path=f"{SHOTS}/{name}.png", full_page=True)


def summary(page, name):
    expect(page.locator(".final-score")).to_be_visible(timeout=8000)
    check(page.locator(".learning").count() > 0, f"{name}: summary shows learnings")
    shot(page, f"{name}-summary")


def word_rush(page):
    page.goto(BASE + "#play.word-rush")
    page.wait_for_selector("#wr-input")
    shot(page, "word-rush-play")
    used = set()
    for _ in range(6):
        cur = page.locator(".big-word").inner_text().strip().lower()
        used.add(cur)
        options = [w for w in KEY["assoc"].get(cur, []) if w not in used and " " not in w]
        word = options[0] if options else "zzqx"
        page.fill("#wr-input", word)
        page.keyboard.press("Enter")
        page.wait_for_timeout(150)
        if word == "zzqx":
            page.keyboard.press("Enter")  # vouch
        used.add(word)
    check(page.locator(".chain .link").count() >= 6, "word rush: chain grows")
    # vouch path
    page.fill("#wr-input", "qwzxv")
    page.keyboard.press("Enter")
    check(page.locator(".vouch").is_visible(), "word rush: unknown word offers vouching")
    page.keyboard.press("Enter")
    page.wait_for_timeout(150)
    check(page.locator(".chain .link.vouched").count() >= 1, "word rush: vouched link marked")
    page.get_by_role("button", name="Finish round").click()
    summary(page, "word-rush")
    check(page.get_by_text("How your chain connects").is_visible(), "word rush: explains links")


def alphabet(page):
    page.goto(BASE + "#play.alphabet-sprint")
    page.wait_for_selector("#as-input")
    letter = page.locator(".letter-hero .tile").inner_text().strip().lower()
    titles = [t.strip() for t in page.locator(".cat-col h3 span:first-child").all_inner_texts()]
    answers = []
    for t in titles:
        answers += KEY["alpha"].get(t, {}).get(letter, [])[:2]
    for a in answers[:5]:
        page.fill("#as-input", a)
        page.keyboard.press("Enter")
        page.wait_for_timeout(80)
    page.fill("#as-input", letter + "zzzzq")
    page.keyboard.press("Enter")
    check("isn't on our lists" in page.locator(".feedback").inner_text(), "alphabet: rejects nonsense")
    found = page.locator(".cat-col li").count()
    check(found >= min(5, len(set(answers))) - 1, f"alphabet: accepted {found} answers")
    shot(page, "alphabet-play")
    page.get_by_role("button", name="Finish round").click()
    summary(page, "alphabet")


def scramble(page):
    page.goto(BASE + "#word-scramble")
    page.get_by_role("button", name="Relaxed No clock").click()
    page.get_by_role("button", name="Play", exact=True).click()
    for i in range(8):
        page.wait_for_selector("#ws-input")
        label = page.locator(".scramble-tiles").get_attribute("aria-label")
        letters = "".join(sorted(label.split(":")[1].replace(" ", "").strip()))
        word = KEY["scramble"].get(letters)
        if i == 0:
            shot(page, "scramble-play")
        if i == 1:
            page.get_by_role("button", name=re.compile("^Hint")).click()
            check(page.locator("#ws-input").input_value() == word[:1], "scramble: hint reveals first letter")
        if i == 2:
            page.get_by_role("button", name="Reveal").click()
        else:
            page.fill("#ws-input", word)
            page.keyboard.press("Enter")
        page.wait_for_selector(".reveal")
        if i == 0:
            shot(page, "scramble-reveal")
        page.keyboard.press("Enter")
    summary(page, "scramble")


def define(page):
    page.goto(BASE + "#play.define-it")
    for i in range(6):
        page.wait_for_selector("#di-def")
        word = page.locator(".big-word").inner_text().strip()
        page.fill("#di-def", "something I am not sure about")
        page.fill("#di-sen", f"I used {word} in a sentence today.")
        if i == 0:
            shot(page, "define-write")
        page.get_by_role("button", name="Compare").click()
        page.wait_for_selector(".verdicts")
        if i == 0:
            check("uses" in page.locator(".compare").inner_text(), "define: sentence check recognises the word")
            shot(page, "define-compare")
            page.get_by_role("button", name="Revisit this word later").click()
        page.keyboard.press(["1", "2", "3"][i % 3])
    summary(page, "define")


def flags(page):
    page.goto(BASE + "#play.flag-finder")
    for i in range(10):
        page.wait_for_selector(".option:not([disabled])")
        img = page.locator(".flag-frame img")
        check(img.evaluate("i => i.complete && i.naturalWidth > 0"), f"flags: image {i} loaded") if i < 2 else None
        if i == 0:
            shot(page, "flag-play")
        page.keyboard.press("1")
        page.wait_for_selector(".factbox")
        if i == 0:
            shot(page, "flag-reveal")
        page.get_by_role("button", name=re.compile("^(Next|See results)$")).click()
    summary(page, "flags")


def capitals(page):
    page.goto(BASE + "#capital-quest")
    page.get_by_role("button", name=re.compile("^Recall")).click()
    page.get_by_role("button", name="Play", exact=True).click()
    right = 0
    for i in range(10):
        page.wait_for_selector("#geo-input")
        country = page.locator(".big-word").inner_text().strip()
        ans = KEY["capitals"].get(country, "Nowhere")
        if i == 3:
            ans = "Atlantis"
        page.fill("#geo-input", ans)
        page.keyboard.press("Enter")
        page.wait_for_selector(".factbox")
        if "Correct" in page.locator(".factbox .t").inner_text():
            right += 1
        if i == 0:
            shot(page, "capital-reveal")
        page.get_by_role("button", name=re.compile("^(Next|See results)$")).click()
    check(right == 9, f"capitals: typed answers judged right ({right}/9)")
    summary(page, "capitals")


def web(page):
    page.goto(BASE + "#play.word-web")
    page.wait_for_selector(".web-cell")
    words = sorted(w.strip().lower() for w in page.locator(".web-cell").all_inner_texts())
    board = next(b for b in KEY["webs"] if sorted(sum(b, [])) == words)
    shot(page, "web-play")
    # one deliberate mistake
    mix = board[0][:3] + board[1][:1]
    for w in mix:
        page.locator(".web-cell", has_text=re.compile(f"^{re.escape(w)}$", re.I)).first.click()
    page.get_by_role("button", name=re.compile("^Submit")).click()
    check("One away" in page.locator(".feedback").inner_text(), "web: one-away feedback")
    page.get_by_role("button", name="Deselect").click()
    for g in board[:3]:
        for w in g:
            page.locator(".web-cell", has_text=re.compile(f"^{re.escape(w)}$", re.I)).first.click()
        page.get_by_role("button", name=re.compile("^Submit")).click()
        page.wait_for_timeout(200)
    page.wait_for_timeout(900)
    check(page.locator(".solved-group").count() == 4, "web: board solved")
    shot(page, "web-solved")
    page.get_by_role("button", name="See results").click()
    summary(page, "web")
    page.get_by_role("button", name=re.compile("Play again")).click()
    check(page.locator(".web-cell").count() == 16, "web: play again starts a new board")


BASE_SHOTS = SHOTS
with sync_playwright() as p:
    browser = p.chromium.launch()
    for label, vp in [("desktop", {"width": 1280, "height": 900}), ("mobile", {"width": 390, "height": 844})]:
        ctx = browser.new_context(viewport=vp, accept_downloads=True, has_touch=label == "mobile")
        page = ctx.new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        # Fonts may be unreachable in sandboxed CI; any other failed request is a real problem.
        page.on("console", lambda m: errors.append(m.text) if m.type == "error" and "Failed to load resource" not in m.text else None)
        page.on("requestfailed", lambda r: errors.append(f"request failed: {r.url}") if "fonts.g" not in r.url else None)
        SHOTS = f"{BASE_SHOTS}/{label}"
        os.makedirs(SHOTS, exist_ok=True)
        page.goto(BASE)
        page.wait_for_selector(".spotlight")
        for fn in [word_rush, alphabet, scramble, define, flags, capitals, web]:
            try:
                fn(page)
            except Exception as e:
                problems.append(f"{label} {fn.__name__}: {e}")
                print("ERROR", fn.__name__, e)
                shot(page, f"error-{fn.__name__}")

        # persistence after reload
        page.goto(BASE)
        page.reload()
        page.wait_for_selector(".numbers")
        rounds = int(page.locator(".numbers .n").first.inner_text().replace(",", ""))
        check(rounds >= 7, f"{label}: rounds persist after reload ({rounds})")
        check(page.locator(".review-strip").count() == 1, f"{label}: review shelf appears")
        shot(page, "home-after")
        page.goto(BASE + "#progress")
        page.wait_for_selector("table.data")
        shot(page, "progress")
        page.goto(BASE + "#review.flag-finder")
        page.wait_for_selector(".flag-frame")
        check(True, f"{label}: review round starts")

        # export / clear / import
        page.goto(BASE + "#settings")
        with page.expect_download() as dl:
            page.get_by_role("button", name="Export data").click()
        path = f"{SHOTS}/export.json"
        dl.value.save_as(path)
        data = json.load(open(path))
        check(data["app"] == "curious-minds" and len(data["data"]["sessions"]) == rounds, f"{label}: export contains every round")
        shot(page, "settings")
        page.get_by_role("button", name="Clear data…").click()
        page.get_by_role("button", name="Yes, clear everything").click()
        page.wait_for_timeout(200)
        page.goto(BASE)
        page.reload()
        page.wait_for_selector(".numbers")
        check(page.locator(".numbers .n").first.inner_text() == "0", f"{label}: clear removes data")
        page.goto(BASE + "#settings")
        page.set_input_files("#import-file", path)
        page.get_by_role("button", name="Merge").click()
        page.wait_for_timeout(300)
        page.goto(BASE)
        page.reload()
        page.wait_for_selector(".numbers")
        check(int(page.locator(".numbers .n").first.inner_text()) == rounds, f"{label}: import restores rounds")
        # malformed import
        page.goto(BASE + "#settings")
        bad = f"{SHOTS}/bad.json"
        open(bad, "w").write("{not json")
        page.set_input_files("#import-file", bad)
        page.wait_for_selector("[role=alert]", timeout=3000)
        check(page.locator("[role=alert]").is_visible(), f"{label}: malformed import explained")

        # overflow check on key screens
        for route in ["", "#progress", "#settings", "#word-web", "#play.alphabet-sprint"]:
            page.goto(BASE + route)
            page.wait_for_timeout(400)
            sw = page.evaluate("document.documentElement.scrollWidth")
            check(sw <= vp["width"], f"{label}: no horizontal scroll on {route or 'home'} ({sw})")
        check(not errors, f"{label}: no page errors {errors[:3]}")
        ctx.close()
    browser.close()

print("\n" + ("ALL CHECKS PASSED" if not problems else f"{len(problems)} PROBLEMS:\n" + "\n".join(problems)))
sys.exit(1 if problems else 0)
