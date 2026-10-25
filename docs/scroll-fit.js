// Pads the end of each page so its last section heading can scroll to the top. Docsify highlights the last heading
// above the top of the window, so without this the last sections of a page, or every section of a short one, never
// highlight in the sidebar.
(function () {
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

  function plugin(hook) {
    hook.doneEach(function () {
      fit();
      // Images change the page height as they load.
      var article = document.querySelector('.markdown-section');
      if (article) article.addEventListener('load', fit, true);
    });
  }

  window.addEventListener('resize', fit);
  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = [].concat(window.$docsify.plugins || [], plugin);
})();
