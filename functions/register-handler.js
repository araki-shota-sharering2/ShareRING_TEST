export async function onRequest(context) {
    if (context.request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    const { request, env } = context;
    const db = env.DB;
    const { username, email, password } = await request.json();

    const existingUser = await db.prepare('SELECT * FROM user_accounts WHERE email = ?').bind(email).first();
    if (existingUser) {
        return new Response(JSON.stringify({ success: false, message: 'このメールアドレスは既に使用されています。' }), { status: 400 });
    }

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.prepare('INSERT INTO user_accounts (username, email, password) VALUES (?, ?, ?)')
        .bind(username, email, hashedPassword).run();

    return new Response(JSON.stringify({ success: true }), { status: 200 });
}
