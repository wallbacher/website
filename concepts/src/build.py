"""Builds the three Kleos story variants.
Writes site pages to concepts/ (full HTML documents) and artifact copies to the scratch dir given as argv[1]."""
import re, sys, pathlib, html, json

ROOT = pathlib.Path(__file__).resolve().parent
OUT_SITE = ROOT.parent
OUT_ART = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else None

MAIL = "info@kleos-entertainment.ch"

engine = (ROOT / "engine.js").read_text()
themes = (ROOT / "themes.js").read_text()
def theme_js(key):
    return re.search(rf"/\* @@{key}@@ \*/(.*?)/\* @@END@@ \*/", themes, re.S).group(1)

# act, short title (used for intertitles), headline, line
ACTS = [
    ("Prologue", "κλέος", "κλέος", "<b>kléos</b> · Ancient Greek. Glory, renown. Literally <i>what is heard</i>: the story people tell about you, long after you leave the stage."),
    ("Act I", "The heroes", "Every hero had a story of their own.", "Different deeds, different songs. That is what made each of them unforgettable."),
    ("Act II", "Your brand", "So does every brand.", "Which is why we don't do cookie-cutter. A template makes you look like everyone else."),
    ("Act III · Listen", "Listen", "First, we listen.", "We research your brand, your product and the people who use it, until we know how they see you today."),
    ("Act IV · Find", "Find", "Then we dig for what only you have.", "Your USP. If your story could belong to a competitor, people will go to the competitor."),
    ("Act V · Tell", "Tell", "Then we tell it so people want to hear it.", "Entertain people and they listen with their ears and their hearts. That is how a message sticks."),
    ("Deed · Orangina Switzerland", "One costume", "One costume. A whole character.", "Small budget, big idea: a character who tells the brand's story in short, funny clips for social media."),
    ("Deed · Eurovision Song Contest", "Stage fever", "A safety briefing with stage fever.", "The briefing for every delegation and crew, filmed on a set that feels like the show, with jokes for the fans. They learned the rules and walked in already fired up."),
    ("Your turn", "Your story", "What will they hear about you?", "Let's find your kleos. Scroll on and tell us about it."),
]
# the Flashback variant is narrated, like a voice-over in a film's flashback
NARRATION = [
    "Long ago, the Greeks had a word for the story people tell about you. <b>κλέος</b>, kléos: what is heard.",
    "Every hero had a kleos of their own. Different deeds, different songs.",
    "Brands are no different. A template makes you look like everyone else, so we don't use one.",
    "First, we listen. Your brand, your product, your people.",
    "Then we dig, until we find what only you have. Your USP.",
    "Then we tell it. Entertain people and they listen with their hearts. That is how a message sticks.",
    "Orangina Switzerland. One costume, one character, a whole brand story told in short clips.",
    "Eurovision Song Contest. A safety briefing on a set like the show itself. The crews walked in on fire.",
    "And now, your story. What will they hear about you?",
]

