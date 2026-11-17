"""Browsertest van de planner (Chrome via Playwright). API wordt gemockt; geen backend nodig.

Draaien vanuit de projectmap:  python3 tests/browser/smoke.py
Vereist: python playwright en google-chrome (of pas CHROME aan).
"""
import json, os, subprocess, sys, time, urllib.request
from playwright.sync_api import sync_playwright

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
PORT = 8765
CHROME = os.environ.get("CHROME", "/usr/bin/google-chrome")
fouten = []

def mock_api(route, request):
    url = request.url
    if "/api/state" in url and request.method == "GET":
        return route.fulfill(status=200, content_type="application/json", body=json.dumps({"data": None, "version": 0}))
    if "/api/state" in url and request.method == "PUT":
        body = json.loads(request.post_data or "{}")
        state["puts"].append(body)
        if state.get("conflict_once"):
            state["conflict_once"] = False
            return route.fulfill(status=409, content_type="application/json", body=json.dumps({"error": "Iemand anders heeft de gegevens al opgeslagen. Ververs de pagina.", "version": 7}))
        state["version"] = body.get("version", 0) + 1
        return route.fulfill(status=200, content_type="application/json", body=json.dumps({"version": state["version"]}))
    return route.fulfill(status=200, content_type="application/json", body="{}")

state = {"puts": [], "version": 0, "conflict_once": False}

def run():
    srv = subprocess.Popen([sys.executable, "-m", "http.server", str(PORT), "--bind", "127.0.0.1"], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        for _ in range(50):
            try: urllib.request.urlopen(f"http://127.0.0.1:{PORT}/index.html"); break
            except Exception: time.sleep(0.1)
        with sync_playwright() as p:
            browser = p.chromium.launch(executable_path=CHROME, args=["--no-sandbox"])
            page = browser.new_page(viewport={"width": 1400, "height": 900})
            page.on("pageerror", lambda e: fouten.append(f"pageerror: {e}"))
            page.route("**/api/**", mock_api)
            page.goto(f"http://127.0.0.1:{PORT}/index.html")
            page.wait_for_selector("table.plan", timeout=10000)
            page.screenshot(path=os.path.join(ROOT, "tests/browser/planning.png"))
            check(page.locator(".blk").count() > 0, "planning toont blokken")

            # Gantt: bovenste rij mag niet onder de kopregel vallen
            page.evaluate("S.tab = 'gantt'; S.gmode = 'proj'; render()")
            page.wait_for_selector(".gantt", timeout=5000)
            kop = page.locator(".g-kop").bounding_box()
            lbl = page.locator(".g-task-lbl").first.bounding_box()
            check(lbl and kop and lbl["y"] >= kop["y"] + kop["height"] - 2, "Gantt: eerste taakrij onder de kopregel")
            check(page.locator(".g-legenda span").count() == 4, "Gantt: legenda met 4 groepen")
            page.screenshot(path=os.path.join(ROOT, "tests/browser/gantt.png"), full_page=False)

            # Projectfilter in planning
            page.evaluate("S.tab = 'overzicht'; S.proj = 'p1'; render()")
            check(page.locator(".blk.dim").count() > 0, "projectfilter: andere blokken gedimd")
            page.evaluate("S.proj = null; render()")

            # Opslaan en conflict (409): de serverversie moet worden geladen, met melding
            n0 = len(state["puts"])
            state["conflict_once"] = True
            page.evaluate("D.settings.titel = 'test-conflict'; save()")
            page.wait_for_timeout(1500)
            check(len(state["puts"]) > n0, "opslaan stuurt een PUT")
            check("Iemand anders heeft de gegevens" in page.content() or "Iemand anders heeft" in page.inner_text("body"), "409: melding dat iemand anders opsloeg")
            browser.close()
    finally:
        srv.terminate()

def check(ok, naam):
    print(("OK   " if ok else "FOUT ") + naam)
    if not ok: fouten.append(naam)

if __name__ == "__main__":
    run()
    if fouten:
        print(f"\n{len(fouten)} controle(s) mislukt"); sys.exit(1)
    print("\nalle browsercontroles geslaagd")
