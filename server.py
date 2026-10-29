#!/usr/bin/env python3
import http.server
import os
import sys

class RangeHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """HTTP Request Handler with full HTTP 206 Partial Content (Byte Range) support and no-cache headers."""
    
    def end_headers(self):
        self.send_header('Accept-Ranges', 'bytes')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def send_head(self):
        if 'Range' not in self.headers:
            self.range = None
            return super().send_head()
            
        try:
            path = self.translate_path(self.path)
            if not os.path.exists(path) or os.path.isdir(path):
                return super().send_head()
                
            f = open(path, 'rb')
            fs = os.fstat(f.fileno())
            total_size = fs[6]
            
            range_header = self.headers['Range'].strip()
            if not range_header.startswith('bytes='):
                return super().send_head()
                
            range_val = range_header[6:].split(',')[0].strip()
            parts = range_val.split('-')
            
            if len(parts) != 2:
                return super().send_head()
                
            start_str, end_str = parts[0].strip(), parts[1].strip()
            
            if start_str == '':
                # Suffix range: bytes=-N (last N bytes)
                length = int(end_str)
                start = max(0, total_size - length)
                end = total_size - 1
            elif end_str == '':
                # Prefix range: bytes=N- (from N to end)
                start = int(start_str)
                end = total_size - 1
            else:
                start = int(start_str)
                end = int(end_str)
                
            if start >= total_size or start > end:
                self.send_error(416, 'Requested Range Not Satisfiable')
                f.close()
                return None
                
            end = min(end, total_size - 1)
            content_length = end - start + 1
            
            self.send_response(206)
            self.send_header('Content-Type', self.guess_type(path))
            self.send_header('Content-Range', f'bytes {start}-{end}/{total_size}')
            self.send_header('Content-Length', str(content_length))
            self.end_headers()
            
            f.seek(start)
            self.range = (start, end)
            return f
        except Exception:
            return super().send_head()

    def copyfile(self, source, outputfile):
        if not getattr(self, 'range', None):
            return super().copyfile(source, outputfile)
            
        start, end = self.range
        bytes_to_send = end - start + 1
        buffer_size = 64 * 1024
        
        while bytes_to_send > 0:
            chunk_size = min(bytes_to_send, buffer_size)
            data = source.read(chunk_size)
            if not data:
                break
            outputfile.write(data)
            bytes_to_send -= len(data)

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    server_address = ('', port)
    httpd = http.server.ThreadingHTTPServer(server_address, RangeHTTPRequestHandler)
    print(f'Starting Range & No-Cache HTTP Server on port {port}...')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('Shutting down server.')
        httpd.server_close()
