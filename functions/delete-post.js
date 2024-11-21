export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        // JSONデータを取得
        const { postId } = await request.json();

        if (!postId) {
            return new Response(JSON.stringify({ message: "Invalid post ID" }), { status: 400 });
        }

        // セッション検証
        const cookieHeader = request.headers.get("Cookie");
        const cookies = new Map(cookieHeader?.split("; ").map(c => c.split("=")));
        const sessionId = cookies.get("session_id");

        if (!sessionId) {
            return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        const session = await env.DB.prepare(`
            SELECT user_id FROM user_sessions WHERE session_id = ? AND expires_at > CURRENT_TIMESTAMP
        `).bind(sessionId).first();

        if (!session) {
            return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        // 投稿の所有者確認と削除
        const deleteResult = await env.DB.prepare(`
            DELETE FROM user_posts
            WHERE post_id = ? AND user_id = ?
        `).bind(postId, session.user_id).run();

        if (deleteResult.changes === 0) {
            return new Response(JSON.stringify({ message: "Post not found or unauthorized" }), { status: 404 });
        }

        return new Response(JSON.stringify({ message: "Post deleted successfully" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error deleting post:", error);
        return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
    }
}