# German is the default language. Swiss spelling (ss, no ß), formal "Sie".
ACTS_DE = [
    ("Prolog", "κλέος", "κλέος", "<b>kléos</b> · Altgriechisch. Ruhm, Ansehen. Wörtlich <i>das, was man hört</i>: die Geschichte, die man sich über Sie erzählt, lange nachdem Sie die Bühne verlassen haben."),
    ("Akt I", "Die Helden", "Jeder Held hatte seine eigene Geschichte.", "Andere Taten, andere Lieder. Genau das machte jeden von ihnen unvergesslich."),
    ("Akt II", "Ihre Marke", "Jede Marke auch.", "Darum arbeiten wir nie nach Schema F. Eine Vorlage lässt Sie aussehen wie alle anderen."),
    ("Akt III · Zuhören", "Zuhören", "Zuerst hören wir zu.", "Wir recherchieren Ihre Marke, Ihr Produkt und die Menschen, die es nutzen, bis wir wissen, wie man Sie heute sieht."),
    ("Akt IV · Finden", "Finden", "Dann graben wir nach dem, was nur Sie haben.", "Ihren USP. Wenn Ihre Geschichte auch zur Konkurrenz passen könnte, gehen die Leute zur Konkurrenz."),
    ("Akt V · Erzählen", "Erzählen", "Dann erzählen wir sie so, dass man zuhören will.", "Wer gut unterhalten wird, hört mit den Ohren und mit dem Herzen zu. So bleibt eine Botschaft hängen."),
    ("Heldentat · Orangina Schweiz", "Ein Kostüm", "Ein Kostüm. Eine ganze Figur.", "Kleines Budget, grosse Idee: eine Figur, die die Geschichte der Marke in kurzen, witzigen Clips für Social Media erzählt."),
    ("Heldentat · Eurovision Song Contest", "Showfieber", "Ein Sicherheitsbriefing, das Lust auf die Show macht.", "Das Briefing für alle Delegationen und Crews, gedreht in einer Kulisse wie die Show selbst, mit Witzen für die Fans. Danach kannten alle die Regeln und kamen schon in Feststimmung in die Halle."),
    ("Ihr Auftritt", "Ihre Geschichte", "Was wird man über Sie erzählen?", "Finden wir Ihr Kleos. Scrollen Sie weiter und erzählen Sie uns davon."),
]
NARRATION_DE = [
    "Vor langer Zeit hatten die Griechen ein Wort für die Geschichte, die man sich über jemanden erzählt. <b>κλέος</b>, kléos: das, was man hört.",
    "Jeder Held hatte sein eigenes Kleos. Andere Taten, andere Lieder.",
    "Bei Marken ist es nicht anders. Eine Vorlage macht Sie austauschbar, darum verwenden wir keine.",
    "Zuerst hören wir zu. Ihrer Marke, Ihrem Produkt, Ihren Leuten.",
    "Dann graben wir, bis wir finden, was nur Sie haben. Ihren USP.",
    "Dann erzählen wir es. Wer gut unterhalten wird, hört mit dem Herzen zu. So bleibt eine Botschaft hängen.",
    "Orangina Schweiz. Ein Kostüm, eine Figur, eine ganze Markengeschichte in kurzen Clips.",
    "Eurovision Song Contest. Ein Sicherheitsbriefing in einer Kulisse wie die Show selbst. Die Crews kamen voller Feuer in die Halle.",
    "Und jetzt Ihre Geschichte. Was wird man über Sie erzählen?",
]

UI = {
  "de": dict(contact="Kontakt", home="Kleos Entertainment, zurück zum Anfang", story="Die Geschichte von Kleos Entertainment in neun Szenen",
             h2="Erzählen Sie uns Ihre Geschichte.", lead="Eine Marke, ein Produkt, ein Event, eine Botschaft, die ein Publikum braucht. Schreiben Sie uns, und wir beginnen mit Zuhören.",
             email="E-Mail", copy="Kopieren", copied="Kopiert", selected="Markiert", name="Ihr Name", mail="Ihre E-Mail", msg="Ihre Geschichte",
             ph="Was soll man über Sie hören?", send="Senden", newstory="Neue Geschichte", present="HEUTE",
             note="Das hat nicht geklappt, darum öffnet sich jetzt Ihr Mail-Programm. Sie können auch direkt an {to} schreiben.", thanks="Danke! Ihre Nachricht ist bei uns angekommen. Wir melden uns bald.", sending="Wird gesendet …", missing="Bitte Name, eine gültige E-Mail und Ihre Nachricht ausfüllen.", lang="Sprache"),
  "en": dict(contact="Contact", home="Kleos Entertainment, back to the start", story="The story of Kleos Entertainment, in nine scenes",
             h2="Tell us your story.", lead="A brand, a product, an event, a message that needs an audience. Write to us and we'll start by listening.",
             email="Email", copy="Copy", copied="Copied", selected="Selected", name="Your name", mail="Your email", msg="Your story",
             ph="What should people hear about you?", send="Send", newstory="New story", present="PRESENT DAY",
             note="That didn’t work, so your mail app is opening instead. You can also write to {to} directly.", thanks="Thank you! Your message has reached us. We’ll be in touch soon.", sending="Sending …", missing="Please fill in your name, a valid email and your message.", lang="Language"),
}

