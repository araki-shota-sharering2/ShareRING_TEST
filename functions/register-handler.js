import { generateUUID } from './utils';

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

    // ソルトの生成
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iterations = 100000;
    const keyLength = 32;

    // パスワードの暗号化
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits", "deriveKey"]
    );

    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: iterations,
            hash: "SHA-256"
        },
        keyMaterial,
        keyLength * 8
    );

    const hashedPassword = Buffer.from(derivedBits).toString('hex');
    const saltHex = Buffer.from(salt).toString('hex');

    // プロフィール画像のアップロード処理
    const timestamp = Date.now();
    const uniqueFileName = `profile-${timestamp}-${profileImage.name}`;
    const r2Key = `profile_images/${uniqueFileName}`;
    
    try {
        await env.MY_R2_BUCKET.put(r2Key, profileImage.stream(), {
            headers: { 'Content-Type': profileImage.type }
        });
        
        const profileImageUrl = `https://pub-ae948fe5f8c746a298df11804f9d8839.r2.dev/${r2Key}`;

        // 暗号化されたパスワードとソルトをデータベースに保存
        const db = env.DB;
        await db.prepare(
            `INSERT INTO user_accounts (username, email, password, profile_image, salt)
            VALUES (?, ?, ?, ?, ?)`
        ).bind(username, email, hashedPassword, profileImageUrl, saltHex).run();

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
