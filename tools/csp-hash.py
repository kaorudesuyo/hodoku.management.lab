#!/usr/bin/env python3
"""index.html 内の <script> のハッシュを再計算し、CSP の script-src を更新します。
使い方:  python3 tools/csp-hash.py index.html
JavaScript を1文字でも編集した場合は、必ずこれを実行してください（実行しないとCSPがスクリプトを止めます）。"""
import re, sys, hashlib, base64
path = sys.argv[1] if len(sys.argv) > 1 else 'index.html'
s = open(path, encoding='utf-8').read()
hashes = []
for m in re.finditer(r'<script(?![^>]*type="application/ld\+json")[^>]*>(.*?)</script>', s, re.S):
    h = base64.b64encode(hashlib.sha256(m.group(1).encode('utf-8')).digest()).decode()
    hashes.append(f"'sha256-{h}'")
csp = ("default-src 'none'; base-uri 'none'; object-src 'none'; form-action 'self'; "
       f"script-src {' '.join(hashes)}; "
       "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
       "font-src https://fonts.gstatic.com; img-src 'self' data:; "
       "connect-src https://formsubmit.co; manifest-src 'self'; upgrade-insecure-requests")
s2 = re.sub(r'(<meta http-equiv="Content-Security-Policy" content=")[^"]*(")', lambda m: m.group(1)+csp+m.group(2), s)
open(path, 'w', encoding='utf-8').write(s2)
import os
for f in ('_headers', '.htaccess'):
    fp = os.path.join(os.path.dirname(path) or '.', f)
    if os.path.exists(fp):
        t = open(fp, encoding='utf-8').read()
        t = re.sub(r"script-src 'sha256-[^']*'", f"script-src {' '.join(hashes)}", t)
        open(fp, 'w', encoding='utf-8').write(t)
print('CSP updated:', csp)