VARIANTS = {
  "stage": dict(
    title="Kleos Stage", file="d-stage.html", theme="STAGE", icon="theater",
    desc="Frieze variation D: a modern theatre stage with depth, where the hero acts out each chapter.",
    fonts="family=Syne:wght@600;700;800&family=Manrope:wght@400;500;700&family=GFS+Didot",
    css="""
:root{--bg:#0b0b12;--fg:#f4efe6;--muted:#a7a3b8;--accent:#ffcc4d;--accent2:#ff5e57;--line:#2a2b3c;--field:#151622;
  --f-display:"Syne",sans-serif;--f-body:"Manrope",system-ui,sans-serif;color-scheme:dark}
.card{left:clamp(16px,6vw,96px);top:clamp(76px,14vh,140px);max-width:min(34rem,calc(100vw - 32px))}
.card .act{font-family:var(--f-body);font-weight:700;font-size:.78rem;letter-spacing:.2em;text-transform:uppercase;color:var(--accent)}
.card h2{font-family:var(--f-display);font-weight:800;font-size:clamp(2.1rem,5.6vw,4.4rem);line-height:.98;margin:.35rem 0 .7rem;text-wrap:balance;transform:translateY(calc((1 - var(--o,1))*18px))}
.card.prologue h2{font-family:"GFS Didot",serif;font-weight:400;font-size:clamp(3.4rem,10vw,7rem)}
.card p{margin:0;font-size:clamp(1rem,1.6vw,1.2rem);line-height:1.55;color:var(--muted);max-width:32rem}
.card p b{color:var(--fg)}
@media (max-width:640px){.card{top:72px}}
""",
  ),
  "flashback": dict(
    title="Kleos Flashback", file="e-flashback.html", theme="FLASHBACK", icon="film",
    desc="Frieze variation E: the story told as a film flashback, in sepia until it reaches the present day.",
    fonts="family=DM+Serif+Display:ital@0;1&family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=GFS+Didot",
    css="""
:root{--bg:#0d0b09;--fg:#f3e6cc;--muted:#b9a88a;--accent:#e8c27a;--accent2:#ffcc4d;--line:#3a2f22;--field:#17130e;
  --f-display:"DM Serif Display",serif;--f-body:"Courier Prime",ui-monospace,monospace;color-scheme:dark}
.card{left:50%;bottom:calc(9vh + 18px);transform:translateX(-50%);width:min(44rem,calc(100vw - 32px));text-align:center}
.card .act{font-family:var(--f-body);font-size:.75rem;letter-spacing:.24em;text-transform:uppercase;color:var(--accent)}
.card h2{display:none}
.card p{margin:.5rem 0 0;font-family:var(--f-body);font-style:italic;font-size:clamp(1.05rem,2.1vw,1.35rem);line-height:1.45;color:#fff6dd;text-shadow:0 2px 0 #000,0 0 18px rgba(0,0,0,.9)}
.card p b{font-style:normal;font-family:"GFS Didot",serif;font-size:1.25em;color:var(--accent2)}
.title-card{position:absolute;left:0;right:0;top:12vh;text-align:center;pointer-events:none}
""",
  ),
  "popup": dict(
    title="Kleos Pop-up", file="f-popup.html", theme="POPUP", icon="book",
    desc="Frieze variation F: a cut-paper pop-up theatre where each scene folds up as the hero arrives.",
    fonts="family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,800&family=DM+Sans:wght@400;500;700&family=GFS+Didot",
    css="""
:root{--bg:#e8edfb;--fg:#111116;--muted:#3d4466;--accent:#2f4bff;--accent2:#ff4f38;--line:#111116;--field:#ffffff;
  --f-display:"Bricolage Grotesque",sans-serif;--f-body:"DM Sans",system-ui,sans-serif;color-scheme:light}
.card{left:clamp(16px,6vw,96px);top:clamp(80px,15vh,150px);max-width:min(30rem,calc(100vw - 32px));background:#fff;border:2.5px solid var(--fg);padding:1.1rem 1.3rem 1.3rem;box-shadow:7px 8px 0 var(--accent);transform:rotate(calc(-1.5deg + (1 - var(--o,1))*6deg)) translateY(calc((1 - var(--o,1))*24px))}
.card:nth-child(even){transform:rotate(calc(1.2deg - (1 - var(--o,1))*6deg)) translateY(calc((1 - var(--o,1))*24px))}
.card .act{display:inline-block;font-family:var(--f-body);font-weight:700;font-size:.72rem;letter-spacing:.16em;text-transform:uppercase;background:var(--accent2);color:#fff;padding:.25rem .55rem}
.card h2{font-family:var(--f-display);font-weight:800;font-size:clamp(1.8rem,4.4vw,3.2rem);line-height:1;margin:.6rem 0 .5rem;text-wrap:balance;letter-spacing:-.01em}
.card.prologue h2{font-family:"GFS Didot",serif;font-weight:400;font-size:clamp(3rem,8vw,5.5rem)}
.card p{margin:0;font-size:clamp(.98rem,1.5vw,1.12rem);line-height:1.5;color:var(--muted)}
.card p b{color:var(--fg)}
@media (max-width:640px){.card{top:70px}}
""",
  ),
}

