// Pads the end of each page so its last section heading can scroll to the top. Docsify highlights the last heading
// above the top of the window, so without this the last sections of a page, or every section of a short one, never
// highlight in the sidebar.
// Also keeps a ?id= target at the top while the page settles: docsify scrolls to it once, before this padding and
// the images above it have changed the layout.
(function () {
  var pinned = null;

  function fit() {
    var article = document.querySelector('.markdown-section');
    if (!article) return;
    article.style.paddingBottom = '';
    var anchors = article.querySelectorAll('h2 .anchor');
    if (!anchors.length) return;
    var below = document.documentElement.scrollHeight - anchors[anchors.length - 1].offsetTop;
    var gap = window.innerHeight - below;
    if (gap > 0) article.style.paddingBottom = parseFloat(getComputedStyle(article).paddingBottom) + gap + 'px';
  }

  function routeId() {
    var m = /[?&]id=([^&]*)/.exec(location.hash);
    return m ? decodeURIComponent(m[1]) : null;
  }

  function align() {
    if (!pinned) return;
    var el = document.getElementById(pinned);
    if (!el) return;
    var top = Math.round(el.getBoundingClientRect().top + window.pageYOffset - (window.$docsify.topMargin || 0));
    if (Math.abs(top - window.pageYOffset) > 1) window.scrollTo(0, top);
  }

  function pin() {
    pinned = routeId();
    // After docsify's 500 ms scroll animation, which would otherwise overwrite the correction.
    setTimeout(align, 550);
  }

  function relayout() {
    fit();
    align();
  }

  function plugin(hook) {
    hook.doneEach(function () {
      fit();
      pin();
      // Images change the page height as they load.
      var article = document.querySelector('.markdown-section');
      if (article) article.addEventListener('load', relayout, true);
    });
  }

  ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (type) {
    window.addEventListener(type, function () { pinned = null; }, { passive: true });
  });
  window.addEventListener('hashchange', pin);
  window.addEventListener('resize', relayout);
  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = [].concat(window.$docsify.plugins || [], plugin);
})();
