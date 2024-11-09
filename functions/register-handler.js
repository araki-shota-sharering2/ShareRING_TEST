export async function onRequestPost(context) {
    const { request, env } = context;
    const formData = await request.formData();
    
    const username = formData.get('username');
    const email = formData.get('email');
    const password = formData.get('password');
    const profileImage = formData.get('profile-image');

    if (!username || !email || !password || !profileImage) {
        return new Response('必須項目が入力されていません', { status: 400 });
    }

    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}-${profileImage.name}`;
    const r2Key = `profile-images/${uniqueFileName}`;
    
    try {
        // R2にプロフィール画像をアップロード
        await env.MY_R2_BUCKET.put(r2Key, profileImage.stream(), {
            headers: { 'Content-Type': profileImage.type }
        });

        // プロフィール画像のURLを生成
        const profileImageUrl = `${env.R2_BUCKET_URL}/${r2Key}`;

        // ユーザー情報をD1データベースに保存
        const db = env.DB;
        await db.prepare(
            `INSERT INTO user_accounts (username, email, password, profile_image) 
             VALUES (?, ?, ?, ?)`
        ).bind(username, email, password, profileImageUrl).run();

        return new Response(JSON.stringify({ message: 'User registered successfully' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error during registration:', error);
        return new Response('登録処理中にエラーが発生しました: ' + error.message, { status: 500 });
    }
}
