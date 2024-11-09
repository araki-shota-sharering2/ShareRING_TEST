export async function onRequestPost(context) {
    const { request, env } = context;
    const db = env.DB;

    try {
        // リクエストからデータを取得
        const { username, email, password, profile_image } = await request.json();

        // 基本的な入力チェック
        if (!username || !email || !password) {
            return new Response(JSON.stringify({ message: "すべての必須フィールドを入力してください。" }), { 
                status: 400, 
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
        }

        // パスワードをSHA-256でハッシュ化
        const hashedPassword = await hashPassword(password);

        // データベースに新しいユーザーを挿入
        const query = `
            INSERT INTO user_accounts (username, email, password, profile_image)
            VALUES (?, ?, ?, ?);
        `;
        await db.prepare(query).bind(username, email, hashedPassword, profile_image || null).run();

        return new Response(JSON.stringify({ message: "登録が完了しました！" }), { 
            status: 200, 
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    } catch (error) {
        console.error('登録エラー:', error);

        // データベースの一意制約違反など、エラーメッセージを詳しく返す
        const errorMessage = error.message.includes('UNIQUE constraint failed') 
            ? "このメールアドレスは既に登録されています。" 
            : "登録に失敗しました。";

        return new Response(JSON.stringify({ message: errorMessage }), { 
            status: 500, 
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }
}

// パスワードをSHA-256でハッシュ化する関数
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
