/**
 * China home-cleaning robots report — interactive layer
 * Data: companies + sources + products + saudi-competitors + saudi-price-watch
 */
(function () {
  'use strict';

  const CAT_LABELS = {
    floors: 'أرضيات',
    glass: 'زجاج',
    pool: 'مسابح',
    garden: 'حدائق',
    solar: 'ألواح شمسية',
  };

  const PRESENCE_CLASS = {
    'official-saudi': 'presence--official',
    official: 'presence--official',
    'retail-saudi': 'presence--retail',
    retail: 'presence--retail',
    marketplace: 'presence--marketplace',
    'grey-import': 'presence--grey',
    'grey-risk': 'presence--grey',
  };

  const PRESENCE_LABEL = {
    official: 'رسمي سعودي',
    retail: 'تجزئة سعودية',
    marketplace: 'منصة',
    'grey-risk': 'ضمان غير واضح',
  };

  const WARRANTY_AR = {
    'manufacturer-saudi': 'ضمان مصنع سعودي',
    retailer: 'ضمان متجر',
    seller: 'ضمان بائع',
    unknown: 'غير واضح',
  };

  const STATUS_AR = {
    current: 'حالي',
    legacy: 'جيل سابق',
    announced: 'معلن',
    'rfq-only': 'بعد طلب الكتالوغ',
  };

  const FIT_AR = {
    high: 'ملاءمة عالية',
    medium: 'ملاءمة متوسطة',
    low: 'ملاءمة منخفضة',
    testing: 'يتطلب اختباراً',
  };

  const PENDING_COMPANIES = new Set(['royalmakers', 'klinsmann', 'minfu']);

  const state = {
    companies: [],
    sources: {},
    products: [],
    competition: null,
    priceWatch: null,
    category: 'all',
    type: 'all',
    city: 'all',
    trust: 'all',
    privateLabel: 'all',
    query: '',
    productCompany: 'all',
    productRole: 'all',
    productQuery: '',
    watchChannel: 'all',
    watchPresence: 'all',
  };

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function $$(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  function trustClass(trust) {
    const t = String(trust).toUpperCase();
    if (t.startsWith('A')) return 'trust--a';
    if (t.startsWith('B')) return 'trust--b';
    return 'trust--c';
  }

  function badgeHtml(note) {
    if (!note) return '';
    const isEst = /تقديري|تقدير|أسعار تجزئة/.test(note);
    const cls = isEst ? 'data-badge data-badge--est' : 'data-badge data-badge--official';
    const label = isEst ? 'تقديري' : 'معلن من الشركة';
    return `<span class="${cls}" title="${escapeAttr(note)}">${label}</span>`;
  }

  function escapeAttr(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;');
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function matchesQuery(c, q) {
    if (!q) return true;
    const hay = [c.name, c.nameAr, c.nameCn, c.city, c.cityAr, c.type, c.typeAr, c.summary]
      .join(' ')
      .toLowerCase();
    return hay.includes(q);
  }

  function filterCompanies() {
    const q = state.query.trim().toLowerCase();
    return state.companies.filter((c) => {
      if (state.category !== 'all' && !(c.categories || []).includes(state.category)) return false;
      if (state.type !== 'all') {
        const t = (c.type || '').toLowerCase();
        if (state.type === 'odm' && !/odm/.test(t)) return false;
        if (state.type === 'oem' && !/oem/.test(t)) return false;
        if (state.type === 'brand' && !/brand|group/.test(t)) return false;
      }
      if (state.city !== 'all') {
        const city = (c.city || '').toLowerCase();
        if (state.city === 'shenzhen' && !city.includes('shenzhen') && !city.includes('dongguan')) return false;
        if (state.city === 'suzhou' && !city.includes('suzhou') && !city.includes('beijing')) return false;
        if (state.city === 'ningbo' && !city.includes('ningbo')) return false;
        if (state.city === 'shanghai' && !city.includes('shanghai')) return false;
        if (state.city === 'other' && /shenzhen|dongguan|suzhou|beijing|ningbo|shanghai/.test(city)) return false;
      }
      if (state.trust !== 'all') {
        const t = String(c.trust).toUpperCase();
        if (state.trust === 'A' && !t.startsWith('A')) return false;
        if (state.trust === 'B' && !t.startsWith('B')) return false;
        if (state.trust === 'C' && !t.includes('C')) return false;
      }
      if (state.privateLabel === 'high' && Number(c.privateLabel) < 7) return false;
      if (state.privateLabel === 'low' && Number(c.privateLabel) >= 7) return false;
      if (!matchesQuery(c, q)) return false;
      return true;
    });
  }

  function renderTable(list) {
    const tbody = $('#factoryTableBody');
    const countEl = $('#factoryCount');
    if (!tbody) return;
    if (countEl) countEl.textContent = String(list.length);

    if (!list.length) {
      tbody.innerHTML =
        '<tr><td colspan="8" class="cr-empty">لا نتائج مطابقة — عدّل الفلاتر أو البحث</td></tr>';
      return;
    }

    tbody.innerHTML = list
      .map((c) => {
        const cats = (c.categories || []).map((k) => CAT_LABELS[k] || k).join(' · ');
        return `<tr data-id="${escapeAttr(c.id)}">
          <td><a class="cr-link" href="${escapeAttr(c.page)}">${escapeHtml(c.num)} · ${escapeHtml(c.nameAr || c.name)}</a>
            <div class="cr-meta">${escapeHtml(c.name)} · ${escapeHtml(c.nameCn || '')}</div></td>
          <td>${escapeHtml(c.typeAr || c.type)}</td>
          <td>${escapeHtml(c.cityAr || c.city)}</td>
          <td><span class="trust-badge ${trustClass(c.trust)}" title="درجة الثقة">${escapeHtml(c.trust)}</span></td>
          <td><span class="score-cell">${c.privateLabel}</span></td>
          <td><span class="score-cell">${c.floors}</span></td>
          <td><span class="score-cell">${c.saudi}</span></td>
          <td class="cr-cats">${escapeHtml(cats)} ${badgeHtml(c.badgeNote)}</td>
        </tr>`;
      })
      .join('');
  }

  function renderCards(list) {
    const shortlist = $('#cardsShortlist');
    const agency = $('#cardsAgency');
    if (!shortlist || !agency) return;

    const s = list.filter((c) => c.path === 'shortlist');
    const a = list.filter((c) => c.path !== 'shortlist');

    const card = (c) => `<article class="glass-card cr-company-card" data-id="${escapeAttr(c.id)}">
      <button type="button" class="cr-company-card__toggle" aria-expanded="false" aria-controls="panel-${escapeAttr(c.id)}" id="btn-${escapeAttr(c.id)}">
        <div class="cr-company-card__top">
          <span class="cr-company-card__num">${escapeHtml(c.num)}</span>
          <span class="trust-badge ${trustClass(c.trust)}">${escapeHtml(c.trust)}</span>
        </div>
        <h3 class="cr-company-card__title">${escapeHtml(c.nameAr || c.name)}</h3>
        <p class="cr-company-card__en">${escapeHtml(c.name)} · ${escapeHtml(c.nameCn || '')}</p>
        <p class="cr-company-card__role">${escapeHtml(c.typeAr)} · ${escapeHtml(c.cityAr)}</p>
        <p class="cr-company-card__summary">${escapeHtml(c.summary)}</p>
        <div class="cr-company-card__scores">
          <span>العلامة الخاصة <strong>${c.privateLabel}</strong></span>
          <span>أرضيات <strong>${c.floors}</strong></span>
          <span>سعودية <strong>${c.saudi}</strong></span>
        </div>
        ${badgeHtml(c.badgeNote)}
        <span class="cr-company-card__chev" aria-hidden="true">▾</span>
      </button>
      <div class="cr-company-card__panel" id="panel-${escapeAttr(c.id)}" hidden>
        <ul class="cr-company-card__facts">
          <li>التأسيس: ${escapeHtml(c.founded || '—')}</li>
          <li>المسار: ${c.path === 'shortlist' ? 'القائمة المختصرة لطلب عروض الأسعار' : 'وكالة / معيار المقارنة'}</li>
          <li>الفئات: ${(c.categories || []).map((k) => CAT_LABELS[k] || k).join(' · ')}</li>
        </ul>
        <a class="btn btn--primary cr-company-card__cta" href="${escapeAttr(c.page)}">فتح الملف العميق</a>
      </div>
    </article>`;

    shortlist.innerHTML = s.length
      ? s.map(card).join('')
      : '<p class="cr-empty">لا شركات في القائمة المختصرة ضمن الفلاتر الحالية</p>';
    agency.innerHTML = a.length
      ? a.map(card).join('')
      : '<p class="cr-empty">لا شركات وكالة ضمن الفلاتر الحالية</p>';

    $$('.cr-company-card__toggle', shortlist.parentElement).forEach((btn) => {
      btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        const panel = document.getElementById(btn.getAttribute('aria-controls'));
        btn.setAttribute('aria-expanded', String(!expanded));
        if (panel) panel.hidden = expanded;
        btn.classList.toggle('is-open', !expanded);
      });
    });
  }

  function renderSources() {
    const grid = $('#sourcesGrid');
    if (!grid) return;
    const entries = Object.values(state.sources);
    grid.innerHTML = entries
      .map(
        (s) => `<a class="glass-card source-card source-card--link" href="${escapeAttr(s.url)}" target="_blank" rel="noopener noreferrer">
          <span class="trust-badge ${trustClass(s.type)}">${escapeHtml(s.type)}</span>
          <h4>${escapeHtml(s.title)}</h4>
          <p class="source-card__id">${escapeHtml(s.id)}</p>
        </a>`
      )
      .join('');
  }

  function filterProducts() {
    const q = state.productQuery.trim().toLowerCase();
    return state.products.filter((p) => {
      if (state.category !== 'all' && p.category !== state.category) return false;
      if (state.productCompany !== 'all') {
        if (state.productCompany === 'pending') {
          if (!PENDING_COMPANIES.has(p.companyId)) return false;
        } else if (p.companyId !== state.productCompany) {
          return false;
        }
      }
      if (state.productRole !== 'all') {
        const role = p.role || '';
        const roleAr = p.roleAr || '';
        if (state.productRole === 'agency' && !(role === 'agency' || /وكالة/.test(roleAr))) return false;
        if (state.productRole === 'benchmark' && !(role === 'benchmark' || /معيار مقارنة/.test(roleAr))) return false;
        if (state.productRole === 'possible_pl' && role !== 'possible_pl') return false;
      }
      if (q) {
        const hay = [p.name, p.company, p.companyAr, p.categoryLabel, p.typeUse, p.saudiNote, (p.keySpecs || []).join(' ')]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function renderProducts(list) {
    const grid = $('#productsGrid');
    const countEl = $('#productCount');
    if (!grid) return;
    if (countEl) countEl.textContent = String(list.length);

    if (!list.length) {
      grid.innerHTML = '<p class="cr-empty">لا منتجات مطابقة — عدّل الفلاتر</p>';
      return;
    }

    grid.innerHTML = list
      .map((p) => {
        const specs = (p.keySpecs || [])
          .slice(0, 3)
          .map((s) => `<li>${escapeHtml(s)}</li>`)
          .join('');
        const videoBtn = p.videoUrl
          ? `<a class="btn btn--ghost cr-product__btn" href="${escapeAttr(p.videoUrl)}" target="_blank" rel="noopener noreferrer">
              شاهد الفيديو
              <span class="data-badge ${p.videoType === 'official' ? 'data-badge--official' : 'data-badge--est'}">${
                p.videoType === 'official' ? 'رسمي' : 'رابط'
              }</span>
            </a>`
          : `<span class="cr-product__novideo">لا يوجد فيديو موثّق بعد</span>`;

        return `<article class="glass-card cr-product" data-company="${escapeAttr(p.companyId)}" data-cat="${escapeAttr(p.category)}">
          <div class="cr-product__media" aria-hidden="true">
            <div class="cr-product__placeholder">
              <span class="cr-product__placeholder-co">${escapeHtml(p.companyAr || p.company)}</span>
              <span class="cr-product__placeholder-name">${escapeHtml(p.name)}</span>
              <span class="cr-product__placeholder-note">الصورة بانتظار موافقة المصنع · الرابط الرسمي أدناه</span>
            </div>
          </div>
          <div class="cr-product__body">
            <div class="cr-product__meta">
              <span class="cr-product__company">${escapeHtml(p.companyAr || p.company)}</span>
              <span class="data-badge data-badge--est">${escapeHtml(STATUS_AR[p.status] || p.status)}</span>
            </div>
            <h3 class="cr-product__title">${escapeHtml(p.name)}</h3>
            <p class="cr-product__type"><strong>النوع والاستخدام:</strong> ${escapeHtml(p.categoryLabel)} · ${escapeHtml(p.typeUse)}</p>
            <p class="cr-product__role"><strong>الدور:</strong> ${escapeHtml(p.roleAr)}</p>
            <ul class="cr-product__specs" aria-label="أبرز المواصفات">${specs}</ul>
            <p class="cr-product__saudi"><strong>ملاءمة السعودية:</strong> ${escapeHtml(FIT_AR[p.saudiFit] || p.saudiFit)} — ${escapeHtml(p.saudiNote)}</p>
            <div class="cr-product__actions">
              <a class="btn btn--primary cr-product__btn" href="${escapeAttr(p.productUrl)}" target="_blank" rel="noopener noreferrer">صفحة المنتج الرسمية</a>
              ${videoBtn}
            </div>
          </div>
        </article>`;
      })
      .join('');
  }

  function applyFilters() {
    const list = filterCompanies().sort((a, b) => a.priority - b.priority);
    renderTable(list);
    renderCards(list);
    renderProducts(filterProducts());
  }

  function bindFilters() {
    $$('[data-cat-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        $$('[data-cat-filter]').forEach((b) => {
          b.classList.remove('is-active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-selected', 'true');
        state.category = btn.getAttribute('data-cat-filter') || 'all';
        applyFilters();
      });
    });

    const map = {
      filterType: 'type',
      filterCity: 'city',
      filterTrust: 'trust',
      filterPrivateLabel: 'privateLabel',
    };
    Object.keys(map).forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('change', () => {
        state[map[id]] = el.value;
        applyFilters();
      });
    });

    const search = $('#companySearch');
    if (search) {
      let t;
      search.addEventListener('input', () => {
        clearTimeout(t);
        t = setTimeout(() => {
          state.query = search.value;
          applyFilters();
        }, 180);
      });
    }

    const reset = $('#filtersReset');
    if (reset) {
      reset.addEventListener('click', () => {
        state.category = 'all';
        state.type = 'all';
        state.city = 'all';
        state.trust = 'all';
        state.privateLabel = 'all';
        state.query = '';
        $$('[data-cat-filter]').forEach((b) => {
          const on = b.getAttribute('data-cat-filter') === 'all';
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-selected', String(on));
        });
        Object.keys(map).forEach((id) => {
          const el = document.getElementById(id);
          if (el) el.value = 'all';
        });
        if (search) search.value = '';
        state.productCompany = 'all';
        state.productRole = 'all';
        state.productQuery = '';
        const pc = $('#productCompany');
        const pr = $('#productRole');
        const ps = $('#productSearch');
        if (pc) pc.value = 'all';
        if (pr) pr.value = 'all';
        if (ps) ps.value = '';
        applyFilters();
      });
    }

    const productCompany = $('#productCompany');
    if (productCompany) {
      productCompany.addEventListener('change', () => {
        state.productCompany = productCompany.value;
        applyFilters();
      });
    }
    const productRole = $('#productRole');
    if (productRole) {
      productRole.addEventListener('change', () => {
        state.productRole = productRole.value;
        applyFilters();
      });
    }
    const productSearch = $('#productSearch');
    if (productSearch) {
      let t;
      productSearch.addEventListener('input', () => {
        clearTimeout(t);
        t = setTimeout(() => {
          state.productQuery = productSearch.value;
          applyFilters();
        }, 180);
      });
    }
  }

  function bindCalculator() {
    const form = $('#landedForm');
    if (!form) return;

    const fields = ['exw', 'freight', 'duty', 'vat', 'local', 'margin'];
    const out = {
      cif: $('#outCif'),
      landed: $('#outLanded'),
      retail: $('#outRetail'),
      vatAmt: $('#outVat'),
    };

    function num(id) {
      const el = document.getElementById(id);
      const v = parseFloat(el && el.value);
      return Number.isFinite(v) ? v : 0;
    }

    function calc() {
      const exw = num('exw');
      const freight = num('freight');
      const dutyPct = num('duty');
      const vatPct = num('vat');
      const local = num('local');
      const marginPct = num('margin');

      const cif = exw + freight;
      const dutyAmt = cif * (dutyPct / 100);
      const afterDuty = cif + dutyAmt;
      const vatAmt = afterDuty * (vatPct / 100);
      const landed = afterDuty + vatAmt + local;
      const retail = landed * (1 + marginPct / 100);

      if (out.cif) out.cif.textContent = cif.toFixed(0) + ' $';
      if (out.landed) out.landed.textContent = landed.toFixed(0) + ' $';
      if (out.vatAmt) out.vatAmt.textContent = vatAmt.toFixed(0) + ' $';
      if (out.retail) out.retail.textContent = retail.toFixed(0) + ' $ ≈ ' + (retail * 3.75).toFixed(0) + ' ر.س';
    }

    fields.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', calc);
    });
    calc();
  }

  function bindPrint() {
    ['printReport', 'printReportHero'].forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) btn.addEventListener('click', () => window.print());
    });
  }

  function renderCompetition() {
    const data = state.competition;
    if (!data) return;

    const summary = $('#competitionSummary');
    if (summary) {
      summary.innerHTML = `<p class="summary__lead">${escapeHtml(data.summary)}</p>
        <p class="cr-disclaimer" style="margin-top:0.75rem;">${escapeHtml(data.methodology)}</p>`;
    }

    const mapBody = $('#competitorMapBody');
    if (mapBody) {
      mapBody.innerHTML = (data.competitors || [])
        .map((c) => {
          const cls = PRESENCE_CLASS[c.presence] || 'presence--marketplace';
          return `<tr>
            <td><strong>${escapeHtml(c.nameAr)}</strong><div class="cr-meta">${escapeHtml(c.name)}</div></td>
            <td><span class="presence-badge ${cls}">${escapeHtml(c.presenceAr)}</span></td>
            <td>${escapeHtml((c.channels || []).join(' · '))}</td>
            <td>${escapeHtml(c.warranty)}</td>
            <td>${escapeHtml(c.priceBand)}</td>
            <td><strong>${c.score}</strong>/10</td>
          </tr>`;
        })
        .join('');
    }

    const cards = $('#competitorCards');
    if (cards) {
      cards.innerHTML = (data.competitors || [])
        .map((c) => {
          const cls = PRESENCE_CLASS[c.presence] || 'presence--marketplace';
          const prices = (c.prices || [])
            .map(
              (pr) =>
                `<li>${escapeHtml(pr.model)}: <strong>${pr.priceSar.toLocaleString('ar-SA')} ر.س</strong> <span class="data-badge data-badge--est">آخر سعر مرصود · ${escapeHtml(pr.note || '')}</span></li>`
            )
            .join('');
          const strengths = (c.strengths || []).map((s) => `<li>${escapeHtml(s)}</li>`).join('');
          const weaknesses = (c.weaknesses || []).map((s) => `<li>${escapeHtml(s)}</li>`).join('');
          return `<article class="glass-card cr-rival">
            <div class="cr-rival__head">
              <h4>${escapeHtml(c.nameAr)} <span class="cr-meta">${escapeHtml(c.name)}</span></h4>
              <span class="presence-badge ${cls}">${escapeHtml(c.presenceAr)}</span>
              <span class="cr-rival__score">${c.score}/10</span>
            </div>
            <p><strong>المنتجات:</strong> ${escapeHtml((c.products || []).join(' · '))}</p>
            ${prices ? `<ul class="cr-rival__prices">${prices}</ul>` : ''}
            <div class="cr-rival__sw">
              <div><strong>نقاط القوة</strong><ul>${strengths}</ul></div>
              <div><strong>الضعف / الفرصة</strong><ul>${weaknesses}</ul></div>
            </div>
            <p class="cr-rival__verdict"><strong>الحكم:</strong> ${escapeHtml(c.verdict)}</p>
          </article>`;
        })
        .join('');
    }

    const bands = $('#priceBands');
    if (bands) {
      bands.innerHTML = (data.priceBands || [])
        .map(
          (b) => `<div class="glass-card cr-band">
            <span class="cr-band__label">${escapeHtml(b.label)}</span>
            <strong class="cr-band__range">${escapeHtml(b.range)}</strong>
            <p>${escapeHtml(b.examples)}</p>
            <p class="cr-meta">${escapeHtml(b.nature)}</p>
          </div>`
        )
        .join('');
    }

    const channels = $('#channelCards');
    if (channels) {
      channels.innerHTML = (data.channels || [])
        .map(
          (ch) => `<div class="glass-card tech-card">
            <h3>${escapeHtml(ch.name)}</h3>
            <ul class="cr-channel-list">${(ch.points || []).map((p) => `<li>${escapeHtml(p)}</li>`).join('')}</ul>
          </div>`
        )
        .join('');
    }

    const specialty = $('#specialtyCards');
    if (specialty && data.specialty) {
      specialty.innerHTML = [
        ['زجاج', data.specialty.glass],
        ['مسابح', data.specialty.pool],
        ['حدائق', data.specialty.garden],
      ]
        .map(
          ([t, body]) => `<div class="glass-card tech-card"><h3>${t}</h3><p>${escapeHtml(body)}</p></div>`
        )
        .join('');
    }

    const gaps = $('#gapsList');
    if (gaps) {
      gaps.innerHTML = (data.gaps || []).map((g) => `<li>${escapeHtml(g)}</li>`).join('');
    }

    const pricing = $('#pricingStrategy');
    if (pricing && data.pricingStrategy) {
      const ps = data.pricingStrategy;
      pricing.innerHTML = ['core', 'premium', 'pool']
        .map((key) => {
          const item = ps[key];
          if (!item) return '';
          const featured = key === 'premium' ? ' pricing-card--featured' : '';
          return `<div class="glass-card pricing-card${featured}">
            <span class="pricing-card__type">${escapeHtml(item.label)}</span>
            <span class="pricing-card__price" style="font-size:1.2rem;">${escapeHtml(item.priceSar)}</span>
            <p>${escapeHtml(item.note)}</p>
          </div>`;
        })
        .join('');
    }

    const matrix = $('#competitionMatrixBody');
    if (matrix) {
      matrix.innerHTML = (data.matrix || [])
        .map(
          (row) => `<tr>
            <td>${escapeHtml(row.factor)}</td>
            <td>${escapeHtml(row.bigBrands)}</td>
            <td>${escapeHtml(row.saudiBrand)}</td>
          </tr>`
        )
        .join('');
    }
  }

  function filterWatchListings() {
    const list = (state.priceWatch && state.priceWatch.listings) || [];
    return list.filter((row) => {
      if (state.watchChannel !== 'all' && row.channel !== state.watchChannel) return false;
      if (state.watchPresence !== 'all' && row.presenceBadge !== state.watchPresence) return false;
      return true;
    });
  }

  function renderPriceWatch() {
    const watch = state.priceWatch;
    if (!watch) return;

    const meta = $('#priceWatchMeta');
    if (meta) {
      meta.textContent = `آخر رصد: ${watch.updated} · المراجعة التالية: ${watch.nextReview} · اعرض «آخر سعر مرصود» وليس سعراً حياً`;
    }

    const rules = $('#priceWatchRules');
    if (rules) {
      rules.innerHTML = (watch.rules || []).map((r) => `<li>${escapeHtml(r)}</li>`).join('');
    }

    const list = filterWatchListings();
    const count = $('#watchCount');
    if (count) count.textContent = String(list.length);

    const body = $('#priceWatchBody');
    if (!body) return;
    if (!list.length) {
      body.innerHTML = '<tr><td colspan="7" class="cr-empty">لا لقطات مطابقة</td></tr>';
      return;
    }

    body.innerHTML = list
      .map((row) => {
        const badge = row.presenceBadge || 'marketplace';
        const cls = PRESENCE_CLASS[badge] || 'presence--marketplace';
        const label = PRESENCE_LABEL[badge] || badge;
        const w = WARRANTY_AR[row.warrantyType] || row.warrantyType;
        const months = row.warrantyMonths ? ` · ${row.warrantyMonths} شهراً` : '';
        return `<tr>
          <td><strong>${escapeHtml(row.brandAr || row.brand)}</strong><div class="cr-meta">${escapeHtml(row.model)}</div></td>
          <td>${escapeHtml(row.channelAr || row.channel)}</td>
          <td>${escapeHtml(row.sellerName || '—')}</td>
          <td><strong>${Number(row.priceSar).toLocaleString('ar-SA')} ر.س</strong>
            <div class="cr-meta">آخر سعر مرصود${row.listPriceSar ? ` · كان ${Number(row.listPriceSar).toLocaleString('ar-SA')}` : ''}</div></td>
          <td>${escapeHtml(w)}${escapeHtml(months)}</td>
          <td>${escapeHtml(row.capturedAt)}</td>
          <td><span class="presence-badge ${cls}">${escapeHtml(label)}</span></td>
        </tr>`;
      })
      .join('');
  }

  function bindPriceWatchFilters() {
    const ch = $('#watchChannel');
    if (ch) {
      ch.addEventListener('change', () => {
        state.watchChannel = ch.value;
        renderPriceWatch();
      });
    }
    const pr = $('#watchPresence');
    if (pr) {
      pr.addEventListener('change', () => {
        state.watchPresence = pr.value;
        renderPriceWatch();
      });
    }
  }

  async function loadData() {
    const [cRes, sRes, pRes, compRes, watchRes] = await Promise.all([
      fetch('data/companies.json'),
      fetch('data/sources.json'),
      fetch('data/products.json'),
      fetch('data/saudi-competitors.json'),
      fetch('data/saudi-price-watch.json'),
    ]);
    if (!cRes.ok || !sRes.ok) throw new Error('تعذر تحميل بيانات التقرير');
    const cJson = await cRes.json();
    const sJson = await sRes.json();
    state.companies = cJson.companies || [];
    state.sources = sJson.sources || {};
    state.products = pRes.ok ? (await pRes.json()).products || [] : [];
    state.competition = compRes.ok ? await compRes.json() : null;
    state.priceWatch = watchRes.ok ? await watchRes.json() : null;
  }

  async function init() {
    const page = (document.body && document.body.getAttribute('data-china-page')) || 'hub';

    bindPrint();
    if (page === 'plan' || page === 'hub') bindCalculator();
    if (page === 'competition') bindPriceWatchFilters();

    try {
      await loadData();

      if (page === 'companies' || page === 'products' || page === 'hub') {
        bindFilters();
        applyFilters();
      }
      if (page === 'sources' || page === 'hub') renderSources();
      if (page === 'competition') {
        renderCompetition();
        renderPriceWatch();
      }

      const status = $('#dataStatus');
      if (status) {
        const nComp = (state.competition && state.competition.competitors && state.competition.competitors.length) || 0;
        const nWatch = (state.priceWatch && state.priceWatch.listings && state.priceWatch.listings.length) || 0;
        if (page === 'companies') {
          status.textContent = `بيانات محدّثة · ${state.companies.length} شركة`;
        } else if (page === 'products') {
          status.textContent = `بيانات محدّثة · ${state.products.length} منتج`;
        } else if (page === 'competition') {
          status.textContent = `بيانات محدّثة · ${nComp} منافس · ${nWatch} لقطة سعر`;
        } else if (page === 'sources') {
          status.textContent = `بيانات محدّثة · ${Object.keys(state.sources).length} مصدر`;
        } else {
          status.textContent = `بيانات محدّثة · ${state.companies.length} شركة · ${state.products.length} منتج · ${nComp} منافس`;
        }
      }
    } catch (err) {
      const status = $('#dataStatus');
      if (status) status.textContent = 'تعذر تحميل البيانات — شغّل الموقع عبر خادم محلي';
      console.error(err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
