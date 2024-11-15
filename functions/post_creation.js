import { DB } from '@cloudflare/d1';

export async function onRequestPost({ request, env }) {
    try {
        const data = await request.json();

        // 必要なデータが含まれているかチェック
        if (!data.user_id || !data.image_url || !data.location || !data.ring_color || !data.address) {
            return new Response(JSON.stringify({ success: false, error: "不正なデータです" }), { status: 400 });
        }

        // データベースに投稿を挿入
        const { user_id, image_url, caption, location, ring_color, address } = data;
        const createdAt = new Date().toISOString(); // 作成日時

        const query = `
            INSERT INTO user_posts (user_id, image_url, caption, location, created_at, ring_color, address)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const result = await env.DB.prepare(query)
            .bind(user_id, image_url, caption, location, createdAt, ring_color, address)
            .run();

        // 挿入が成功した場合のレスポンス
        return new Response(JSON.stringify({ success: true, post_id: result.lastInsertRowId }), { status: 200 });
    } catch (error) {
        console.error("サーバーエラー:", error);
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }
}
