ShareRING
│
├── index.html                  // メインエントリーポイント、初回アクセス時に表示される画面
├── styles.css                  // アプリ全体で使用する共通のCSSスタイル
├── scripts.js                  // アプリ全体で使用する共通のJavaScript
│
├── login                       // ログイン画面ディレクトリ
│   ├── login.html              // ログイン画面
│   ├── login.css               // ログイン画面専用のスタイル
│   └── login.js                // ログイン機能に関するJavaScript
│
├── home                        // ホーム画面ディレクトリ
│   ├── home.html               // ホーム画面、他の画面へのナビゲーションボタン配置
│   ├── home.css                // ホーム画面専用のスタイル
│   └── home.js                 // ホーム画面の機能に関するJavaScript
│
├── my_page                     // マイページ画面ディレクトリ
│   ├── my_page.html            // ログインユーザー情報を表示するマイページ
│   ├── my_page.css             // マイページのスタイル
│   └── my_page.js              // ユーザー情報の表示と編集機能を管理するJavaScript
│
├── notifications               // 通知画面ディレクトリ
│   ├── notifications.html      // 通知一覧を表示する画面
│   ├── notifications.css       // 通知画面のスタイル
│   └── notifications.js        // 通知データの取得・表示のためのスクリプト
│
├── post_viewing                // 投稿閲覧画面ディレクトリ
│   ├── post_viewing.html       // 投稿詳細を表示する画面
│   ├── post_viewing.css        // 投稿閲覧画面のスタイル
│   └── post_viewing.js         // 投稿データを表示・管理するスクリプト
│
├── post_creation               // 投稿作成画面ディレクトリ
│   ├── post_creation.html      // 新規投稿を行うための画面
│   ├── post_creation.css       // 投稿作成画面のスタイル
│   └── post_creation.js        // 投稿内容の入力・送信を処理するスクリプト
│
├── ring_navi                   // RING-NAVI（おすすめスポット）画面ディレクトリ
│   ├── ring_navi.html          // おすすめスポットを表示する画面
│   ├── ring_navi.css           // RING-NAVIのスタイル
│   └── ring_navi.js            // おすすめスポットのデータ取得・表示処理
│
├── achievements                // アチーブメント画面ディレクトリ
│   ├── achievements.html       // アチーブメントのリストを表示する画面
│   ├── achievements.css        // アチーブメント画面のスタイル
│   └── achievements.js         // アチーブメントの取得・管理のためのスクリプト
│
├── fitness                     // FITNESS画面ディレクトリ
│   ├── fitness.html            // Google FIT APIと連携したフィットネスデータを表示する画面
│   ├── fitness.css             // FITNESS画面のスタイル
│   └── fitness.js              // Google FIT APIを利用したデータ取得処理
│
├── my_map                      // MYMAP画面ディレクトリ
│   ├── my_map.html             // Google Maps APIを使った地図表示画面
│   ├── my_map.css              // MYMAP画面のスタイル
│   └── my_map.js               // Google Maps APIと連携した地図表示機能
│
├── ring_keeper                 // RINGkeeper画面ディレクトリ
│   ├── ring_keeper.html        // 保存した投稿のリストを表示する画面
│   ├── ring_keeper.css         // RINGkeeperのスタイル
│   └── ring_keeper.js          // 保存した投稿の管理と表示のためのスクリプト
│
├── group                       // グループ画面ディレクトリ
│   ├── group.html              // グループを作成し、投稿を共有する画面
│   ├── group.css               // グループ画面のスタイル
│   └── group.js                // グループ作成や投稿管理機能
│
├── my_ring                     // MYRING画面ディレクトリ
│   ├── my_ring.html            // 自身の投稿の一覧を表示する画面
│   ├── my_ring.css             // MYRING画面のスタイル
│   └── my_ring.js              // 自身の投稿を表示・管理するスクリプト
│
├── assets                      // アセット（画像やフォントなど）
│   ├── images                  // アプリ内で使用する画像やアイコン
│   └── fonts                   // アプリで使用するカスタムフォント（必要な場合）
│
├── config                      // 設定ディレクトリ
│   └── config.js               // APIキーなどの設定ファイル
│
├── apis                        // API連携用のスクリプト
│   ├── google_fit_api.js       // Google FIT APIと連携するスクリプト
│   └── google_maps_api.js      // Google Maps APIと連携するスクリプト
│
├── wrangler.toml               // Cloudflare Workers用の設定ファイル
│
└── functions                   // Cloudflare Functionsを管理するディレクトリ
    ├── upload-photo.js         // 画像アップロード処理を行う関数
    ├── login-handler.js        // ログイン処理を行う関数
    └── index.js                // 他のエンドポイント用の関数
