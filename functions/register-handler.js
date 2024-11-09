export async function onRequestPost(context) {
    const { request, env } = context;
    const db = env.DB;

    try {
        // リクエストからデータを取得
        const { username, email, password, profile_image } = await request.json();

        // bcryptを使用してパスワードをハッシュ化
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 10);

        // データベースに新しいユーザーを挿入
        const query = `
            INSERT INTO user_accounts (username, email, password, profile_image)
            VALUES (?, ?, ?, ?);
        `;
        await db.prepare(query).bind(username, email, hashedPassword, profile_image).run();

        return new Response(JSON.stringify({ message: "登録が完了しました！" }), { 
            status: 200, 
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    } catch (error) {
        console.error('登録エラー:', error);
        return new Response(JSON.stringify({ message: "登録に失敗しました。" }), { 
            status: 500, 
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }
}
