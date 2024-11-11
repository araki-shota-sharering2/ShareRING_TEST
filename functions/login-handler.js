import jwt from 'jsonwebtoken';

const SECRET_KEY = 'sharering_token';

export async function onRequestPost(context) {
    const { request, env } = context;
    const { email, password } = await request.json();

    const db = env.DB;

    try {
        const user = await db.prepare('SELECT * FROM user_accounts WHERE email = ?').bind(email).first();

        if (user && user.password === password) {  // パスワードをハッシュ化して比較することが推奨されます
            // JWTトークンを生成（例としてuser_idをペイロードに含める）
            const token = jwt.sign({ userId: user.user_id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });

            // クッキーにトークンを設定してレスポンスを返す
            return new Response(JSON.stringify({ message: 'ログイン成功' }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Set-Cookie': `token=${token}; HttpOnly; Path=/; Max-Age=3600`
                }
            });
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
