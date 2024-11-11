export async function onRequestPost(context) {
    const { request, env } = context;
    const { email, password } = await request.json();

    const db = env.DB;

    try {
        // ユーザー情報の照会
        const user = await db.prepare('SELECT * FROM user_accounts WHERE email = ? AND password = ?')
            .bind(email, password)
            .first();

        if (user) {
            // ログイン成功
            return new Response(JSON.stringify({ message: 'ログイン成功' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            // 認証エラー
            return new Response(JSON.stringify({ message: 'メールアドレスまたはパスワードが間違っています' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    } catch (error) {
        console.error('データベースエラー:', error);
        return new Response(JSON.stringify({ message: 'サーバーエラー' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
