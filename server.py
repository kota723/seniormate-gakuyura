import http.server
import socketserver
import urllib.request
import urllib.error
import json
import ssl
import sys

PORT = 8000
API_KEY = "5NktcNmkaRcjELDE8KN0krYXRWgu7x2mCO3U"
SERVICE_ID = "seniormate1"
BASE_URL = f"https://{SERVICE_ID}.microcms.io/api/v1/blog"

# SSL Context to ignore certificate errors (Common on some Mac Python installs)
ssl_context = ssl._create_unverified_context()

class ProxyHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/api/proxy_blog':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                
                req = urllib.request.Request(BASE_URL, data=post_data, method='POST')
                req.add_header('X-MICROCMS-API-KEY', API_KEY)
                req.add_header('Content-Type', 'application/json')
                req.add_header('User-Agent', 'SeniorMate-LocalProxy/1.0')
                
                with urllib.request.urlopen(req, context=ssl_context) as response:
                    response_body = response.read()
                    self.send_response(response.status)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(response_body)

            except urllib.error.HTTPError as e:
                # Upstream API returned 4xx/5xx
                self.send_response(e.code)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(e.read())
            except Exception as e:
                # Local error (Connection, SSL, etc)
                print(f"Proxy Error: {e}", file=sys.stderr)
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                error_resp = json.dumps({"error": str(e), "note": "Local Proxy Failed"}).encode('utf-8')
                self.wfile.write(error_resp)
            return

        self.send_error(404, "Not Found")

print(f"Starting Robust Local Proxy Server at http://localhost:{PORT}")
with socketserver.TCPServer(("", PORT), ProxyHandler) as httpd:
    httpd.serve_forever()