I18N_RUNTIME = r"""
(function(){
  const pick=()=>{try{const q=new URLSearchParams(location.search).get('lang');if(q==='de'||q==='en')return q}catch(e){}
    try{const v=localStorage.getItem('kleos-lang');if(v==='de'||v==='en')return v}catch(e){}return 'de'};
  function apply(l){window.LANG=l;const D=window.I18N[l];document.documentElement.lang=l;
    document.querySelectorAll('[data-i18n]').forEach(e=>e.textContent=D.ui[e.dataset.i18n]);
    document.querySelectorAll('[data-i18n-aria]').forEach(e=>e.setAttribute('aria-label',D.ui[e.dataset.i18nAria]));
    document.querySelectorAll('[data-i18n-ph]').forEach(e=>e.placeholder=D.ui[e.dataset.i18nPh]);
    document.querySelectorAll('.card').forEach((c,i)=>{const a=D.acts[i];c.dataset.act=a.act;c.dataset.short=a.short;c.querySelector('.act').textContent=a.act;c.querySelector('h2').innerHTML=a.h2;c.querySelector('p').innerHTML=a.p});
    document.querySelectorAll('[data-lang]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.lang===l));
    const n=document.getElementById('form-note');if(n)n.textContent=''}
  window.LANG='de';
  document.addEventListener('DOMContentLoaded',()=>{});
  const init=()=>{apply(pick());document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>{apply(b.dataset.lang);try{localStorage.setItem('kleos-lang',b.dataset.lang)}catch(e){}}))};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
"""

