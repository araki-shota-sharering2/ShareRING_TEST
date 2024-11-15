import { generateUUID } from './utils';

// パスワードのハッシュを検証するための関数
async function hashPassword(password, salt) {
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    const saltData = encoder.encode(salt);

    const key = await crypto.subtle.importKey(
        'raw',
        passwordData,
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
    );

    const derivedKey = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: saltData,
            iterations: 100000,
            hash: 'SHA-256'
        },
        key,
        256
    );

    return Buffer.from(derivedKey).toString('hex');
}

export async function onRequestPost(context) {
    const { request, env } = context;
    const { email, password } = await request.json();
    const db = env.DB;

    try {
        // ユーザー情報の取得（ソルトも含む）
        const user = await db.prepare('SELECT * FROM user_accounts WHERE email = ?')
            .bind(email)
            .first();

        if (user) {
            // 入力されたパスワードを取得したソルトでハッシュ化
            const hashedInputPassword = await hashPassword(password, user.salt);

            if (hashedInputPassword === user.password) {
                // セッションIDの生成
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
                return new Response(JSON.stringify({ message: 'メールアドレスまたはパスワードが間違っています' }), {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
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
