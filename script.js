(function () {
  var m = document.querySelector('.menu');
  if (!m) return;
  document.addEventListener('click', function (e) {
    if (m.open && (!m.contains(e.target) || e.target.closest('.menu-panel a'))) m.open = false;
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && m.open) {
      m.open = false;
      m.querySelector('summary').focus();
    }
  });
})();

(function () {
  [].forEach.call(document.querySelectorAll('.ba'), function (s) {
    var r = s.querySelector('input');
    var down = false;
    function set(v) {
      v = Math.max(0, Math.min(100, v));
      r.value = v;
      s.style.setProperty('--p', v + '%');
    }
    function at(e) {
      var b = s.getBoundingClientRect();
      set(((e.clientX - b.left) / b.width) * 100);
    }
    s.addEventListener('pointerdown', function (e) {
      down = true;
      at(e);
    });
    s.addEventListener('pointermove', function (e) {
      if (down) at(e);
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (n) {
      s.addEventListener(n, function () {
        down = false;
      });
    });
    r.addEventListener('input', function () {
      set(+r.value);
    });
  });
})();

(function () {
  var d = document.getElementById('lb');
  if (!d) return;
  var works = [].slice.call(document.querySelectorAll('.work'));
  var stage = document.getElementById('lb-stage');
  var before = document.getElementById('lb-before');
  var after = document.getElementById('lb-after');
  var range = document.getElementById('lb-range');
  var title = document.getElementById('lb-title');
  var count = document.getElementById('lb-count');
  var body = document.getElementById('lb-body');
  var idx = 0;
  var dragging = false;

  function setP(v) {
    v = Math.max(0, Math.min(100, v));
    range.value = v;
    stage.style.setProperty('--p', v + '%');
  }
  function show(i) {
    idx = (i + works.length) % works.length;
    var w = works[idx];
    stage.style.setProperty('--ar', w.dataset.ar);
    before.removeAttribute('loading');
    after.removeAttribute('loading');
    before.src = w.dataset.before;
    after.src = w.dataset.after;
    before.alt = 'До: ' + w.dataset.title;
    after.alt = 'Після: ' + w.dataset.title;
    title.textContent = w.dataset.title;
    count.textContent = idx + 1 + ' / ' + works.length;
    setP(50);
    var n = works[(idx + 1) % works.length];
    new Image().src = n.dataset.before;
    new Image().src = n.dataset.after;
  }
  // Replaced photos may have another shape: trust the real file over data-ar.
  after.addEventListener('load', function () {
    if (after.naturalWidth && after.src.indexOf('-thumb') < 0) {
      stage.style.setProperty('--ar', after.naturalWidth / after.naturalHeight);
    }
  });
  function fromEvent(e) {
    var r = stage.getBoundingClientRect();
    setP(((e.clientX - r.left) / r.width) * 100);
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('.work');
    if (!a || e.ctrlKey || e.metaKey || e.shiftKey) return;
    e.preventDefault();
    show(works.indexOf(a));
    d.showModal();
  });
  stage.addEventListener('pointerdown', function (e) {
    dragging = true;
    stage.setPointerCapture(e.pointerId);
    fromEvent(e);
  });
  stage.addEventListener('pointermove', function (e) {
    if (dragging) fromEvent(e);
  });
  function stop() { dragging = false; }
  stage.addEventListener('pointerup', stop);
  stage.addEventListener('pointercancel', stop);
  range.addEventListener('input', function () { setP(+range.value); });

  document.getElementById('lb-close').addEventListener('click', function () { d.close(); });
  document.getElementById('lb-prev').addEventListener('click', function () { show(idx - 1); });
  document.getElementById('lb-next').addEventListener('click', function () { show(idx + 1); });
  d.addEventListener('click', function (e) {
    if (e.target === d || e.target === body) d.close();
  });
  d.addEventListener('keydown', function (e) {
    if (e.target === range) return;
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
})();

// Particle waves behind #services: a plain canvas port of the "particles waves" demo.
(function () {
  var c = document.querySelector('.waves');
  var x = c && c.getContext && c.getContext('2d');
  if (!x) return;
  var COLOR = '#ff9be0';
  var LEVELS = 6; // dots are drawn in alpha groups, one path per group
  var still = window.matchMedia('(prefers-reduced-motion: reduce)');
  var w = 0, h = 0, gap = 30, row = 24, cols = 0, rows = 0, headEnd = 0, headRight = 0, step = 30, cards = [];
  var raf = 0, last = 0, seen = false;

  function clamp01(n) {
    return n < 0 ? 0 : n > 1 ? 1 : n;
  }

  // 0 at the top and bottom edges, dim behind the heading text so it stays readable
  function fade(px, py) {
    var e = Math.min(py / 120, (h - py) / 100, 1);
    if (e <= 0) return 0;
    return e * (1 - 0.7 * clamp01((headEnd + 60 - py) / 60) * clamp01((headRight + 120 - px) / 120));
  }

  function underCard(px, py) {
    for (var i = 0; i < cards.length; i++) {
      var r = cards[i];
      if (px > r[0] && px < r[2] && py > r[1] && py < r[3]) return true;
    }
    return false;
  }

  function draw(t) {
    var paths = [], i, ix, iy, a, b, v, px, py;
    for (i = 0; i < LEVELS; i++) paths.push(new Path2D());
    for (ix = 0; ix < cols; ix++) {
      a = Math.sin((ix + t) * 0.3);
      px = (ix - 0.5) * gap;
      for (iy = 0; iy < rows; iy++) {
        b = Math.sin((iy + t) * 0.5);
        py = (iy - 2) * row + (a + b) * gap * 0.55;
        if (underCard(px, py)) continue;
        v = ((a + b + 2) / 4) * fade(px, py);
        if (v < 0.05) continue;
        i = Math.min(LEVELS - 1, Math.floor(v * LEVELS));
        v = 0.7 + v * 1.9;
        paths[i].moveTo(px + v, py);
        paths[i].arc(px, py, v, 0, 6.2832);
      }
    }
    x.clearRect(0, 0, w, h);
    x.fillStyle = COLOR;
    for (i = 0; i < LEVELS; i++) {
      x.globalAlpha = 0.16 + (i / (LEVELS - 1)) * 0.6;
      x.fill(paths[i]);
    }
  }

  function tick(ms) {
    raf = requestAnimationFrame(tick);
    if (ms - last < step) return; // a slow background doesn't need every frame
    last = ms;
    draw(ms * 0.0016);
  }

  function run() {
    cancelAnimationFrame(raf);
    raf = 0;
    if (seen && !still.matches) raf = requestAnimationFrame(tick);
    else draw(0);
  }

  function size() {
    var box = c.getBoundingClientRect();
    var d = Math.min(window.devicePixelRatio || 1, box.width < 860 ? 1 : 1.5);
    w = box.width;
    h = box.height;
    if (!w || !h) return;
    gap = Math.max(26, Math.sqrt((w * h) / 1200)); // at most about 1500 dots
    row = gap * 0.8;
    cols = Math.ceil(w / gap) + 2;
    rows = Math.ceil(h / row) + 5;
    step = w < 860 ? 45 : 30;
    var head = c.parentNode.querySelector('.head').getBoundingClientRect();
    headEnd = head.bottom - box.top;
    headRight = head.right - box.left;
    // Dots fully under an opaque card are skipped; 10px inset keeps the rounded corners covered.
    cards = [].map.call(c.parentNode.querySelectorAll('.card'), function (k) {
      var r = k.getBoundingClientRect();
      return [r.left - box.left + 10, r.top - box.top + 10, r.right - box.left - 10, r.bottom - box.top - 10];
    });
    c.width = Math.round(w * d);
    c.height = Math.round(h * d);
    x.setTransform(d, 0, 0, d, 0, 0);
    if (!raf) draw(0);
  }

  size();
  if (window.ResizeObserver) new ResizeObserver(size).observe(c);
  else window.addEventListener('resize', size);
  if (still.addEventListener) still.addEventListener('change', run);
  if (window.IntersectionObserver) {
    new IntersectionObserver(function (e) {
      seen = e[e.length - 1].isIntersecting;
      run();
    }, { rootMargin: '80px' }).observe(c);
  } else {
    seen = true;
    run();
  }
})();