BASE_CSS = """
.lang{display:flex;border:1.5px solid var(--line);border-radius:99px;overflow:hidden;background:color-mix(in srgb,var(--bg) 70%,transparent);backdrop-filter:blur(6px);pointer-events:auto}
.lang button{font:inherit;font-size:.78rem;font-weight:700;letter-spacing:.08em;color:var(--muted);background:transparent;border:0;padding:.5rem .7rem;cursor:pointer}
.lang button[aria-pressed="true"]{color:var(--bg);background:var(--fg)}
.top nav{align-items:center}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--fg);font-family:var(--f-body);font-size:16px;line-height:1.55}
:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
.top{position:fixed;left:0;right:0;top:0;z-index:10;display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:calc(14px + env(safe-area-inset-top,0px)) clamp(16px,4vw,48px) 14px;pointer-events:none}
.top a{pointer-events:auto;color:var(--fg);text-decoration:none}
.mark{font-family:var(--f-display);font-weight:800;font-size:1.25rem;letter-spacing:.08em;display:flex;align-items:baseline;gap:.5rem}
.mark small{font-family:var(--f-body);font-weight:500;font-size:.68rem;letter-spacing:.2em;text-transform:uppercase;color:var(--muted)}
.top nav{display:flex;gap:.4rem}
.top nav a{font-size:.85rem;font-weight:600;padding:.5rem .9rem;border:1.5px solid var(--line);border-radius:99px;background:color-mix(in srgb,var(--bg) 70%,transparent);backdrop-filter:blur(6px)}
.top nav a:hover{border-color:var(--accent);color:var(--accent)}
@media (max-width:520px){.mark small{display:none}}
.story{height:var(--len,855vh);position:relative}
.stage{position:sticky;top:0;height:100vh;height:100dvh;overflow:hidden}
#world{position:absolute;inset:0;width:100%;height:100%;display:block}
.cards{position:absolute;inset:0;pointer-events:none}
.card{position:absolute;opacity:0}
.card:first-child{opacity:1}
.progress{position:absolute;left:0;right:0;bottom:0;height:3px;background:color-mix(in srgb,var(--fg) 12%,transparent)}
.progress i{display:block;height:100%;background:var(--accent);transform-origin:left;transform:scaleX(0)}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}

.contact{padding-inline:clamp(16px,6vw,96px);padding-block:clamp(64px,10vw,120px) 40px;display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:clamp(32px,6vw,80px);max-width:1200px;margin:0 auto}
@media (max-width:800px){.contact{grid-template-columns:1fr}}
.contact h2{font-family:var(--f-display);font-weight:800;font-size:clamp(2.4rem,6vw,4.6rem);line-height:.95;margin:0 0 1rem;text-wrap:balance}
.contact .lead{color:var(--muted);font-size:1.1rem;max-width:30rem;margin:0 0 2rem}
.reach{display:grid;gap:1rem}
.reach .row{display:flex;flex-wrap:wrap;align-items:center;gap:.6rem 1rem;padding-block:1rem;border-top:1.5px solid var(--line)}
.reach .k{font-size:.72rem;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);width:100%}
.reach a,.reach #mail-text{color:var(--fg);font-size:1.15rem;font-weight:600;text-decoration:none;word-break:break-all}
.reach a:hover{color:var(--accent)}
.chip{font:inherit;font-size:.8rem;font-weight:600;color:var(--fg);background:transparent;border:1.5px solid var(--line);border-radius:99px;padding:.3rem .8rem;cursor:pointer}
.chip:hover{border-color:var(--accent);color:var(--accent)}
form{display:grid;gap:1rem;align-content:start}
label{display:grid;gap:.35rem;font-size:.8rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
input,textarea{font:inherit;font-size:1rem;letter-spacing:0;text-transform:none;color:var(--fg);background:var(--field);border:1.5px solid var(--line);border-radius:6px;padding:.85rem 1rem;width:100%}
textarea{min-height:9rem;resize:vertical}
input:focus,textarea:focus{outline:none;border-color:var(--accent)}
.send{font:inherit;font-weight:700;font-size:1rem;color:var(--bg);background:var(--accent);border:0;border-radius:99px;padding:1rem 1.6rem;cursor:pointer;justify-self:start}
.send:hover{background:var(--accent2)}
.send:disabled{opacity:.6;cursor:wait}
#form-note{min-height:1.4em;margin:0;color:var(--muted);font-size:.92rem}
footer{padding-inline:clamp(16px,6vw,96px);padding-block:24px 40px;color:var(--muted);font-size:.85rem;max-width:1200px;margin:0 auto;border-top:1.5px solid var(--line);display:flex;flex-wrap:wrap;justify-content:space-between;gap:.5rem}
"""

