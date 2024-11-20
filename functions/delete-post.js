export async function onRequestPost(context) {
    const { env, request } = context;

    // クッキーからセッションIDを取得
    const cookieHeader = request.headers.get("Cookie");
    const cookies = new Map(cookieHeader?.split("; ").map(c => c.split("=")));
    const sessionId = cookies.get("session_id");

    if (!sessionId) {
        console.error("Unauthorized access: No session ID found");
        return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    try {
        // 有効なセッションを確認し、ユーザーIDを取得
        const session = await env.DB.prepare(`
            SELECT user_id FROM user_sessions 
            WHERE session_id = ? AND expires_at > CURRENT_TIMESTAMP
        `).bind(sessionId).first();

        if (!session) {
            console.error("Unauthorized access: No valid session found");
            return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        // リクエストボディからpost_idを取得
        const { postId } = await request.json();

        if (!postId) {
            console.error("Invalid request: Missing postId");
            return new Response(JSON.stringify({ message: "Invalid request: Missing postId" }), { status: 400 });
        }

        // ユーザーIDが一致する投稿を削除
        const result = await env.DB.prepare(`
            DELETE FROM user_posts WHERE post_id = ? AND user_id = ?
        `).bind(postId, session.user_id).run();

        if (result.success) {
            console.log(`Post with ID ${postId} deleted successfully`);
            return new Response(JSON.stringify({ message: "Post deleted successfully" }), { status: 200 });
        } else {
            console.error("Failed to delete post");
            return new Response(JSON.stringify({ message: "Failed to delete post" }), { status: 500 });
        }
    } catch (error) {
        console.error("Error deleting post:", error);
        return new Response(JSON.stringify({ message: "Failed to delete post", error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
