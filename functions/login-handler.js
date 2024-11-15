import { generateUUID } from './utils';

export async function onRequestPost(context) {
    const { request, env } = context;
    const { email, password } = await request.json();
    const db = env.DB;

    try {
        // ユーザー情報の取得
        const user = await db.prepare('SELECT * FROM user_accounts WHERE email = ?')
            .bind(email)
            .first();

        if (!user) {
            // ユーザーが存在しない場合
            return new Response(JSON.stringify({ message: 'メールアドレスまたはパスワードが間違っています' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 保存されたソルトを使って入力されたパスワードをハッシュ化し、検証
        const encoder = new TextEncoder();
        const data = encoder.encode(password + user.salt);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashedInputPassword = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

        if (hashedInputPassword === user.password) {
            // ログイン成功処理
            const sessionId = generateUUID();
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

            await db.prepare(
                `INSERT INTO user_sessions (session_id, user_id, expires_at)
                VALUES (?, ?, ?)`
            ).bind(sessionId, user.user_id, expiresAt).run();

            return new Response(JSON.stringify({ message: 'ログイン成功' }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Set-Cookie': `session_id=${sessionId}; HttpOnly; Secure; Path=/; Max-Age=86400`
                }
            });
        } else {
            // パスワードが一致しない場合
            return new Response(JSON.stringify({ message: 'メールアドレスまたはパスワードが間違っています' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    } catch (error) {
        console.error('ログイン中のサーバーエラー:', error);
        return new Response(JSON.stringify({ message: 'サーバーエラーが発生しました' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