def page(v, doctype):
    flash = v["theme"] == "FLASHBACK"
    def acts(lang):
        a, n = (ACTS_DE, NARRATION_DE) if lang == "de" else (ACTS, NARRATION)
        return [dict(act=x[0], short=x[1], h2=x[2], p=(n[i] if flash else x[3])) for i, x in enumerate(a)]
    data = {l: dict(ui=UI[l], acts=acts(l)) for l in ("de", "en")}
    de, u = data["de"]["acts"], UI["de"]
    cards = []
    for i, c in enumerate(de):
        cls = "card prologue" if i == 0 else "card"
        cards.append(f'<article class="{cls}" data-act="{html.escape(c["act"])}" data-short="{html.escape(c["short"])}"><span class="act">{c["act"]}</span><h2>{c["h2"]}</h2><p>{c["p"]}</p></article>')
    i18n_js = "window.I18N=" + json.dumps(data, ensure_ascii=False) + ";" + I18N_RUNTIME
    body = f"""<title>{v['title']}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?{v['fonts']}&display=swap">
<style>{v['css']}{BASE_CSS}</style>

<header class="top">
  <a class="mark" href="#story" data-i18n-aria="home" aria-label="{u['home']}">KLEOS<small>Entertainment</small></a>
  <nav aria-label="Menu">
    <div class="lang" role="group" data-i18n-aria="lang" aria-label="{u['lang']}"><button type="button" data-lang="de" aria-pressed="true">DE</button><button type="button" data-lang="en" aria-pressed="false">EN</button></div>
    <a href="#contact" data-i18n="contact">{u['contact']}</a>
  </nav>
</header>

<section id="story" class="story" data-i18n-aria="story" aria-label="{u['story']}">
  <div class="stage">
    <canvas id="world" aria-hidden="true"></canvas>
    <div class="cards">
      {''.join(cards)}
    </div>
    <div class="progress" aria-hidden="true"><i id="bar"></i></div>
  </div>
</section>

<section id="contact" class="contact" data-i18n-aria="contact" aria-label="{u['contact']}">
  <div>
    <h2 data-i18n="h2">{u['h2']}</h2>
    <p class="lead" data-i18n="lead">{u['lead']}</p>
    <div class="reach">
      <div class="row"><span class="k" data-i18n="email">{u['email']}</span><span id="mail-text">{MAIL}</span><button class="chip" id="copy-mail" type="button" data-mail="{MAIL}" data-i18n="copy">{u['copy']}</button></div>
    </div>
  </div>
  <form id="contact-form" data-to="{MAIL}" novalidate>
    <label for="f-name"><span data-i18n="name">{u['name']}</span><input id="f-name" name="name" autocomplete="name" required></label>
    <label for="f-email"><span data-i18n="mail">{u['mail']}</span><input id="f-email" name="email" type="email" autocomplete="email" required></label>
    <label for="f-msg"><span data-i18n="msg">{u['msg']}</span><textarea id="f-msg" name="message" data-i18n-ph="ph" placeholder="{u['ph']}" required></textarea></label>
    <input type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px">
    <button class="send" type="submit" data-i18n="send">{u['send']}</button>
    <p id="form-note" aria-live="polite"></p>
  </form>
</section>
<footer><span>© 2026 Kleos Entertainment</span><span>kleos-entertainment.ch</span></footer>

<script>{i18n_js}</script>
<script>{theme_js(v['theme'])}</script>
<script>{engine}</script>
"""
    if doctype:
        head, rest = body.split("<style>", 1)
        return f"""<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
{head}<style>{rest.split('</style>',1)[0]}</style>
</head>
<body>
{rest.split('</style>',1)[1]}
</body>
</html>
"""
    return body

for key, v in VARIANTS.items():
    (OUT_SITE / v["file"]).write_text(page(v, True))
    if OUT_ART:
        OUT_ART.mkdir(parents=True, exist_ok=True)
        (OUT_ART / v["file"]).write_text(page(v, False))
    if key == "stage":
        (OUT_SITE.parent / "index.html").write_text(page(v, True))
    print("built", v["file"])
