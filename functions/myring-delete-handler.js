export async function onRequestPost(context) {
    const { request, env } = context;
    try {
        // セッションIDをCookieから取得
        const cookieHeader = request.headers.get("Cookie");
        const cookies = new Map(cookieHeader?.split("; ").map(c => c.split("=")));
        const sessionId = cookies.get("session_id");

        if (!sessionId) {
            return new Response("Unauthorized", { status: 401 });
        }

        // セッション情報を取得して認証
        const session = await env.DB.prepare(`
            SELECT user_id FROM user_sessions WHERE session_id = ? AND expires_at > CURRENT_TIMESTAMP
        `).bind(sessionId).first();

        if (!session) {
            return new Response("Unauthorized", { status: 401 });
        }

        const userId = session.user_id;

        // リクエストボディから `postId` を取得
        const requestBody = await request.json();
        const { postId } = requestBody;

        if (!postId) {
            return new Response("Invalid Request: Missing postId", { status: 400 });
        }

        // 投稿が認証ユーザーのものであるか確認
        const postCheck = await env.DB.prepare(`
            SELECT user_id FROM user_posts WHERE post_id = ?
        `).bind(postId).first();

        if (!postCheck || postCheck.user_id !== userId) {
            return new Response("Forbidden: You can only delete your own posts", { status: 403 });
        }

        // 投稿を削除
        await env.DB.prepare(`
            DELETE FROM user_posts WHERE post_id = ?
        `).bind(postId).run();

        return new Response(JSON.stringify({ message: "Post deleted successfully" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error during deletion:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
