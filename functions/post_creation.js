import { generateUUID } from './utils';

export async function onRequestPost(context) {
    const { env, request } = context;
    const formData = await request.formData();
    
    const caption = formData.get('caption');
    const location = JSON.parse(formData.get('location'));
    const imageFile = formData.get('image');
    const ringColor = formData.get('ring_color') || '#4e5c94';

    // クッキーからセッションIDを取得
    const cookieHeader = request.headers.get("Cookie");
    const cookies = Object.fromEntries(
        cookieHeader.split("; ").map((c) => c.split("=").map(decodeURIComponent))
    );
    const sessionId = cookies.session_id;

    if (!sessionId || !imageFile || !location) {
        return new Response(JSON.stringify({ message: "セッションID、画像、位置情報が不足しています。" }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        // セッションを検証してユーザー情報を取得
        const db = env.DB;
        const session = await db
            .prepare("SELECT user_id FROM user_sessions WHERE session_id = ? AND expires_at > CURRENT_TIMESTAMP")
            .bind(sessionId)
            .first();

        if (!session) {
            return new Response(JSON.stringify({ message: "セッションが無効または期限切れです。" }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const user_id = session.user_id;

        // R2に画像をアップロード
        const timestamp = Date.now();
        const uniqueFileName = `post-${user_id}-${timestamp}-${generateUUID()}`;
        const r2Key = `user_posts/${uniqueFileName}`;
        const bucket = env.MY_R2_BUCKET;

        await bucket.put(r2Key, imageFile.stream(), {
            headers: { 'Content-Type': imageFile.type },
        });

        const imageUrl = `https://pub-ae948fe5f8c746a298df11804f9d8839.r2.dev/${r2Key}`;

        // データベースに投稿データを保存
        const { latitude, longitude, name } = location;

        const result = await db
            .prepare(
                `INSERT INTO user_posts (user_id, image_url, caption, location, ring_color, address) 
                 VALUES (?, ?, ?, ?, ?, ?)`
            )
            .bind(
                user_id,
                imageUrl,
                caption || null,
                `POINT(${longitude} ${latitude})`,
                ringColor,
                name || null
            )
            .run();

        return new Response(JSON.stringify({ success: true, post_id: result.meta.last_row_id, imageUrl }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error("投稿処理中のエラー:", error);
        return new Response(JSON.stringify({ message: "投稿処理中にエラーが発生しました。", error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
