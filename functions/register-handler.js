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

    // ソルトを生成
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');

    // ソルトとパスワードを結合し、SHA-256でハッシュ化
    const encoder = new TextEncoder();
    const data = encoder.encode(password + saltHex);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashedPassword = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    // プロフィール画像のアップロード処理
    const timestamp = Date.now();
    const uniqueFileName = `profile-${timestamp}-${profileImage.name}`;
    const r2Key = `profile_images/${uniqueFileName}`;

    try {
        await env.MY_R2_BUCKET.put(r2Key, profileImage.stream(), {
            headers: { 'Content-Type': profileImage.type }
        });

        const profileImageUrl = `https://pub-ae948fe5f8c746a298df11804f9d8839.r2.dev/${r2Key}`;

        // ハッシュ化されたパスワードとソルトをデータベースに保存
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
