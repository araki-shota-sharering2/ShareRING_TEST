import { generateUUID } from './utils';
import { crypto } from 'crypto';

export async function onRequestPost(context) {
    const { request, env } = context;
    const { email, password } = await request.json();
    const db = env.DB;

    try {
        // 平文パスワードが保存されているかをチェック
        const user = await db.prepare('SELECT * FROM user_accounts WHERE email = ?')
            .bind(email)
            .first();

        if (user) {
            if (!user.salt) {
                // ソルトがない場合は、平文パスワードが保存されている可能性があるので暗号化処理を行う
                const salt = crypto.randomUUID();
                const iterations = 100000;
                const keyLength = 32;

                const hashedPassword = await crypto.subtle.deriveKey(
                    {
                        name: 'PBKDF2',
                        hash: 'SHA-256',
                        salt: Buffer.from(salt, 'utf-8'),
                        iterations: iterations
                    },
                    Buffer.from(password, 'utf-8'),
                    { name: 'HMAC', length: keyLength * 8 },
                    true,
                    ['sign']
                );

                // 暗号化されたパスワードとソルトを再保存
                await db.prepare(
                    `UPDATE user_accounts SET password = ?, salt = ? WHERE user_id = ?`
                ).bind(hashedPassword, salt, user.user_id).run();
                
                user.password = hashedPassword;  // 更新後のパスワードで上書き
                user.salt = salt; // 更新後のソルトで上書き
            }

            // 暗号化済みパスワードの検証
            const derivedKey = await crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    hash: 'SHA-256',
                    salt: Buffer.from(user.salt, 'utf-8'),
                    iterations: 100000
                },
                Buffer.from(password, 'utf-8'),
                { name: 'HMAC', length: 32 * 8 },
                true,
                ['sign']
            );

            if (derivedKey === user.password) {
                // ログイン成功
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
        } else {
            // ユーザーが見つからない場合
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
