// Fills <div id="credits-live"> on the Credits page from the live credits.json: corporate sponsors, Eternal supporters,
// contributors and testers. Other tiers are listed in Lila only.
(function () {
  var URL_ = 'https://lila-telemetry.lila3d.workers.dev/credits.json';

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }

  function name(entry) {
    if (!/^https:\/\//.test(entry.url || '')) return el('span', 'credits-name', entry.name);
    var a = el('a', 'credits-name', entry.name);
    a.href = entry.url;
    a.target = '_blank';
    a.rel = 'nofollow sponsored noopener noreferrer';
    a.title = 'Opens ' + new URL(entry.url).hostname.replace(/^www\./, '');
    return a;
  }

  function section(root, title, entries, render) {
    if (!entries.length) return;
    root.appendChild(el('h3', null, title));
    var list = el('ul', 'credits-list');
    entries.forEach(function (e) {
      var li = el('li');
      render(li, e);
      list.appendChild(li);
    });
    root.appendChild(list);
  }

  function fill(root, c) {
    root.textContent = '';
    section(root, 'Corporate sponsors', c.corporate || [], function (li, s) {
      li.appendChild(name(s));
    });
    section(root, 'Eternal', (c.supporters || []).filter(function (s) { return s.tier === 'eternal'; }), function (li, s) {
      li.appendChild(name(s));
    });
    section(root, 'Contributors', c.contributors || [], function (li, s) {
      li.appendChild(name(s));
      var detail = [s.role].concat((s.areas || []).join(', ')).filter(Boolean).join(': ');
      if (detail) li.appendChild(el('span', 'credits-role', ' ' + detail));
    });
    section(root, 'Testers', c.testers || [], function (li, s) {
      li.appendChild(el('span', 'credits-name', s.name));
      if (s.founding) li.appendChild(el('span', 'credits-role', ' Founding Tester'));
    });
    if (!root.childNodes.length) root.appendChild(el('p', null, 'No one is listed yet.'));
  }

  function load() {
    var root = document.getElementById('credits-live');
    if (!root) return;
    fetch(URL_, { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (c) { fill(root, c); })
      .catch(function () {});
  }

  function plugin(hook) {
    hook.doneEach(load);
  }

  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = [].concat(window.$docsify.plugins || [], plugin);
})();
