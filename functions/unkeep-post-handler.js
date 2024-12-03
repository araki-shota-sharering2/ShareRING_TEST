export async function onRequestPost(context) {
    const { env, request } = context;

    try {
        // Retrieve session ID from cookies
        const cookieHeader = request.headers.get("Cookie");
        const cookies = new Map(cookieHeader?.split("; ").map((c) => c.split("=")));
        const sessionId = cookies.get("session_id");

        if (!sessionId) {
            return new Response(JSON.stringify({ error: "セッションが存在しません" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Fetch user ID from session
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

        // Parse the request body to get the post ID
        const { postId } = await request.json();

        if (!postId) {
            return new Response(JSON.stringify({ error: "投稿IDが提供されていません。" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Delete the keep record from the database
        const deleteQuery = `
            DELETE FROM post_keeps WHERE post_id = ? AND user_id = ?
        `;
        await env.DB.prepare(deleteQuery).bind(postId, userId).run();

        return new Response(JSON.stringify({ message: "投稿をKeepから削除しました。" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error in unkeep-post-handler:", error);
        return new Response(JSON.stringify({ error: "サーバーエラーが発生しました。" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
