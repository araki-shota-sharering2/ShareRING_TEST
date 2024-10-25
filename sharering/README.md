ファイル構成
sharering/
├── client/                      # フロントエンド (React)
│   ├── public/
│   │   ├── index.html
│   │   └── CNAME                # ドメイン名を指定する
│   ├── src/
│   │   ├── assets/              # 画像、CSS、その他静的ファイル
│   │   ├── components/          # 再利用可能なUIコンポーネント
│   │   ├── pages/               # 各ページコンポーネント
│   │   ├── services/            # API通信やロジックをまとめたサービスファイル
│   │   ├── App.js               # アプリのメインコンポーネント
│   │   └── index.js             # エントリーポイント
│   ├── package.json
│   └── README.md
├── server/                      # バックエンド (Cloudflare Workers + D1)
│   ├── src/
│   │   ├── controllers/         # リクエストを処理するコントローラ
│   │   ├── models/              # データベースモデル
│   │   ├── routes/              # ルーティング設定
│   │   ├── middlewares/         # 認証やエラーハンドリングのミドルウェア
│   │   └── config/              # 設定ファイル (D1接続情報など)
│   ├── workers/
│   │   ├── index.js             # Workersエントリーポイント
│   │   └── d1-connector.js      # D1データベース接続ロジック
│   ├── wrangler.toml            # Wrangler設定ファイル（Cloudflare Workers 用）
│   └── README.md
├── .gitignore
├── README.md
└── package.json                 # プロジェクト全体の依存関係
