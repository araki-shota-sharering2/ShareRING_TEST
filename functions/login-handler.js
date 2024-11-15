import { generateUUID } from './utils';
import { crypto } from 'crypto';

export async function onRequestPost(context) {
    const { request, env } = context;
    const { email, password } = await request.json();
    const db = env.DB;

    try {
        const user = await db.prepare('SELECT * FROM user_accounts WHERE email = ?').bind(email).first();

        if (user) {
            const keyMaterial = await crypto.subtle.importKey(
                "raw",
                new TextEncoder().encode(password),
                { name: "PBKDF2" },
                false,
                ["deriveBits"]
            );

            const derivedKeyBuffer = await crypto.subtle.deriveBits(
                {
                    name: "PBKDF2",
                    hash: "SHA-256",
                    salt: new TextEncoder().encode(user.salt),
                    iterations: 100000
                },
                keyMaterial,
                32 * 8
            );

            const derivedKeyHex = Buffer.from(derivedKeyBuffer).toString('hex');

            if (derivedKeyHex === user.password) {
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
