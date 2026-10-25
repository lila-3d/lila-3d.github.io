// "Find a symbol" box on the Python API pages: matches command, class and member names across every API page and jumps
// to the one picked. Pages come from the links in python/README.md, so new modules are picked up without edits here.
(function () {
  var FOLDER = 'python';
  var index = null;

  // docsify's heading id, without its duplicate counter (generated API headings are unique per page).
  function slug(text) {
    return text.trim().toLowerCase()
      .replace(/<[^>]*>/g, '')
      .replace(/[\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~ -⁯]/g, '')
      .replace(/\s+/g, '-');
  }

  function fetchText(path) {
    return fetch(path).then(function (r) { return r.ok ? r.text() : ''; });
  }

  // One entry per heading: its name, page, and the first line of prose under it.
  function parse(page, md) {
    var out = [];
    var lines = md.split('\n');
    var commands = page === 'lila.ops';
    for (var i = 0; i < lines.length; i++) {
      var m = /^(##|###) (.+)$/.exec(lines[i]);
      if (!m || (commands && m[1] === '##')) continue;
      var summary = '';
      var fence = false;
      for (var j = i + 1; j < lines.length && !/^#/.test(lines[j]); j++) {
        var l = lines[j];
        if (/^```/.test(l)) { fence = !fence; continue; }
        if (fence || !l.trim() || /^(\||\*\*|Inherits|Read only|Static|Class method)/.test(l)) continue;
        summary = l.replace(/`/g, '');
        break;
      }
      out.push({ name: m[2], key: m[2].toLowerCase(), page: page, summary: summary });
    }
    return out;
  }

  function load() {
    if (index) return index;
    index = fetchText(FOLDER + '/README.md').then(function (home) {
      var pages = [];
      home.replace(new RegExp('\\(' + FOLDER + '/([\\w.]+)\\.md\\)', 'g'), function (_, p) { pages.push(p); });
      return Promise.all(pages.map(function (p) {
        return fetchText(FOLDER + '/' + p + '.md').then(function (md) { return parse(p, md); });
      }));
    }).then(function (lists) { return [].concat.apply([], lists); });
    return index;
  }

  // Exact name, then name prefix, then the member name after a dot, then anywhere in the name, then the summary.
  function rank(entry, q) {
    var tail = entry.key.slice(entry.key.lastIndexOf('.') + 1);
    if (entry.key === q || tail === q) return 0;
    if (entry.key.indexOf(q) === 0) return 1;
    if (tail.indexOf(q) === 0) return 2;
    if (entry.key.indexOf(q) >= 0) return 3;
    if (entry.summary.toLowerCase().indexOf(q) >= 0) return 4;
    return -1;
  }

  function escape(s) {
    return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }

  function build(vm) {
    var box = document.createElement('div');
    box.className = 'api-find';
    box.innerHTML = '<input type="search" placeholder="Find a command, class or function" aria-label="Find in the Python API" autocomplete="off" spellcheck="false"><ol class="api-find-results" hidden></ol>';
    var input = box.querySelector('input');
    var list = box.querySelector('ol');
    var hits = [];
    var active = 0;

    function go(hit) {
      list.hidden = true;
      input.blur();
      location.hash = '#/' + FOLDER + '/' + hit.page + '?id=' + slug(hit.name);
    }

    function show() {
      var q = input.value.trim().toLowerCase();
      if (!q) { list.hidden = true; return; }
      load().then(function (all) {
        if (input.value.trim().toLowerCase() !== q) return;
        hits = all.map(function (e) { return { e: e, r: rank(e, q) }; })
          .filter(function (h) { return h.r >= 0; })
          .sort(function (a, b) { return a.r - b.r || a.e.key.length - b.e.key.length || (a.e.key < b.e.key ? -1 : 1); })
          .slice(0, 50)
          .map(function (h) { return h.e; });
        active = 0;
        list.innerHTML = hits.length ? hits.map(function (h, i) {
          return '<li data-i="' + i + '"' + (i === active ? ' class="active"' : '') + '><code>' + escape(h.name) + '</code><span class="api-find-page">' + escape(h.page) + '</span><span class="api-find-summary">' + escape(h.summary) + '</span></li>';
        }).join('') : '<li class="api-find-none">No matches</li>';
        list.hidden = false;
      });
    }

    function move(by) {
      if (!hits.length) return;
      active = (active + by + hits.length) % hits.length;
      [].forEach.call(list.children, function (li, i) { li.classList.toggle('active', i === active); });
      list.children[active].scrollIntoView({ block: 'nearest' });
    }

    input.addEventListener('input', show);
    input.addEventListener('focus', show);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { move(1); e.preventDefault(); }
      else if (e.key === 'ArrowUp') { move(-1); e.preventDefault(); }
      else if (e.key === 'Enter' && hits[active]) { go(hits[active]); e.preventDefault(); }
      else if (e.key === 'Escape') { input.value = ''; list.hidden = true; }
    });
    // mousedown, so the pick lands before the input's blur hides the list.
    list.addEventListener('mousedown', function (e) {
      var li = e.target.closest('li[data-i]');
      if (li) { go(hits[+li.dataset.i]); e.preventDefault(); }
    });
    input.addEventListener('blur', function () { list.hidden = true; });
    return box;
  }

  function plugin(hook, vm) {
    hook.doneEach(function () {
      var inApi = vm.route.path.indexOf('/' + FOLDER + '/') === 0;
      document.body.classList.toggle('in-api', inApi);
      if (!inApi) return;
      var article = document.querySelector('.markdown-section');
      if (article && !article.querySelector('.api-find')) article.insertBefore(build(vm), article.firstChild);
    });
  }

  // "/" focuses the box from anywhere on an API page.
  document.addEventListener('keydown', function (e) {
    var input = document.querySelector('.api-find input');
    if (e.key === '/' && input && !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) {
      input.focus();
      e.preventDefault();
    }
  });

  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = [].concat(window.$docsify.plugins || [], plugin);
})();
