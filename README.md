# ほどく経営研究所 — 公開手順メモ

## ファイル構成（すべて同じ階層に置く）
- index.html … サイト本体（画像・アイコン・写真は埋め込み済み）
- ogp.png … SNS共有用画像（1200×630）
- favicon.ico / favicon-16.png / favicon-32.png / apple-touch-icon.png / icon-192.png / icon-512.png / site.webmanifest … タブ・ブックマーク・ホーム画面・デスクトップ保存用アイコン
- robots.txt / sitemap.xml / llms.txt … 検索エンジン・AI検索向け
- _headers（Netlify / Cloudflare Pages 用）または .htaccess（Apache 用）… セキュリティヘッダー
- tools/csp-hash.py … JS編集後にCSPハッシュを更新するスクリプト

## 公開前に必ず行うこと
1. `YOUR-DOMAIN` を実際のドメインに一括置換（index.html / robots.txt / sitemap.xml / llms.txt）
2. FormSubmit の有効化：最初のフォーム送信後、hodoku.management.lab@gmail.com に届く「Activate」メールのリンクをクリック
   - 有効化後に発行されるIDを index.html の `CONFIG.ENDPOINT_ID` に入れると、送信先アドレスをHTMLから隠せます
3. index.html 内の JavaScript を編集した場合は `python3 tools/csp-hash.py index.html` を実行（CSPのハッシュ更新）
4. Google Search Console にサイトを登録し、sitemap.xml を送信

## 注意
- フォームの直接送信は HTTPS でホスティングされた状態でのみ動作します（ローカルで index.html を開いた場合は代替手段が表示されます）
- Google Fonts を読み込むため、訪問者のブラウザが Google のサーバーに接続します。自社サーバーにフォントを置きたい場合はご相談ください

## GitHub Pages で公開する場合
- `.htaccess` と `_headers` は不要です（GitHub Pages は Apache でも Netlify でもないため読み込まれません）。アップロードを省略して構いません
- セキュリティヘッダーのうち CSP は index.html の meta タグで有効です。HSTS / X-Frame-Options 等は GitHub Pages では設定できません（GitHub 側で HTTPS は強制されます）
- `YOUR-DOMAIN` は `https://＜ユーザー名＞.github.io/＜リポジトリ名＞/` に置換してください（独自ドメインを設定する場合はそのドメイン）
- tools/ フォルダは公開不要です。リポジトリに含める場合は robots.txt で除外済みです
- どうしてもドットファイルを Web 画面からアップロードしたい場合：リポジトリの「Add file → Create new file」でファイル名に `.htaccess` と入力し、内容を貼り付けると作成できます
