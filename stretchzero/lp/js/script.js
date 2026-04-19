/*
  Stretch ZERO 広告LP — script
  - FV 3パターンカルーセル
  - FAQアコーディオン
  - 予約モーダル開閉
  - ハンバーガーメニュー
  - GTMデータレイヤーpush(TELタップ/モーダル起動)
  - IntersectionObserver reveal (data-sz-reveal)
  - 数値カウントアップ（data-sz-count）
  - prefers-reduced-motion 尊重
*/
(function(){
  'use strict';

  var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- FV carousel ---
  var slides = document.querySelectorAll('.sz-fv__slide');
  if(slides.length){
    var i=0;
    slides[0].classList.add('is-active');
    setInterval(function(){
      slides[i].classList.remove('is-active');
      i = (i+1) % slides.length;
      slides[i].classList.add('is-active');
    }, 5500);
  }

  // --- FAQ accordion ---
  document.querySelectorAll('.sz-faq__item').forEach(function(item){
    var q = item.querySelector('.sz-faq__q');
    if(!q) return;
    q.addEventListener('click', function(){
      var open = item.getAttribute('aria-expanded') === 'true';
      item.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
  });

  // --- Modal (reservation) ---
  var modal = document.getElementById('sz-reservation-modal');
  function openModal(source){
    if(!modal) return;
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
    if(window.dataLayer){
      window.dataLayer.push({event:'reservation_modal_open', source: source||'unknown'});
    }
  }
  function closeModal(){
    if(!modal) return;
    modal.setAttribute('aria-hidden','true');
    document.body.style.overflow='';
  }
  document.querySelectorAll('[data-sz-open-modal]').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.preventDefault();
      openModal(btn.getAttribute('data-sz-open-modal'));
    });
  });
  document.querySelectorAll('[data-sz-close-modal]').forEach(function(btn){
    btn.addEventListener('click', closeModal);
  });
  if(modal){
    modal.addEventListener('click', function(e){
      if(e.target === modal) closeModal();
    });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && modal.getAttribute('aria-hidden')==='false') closeModal();
    });
  }

  // --- TEL tap tracking ---
  document.querySelectorAll('a[href^="tel:"]').forEach(function(a){
    a.addEventListener('click', function(){
      if(window.dataLayer){
        window.dataLayer.push({
          event:'tel_tap',
          tel: a.getAttribute('href').replace('tel:',''),
          shop: a.getAttribute('data-sz-shop') || 'unknown'
        });
      }
    });
  });

  // --- Hamburger (SP) ---
  var ham = document.querySelector('[data-sz-ham]');
  var nav = document.querySelector('[data-sz-nav]');
  if(ham && nav){
    ham.addEventListener('click', function(){
      var open = nav.getAttribute('aria-hidden') === 'false';
      nav.setAttribute('aria-hidden', open ? 'true' : 'false');
      ham.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
    nav.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        nav.setAttribute('aria-hidden','true');
        ham.setAttribute('aria-expanded','false');
      });
    });
  }

  // --- Reveal observer ---
  if('IntersectionObserver' in window && !prefersReduced){
    var revealTargets = document.querySelectorAll('[data-sz-reveal],[data-sz-reveal-group]');
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, {root:null, rootMargin:'0px 0px -8% 0px', threshold:0.12});
    revealTargets.forEach(function(el){io.observe(el);});
  } else {
    // Fallback: show everything
    document.querySelectorAll('[data-sz-reveal],[data-sz-reveal-group]').forEach(function(el){
      el.classList.add('is-in');
    });
  }

  // --- Count up (data-sz-count="85" data-sz-suffix="%") ---
  function countUp(el){
    var target = parseInt(el.getAttribute('data-sz-count'), 10);
    var dur = parseInt(el.getAttribute('data-sz-duration'), 10) || 1200;
    var start = null;
    if(isNaN(target)) return;
    function step(ts){
      if(start===null) start = ts;
      var t = Math.min(1, (ts - start) / dur);
      // easeOutQuart
      var eased = 1 - Math.pow(1-t, 4);
      var val = Math.round(target * eased);
      el.textContent = val.toLocaleString();
      if(t<1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString();
    }
    requestAnimationFrame(step);
  }
  if('IntersectionObserver' in window && !prefersReduced){
    var counters = document.querySelectorAll('[data-sz-count]');
    var countIo = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          countUp(entry.target);
          countIo.unobserve(entry.target);
        }
      });
    }, {threshold:0.4});
    counters.forEach(function(el){countIo.observe(el);});
  } else {
    document.querySelectorAll('[data-sz-count]').forEach(function(el){
      el.textContent = parseInt(el.getAttribute('data-sz-count'),10).toLocaleString();
    });
  }

  // --- Sticky CTA show/hide based on scroll ---
  var sticky = document.querySelector('.sz-sticky');
  if(sticky){
    var lastY = 0, ticking = false;
    window.addEventListener('scroll', function(){
      if(!ticking){
        requestAnimationFrame(function(){
          var y = window.pageYOffset;
          // hide on extreme top and extreme bottom
          if(y < 400){
            sticky.style.transform = 'translateY(110%)';
          } else if(y + window.innerHeight > document.documentElement.scrollHeight - 200){
            sticky.style.transform = 'translateY(110%)';
          } else {
            sticky.style.transform = 'translateY(0)';
          }
          lastY = y;
          ticking = false;
        });
        ticking = true;
      }
    }, {passive:true});
  }
})();
