import { generateUUID } from './utils';
import crypto from 'crypto';

export async function onRequestPost(context) {
    const { request, env } = context;
    const { email, password } = await request.json();
    const db = env.DB;

    try {
        const user = await db.prepare(`SELECT * FROM user_accounts WHERE email = ?`)
            .bind(email)
            .first();

        if (user) {
            const hashedInputPassword = await crypto.subtle.importKey(
                'raw',
                new TextEncoder().encode(password + user.salt),
                { name: 'PBKDF2' },
                false,
                ['deriveBits']
            ).then(key => crypto.subtle.deriveBits(
                { name: 'PBKDF2', salt: new TextEncoder().encode(user.salt), iterations: 100000, hash: 'SHA-256' },
                key,
                256
            ));

            const encodedInputPassword = Buffer.from(new Uint8Array(hashedInputPassword)).toString('hex');

            if (encodedInputPassword === user.password) {
                const sessionId = generateUUID();
                await db.prepare(
                    `INSERT INTO user_sessions (session_id, user_id) VALUES (?, ?)`
                ).bind(sessionId, user.user_id).run();

                return new Response(JSON.stringify({ message: 'Login successful' }), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Set-Cookie': `session_id=${sessionId}; HttpOnly; Secure; Path=/; Max-Age=86400`
                    }
                });
            } else {
                return new Response(JSON.stringify({ message: 'Invalid email or password' }), {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        } else {
            return new Response(JSON.stringify({ message: 'Invalid email or password' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    } catch (error) {
        console.error('Database error:', error);
        return new Response(JSON.stringify({ message: 'Server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
