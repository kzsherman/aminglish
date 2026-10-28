// Мобильное меню: открытие/закрытие, закрытие по ссылке, фону и Esc
(function () {
  var root = document.documentElement;
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('mobile-menu');
  var overlay = document.querySelector('.menu-overlay');
  var closeBtn = document.querySelector('.mm-close');
  if (!toggle || !menu) return;

  function openMenu() {
    root.classList.add('menu-open');
    toggle.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
    if (closeBtn) closeBtn.focus();
  }
  function closeMenu() {
    root.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
  }

  toggle.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', function () { closeMenu(); toggle.focus(); });
  if (overlay) overlay.addEventListener('click', closeMenu);
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && root.classList.contains('menu-open')) { closeMenu(); toggle.focus(); }
  });
  // при повороте/расширении до десктопа меню закрывается само
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 1000) closeMenu();
  });
})();

// Год в подвале
document.querySelectorAll('[data-year]').forEach(function (el) {
  el.textContent = new Date().getFullYear();
});

// Видеогалерея: листание стрелками, свайпом и клавишами; YouTube грузится только по клику
(function () {
  var g = document.querySelector('.vgallery');
  if (!g) return;
  var track = g.querySelector('.vg-track');
  var slides = g.querySelectorAll('.vg-slide');
  var prev = g.querySelector('.vg-prev');
  var next = g.querySelector('.vg-next');
  var counter = g.querySelector('.vg-counter');
  var i = 0;

  // обложка с кнопкой Play; по клику подставляется плеер
  function poster(s, n) {
    var id = s.getAttribute('data-yt');
    var title = s.getAttribute('data-title') || ('Видео ' + (n + 1));
    s.innerHTML = '';
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'vg-poster';
    b.setAttribute('aria-label', 'Смотреть: ' + title);
    b.innerHTML = '<img src="https://i.ytimg.com/vi/' + id + '/hqdefault.jpg" alt="" loading="lazy">' +
      '<span class="vg-play"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12.5-7.5z" fill="currentColor"/></svg></span>';
    b.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
      f.title = title;
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      f.allowFullscreen = true;
      s.innerHTML = '';
      s.appendChild(f);
    });
    s.appendChild(b);
  }
  slides.forEach(poster);

  function go(n) {
    var old = i;
    i = Math.max(0, Math.min(slides.length - 1, n));
    // при перелистывании останавливаем играющее видео
    if (old !== i && slides[old].querySelector('iframe')) poster(slides[old], old);
    track.style.transform = 'translateX(' + (-100 * i) + '%)';
    prev.disabled = i === 0;
    next.disabled = i === slides.length - 1;
    counter.textContent = (i + 1) + ' / ' + slides.length;
  }
  prev.addEventListener('click', function () { go(i - 1); });
  next.addEventListener('click', function () { go(i + 1); });
  g.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') go(i - 1);
    if (e.key === 'ArrowRight') go(i + 1);
  });
  var x0 = null;
  track.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
    x0 = null;
  });
  go(0);
})();
