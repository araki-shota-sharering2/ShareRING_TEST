export async function onRequestPost(context) {
    const { env, request } = context;

    // セッションIDをクッキーから取得
    const cookieHeader = request.headers.get("Cookie");
    const cookies = new Map(cookieHeader?.split("; ").map((c) => c.split("=")));
    const sessionId = cookies.get("session_id");

    if (!sessionId) {
        console.error("Unauthorized access: No session ID found");
        return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    try {
        const { postId } = await request.json();

        if (!postId) {
            return new Response(JSON.stringify({ message: "Invalid post ID" }), { status: 400 });
        }

        const session = await env.DB.prepare(`
            SELECT user_id FROM user_sessions WHERE session_id = ? AND expires_at > CURRENT_TIMESTAMP
        `).bind(sessionId).first();

        if (!session) {
            console.error("Unauthorized access: Invalid session");
            return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        const deleteResult = await env.DB.prepare(`
            DELETE FROM user_posts WHERE post_id = ? AND user_id = ?
        `).bind(postId, session.user_id).run();

        const deleteResultFromGroups = await env.DB.prepare(`
            DELETE FROM group_posts WHERE group_post_id = ? AND user_id = ?
        `).bind(postId, session.user_id).run();

        if (deleteResult.changes === 0 && deleteResultFromGroups.changes === 0) {
            return new Response(JSON.stringify({ message: "Post not found or unauthorized" }), { status: 404 });
        }

        return new Response(JSON.stringify({ message: "Post deleted successfully" }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        console.error("Error deleting post:", error);
        return new Response(JSON.stringify({ message: "Internal Server Error", error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
