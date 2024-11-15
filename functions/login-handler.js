import CryptoJS from "https://cdn.jsdelivr.net/npm/crypto-js@4.1.1/crypto-js.min.js";

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
            return new Response(JSON.stringify({ message: 'メールアドレスまたはパスワードが間違っています' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 保存されたソルトを使って入力されたパスワードをハッシュ化し、比較
        const saltedPassword = password + user.salt;
        const hashedInputPassword = CryptoJS.SHA256(saltedPassword).toString(CryptoJS.enc.Hex);

        if (hashedInputPassword === user.password) {
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
