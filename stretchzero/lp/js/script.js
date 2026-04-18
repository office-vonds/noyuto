/*
  Stretch ZERO 広告LP — skeleton JS
  - FV 3パターンカルーセル
  - FAQアコーディオン
  - 予約モーダル開閉
  - ハンバーガーメニュー
  - GTMデータレイヤーpush(TELタップ/モーダル起動)
*/
(function(){
  'use strict';

  // --- FV carousel ---
  var slides = document.querySelectorAll('.sz-fv__slide');
  if(slides.length){
    var i=0;
    slides[0].classList.add('is-active');
    setInterval(function(){
      slides[i].classList.remove('is-active');
      i = (i+1) % slides.length;
      slides[i].classList.add('is-active');
    }, 4500);
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
        window.dataLayer.push({event:'tel_tap', tel: a.getAttribute('href').replace('tel:','')});
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
  }
})();
