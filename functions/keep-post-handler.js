export async function onRequestPost(context) {
    const { env, request } = context;

    try {
        // CookieからセッションIDを取得
        const cookieHeader = request.headers.get("Cookie");
        const cookies = new Map(cookieHeader?.split("; ").map((c) => c.split("=")));
        const sessionId = cookies.get("session_id");

        if (!sessionId) {
            return new Response(JSON.stringify({ error: "セッションが存在しません" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        // セッションIDからユーザーIDを取得
        const sessionQuery = `
            SELECT user_id FROM user_sessions WHERE session_id = ? AND expires_at > CURRENT_TIMESTAMP
        `;
        const sessionResult = await env.DB.prepare(sessionQuery).bind(sessionId).first();

        if (!sessionResult || !sessionResult.user_id) {
            return new Response(JSON.stringify({ error: "無効なセッション" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        const userId = sessionResult.user_id;

        // リクエストボディから投稿IDを取得
        const { postId } = await request.json();

        if (!postId) {
            return new Response(JSON.stringify({ error: "投稿IDが提供されていません" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // 既にキープ済みか確認
        const checkQuery = `
            SELECT COUNT(*) as count FROM post_keeps WHERE user_id = ? AND post_id = ?
        `;
        const checkResult = await env.DB.prepare(checkQuery).bind(userId, postId).first();

        if (checkResult.count > 0) {
            return new Response(JSON.stringify({ message: "既にキープ済みです" }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Keepテーブルに挿入
        const insertQuery = `
            INSERT INTO post_keeps (post_id, user_id) VALUES (?, ?)
        `;
        await env.DB.prepare(insertQuery).bind(postId, userId).run();

        return new Response(JSON.stringify({ success: true, message: "投稿をKeepしました！" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Keep処理中のエラー:", error);
        return new Response(JSON.stringify({ error: "サーバーエラーが発生しました" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
