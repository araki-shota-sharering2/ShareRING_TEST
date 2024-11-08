export default async function handleRegister(request) {
    if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    try {
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
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ success: false, message: 'サーバーエラーが発生しました。' }), { status: 500 });
    }
}
