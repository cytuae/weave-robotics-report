(function () {
  "use strict";

  var DATA_URL = "../../data/incrobotics-audit.json";
  var SCORE_MAX = 10;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function severityClass(sev) {
    var s = String(sev || "").toLowerCase();
    if (s === "critical" || s === "حرجة") return "sev--critical";
    if (s === "high" || s === "مرتفعة") return "sev--high";
    return "sev--medium";
  }

  function severityLabel(f) {
    return f.severityAr || f.severity || "";
  }

  function toneClass(tone) {
    return "tone-" + (tone || "medium");
  }

  function pct(score, max) {
    return Math.min(100, Math.round((Number(score) / Number(max || SCORE_MAX)) * 100));
  }

  function externalIcon() {
    return (
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
      '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>' +
      '<polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>' +
      "</svg>"
    );
  }

  function chips(items) {
    if (!items || !items.length) return "";
    return (
      '<div class="inc-chips">' +
      items
        .map(function (m) {
          return '<span class="inc-chip">' + esc(m) + "</span>";
        })
        .join("") +
      "</div>"
    );
  }

  function list(items, ordered) {
    if (!items || !items.length) return "";
    var tag = ordered ? "ol" : "ul";
    return (
      "<" +
      tag +
      ' class="inc-list">' +
      items
        .map(function (p) {
          return "<li>" + esc(p) + "</li>";
        })
        .join("") +
      "</" +
      tag +
      ">"
    );
  }

  function renderToc(items) {
    return (
      '<nav class="inc-toc is-collapsed" id="inc-toc" aria-label="فهرس التقرير">' +
      '<div class="inc-toc__head">' +
      "<h2>محتويات التقرير</h2>" +
      '<button type="button" class="inc-btn inc-btn--ghost inc-toc-toggle" id="inc-toc-toggle" style="color:var(--inc-navy);border-color:var(--inc-border);background:#fff">عرض / إخفاء</button>' +
      "</div><ol>" +
      items
        .map(function (item) {
          return (
            '<li><a href="#' +
            esc(item.id) +
            '">' +
            esc(item.label) +
            "</a></li>"
          );
        })
        .join("") +
      "</ol></nav>"
    );
  }

  function renderHero(meta) {
    var readiness = meta.readinessPercent != null ? Number(meta.readinessPercent) : pct(meta.overallScore, meta.overallMax);
    return (
      '<header class="inc-hero" id="hero">' +
      '<div class="inc-hero__grid">' +
      "<div>" +
      '<div class="inc-badge">' +
      esc(meta.badge) +
      "</div>" +
      "<h1>" +
      esc(meta.title) +
      "</h1>" +
      '<p class="inc-hero__sub">' +
      esc(meta.subtitle) +
      "</p>" +
      '<div class="inc-hero__meta">' +
      "<span>تاريخ المراجعة: " +
      esc(meta.date) +
      "</span>" +
      '<a href="' +
      esc(meta.url) +
      '" target="_blank" rel="noopener noreferrer">' +
      externalIcon() +
      " " +
      esc(meta.url) +
      "</a>" +
      "</div>" +
      '<div class="inc-actions">' +
      '<a class="inc-btn inc-btn--primary" href="' +
      esc(meta.url) +
      '" target="_blank" rel="noopener noreferrer">زيارة الموقع</a>' +
      '<button type="button" class="inc-btn inc-btn--ghost" id="inc-print">تحميل أو طباعة التقرير</button>' +
      "</div>" +
      '<p class="inc-intro">' +
      esc(meta.intro) +
      "</p>" +
      '<div class="inc-mock" aria-hidden="true">' +
      '<div class="inc-mock__bar"><i></i><i></i><i></i></div>' +
      '<div class="inc-mock__body">تمثيل بصري للإطار العام للموقع — بدون نسخ أصول INC Robotics.</div>' +
      "</div>" +
      "</div>" +
      '<aside class="inc-score-card" aria-label="التقييم العام">' +
      '<div class="inc-score-card__label">التقييم العام</div>' +
      '<div class="inc-score-card__value">' +
      esc(meta.overallScore) +
      "/" +
      esc(meta.overallMax) +
      "</div>" +
      "<div>مستوى الجاهزية الحالي</div>" +
      '<div class="inc-progress" role="progressbar" aria-valuenow="' +
      readiness +
      '" aria-valuemin="0" aria-valuemax="100" aria-label="جاهزية الموقع">' +
      '<span style="width:' +
      readiness +
      '%"></span></div>' +
      "<small style=\"opacity:.8\">" +
      esc(meta.readinessLabel || readiness + "%") +
      "</small>" +
      "</aside></div></header>"
    );
  }

  function renderExecutive(exec) {
    return (
      '<section class="inc-section" id="executive">' +
      "<h2>الملخص التنفيذي</h2>" +
      '<div class="inc-exec">' +
      '<div class="inc-exec__main">' +
      '<div class="inc-exec__score">التقييم العام: ' +
      esc(exec.score) +
      "</div>" +
      '<p class="inc-lead">' +
      esc(exec.summary) +
      "</p></div>" +
      '<div class="inc-quick">' +
      exec.quickCards
        .map(function (c) {
          return (
            '<article class="inc-quick__card ' +
            toneClass(c.tone) +
            '"><span>' +
            esc(c.label) +
            "</span><strong>" +
            esc(c.value) +
            "</strong></article>"
          );
        })
        .join("") +
      "</div></div></section>"
    );
  }

  function renderDashboard(scores) {
    return (
      '<section class="inc-section" id="scores">' +
      "<h2>لوحة التقييم</h2>" +
      '<div class="inc-bars" role="list">' +
      scores
        .map(function (s) {
          var max = s.max || SCORE_MAX;
          var w = pct(s.score, max);
          return (
            '<div class="inc-bar" role="listitem">' +
            '<div class="inc-bar__label">' +
            esc(s.label) +
            "</div>" +
            '<div class="inc-bar__track" aria-hidden="true"><div class="inc-bar__fill" style="width:' +
            w +
            '%"></div></div>' +
            '<div class="inc-bar__val">' +
            esc(s.score) +
            "/" +
            esc(max) +
            "</div></div>"
          );
        })
        .join("") +
      "</div></section>"
    );
  }

  function renderStrengths(items, note) {
    return (
      '<section class="inc-section" id="strengths">' +
      "<h2>نقاط القوة الحالية</h2>" +
      '<div class="inc-strengths">' +
      items
        .map(function (t) {
          return '<article class="inc-strength">' + esc(t) + "</article>";
        })
        .join("") +
      "</div>" +
      '<p class="inc-note">' +
      esc(note) +
      "</p></section>"
    );
  }

  function renderFinding(f) {
    var html =
      '<article class="inc-finding" id="finding-' +
      esc(f.num) +
      '">' +
      '<div class="inc-finding__meta">' +
      '<span class="inc-finding__num">المشكلة ' +
      esc(f.num) +
      "</span>" +
      '<span class="sev ' +
      severityClass(f.severityAr || f.severity) +
      '">' +
      esc(severityLabel(f)) +
      "</span></div>" +
      "<h3>" +
      esc(f.title) +
      "</h3><dl>" +
      "<div><dt>الوصف</dt><dd>" +
      esc(f.description) +
      "</dd></div>";

    if (f.impact) {
      html +=
        "<div><dt>لماذا تؤثر على النتائج</dt><dd>" +
        esc(f.impact) +
        "</dd></div>";
    }
    if (f.evidence) {
      html +=
        "<div><dt>الدليل الموجود في الموقع</dt><dd>" +
        esc(f.evidence) +
        "</dd></div>";
    }
    if (f.missing && f.missing.length) {
      html +=
        "<div><dt>العناصر المفقودة</dt><dd>" + chips(f.missing) + "</dd></div>";
    }
    if (f.beforeAfter && f.beforeAfter.length) {
      html +=
        '<div><dt>Before / After</dt><dd><div class="inc-ba">' +
        f.beforeAfter
          .map(function (ba) {
            return (
              '<article class="inc-ba__before"><strong>Before:</strong><br>' +
              esc(ba.before) +
              "</article>" +
              '<article class="inc-ba__after"><strong>After:</strong><br>' +
              esc(ba.after) +
              "</article>"
            );
          })
          .join("") +
        "</div></dd></div>";
    }
    if (f.action) {
      html +=
        "<div><dt>الإجراء المقترح</dt><dd>" + esc(f.action) + "</dd></div>";
    }
    if (f.outcome) {
      html +=
        "<div><dt>النتيجة المتوقعة بعد الإصلاح</dt><dd>" +
        esc(f.outcome) +
        "</dd></div>";
    }

    html += "</dl></article>";
    return html;
  }

  function groupFindings(findings) {
    var groups = [
      { id: "critical", title: "المشاكل الحرجة", category: "critical" },
      { id: "ux", title: "مشاكل التصميم وتجربة المستخدم", category: "ux" },
      { id: "content", title: "مشاكل المحتوى والترجمة", category: "content" },
      { id: "seo", title: "SEO والمشاكل التقنية", category: "seo" },
    ];
    return groups
      .map(function (g) {
        var items = findings.filter(function (f) {
          return f.category === g.category;
        });
        return (
          '<section class="inc-section" id="' +
          g.id +
          '"><h2>' +
          esc(g.title) +
          '</h2><div class="inc-findings">' +
          items.map(renderFinding).join("") +
          "</div></section>"
        );
      })
      .join("");
  }

  function renderA11y(a11y) {
    return (
      '<section class="inc-section" id="a11y"><h2>إمكانية الوصول (Accessibility)</h2>' +
      '<div class="inc-two">' +
      "<div><h3>المشاكل</h3>" +
      list(a11y.issues) +
      "</div>" +
      "<div><h3>التوصيات</h3>" +
      list(a11y.recommendations) +
      "</div></div></section>"
    );
  }

  function renderTrust(trust) {
    return (
      '<section class="inc-section" id="trust"><h2>الثقة والامتثال</h2>' +
      "<h3>العناصر المفقودة</h3>" +
      list(trust.missing) +
      '<p class="inc-note">' +
      esc(trust.note) +
      "</p>" +
      '<p class="inc-note">' +
      esc(trust.phoneNote) +
      "</p></section>"
    );
  }

  function renderStructure(items) {
    return (
      '<section class="inc-section" id="structure"><h2>الهيكل المقترح للصفحة الرئيسية الجديدة</h2>' +
      '<div class="inc-structure">' +
      items
        .map(function (s) {
          return (
            '<article class="inc-step">' +
            '<div class="inc-step__n">' +
            esc(s.step) +
            "</div><div><h3>" +
            esc(s.title) +
            "</h3><p>" +
            esc(s.items.join(" · ")) +
            "</p></div></article>"
          );
        })
        .join("") +
      "</div></section>"
    );
  }

  function renderFuturePreview() {
    return (
      '<section class="inc-section inc-future" id="future">' +
      "<h2>مثال الموقع المستقبلي</h2>" +
      '<p class="inc-lead">اتجاه فاتح قريب من ألوان INC الحالية (أبيض، رمادي فاتح، كحلي للعناوين، أزرق للأزرار) — بدون اعتماد على الأسود، وبهيكل يمكن تنفيذه بتعديل أقل على الهوية الموجودة.</p>' +
      '<div class="inc-future__card">' +
      '<div class="inc-future__preview" aria-hidden="true">' +
      "<picture>" +
      '<source srcset="assets/incrobotics-future-mobile.webp" type="image/webp">' +
      '<img src="assets/incrobotics-future-mobile.jpg" alt="" width="1290" height="1935" loading="lazy" decoding="async">' +
      "</picture>" +
      "</div>" +
      '<div class="inc-future__copy">' +
      "<h3>اكتشف الشكل المستهدف للموقع</h3>" +
      "<p>معاينة موبايل عملية: روبوت في الـHero، أرقام ثقة، حلول، قطاعات، دراسة حالة، وCTA واضح — خلفية فاتحة وقابلة للشحن كموقع حقيقي.</p>" +
      '<a class="inc-btn inc-btn--future" href="future.html">انقر هنا لاكتشاف مثال الموقع</a>' +
      "</div></div></section>"
    );
  }

  function renderRoadmap(phases) {
    return (
      '<section class="inc-section" id="roadmap"><h2>خطة التنفيذ</h2>' +
      '<div class="inc-roadmap">' +
      phases
        .map(function (p) {
          return (
            '<article class="inc-phase"><div class="inc-phase__top"><h3 style="margin:0;font-size:1rem">المرحلة ' +
            esc(p.phase) +
            ": " +
            esc(p.title) +
            "</h3><span>" +
            esc(p.duration) +
            "</span></div>" +
            list(p.items) +
            "</article>"
          );
        })
        .join("") +
      "</div></section>"
    );
  }

  function renderPriorityTable(rows) {
    return (
      '<section class="inc-section" id="priorities"><h2>جدول الأولويات</h2>' +
      '<div class="inc-table-wrap"><table><thead><tr>' +
      "<th>#</th><th>المشكلة</th><th>الخطورة</th><th>التأثير</th><th>الأولوية</th>" +
      "</tr></thead><tbody>" +
      rows
        .map(function (r) {
          return (
            "<tr><td>" +
            esc(r.num) +
            "</td><td>" +
            esc(r.issue) +
            '</td><td><span class="sev ' +
            severityClass(r.severity) +
            '">' +
            esc(r.severity) +
            "</span></td><td>" +
            esc(r.impact) +
            "</td><td>" +
            esc(r.priority) +
            "</td></tr>"
          );
        })
        .join("") +
      "</tbody></table></div></section>"
    );
  }

  function renderExpected(exp) {
    return (
      '<section class="inc-section" id="targets"><h2>النتيجة المتوقعة</h2>' +
      '<div class="inc-compare">' +
      '<article class="tone-critical"><h3>' +
      esc(exp.currentLabel) +
      "</h3>" +
      list(exp.current) +
      "</article>" +
      '<article class="tone-good"><h3>' +
      esc(exp.targetLabel) +
      "</h3>" +
      list(exp.target) +
      "</article></div>" +
      '<h3>Target Scores</h3><div class="inc-targets">' +
      exp.scoreTargets
        .map(function (t) {
          var fromW = pct(t.from, SCORE_MAX);
          var toW = pct(t.to, SCORE_MAX);
          return (
            '<div class="inc-target">' +
            '<div class="inc-target__label">' +
            esc(t.label) +
            " · من " +
            esc(t.from) +
            " إلى " +
            esc(t.to) +
            "</div>" +
            '<div class="inc-target__row"><span>الحالي</span>' +
            '<div class="inc-target__track" aria-hidden="true"><div class="inc-target__fill--from" style="width:' +
            fromW +
            '%"></div></div><strong>' +
            esc(t.from) +
            "</strong></div>" +
            '<div class="inc-target__row"><span>المستهدف</span>' +
            '<div class="inc-target__track" aria-hidden="true"><div class="inc-target__fill--to" style="width:' +
            toW +
            '%"></div></div><strong>' +
            esc(t.to) +
            "</strong></div></div>"
          );
        })
        .join("") +
      "</div>" +
      '<p class="inc-note"><strong>التقييم العام المستهدف: ' +
      esc(exp.overallTarget) +
      "/" +
      SCORE_MAX +
      "</strong></p></section>"
    );
  }

  function renderConclusion(c) {
    return (
      '<section class="inc-section inc-conclusion" id="conclusion">' +
      "<h2>الخلاصة النهائية</h2>" +
      "<p>" +
      esc(c.body) +
      "</p>" +
      '<p class="inc-conclusion__strong">' +
      esc(c.strong) +
      "</p></section>"
    );
  }

  function bindUi() {
    var printBtn = document.getElementById("inc-print");
    if (printBtn) {
      printBtn.addEventListener("click", function () {
        window.print();
      });
    }

    var toc = document.getElementById("inc-toc");
    var tocToggle = document.getElementById("inc-toc-toggle");
    if (toc && tocToggle) {
      tocToggle.addEventListener("click", function () {
        toc.classList.toggle("is-collapsed");
      });
    }

    var topBtn = document.getElementById("inc-top");
    if (topBtn) {
      window.addEventListener(
        "scroll",
        function () {
          if (window.scrollY > 500) topBtn.classList.add("is-visible");
          else topBtn.classList.remove("is-visible");
        },
        { passive: true }
      );
      topBtn.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }

  function renderAll(data) {
    var root = document.getElementById("inc-audit-root");
    if (!root) return;

    root.innerHTML =
      '<div class="inc-wrap"><div class="inc-layout">' +
      renderHero(data.meta) +
      renderToc(data.toc) +
      '<div class="inc-main">' +
      renderExecutive(data.executive) +
      renderDashboard(data.scores) +
      renderStrengths(data.strengths, data.strengthsNote) +
      groupFindings(data.findings) +
      renderA11y(data.accessibility) +
      renderTrust(data.trustCompliance) +
      renderStructure(data.homepageStructure) +
      renderFuturePreview() +
      renderRoadmap(data.roadmap) +
      renderPriorityTable(data.priorities) +
      renderExpected(data.targets) +
      renderConclusion(data.conclusion) +
      "</div></div></div>" +
      '<button type="button" class="inc-top" id="inc-top" aria-label="العودة للأعلى">↑</button>';

    bindUi();
  }

  function init() {
    var root = document.getElementById("inc-audit-root");
    if (!root) return;
    root.innerHTML =
      '<div class="inc-wrap"><p class="inc-status">جاري تحميل تقرير التحليل…</p></div>';

    fetch(DATA_URL)
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(renderAll)
      .catch(function (err) {
        root.innerHTML =
          '<div class="inc-wrap"><p class="inc-status">تعذّر تحميل بيانات التقرير. شغّل الصفحة عبر خادم محلي وتأكد من وجود الملف data/incrobotics-audit.json. التفاصيل: ' +
          esc(err && err.message) +
          "</p></div>";
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
