export async function onRequestPost(context) {
    const { request, env } = context;
    const { email, password } = await request.json();
    const db = env.DB;

    try {
        // ユーザー情報の取得（ソルトと暗号化パスワードを含む）
        const user = await db.prepare('SELECT * FROM user_accounts WHERE email = ?')
            .bind(email)
            .first();

        if (!user) {
            return new Response(JSON.stringify({ message: 'メールアドレスまたはパスワードが間違っています' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 保存されたソルトを使って入力されたパスワードを再暗号化し、比較
        const iterations = 100000;
        const keyLength = 32;

        const derivedKey = await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                hash: 'SHA-256',
                salt: Buffer.from(user.salt, 'utf-8'),
                iterations: iterations
            },
            Buffer.from(password, 'utf-8'),
            { name: 'HMAC', length: keyLength * 8 },
            true,
            ['sign']
        );

        if (derivedKey === user.password) {
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
