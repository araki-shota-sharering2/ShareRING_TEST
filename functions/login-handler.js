import { generateUUID } from './utils';

export async function onRequestPost(context) {
    const { request, env } = context;
    const { email, password } = await request.json();
    const db = env.DB;

    try {
        // ユーザー情報の照会（平文のパスワードを直接比較）
        const user = await db.prepare('SELECT * FROM user_accounts WHERE email = ? AND password = ?')
            .bind(email, password)
            .first();

        if (user) {
            // ログイン成功、セッションIDの生成
            const sessionId = generateUUID();
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

            // セッション情報をDBに保存
            await db.prepare(`
                INSERT INTO user_sessions (session_id, user_id, expires_at)
                VALUES (?, ?, ?)
            `).bind(sessionId, user.user_id, expiresAt).run();

            return new Response(JSON.stringify({ message: 'ログイン成功' }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Set-Cookie': `session_id=${sessionId}; HttpOnly; Secure; Path=/; Max-Age=86400`
                }
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
