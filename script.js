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
