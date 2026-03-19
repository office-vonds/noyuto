'use strict';

(function () {

  /* ============================================================
     ハンバーガーメニュー
     ============================================================ */
  var hamburger = document.getElementById('js-hamburger');
  var nav = document.getElementById('js-nav');
  var overlay = null;

  function createOverlay() {
    overlay = document.createElement('div');
    overlay.classList.add('header__overlay');
    hamburger.parentElement.appendChild(overlay);
    overlay.addEventListener('click', closeMenu);
  }

  function openMenu() {
    hamburger.classList.add('is-active');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'メニューを閉じる');
    nav.classList.add('is-open');
    if (overlay) overlay.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.classList.remove('is-active');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'メニューを開く');
    nav.classList.remove('is-open');
    if (overlay) overlay.classList.remove('is-visible');
    document.body.style.overflow = '';
  }

  if (hamburger && nav) {
    createOverlay();
    hamburger.addEventListener('click', function () {
      if (hamburger.classList.contains('is-active')) {
        closeMenu();
      } else {
        openMenu();
      }
    });
    var navClose = document.getElementById('js-nav-close');
    if (navClose) {
      navClose.addEventListener('click', closeMenu);
    }
    nav.querySelectorAll('.header__nav-link').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
  }

  /* ============================================================
     固定バナー表示制御（SP用）
     ============================================================ */
  var fixedBanner = document.getElementById('js-fixed-banner');
  var header = document.getElementById('header');

  if (fixedBanner) {
    var spCta = document.querySelector('.p-hero-sp-cta');

    if (spCta && 'IntersectionObserver' in window) {
      var bannerObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          fixedBanner.style.transform = entry.isIntersecting
            ? 'translateY(100%)'
            : 'translateY(0)';
        });
      }, { threshold: 0 });
      bannerObserver.observe(spCta);
    }
  }

  /* ============================================================
     スムーススクロール
     ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href === '#') return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        var headerHeight = header ? header.offsetHeight : 0;
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.scrollY - headerHeight,
          behavior: 'smooth'
        });
      }
    });
  });

  /* ============================================================
     スクロールアニメーション（Intersection Observer）
     ============================================================ */
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-inview');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    document.querySelectorAll('.js-inview').forEach(function (el) {
      observer.observe(el);
    });
  }

}());
