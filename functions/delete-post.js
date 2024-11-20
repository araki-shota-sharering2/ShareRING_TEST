export async function onRequestPost(context) {
    const { request, env } = context;

    // クッキーからセッションIDを取得
    const cookieHeader = request.headers.get("Cookie");
    const cookies = new Map(cookieHeader?.split("; ").map(c => c.split("=")));
    const sessionId = cookies.get("session_id");

    if (!sessionId) {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        // セッションからユーザーIDを取得
        const session = await env.DB.prepare(`
            SELECT user_id FROM user_sessions WHERE session_id = ? AND expires_at > CURRENT_TIMESTAMP
        `).bind(sessionId).first();

        if (!session) {
            return new Response("Unauthorized", { status: 401 });
        }

        // リクエストボディからpost_idを取得
        const { postId } = await request.json();

        if (!postId) {
            return new Response(JSON.stringify({ message: "Invalid request: Missing postId" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // 投稿を削除
        const deleteResult = await env.DB.prepare(`
            DELETE FROM user_posts WHERE post_id = ? AND user_id = ?
        `).bind(postId, session.user_id).run();

        if (deleteResult.success) {
            return new Response(JSON.stringify({ message: "Post deleted successfully" }), {
                status: 200,
                headers: { "Content-Type": "application/json" }
            });
        } else {
            return new Response(JSON.stringify({ message: "Failed to delete post" }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }
    } catch (error) {
        console.error("Error deleting post:", error);
        return new Response(JSON.stringify({ message: "Error deleting post", error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
