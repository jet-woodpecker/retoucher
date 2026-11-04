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
