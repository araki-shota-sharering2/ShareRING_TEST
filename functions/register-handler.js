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

    const salt = crypto.randomUUID(); // ソルトを生成
    const iterations = 100000;
    const keyLength = 32;

    // PBKDF2でパスワードを暗号化
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits"]
    );

    const hashBuffer = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            hash: "SHA-256",
            salt: new TextEncoder().encode(salt),
            iterations: iterations
        },
        keyMaterial,
        keyLength * 8
    );

    const hashedPassword = Buffer.from(hashBuffer).toString('hex');

    // プロフィール画像のアップロード処理
    const timestamp = Date.now();
    const uniqueFileName = `profile-${timestamp}-${profileImage.name}`;
    const r2Key = `profile_images/${uniqueFileName}`;

    try {
        await env.MY_R2_BUCKET.put(r2Key, profileImage.stream(), {
            headers: { 'Content-Type': profileImage.type }
        });
        
        const profileImageUrl = `https://pub-ae948fe5f8c746a298df11804f9d8839.r2.dev/${r2Key}`;

        // 暗号化済みパスワード、ソルト、その他の情報をデータベースに保存
        const db = env.DB;
        await db.prepare(
            `INSERT INTO user_accounts (username, email, password, salt, profile_image)
            VALUES (?, ?, ?, ?, ?)`
        ).bind(username, email, hashedPassword, salt, profileImageUrl).run();

        return new Response(JSON.stringify({ message: 'ユーザーが正常に登録されました', profileImageUrl }), {
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
