import { generateUUID } from './utils';
import { crypto } from 'crypto';

export async function onRequestPost(context) {
    const { env, request } = context;
    const formData = await request.formData();
    const username = formData.get('username');
    const email = formData.get('email');
    const password = formData.get('password');
    const profileImage = formData.get('profile_image');

    if (!username || !email || !password || !profileImage) {
        return new Response(JSON.stringify({ message: '全てのフィールドを入力してください' }), { status: 400 });
    }

    const salt = crypto.randomUUID(); // ソルトの生成
    const iterations = 100000;
    const keyLength = 32;

    // PBKDF2を使用してパスワードを暗号化
    const hashedPassword = crypto.subtle.deriveKey(
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

    const db = env.DB;

    try {
        await db.prepare(
            `INSERT INTO user_accounts (username, email, password, profile_image, salt)
            VALUES (?, ?, ?, ?, ?)`
        ).bind(username, email, hashedPassword, profileImageUrl, salt).run();

        return new Response(JSON.stringify({ message: 'ユーザーが正常に登録されました' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('登録中のエラー:', error);
        return new Response(JSON.stringify({ message: '登録に失敗しました', error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
