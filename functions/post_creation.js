export async function onRequestPost(context) {
    const { request, env } = context;
    const db = env.DB;

    try {
        // リクエストヘッダーからクッキーを取得
        const cookieHeader = request.headers.get("Cookie");
        if (!cookieHeader) {
            return new Response(JSON.stringify({ success: false, error: "認証情報が見つかりません。" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        // セッションIDを抽出
        const cookies = Object.fromEntries(
            cookieHeader.split("; ").map((c) => c.split("=").map(decodeURIComponent))
        );
        const sessionId = cookies.session_id;

        if (!sessionId) {
            return new Response(JSON.stringify({ success: false, error: "セッションIDが見つかりません。" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        // セッションからユーザー情報を取得
        const session = await db
            .prepare("SELECT user_id FROM user_sessions WHERE session_id = ? AND expires_at > CURRENT_TIMESTAMP")
            .bind(sessionId)
            .first();

        if (!session) {
            return new Response(JSON.stringify({ success: false, error: "セッションが無効または期限切れです。" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        const user_id = session.user_id;

        // リクエストボディから投稿データを取得
        const postData = await request.json();
        const { caption, location, image_url, ring_color } = postData;

        if (!image_url || !location) {
            return new Response(JSON.stringify({ success: false, error: "必要なデータが不足しています。" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const { latitude, longitude, name } = location;

        // 投稿データを挿入
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
                name || null
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
