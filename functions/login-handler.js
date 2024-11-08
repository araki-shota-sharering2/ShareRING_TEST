import bcrypt from 'bcryptjs';
import { DB } from './config';

export default async function handleLogin(request) {
    if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    const { email, password } = await request.json();
    const result = await DB.prepare('SELECT * FROM user_accounts WHERE email = ?').bind(email).first();

    if (!result) {
        return new Response(JSON.stringify({ success: false, message: 'メールアドレスが見つかりません。' }), { status: 404 });
    }

    const isPasswordMatch = await bcrypt.compare(password, result.password);
    if (!isPasswordMatch) {
        return new Response(JSON.stringify({ success: false, message: 'パスワードが間違っています。' }), { status: 401 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
}
