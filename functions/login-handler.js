import bcrypt from 'bcryptjs';
import { DB } from './config'; // Cloudflare D1 データベース接続設定

export default async function handleLogin(request) {
    const { email, password } = await request.json();

    // ユーザーのメールアドレスをデータベースから検索
    const result = await DB.prepare('SELECT * FROM user_accounts WHERE email = ?').bind(email).first();

    if (!result) {
        return new Response(JSON.stringify({ success: false, message: 'メールアドレスが見つかりません。' }), { status: 404 });
    }

    // パスワードの照合
    const isPasswordMatch = await bcrypt.compare(password, result.password);
    if (!isPasswordMatch) {
        return new Response(JSON.stringify({ success: false, message: 'パスワードが間違っています。' }), { status: 401 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
}
