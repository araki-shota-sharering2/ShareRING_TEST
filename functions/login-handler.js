export async function onRequest(context) {
    if (context.request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    const { request, env } = context;
    const db = env.DB;
    const { email, password } = await request.json();

    const result = await db.prepare('SELECT * FROM user_accounts WHERE email = ?').bind(email).first();
    if (!result) {
        return new Response(JSON.stringify({ success: false, message: 'メールアドレスが見つかりません。' }), { status: 404 });
    }

    const bcrypt = require('bcryptjs');
    const isPasswordMatch = await bcrypt.compare(password, result.password);
    if (!isPasswordMatch) {
        return new Response(JSON.stringify({ success: false, message: 'パスワードが間違っています。' }), { status: 401 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
}
