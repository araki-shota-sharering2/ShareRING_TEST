export async function onRequestPost(context) {
    const { env, request } = context;

    // フォームデータを取得
    const formData = await request.formData();
    const username = formData.get('username');
    const email = formData.get('email');
    const password = formData.get('password'); // 現時点では平文のまま保存
    const profileImage = formData.get('profile_image');

    if (!username || !email || !password || !profileImage) {
        return new Response(JSON.stringify({ message: '全てのフィールドを入力してください' }), { status: 400 });
    }

    // タイムスタンプを利用して一意のファイル名を作成
    const timestamp = Date.now();
    const uniqueFileName = `profile-${timestamp}-${profileImage.name}`;
    const r2Key = `profile_images/${uniqueFileName}`;

    try {
        // プロフィール画像をR2にアップロード
        await env.MY_R2_BUCKET.put(r2Key, profileImage.stream(), {
            headers: { 'Content-Type': profileImage.type }
        });

        // 新しいURLを生成
        const profileImageUrl = `https://pub-ae948fe5f8c746a298df11804f9d8839.r2.dev/${r2Key}`;

        // ユーザーデータをD1データベースに保存
        const db = env.DB;
        await db.prepare(`
            INSERT INTO user_accounts (username, email, password, profile_image)
            VALUES (?, ?, ?, ?)
        `).bind(username, email, password, profileImageUrl).run();

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
