// パスワードをPBKDF2を使ってハッシュ化するための関数
async function hashPassword(password, salt) {
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    const saltData = encoder.encode(salt);

    const key = await crypto.subtle.importKey(
        'raw',
        passwordData,
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
    );

    const derivedKey = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: saltData,
            iterations: 100000,
            hash: 'SHA-256'
        },
        key,
        256
    );

    return Buffer.from(derivedKey).toString('hex');
}

export async function onRequestPost(context) {
    const { env, request } = context;

    // フォームデータを取得
    const formData = await request.formData();
    const username = formData.get('username');
    const email = formData.get('email');
    const password = formData.get('password');
    const profileImage = formData.get('profile_image');

    if (!username || !email || !password || !profileImage) {
        return new Response(JSON.stringify({ message: '全てのフィールドを入力してください' }), { status: 400 });
    }

    // ランダムなソルトを生成
    const saltArray = new Uint8Array(16);
    crypto.getRandomValues(saltArray);
    const salt = Array.from(saltArray).map(b => b.toString(16).padStart(2, '0')).join('');

    // パスワードをハッシュ化
    const hashedPassword = await hashPassword(password, salt);

    // プロフィール画像のアップロード準備
    const timestamp = Date.now();
    const uniqueFileName = `profile-${timestamp}-${profileImage.name}`;
    const r2Key = `profile_images/${uniqueFileName}`;
    const profileImageUrl = `https://example.r2.dev/${r2Key}`;

    try {
        // プロフィール画像をR2にアップロード
        await env.MY_R2_BUCKET.put(r2Key, profileImage.stream(), {
            headers: { 'Content-Type': profileImage.type }
        });

        // ユーザーデータをD1データベースに保存
        const db = env.DB;
        await db.prepare(`
            INSERT INTO user_accounts (username, email, password, salt, profile_image)
            VALUES (?, ?, ?, ?, ?)
        `).bind(username, email, hashedPassword, salt, profileImageUrl).run();

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
