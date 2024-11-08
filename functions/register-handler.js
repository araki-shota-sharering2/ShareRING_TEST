import bcrypt from 'bcryptjs';
import { DB } from './config';

export default async function handleRegister(request) {
    const { username, email, password } = await request.json();

    // メールが既に使用されていないか確認
    const existingUser = await DB.prepare('SELECT * FROM user_accounts WHERE email = ?').bind(email).first();
    if (existingUser) {
        return new Response(JSON.stringify({ success: false, message: 'このメールアドレスは既に使用されています。' }), { status: 400 });
    }

    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);

    // ユーザー情報をデータベースに挿入
    await DB.prepare('INSERT INTO user_accounts (username, email, password) VALUES (?, ?, ?)')
        .bind(username, email, hashedPassword).run();

    return new Response(JSON.stringify({ success: true }), { status: 200 });
}
