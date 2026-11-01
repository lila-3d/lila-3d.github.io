// Sidebar search: results grouped under their page's title, best page first, so a hit reads "Sculpting > Get it
// working" instead of a bare section heading. Reference areas fold into one collapsed row each so a search for a page
// isn't buried under hundreds of API headings; a reference row opens by itself when no guide page matches.
(function () {
  var REFERENCE = [
    { prefix: '#/python/', label: 'Python API' },
    { prefix: '#/nodes/', label: 'Node reference' },
  ];
  var SECTIONS_SHOWN = 3;

  function escape(s) {
    return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }

  function hrefOf(post) {
    var a = post.querySelector('a');
    return a ? a.getAttribute('href') || '' : '';
  }

  function pageTitle(page, posts) {
    var link = document.querySelector('.sidebar-nav a[href="' + page + '"]');
    if (link) return link.textContent.trim();
    var top = posts.filter(function (p) { return hrefOf(p) === page; })[0];
    return top ? top.querySelector('h2').textContent : page.replace(/^#\//, '') || 'Start here';
  }

  function pageBlock(page, posts) {
    var block = document.createElement('section');
    block.className = 'search-page';
    var title = pageTitle(page, posts);
    // The page's own H1 entry would repeat the title as its first section.
    var own = [];
    var sections = posts.filter(function (p) {
      var isOwn = hrefOf(p) === page || p.querySelector('h2').textContent.trim().toLowerCase() === title.toLowerCase();
      if (isOwn) own.push(p);
      return !isOwn;
    });
    block.innerHTML = '<a class="search-page-title" href="' + escape(page) + '">' + escape(title) + '</a>';
    var snippet = own.length && own[0].querySelector('p');
    if (snippet && !sections.length) {
      snippet.className = 'search-page-snippet';
      block.firstChild.appendChild(snippet);
    }
    own.forEach(function (p) { p.remove(); });
    sections.slice(0, SECTIONS_SHOWN).forEach(function (p) { block.appendChild(p); });
    if (sections.length > SECTIONS_SHOWN) {
      var more = document.createElement('details');
      more.className = 'search-more';
      more.innerHTML = '<summary>' + (sections.length - SECTIONS_SHOWN) + ' more on this page</summary>';
      sections.slice(SECTIONS_SHOWN).forEach(function (p) { more.appendChild(p); });
      block.appendChild(more);
    }
    return block;
  }

  function scope(panel) {
    var posts = [].slice.call(panel.querySelectorAll(':scope > .matching-post'));
    if (!posts.length) return;
    var pages = [];
    var byPage = {};
    var refs = REFERENCE.map(function () { return []; });
    posts.forEach(function (p) {
      var href = hrefOf(p);
      for (var i = 0; i < REFERENCE.length; i++) {
        if (href.indexOf(REFERENCE[i].prefix) === 0) { refs[i].push(p); return; }
      }
      var page = href.split('?')[0];
      if (!byPage[page]) { byPage[page] = []; pages.push(page); }
      byPage[page].push(p);
    });

    pages.forEach(function (page) { panel.appendChild(pageBlock(page, byPage[page])); });

    var openFirst = !pages.length;
    refs.forEach(function (list, i) {
      if (!list.length) return;
      var group = document.createElement('details');
      group.className = 'search-group';
      if (openFirst) { group.open = true; openFirst = false; }
      group.innerHTML = '<summary><span>' + REFERENCE[i].label + '</span><span class="search-group-count">' + list.length + '</span></summary>';
      list.forEach(function (p) { group.appendChild(p); });
      panel.appendChild(group);
    });
  }

  function plugin(hook) {
    hook.mounted(function () {
      var panel = document.querySelector('.search .results-panel');
      if (!panel) return;
      // Docsify rewrites the panel on every keystroke; disconnect while regrouping so our own edits don't re-trigger it.
      var observer = new MutationObserver(function () {
        observer.disconnect();
        scope(panel);
        observer.observe(panel, { childList: true });
      });
      observer.observe(panel, { childList: true });
    });
  }

  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = [].concat(window.$docsify.plugins || [], plugin);
})();
