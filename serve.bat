@echo off
rem Serves the site locally. Docsify can't load pages over file://.
rem Caching is off so edited .md files show on a normal refresh.
cd /d "%~dp0"
start "" http://localhost:8000/docs/
python -c "import http.server as s; h = s.SimpleHTTPRequestHandler; e = h.end_headers; h.end_headers = lambda self: (self.send_header('Cache-Control', 'no-store'), e(self)); s.test(HandlerClass=h, port=8000)"
