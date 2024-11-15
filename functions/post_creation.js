export async function onRequestPost(context) {
    const { request, env } = context;
    const db = env.DB;

    try {
        const postData = await request.json();
        const { user_id, caption, location, image_url, ring_color } = postData;

        if (!user_id || !image_url || !location) {
            return new Response(JSON.stringify({ success: false, error: "必要なデータが不足しています。" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const { latitude, longitude } = location;

        const result = await db
            .prepare(
                `INSERT INTO user_posts (user_id, image_url, caption, location, ring_color, address) 
                 VALUES (?, ?, ?, ?, ?, ?)`
            )
            .bind(
                user_id,
                image_url,
                caption || null,
                `POINT(${longitude} ${latitude})`,
                ring_color || "#4e5c94",
                location.name || null
            )
            .run();

        return new Response(JSON.stringify({ success: true, post_id: result.meta.last_row_id }), {
            status: 201,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("投稿処理中のエラー:", error);
        return new Response(JSON.stringify({ success: false, error: "投稿処理中にエラーが発生しました。" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
