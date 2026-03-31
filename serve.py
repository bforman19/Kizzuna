"""Simple HTTP server with byte-range support for local video playback."""
import http.server, os, re, sys

class RangeHandler(http.server.SimpleHTTPRequestHandler):
    def send_head(self):
        path = self.translate_path(self.path)
        if not os.path.isfile(path):
            return super().send_head()

        size = os.path.getsize(path)
        ctype = self.guess_type(path)
        range_header = self.headers.get('Range')

        f = open(path, 'rb')

        if range_header:
            m = re.match(r'bytes=(\d+)-(\d*)', range_header)
            if m:
                start = int(m.group(1))
                end   = int(m.group(2)) if m.group(2) else size - 1
                end   = min(end, size - 1)
                length = end - start + 1
                f.seek(start)
                self.send_response(206)
                self.send_header('Content-Type', ctype)
                self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
                self.send_header('Content-Length', str(length))
                self.send_header('Accept-Ranges', 'bytes')
                self.end_headers()
                return f

        self.send_response(200)
        self.send_header('Content-Type', ctype)
        self.send_header('Content-Length', str(size))
        self.send_header('Accept-Ranges', 'bytes')
        self.end_headers()
        return f

    def log_message(self, fmt, *args):
        pass  # suppress request logs

port = int(sys.argv[1]) if len(sys.argv) > 1 else 3000
os.chdir(os.path.dirname(os.path.abspath(__file__)))
print(f"Serving at http://localhost:{port}")
http.server.HTTPServer(('', port), RangeHandler).serve_forever()
