# ほどく経営研究所 Webサイト — 公開手順と編集の手引き

## フォルダ構成

```
netlify.toml        Netlify への指示（「site フォルダだけを公開する」）
site/               公開されるファイル一式 ← サイト本体
  index.html          ページ本体（文章の編集はこのファイル）
  404.html            存在しないURLに表示されるページ
  assets/css/site.css デザイン
  assets/js/app.js    冒頭の糸・目次・フォームの動き
  assets/fonts/       文字（自前で配信。外部サービスは使いません）
  assets/img/         ロゴ・顔写真・プロダクトのアイコン
  _headers            セキュリティ用のHTTPヘッダー
  _redirects          公開不要ファイルの遮断・security.txt の配置
  robots.txt / sitemap.xml / llms.txt / security.txt / site.webmanifest / favicon 類 / ogp.png
docs/               手順書・監査レポート（公開されません）
```

## 公開の手順（GitHub → Netlify）

1. GitHub のリポジトリを開き、**いまあるファイルをすべて削除**します（README.md・tools フォルダなど、以前の構成のものを残さないため）。
2. この zip を展開してできた **中身すべて（netlify.toml・site・docs）を、リポジトリの直下にアップロード**します。フォルダごとドラッグ＆ドロップで構いません。
3. Netlify が自動で公開し直します。`netlify.toml` の指定により、公開されるのは `site` フォルダの中身だけです。
4. 公開後、次の4点を確認してください。
   - `https://hodoku-management-lab.kaoru-furubayashi.com/` が新しいデザインで表示される
   - `…/README.md` と `…/tools/csp-hash.py` を開くと「お探しのページは、見つかりませんでした。」になる
   - お問い合わせフォームからテスト送信し、メールが届く
   - `…/.well-known/security.txt` が表示される

> Netlify にフォルダを直接ドラッグして公開している場合は、**`site` フォルダ**をドロップしてください（zip 全体ではなく）。

## 文章を書き換えるとき

- 編集するのは `site/index.html` だけです。文字を書き換えて上書きアップロードすれば反映されます。
- 以前あった「JavaScript を触ったら CSP のハッシュを再計算する」作業は**不要になりました**（スクリプトとデザインを別ファイルに分けたため）。
- 冒頭の絡まりに添えている課題の例は、`index.html` の `<ul class="issues">` の6行です。スマホでは先頭4つが表示されます。1行10文字前後に収めると崩れません。
- 新しい漢字を使っても、必要な文字データは自動で読み込まれます（JIS第1水準の範囲）。
- **`index.html` の中に `style="…"` や `<script>…</script>` を直接書かないでください。** セキュリティ設定（CSP）により無視されます。見た目の変更は `site.css` で行います。
- `site.css` や `app.js` を書き換えたときは、`index.html` 内の `?v=20261114` の数字を変えると、訪問者のブラウザに古い版が残りません。

## お問い合わせフォームについて

現在は、これまでと同じ **FormSubmit**（formsubmit.co）経由で `hodoku.management.lab` のGmailに届きます。

### 推奨：宛先アドレスをコードから隠す（5分）

FormSubmit の有効化メールに記載されている英数字のID（ランダム文字列）を、`index.html` の

```html
data-formsubmit-id=""
```

の `""` の中に貼り付けてください。送信先のURLからメールアドレスが消えます。

### より堅牢にする場合：Netlify Forms への切り替え

第三者（FormSubmit）を経由せず、ホスティング元の Netlify で受け付ける方式です。フォーム側の準備は済んでいます。

1. Netlify の管理画面で、このサイトの **Forms** を開き、フォームの検出（form detection）を有効にする
2. サイトを再デプロイする（Forms に `contact` というフォームが現れます）
3. Forms の通知設定で、メール通知の宛先を登録する
4. `index.html` の `data-transport="formsubmit"` を `data-transport="netlify"` に変える
5. テスト送信して届くことを確認したら、`site/_headers` と `index.html` 冒頭の `Content-Security-Policy` から ` https://formsubmit.co` を削除し、「個人情報の取り扱いについて」の「送信の経路」の文を実態に合わせて直す

※ Netlify の画面の名称は変わることがあります。手順 1〜3 は Netlify の最新の案内をご確認ください。

## 手元で確認するとき

`site/index.html` をダブルクリックして開けば、デザインと動きを確認できます。フォームの送信だけは、公開後（HTTPS）でないと動きません。その場合は代替の送信手段が表示されます。

## 使用している書体

Shippori Mincho（しっぽり明朝）／Zen Kaku Gothic New／Cormorant Garamond。いずれも SIL Open Font License 1.1 です。ライセンス文は `site/assets/fonts/OFL.txt` に同梱しています。
