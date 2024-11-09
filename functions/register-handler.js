// POSTリクエストを処理する関数をエクスポート
export async function onRequestPost(context) {
    const { request, env } = context; // リクエストと環境変数を取得
    const db = env.DB; // Cloudflare D1データベースへの接続

    try {
        // リクエストからJSONデータを取得
        const { username, email, password, profile_image } = await request.json();

        // 必須フィールドの入力チェック
        if (!username || !email || !password) {
            return new Response(JSON.stringify({ message: "すべての必須フィールドを入力してください。" }), { 
                status: 400, 
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } // CORSヘッダー
            });
        }

        // パスワードをSHA-256でハッシュ化
        const hashedPassword = await hashPassword(password);

        // 新しいユーザー情報をデータベースに挿入
        const query = `
            INSERT INTO user_accounts (username, email, password, profile_image)
            VALUES (?, ?, ?, ?);
        `;
        await db.prepare(query).bind(username, email, hashedPassword, profile_image || null).run(); // データベースに挿入

        // 成功レスポンスを返す
        return new Response(JSON.stringify({ message: "登録が完了しました！" }), { 
            status: 200, 
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } // CORSヘッダー
        });
    } catch (error) {
        // エラーハンドリング
        console.error('登録エラー:', error);

        // エラー内容に応じたメッセージを設定
        const errorMessage = error.message.includes('UNIQUE constraint failed') 
            ? "このメールアドレスは既に登録されています。" 
            : "登録に失敗しました。";

        // エラーレスポンスを返す
        return new Response(JSON.stringify({ message: errorMessage }), { 
            status: 500, 
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } // CORSヘッダー
        });
    }
}

// パスワードをSHA-256でハッシュ化する関数
async function hashPassword(password) {
    const encoder = new TextEncoder(); // テキストエンコーダーを作成
    const data = encoder.encode(password); // パスワードをバイトデータにエンコード
    const hashBuffer = await crypto.subtle.digest('SHA-256', data); // SHA-256でハッシュ化
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // バッファを配列に変換
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // 16進数に変換して結合し、ハッシュ文字列を返す
}
