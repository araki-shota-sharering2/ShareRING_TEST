import { generateUUID } from './utils';
import CryptoJS from "https://cdn.jsdelivr.net/npm/crypto-js@4.1.1/crypto-js.min.js";

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

    // ランダムなソルトを生成
    const salt = CryptoJS.lib.WordArray.random(16).toString();
    
    // パスワードとソルトを組み合わせてSHA-256でハッシュ化
    const saltedPassword = password + salt;
    const hashedPassword = CryptoJS.SHA256(saltedPassword).toString(CryptoJS.enc.Hex);

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
        ).bind(username, email, hashedPassword, profileImageUrl, salt).run();

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
