export async function onRequestPost(context) {
    const { request, env } = context;
    const { email, password } = await request.json();
    const db = env.DB;

    try {
        // ユーザー情報の確認（メールアドレスとパスワードの照合）
        const user = await db.prepare('SELECT * FROM user_accounts WHERE email = ? AND password = ?')
            .bind(email, password)
            .first();

        if (user) {
            // ユーザーが存在する場合、アカウントを削除
            await db.prepare('DELETE FROM user_accounts WHERE user_id = ?')
                .bind(user.user_id)
                .run();

            return new Response(JSON.stringify({ message: 'アカウントが正常に削除されました' }), {
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
