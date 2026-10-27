// Adds a copy button to every code block.
(function () {
  function add() {
    document.querySelectorAll('.markdown-section pre').forEach(function (pre) {
      if (pre.parentNode.classList.contains('code-block')) return;
      // Wrapped so the button stays put when a long block scrolls sideways.
      var wrap = document.createElement('div');
      wrap.className = 'code-block';
      pre.parentNode.insertBefore(wrap, pre);
      wrap.appendChild(pre);
      var button = document.createElement('button');
      button.className = 'copy-code';
      button.type = 'button';
      button.title = 'Copy';
      button.setAttribute('aria-label', 'Copy code');
      button.addEventListener('click', function () {
        var code = pre.querySelector('code');
        navigator.clipboard.writeText((code || pre).innerText).then(function () {
          button.classList.add('copied');
          button.title = 'Copied';
          setTimeout(function () {
            button.classList.remove('copied');
            button.title = 'Copy';
          }, 1500);
        });
      });
      wrap.appendChild(button);
    });
  }

  function plugin(hook) {
    hook.doneEach(add);
  }

  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = [].concat(window.$docsify.plugins || [], plugin);
})();
