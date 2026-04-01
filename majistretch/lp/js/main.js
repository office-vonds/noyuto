'use strict';

/* =============================================
   スクロールアニメーション（Intersection Observer）
   ============================================= */
document.addEventListener('DOMContentLoaded', function () {
  var fadeTargets = document.querySelectorAll('.js-fade-in');
  if (!fadeTargets.length) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, { threshold: 0.1 });

  fadeTargets.forEach(function (el) {
    observer.observe(el);
  });
});
