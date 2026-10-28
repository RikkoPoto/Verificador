(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var fmtNum = function (n) { return n.toLocaleString('es-CL', { maximumFractionDigits: 1 }); };

  var CATS = { PRI: 'Política de privacidad', CON: 'Consentimiento y cookies', DER: 'Derechos de las personas' };
  var LABEL = { C: 'Cumple', P: 'Parcial', N: 'No cumple', E: 'No evaluable' };
  var PTS = { C: 1, P: 0.5, N: 0 };

  // Reglas de ejemplo. En producción las entrega el backend, cada una con su referencia normativa.
  var RULES = [
    { id: 'PRI-01', cat: 'PRI', title: 'Enlace a la política de privacidad visible en el inicio', ok: 'Enlace encontrado en el pie de página: a[href="/privacidad"].', ko: 'No hay enlaces con texto o ruta de privacidad en la página de inicio.', fix: 'Agregar un enlace visible a la política en el encabezado o el pie de página.' },
    { id: 'PRI-02', cat: 'PRI', title: 'Política enlazada desde todas las páginas revisadas', ok: 'El enlace aparece en 10 de 10 páginas revisadas.', ko: 'El enlace falta en 4 de 10 páginas revisadas.', fix: 'Incluir el enlace en la plantilla común de todas las páginas.' },
    { id: 'PRI-03', cat: 'PRI', title: 'Identifica al responsable y su medio de contacto', ok: 'Se nombra al responsable y se indica un correo de contacto.', ko: 'El texto de /privacidad no nombra al responsable ni da un medio de contacto.', fix: 'Indicar quién es el responsable del tratamiento y cómo contactarlo.' },
    { id: 'PRI-04', cat: 'PRI', title: 'Describe las finalidades del tratamiento', ok: 'Las finalidades se detallan por tipo de dato.', ko: 'Se mencionan finalidades generales, sin vincularlas a cada tipo de dato recolectado.', fix: 'Detallar la finalidad de cada tipo de dato que se recolecta.' },
    { id: 'PRI-05', cat: 'PRI', title: 'Informa el plazo de conservación de los datos', ok: 'Se declara un plazo de conservación.', ko: 'No hay ninguna mención a plazos de conservación en la política.', fix: 'Declarar el plazo de conservación o el criterio para definirlo.' },
    { id: 'CON-01', cat: 'CON', title: 'Pide consentimiento antes de cargar cookies no esenciales', ok: 'No se cargan cookies no esenciales antes de aceptar.', ko: 'Se cargaron 3 cookies de analítica antes de que la persona interactuara con el banner.', fix: 'Bloquear las cookies no esenciales hasta recibir el consentimiento.' },
    { id: 'CON-02', cat: 'CON', title: 'Permite rechazar cookies tan fácil como aceptarlas', ok: 'El banner ofrece Aceptar y Rechazar con el mismo peso visual.', ko: 'El banner tiene un botón Aceptar, pero rechazar exige abrir la configuración.', fix: 'Agregar un botón Rechazar al mismo nivel que Aceptar.' },
    { id: 'CON-03', cat: 'CON', title: 'Permite elegir cookies por categoría', ok: 'El banner ofrece las categorías necesarias, analítica y marketing.', ko: 'El banner no permite elegir por categoría.', fix: 'Permitir aceptar o rechazar cada categoría por separado.' },
    { id: 'CON-04', cat: 'CON', title: 'Formularios sin casillas de consentimiento premarcadas', ok: 'Se revisaron 2 formularios; ninguna casilla viene marcada.', ko: 'Hay casillas de consentimiento marcadas de antemano.', fix: 'Dejar las casillas sin marcar por defecto.' },
    { id: 'CON-05', cat: 'CON', title: 'Formularios enlazan a la política de privacidad', ok: 'Los 2 formularios revisados enlazan a la política.', ko: 'Los formularios no enlazan a la política de privacidad.', fix: 'Agregar el enlace a la política junto al botón de envío.' },
    { id: 'DER-01', cat: 'DER', title: 'Canal para solicitar acceso a los datos', ok: '/derechos incluye la opción Acceso a mis datos.', ko: 'No se encontró un canal para pedir acceso.', fix: 'Habilitar un formulario o un correo para solicitar acceso.' },
    { id: 'DER-02', cat: 'DER', title: 'Canal para solicitar rectificación', ok: '/derechos incluye la opción Rectificar mis datos.', ko: 'No se encontró un canal para pedir rectificación.', fix: 'Habilitar un canal para solicitar rectificación.' },
    { id: 'DER-03', cat: 'DER', title: 'Canal para solicitar cancelación (supresión)', ok: '/derechos incluye la opción Eliminar mis datos.', ko: '/derechos no incluye una opción para solicitar la supresión de datos.', fix: 'Agregar la opción de solicitar cancelación (supresión).' },
    { id: 'DER-04', cat: 'DER', title: 'Canal para ejercer oposición al tratamiento', ok: '/derechos incluye la opción Oponerme al tratamiento.', ko: 'No se encontró un canal para oponerse al tratamiento.', fix: 'Habilitar un canal para ejercer el derecho de oposición.' },
    { id: 'DER-05', cat: 'DER', title: 'Canal para solicitar portabilidad', ok: '/derechos incluye la opción Portabilidad.', ko: 'No se encontró un canal para pedir portabilidad.', fix: 'Habilitar un canal para solicitar portabilidad.', ne: 'La página de derechos carga su contenido con scripts y no se pudo leer de forma automática. Requiere revisión manual.' }
  ];
  var DEMO = 'CCNPNNNCCCCCNNE';

  var HIST = [
    { id: 'VER-20261028-0142', date: '28-10-2026 14:05', url: 'https://www.tiendaejemplo.cl', scope: 10, status: 'Completado', res: DEMO },
    { id: 'VER-20261027-0141', date: '27-10-2026 18:42', url: 'https://www.municipio-ejemplo.cl', scope: 10, status: 'Completado', res: 'CCCCPCCCCCCCCPC' },
    { id: 'VER-20261027-0140', date: '27-10-2026 09:10', url: 'https://www.clinicaejemplo.cl', scope: 50, status: 'Error', err: 'Tiempo de espera agotado al descargar la página de inicio.' },
    { id: 'VER-20261022-0139', date: '22-10-2026 16:30', url: 'https://www.colegioejemplo.cl', scope: 10, status: 'Completado', res: 'CPNNNNNNPNCNNNE' },
    { id: 'VER-20261020-0138', date: '20-10-2026 11:15', url: 'https://www.viajesejemplo.cl', scope: 1, status: 'Interrumpido' },
    { id: 'VER-20261015-0137', date: '15-10-2026 10:00', url: 'https://www.bancoejemplo.cl', scope: 10, status: 'Completado', res: 'CCCCCCCCCCCCCCE' }
  ];

  function klass(p) {
    if (p >= 85) return { k: 'Alto', t: 'ok', chip: 'C' };
    if (p >= 50) return { k: 'Parcial', t: 'warn', chip: 'P' };
    return { k: 'Bajo', t: 'bad', chip: 'N' };
  }
  function calc(res) {
    var by = { PRI: { p: 0, n: 0 }, CON: { p: 0, n: 0 }, DER: { p: 0, n: 0 } }, tot = 0, n = 0;
    RULES.forEach(function (r, i) {
      var s = res.charAt(i);
      if (s === 'E') return;
      tot += PTS[s]; n++; by[r.cat].p += PTS[s]; by[r.cat].n++;
    });
    var pct = Math.round(tot / n * 100);
    return { pct: pct, tot: tot, n: n, by: by, cls: klass(pct) };
  }
  function host(u) { try { return new URL(u).hostname; } catch (e) { return u; } }
  function pad(n, l) { return String(n).padStart(l || 2, '0'); }
  function fmtDate(d) { return pad(d.getDate()) + '-' + pad(d.getMonth() + 1) + '-' + d.getFullYear() + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function hms(d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()); }
  function scopeText(n) { return n === 1 ? 'solo la página indicada' : 'hasta ' + n + ' páginas'; }

  var toastTimer;
  function toast(msg) {
    $('#toast-text').textContent = msg;
    $('#toast').hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { $('#toast').hidden = true; }, 4500);
  }

  /* ---------- Router por hash ---------- */
  var VIEWS = ['inicio', 'escaneo', 'informe', 'historial', 'integracion'];
  function route() {
    var v = location.hash.slice(1);
    if (VIEWS.indexOf(v) < 0) v = 'inicio';
    $$('[data-view]').forEach(function (s) { s.hidden = s.dataset.view !== v; });
    $$('[data-nav]').forEach(function (a) {
      if (a.dataset.nav === v) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    if (v === 'inicio') renderHome();
    if (v === 'escaneo') updateScan();
    if (v === 'informe') renderReport();
    if (v === 'historial') renderHistory();
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);

  /* ---------- Inicio ---------- */
  function renderHome() {
    $('#home-cats').innerHTML = Object.keys(CATS).map(function (k) {
      var rs = RULES.filter(function (r) { return r.cat === k; });
      return '<div class="min-w-0 border-t border-line pt-4">' +
        '<p class="eyebrow">' + rs.length + ' reglas</p>' +
        '<h3 class="mt-1 font-display text-base font-bold tracking-tight">' + CATS[k] + '</h3>' +
        '<ul class="mt-3 space-y-1.5 text-sm text-mute">' + rs.map(function (r) { return '<li>' + esc(r.title) + '</li>'; }).join('') + '</ul></div>';
    }).join('');
    $('#home-recent').innerHTML = HIST.slice(0, 4).map(function (h) {
      var right = h.res ? '<span class="chip chip-' + klass(calc(h.res).pct).chip + '">' + calc(h.res).pct + '% · ' + klass(calc(h.res).pct).k + '</span>' : '<span class="chip chip-' + statusChip(h.status) + '">' + h.status + '</span>';
      return '<li class="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2.5"><div class="min-w-0"><p class="truncate font-mono text-sm">' + esc(host(h.url)) + '</p><p class="font-mono text-xs tabular-nums text-mute">' + h.date + '</p></div>' + right + '</li>';
    }).join('');
  }
  function statusChip(s) { return s === 'Completado' ? 'C' : s === 'Error' ? 'N' : 'P'; }

  $$('[data-action="example"]').forEach(function () {});
  $('#scan-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var err = $('#url-error'), raw = $('#url').value.trim(), v = raw;
    function fail(m) { err.textContent = m; err.hidden = false; $('#url').setAttribute('aria-invalid', 'true'); $('#url').focus(); }
    if (!v) return fail('Escribe la dirección del sitio que quieres verificar.');
    if (!/^https?:\/\//i.test(v)) v = 'https://' + v;
    var u;
    try { u = new URL(v); if (!u.hostname.includes('.') || /\s/.test(raw)) throw new Error('x'); }
    catch (x) { return fail('Esa dirección no parece válida. Revisa que tenga un dominio, por ejemplo www.ejemplo.cl.'); }
    err.hidden = true; $('#url').removeAttribute('aria-invalid');
    startScan(u.origin + (u.pathname === '/' ? '' : u.pathname), parseInt($('#scope').value, 10));
    location.hash = '#escaneo';
  });

  /* ---------- Motor de escaneo simulado ---------- */
  // BACKEND: aquí van POST /api/scans y la suscripción a /api/scans/{id}/events.
  var TICK = 650, TOTAL = RULES.length + 2, FAIL_AT = 8, seq = 0, scan = null, currentReport = HIST[0];
  var STAGES = [
    { label: 'Conexión y descarga', from: 0, to: 0 },
    { label: 'Política de privacidad', from: 1, to: 5 },
    { label: 'Consentimiento y cookies', from: 6, to: 10 },
    { label: 'Derechos de las personas', from: 11, to: 15 },
    { label: 'Cálculo del resultado', from: 16, to: 16 }
  ];

  function addLog(level, text) { scan.log.push({ level: level, text: text, t: hms(new Date()) }); }

  function startScan(url, scopeN) {
    if (scan && scan.timer) clearInterval(scan.timer);
    seq++;
    var now = new Date();
    scan = {
      id: 'VER-' + now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate()) + '-' + pad(142 + seq, 4),
      url: url, scope: scopeN, date: fmtDate(now), res: DEMO, step: 0, status: 'running',
      log: [], rendered: 0, findings: [], retries: 0, failedOnce: false, timer: null
    };
    addLog('info', 'Verificación iniciada para ' + host(url) + '.');
    scan.timer = setInterval(tick, TICK);
    updateScan();
  }

  function tick() {
    if (!scan || scan.status !== 'running') return;
    var s = scan.step;
    if ($('#sim-error').checked && !scan.failedOnce && s === FAIL_AT) {
      scan.failedOnce = true; scan.status = 'error'; clearInterval(scan.timer);
      scan.errMsg = 'Tiempo de espera agotado al descargar /derechos (15 s sin respuesta).';
      addLog('error', 'ERROR ' + scan.errMsg);
      updateScan(); return;
    }
    if (s === 0) {
      addLog('info', 'Conectando con ' + host(scan.url) + '…');
      addLog('info', 'Respuesta HTTP 200. Página de inicio descargada (184 KB).');
    } else if (s <= RULES.length) {
      var r = RULES[s - 1], st = scan.res.charAt(s - 1);
      addLog(st, r.id + ' ' + LABEL[st].toLowerCase() + ' · ' + r.title);
      if (st === 'N' || st === 'P') scan.findings.push({ r: r, st: st });
    } else {
      addLog('info', 'Calculando porcentaje y clasificación…');
    }
    scan.step++;
    if (scan.step >= TOTAL) finish();
    updateScan();
  }

  function finish() {
    clearInterval(scan.timer); scan.status = 'done';
    var c = calc(scan.res);
    addLog('info', 'Escaneo completado. Cumplimiento: ' + c.pct + '% (' + c.cls.k + ').');
    var h = { id: scan.id, date: scan.date, url: scan.url, scope: scan.scope, status: 'Completado', res: scan.res };
    HIST.unshift(h); currentReport = h;
  }

  var STATUS_UI = {
    running: ['chip-A', 'En curso'], done: ['chip-C', 'Completado'], error: ['chip-N', 'Error'], cancelled: ['chip-P', 'Interrumpido']
  };
  var LOG_CLS = { info: 'text-mute', C: 'text-ok', P: 'text-warn', N: 'text-bad', E: 'text-mute', error: 'text-bad font-semibold' };
  var ICON = {
    done: '<svg viewBox="0 0 20 20" class="h-5 w-5 text-ok" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10" cy="10" r="8"/><path d="m6.5 10.2 2.4 2.4 4.6-5"/></svg>',
    active: '<svg viewBox="0 0 20 20" class="h-5 w-5 animate-spin text-accent motion-reduce:animate-none" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="10" cy="10" r="8" opacity=".25"/><path d="M10 2a8 8 0 0 1 8 8"/></svg>',
    stalled: '<svg viewBox="0 0 20 20" class="h-5 w-5 text-bad" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="10" cy="10" r="8"/><path d="m7.5 7.5 5 5m0-5-5 5"/></svg>',
    pending: '<svg viewBox="0 0 20 20" class="h-5 w-5 text-line" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="10" cy="10" r="8"/></svg>'
  };

  function updateScan() {
    var s = scan;
    $('#scan-empty').hidden = !!s; $('#scan-live').hidden = !s;
    if (!s) return;
    var pct = s.status === 'done' ? 100 : Math.round(s.step / TOTAL * 100);
    $('#scan-id').textContent = s.id;
    $('#scan-url').textContent = s.url;
    $('#scan-meta').textContent = 'Iniciada el ' + s.date + ' · alcance: ' + scopeText(s.scope) + (s.retries ? ' · reintentos: ' + s.retries : '');
    var st = STATUS_UI[s.status], chip = $('#scan-status');
    chip.className = 'chip ' + st[0]; chip.textContent = st[1];
    $('#scan-pct').textContent = pct + '%';
    $('#scan-fill').style.width = pct + '%';
    $('#scan-bar').setAttribute('aria-valuenow', pct);

    var cur = STAGES.filter(function (g) { return s.step >= g.from && s.step <= g.to; })[0];
    var stepTxt = '';
    if (s.status === 'running') stepTxt = (cur ? cur.label : 'Finalizando') + ' · paso ' + Math.min(s.step + 1, TOTAL) + ' de ' + TOTAL;
    else if (s.status === 'done') stepTxt = 'Escaneo completado. ' + RULES.length + ' reglas revisadas.';
    else if (s.status === 'error') stepTxt = 'El escaneo se detuvo en el paso ' + (s.step + 1) + ' de ' + TOTAL + '. Al reintentar continúa desde ahí.';
    else stepTxt = 'El escaneo se interrumpió en el paso ' + (s.step + 1) + ' de ' + TOTAL + '. Al reintentar continúa desde ahí.';
    $('#scan-step').textContent = stepTxt;

    var eb = $('#scan-error');
    eb.hidden = s.status !== 'error';
    if (s.status === 'error') eb.textContent = s.errMsg;
    $('#btn-cancel').hidden = s.status !== 'running';
    $('#btn-retry').hidden = !(s.status === 'error' || s.status === 'cancelled');
    $('#btn-report').hidden = s.status !== 'done';
    $('#btn-new').hidden = s.status === 'running';

    $('#scan-stages').innerHTML = STAGES.map(function (g) {
      var state = 'pending';
      if (s.status === 'done' || s.step > g.to) state = 'done';
      else if (s.step >= g.from && s.step <= g.to) state = s.status === 'running' ? 'active' : (s.status === 'done' ? 'done' : 'stalled');
      var txt = { done: 'Listo', active: 'En curso', stalled: 'Detenido', pending: 'Pendiente' }[state];
      return '<li class="flex items-center gap-3">' + ICON[state] + '<div class="min-w-0"><p class="text-sm font-medium">' + g.label + '</p><p class="text-xs text-mute">' + txt + '</p></div></li>';
    }).join('');

    var logEl = $('#scan-log');
    if (logEl.dataset.id !== s.id) { logEl.innerHTML = ''; logEl.dataset.id = s.id; s.rendered = 0; }
    for (; s.rendered < s.log.length; s.rendered++) {
      var l = s.log[s.rendered], li = document.createElement('li');
      li.className = 'flex gap-3 ' + (LOG_CLS[l.level] || 'text-mute');
      li.innerHTML = '<time class="shrink-0 tabular-nums text-mute">' + l.t + '</time><span class="min-w-0 break-words">' + esc(l.text) + '</span>';
      logEl.appendChild(li);
      logEl.scrollTop = logEl.scrollHeight;
    }

    $('#scan-count').textContent = s.findings.length;
    $('#scan-count').className = 'chip ' + (s.findings.length ? 'chip-N' : 'chip-E');
    $('#scan-findings-empty').hidden = s.findings.length > 0;
    $('#scan-findings').innerHTML = s.findings.map(function (f) {
      return '<li class="flex flex-wrap items-start gap-x-4 gap-y-1 px-4 py-3"><span class="w-14 shrink-0 pt-0.5 font-mono text-xs text-mute">' + f.r.id + '</span><div class="min-w-0 flex-1"><p class="text-sm font-medium">' + esc(f.r.title) + '</p><p class="mt-0.5 text-sm text-mute">' + esc(f.r.ko) + '</p></div><span class="chip chip-' + f.st + '">' + LABEL[f.st] + '</span></li>';
    }).join('');
  }

  /* ---------- Informe ---------- */
  var repFilter = 'all';
  function renderReport() {
    var r = currentReport, box = $('#report');
    if (!r || !r.res) {
      box.innerHTML = '<div class="panel mx-auto max-w-xl p-8 text-center"><h1 class="font-display text-xl font-bold tracking-tight">Este escaneo no tiene informe</h1><p class="mt-2 text-sm text-mute">Solo las verificaciones completadas generan un informe. Puedes reintentar desde el historial.</p><a href="#historial" class="btn btn-primary mt-5">Ir al historial</a></div>';
      return;
    }
    var c = calc(r.res), C = 2 * Math.PI * 52, dash = c.pct / 100 * C;
    var counts = { all: RULES.length, N: 0, P: 0, C: 0, E: 0 };
    for (var i = 0; i < RULES.length; i++) counts[r.res.charAt(i)]++;

    var ring = '<svg viewBox="0 0 120 120" class="h-32 w-32 shrink-0" role="img" aria-label="Cumplimiento ' + c.pct + ' por ciento"><circle cx="60" cy="60" r="52" fill="none" stroke="var(--neutral)" stroke-width="12"/><circle cx="60" cy="60" r="52" fill="none" stroke="var(--' + c.cls.t + ')" stroke-width="12" stroke-dasharray="' + dash.toFixed(1) + ' ' + C.toFixed(1) + '" transform="rotate(-90 60 60)"/><text x="60" y="67" text-anchor="middle" font-size="28" font-weight="700" fill="var(--ink)" font-family="Schibsted Grotesk, system-ui, sans-serif">' + c.pct + '%</text></svg>';

    var scale = [['Bajo', 'menos de 50', 'N'], ['Parcial', '50 a 84', 'P'], ['Alto', '85 o más', 'C']].map(function (x) {
      var on = x[0] === c.cls.k;
      return '<li class="flex items-center gap-2 text-sm ' + (on ? 'font-semibold' : 'text-mute') + '"><span class="chip chip-' + x[2] + (on ? '' : ' opacity-60') + '">' + x[0] + '</span>' + x[1] + (on ? '<span class="sr-only"> (resultado actual)</span>' : '') + '</li>';
    }).join('');

    var cats = Object.keys(CATS).map(function (k) {
      var b = c.by[k], ratio = b.n ? b.p / b.n : 0, col = ratio >= 0.85 ? 'ok' : ratio >= 0.5 ? 'warn' : 'bad';
      return '<li><div class="flex items-baseline justify-between gap-3 text-sm"><span class="font-medium">' + CATS[k] + '</span><span class="font-mono text-xs tabular-nums text-mute">' + fmtNum(b.p) + ' de ' + b.n + ' puntos</span></div><div class="mt-1.5 h-2 overflow-hidden rounded-full bg-neutral"><div class="h-full rounded-full" style="width:' + Math.round(ratio * 100) + '%;background:var(--' + col + ')"></div></div></li>';
    }).join('');

    var filters = [['all', 'Todas'], ['N', 'No cumple'], ['P', 'Parcial'], ['C', 'Cumple'], ['E', 'No evaluable']].map(function (f) {
      var on = repFilter === f[0];
      return '<button type="button" data-action="filter" data-f="' + f[0] + '" aria-pressed="' + on + '" class="btn btn-sm ' + (on ? 'btn-primary' : 'btn-ghost') + '">' + f[1] + ' <span class="tabular-nums opacity-80">' + counts[f[0]] + '</span></button>';
    }).join('');

    var items = RULES.map(function (rule, i) { return { r: rule, s: r.res.charAt(i) }; })
      .filter(function (x) { return repFilter === 'all' || x.s === repFilter; })
      .map(function (x) {
        var ev = x.s === 'C' ? x.r.ok : x.s === 'E' ? x.r.ne : x.r.ko;
        var fix = (x.s === 'N' || x.s === 'P') ? '<div><p class="eyebrow">Qué corregir</p><p class="mt-1">' + esc(x.r.fix) + '</p></div>' : '';
        return '<details class="group border-b border-line last:border-0"><summary class="flex cursor-pointer flex-wrap items-start gap-x-3 gap-y-1 px-4 py-3 hover:bg-neutral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent">' +
          '<svg viewBox="0 0 20 20" class="mt-1 h-4 w-4 shrink-0 text-mute transition-transform group-open:rotate-90 motion-reduce:transition-none" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m7.5 4.5 5.5 5.5-5.5 5.5"/></svg>' +
          '<span class="w-14 shrink-0 pt-0.5 font-mono text-xs text-mute">' + x.r.id + '</span>' +
          '<span class="min-w-0 flex-1 basis-48 font-medium">' + esc(x.r.title) + '</span>' +
          '<span class="chip chip-' + x.s + '">' + LABEL[x.s] + '</span></summary>' +
          '<div class="grid gap-4 px-4 pb-4 pt-1 text-sm sm:pl-[5.75rem]">' +
          '<div><p class="eyebrow">Evidencia</p><p class="mt-1 rounded bg-neutral px-3 py-2 font-mono text-xs leading-5">' + esc(ev) + '</p></div>' + fix +
          '<div><p class="eyebrow">Referencia normativa</p><p class="mt-1 text-mute">Ley N.º 21.719 · artículo por vincular desde el catálogo de reglas</p></div></div></details>';
      }).join('');

    box.innerHTML =
      '<a href="#historial" class="text-sm font-medium text-accent hover:underline">← Historial</a>' +
      '<div class="mt-3 flex flex-wrap items-start justify-between gap-4"><div class="min-w-0"><p class="eyebrow">Informe de verificación</p><h1 class="mt-1 break-all font-mono text-xl font-medium sm:text-2xl">' + esc(r.url) + '</h1></div>' +
      '<div class="flex flex-wrap gap-2"><button type="button" data-action="export" data-fmt="PDF" class="btn btn-ghost btn-sm">Exportar PDF</button><button type="button" data-action="export" data-fmt="JSON" class="btn btn-ghost btn-sm">Exportar JSON</button><button type="button" data-action="export" data-fmt="CSV" class="btn btn-ghost btn-sm">Exportar CSV</button></div></div>' +
      '<dl class="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4"><div><dt class="eyebrow">Fecha y hora</dt><dd class="mt-0.5 font-mono tabular-nums">' + r.date + '</dd></div><div><dt class="eyebrow">Identificador</dt><dd class="mt-0.5 break-all font-mono">' + r.id + '</dd></div><div><dt class="eyebrow">Alcance</dt><dd class="mt-0.5">' + scopeText(r.scope) + '</dd></div><div><dt class="eyebrow">Reglas evaluadas</dt><dd class="mt-0.5 tabular-nums">' + c.n + ' de ' + RULES.length + '</dd></div></dl>' +
      '<div class="mt-6 grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">' +
        '<div class="panel p-5"><p class="eyebrow">Nivel de cumplimiento</p><div class="mt-3 flex flex-wrap items-center gap-5">' + ring + '<div><p class="font-display text-2xl font-bold tracking-tight">' + c.cls.k + '</p><p class="mt-0.5 text-sm text-mute">' + fmtNum(c.tot) + ' de ' + c.n + ' puntos</p></div></div><ul class="mt-5 space-y-2 border-t border-line pt-4">' + scale + '</ul></div>' +
        '<div class="panel p-5"><p class="eyebrow">Resultado por categoría</p><ul class="mt-4 space-y-5">' + cats + '</ul></div>' +
      '</div>' +
      '<div class="mt-8"><h2 class="font-display text-xl font-bold tracking-tight">Reglas evaluadas</h2><div class="mt-3 flex flex-wrap gap-2">' + filters + '</div>' +
      '<div class="panel mt-4">' + (items || '<p class="px-4 py-8 text-center text-sm text-mute">Ninguna regla tiene este resultado.</p>') + '</div></div>';
  }

  /* ---------- Historial ---------- */
  function renderHistory() {
    var q = $('#hist-q').value.trim().toLowerCase(), st = $('#hist-status').value;
    var rows = HIST.filter(function (h) { return (!q || h.url.toLowerCase().indexOf(q) >= 0) && (!st || h.status === st); });
    $('#hist-empty').hidden = rows.length > 0;
    $('#hist-body').innerHTML = rows.map(function (h) {
      var res = '<span class="text-mute">—</span>', act;
      if (h.res) { var c = calc(h.res); res = '<span class="font-display font-bold tabular-nums">' + c.pct + '%</span> <span class="chip chip-' + c.cls.chip + ' ml-1">' + c.cls.k + '</span>'; }
      if (h.status === 'Completado') act = '<button type="button" data-action="open-report" data-id="' + h.id + '" class="btn btn-ghost btn-sm">Ver informe</button>';
      else act = '<button type="button" data-action="retry-url" data-url="' + esc(h.url) + '" data-scope="' + h.scope + '" class="btn btn-ghost btn-sm">Reintentar</button>';
      var note = h.err ? '<p class="mt-0.5 max-w-xs text-xs text-mute">' + esc(h.err) + '</p>' : '';
      return '<tr class="border-t border-line align-top"><td class="whitespace-nowrap px-4 py-3 font-mono text-xs tabular-nums text-mute">' + h.date + '</td><td class="px-4 py-3"><p class="break-all font-mono text-sm">' + esc(host(h.url)) + '</p><p class="font-mono text-xs text-mute">' + h.id + '</p></td><td class="whitespace-nowrap px-4 py-3">' + res + '</td><td class="px-4 py-3"><span class="chip chip-' + statusChip(h.status) + '">' + h.status + '</span>' + note + '</td><td class="px-4 py-3 text-right">' + act + '</td></tr>';
    }).join('');
  }
  $('#hist-q').addEventListener('input', renderHistory);
  $('#hist-status').addEventListener('change', renderHistory);

  /* ---------- Acciones ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-action]');
    if (!b) return;
    var a = b.dataset.action;
    if (a === 'example') { $('#url').value = b.dataset.url; $('#url-error').hidden = true; $('#url').focus(); }
    else if (a === 'cancel' && scan && scan.status === 'running') {
      clearInterval(scan.timer); scan.status = 'cancelled';
      addLog('error', 'Escaneo interrumpido por la persona.'); updateScan();
    }
    else if (a === 'retry' && scan && (scan.status === 'error' || scan.status === 'cancelled')) {
      scan.retries++; scan.status = 'running';
      addLog('info', 'Reintento n.º ' + scan.retries + '. Continúa desde el paso ' + (scan.step + 1) + '.');
      scan.timer = setInterval(tick, TICK); updateScan();
    }
    else if (a === 'open-report') {
      currentReport = HIST.filter(function (h) { return h.id === b.dataset.id; })[0]; repFilter = 'all'; location.hash = '#informe'; if (location.hash === '#informe') renderReport();
    }
    else if (a === 'retry-url') { startScan(b.dataset.url, parseInt(b.dataset.scope, 10)); location.hash = '#escaneo'; }
    else if (a === 'filter') { repFilter = b.dataset.f; renderReport(); var nb = $('[data-action="filter"][data-f="' + repFilter + '"]'); if (nb) nb.focus(); }
    else if (a === 'export') toast('Exportar a ' + b.dataset.fmt + ' se activa al conectar GET /api/scans/{id}/report?format=' + b.dataset.fmt.toLowerCase() + '.');
  });

  route();
})();
