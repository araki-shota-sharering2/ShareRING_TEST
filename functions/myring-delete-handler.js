export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        // クッキーからセッションIDを取得
        const cookieHeader = request.headers.get("Cookie");
        const cookies = new Map(cookieHeader?.split("; ").map(c => c.split("=")));
        const sessionId = cookies.get("session_id");

        // セッションIDが存在しない場合はUnauthorized
        if (!sessionId) {
            return new Response(JSON.stringify({ message: "Unauthorized: No session ID" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        // セッション情報を取得して認証
        const session = await env.DB.prepare(`
            SELECT user_id FROM user_sessions 
            WHERE session_id = ? AND expires_at > CURRENT_TIMESTAMP
        `).bind(sessionId).first();

        // 有効なセッションがない場合はUnauthorized
        if (!session) {
            return new Response(JSON.stringify({ message: "Unauthorized: Invalid session" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        const userId = session.user_id;

        // リクエストボディを解析して `postId` を取得
        const requestBody = await request.json();
        const { postId } = requestBody;

        // postIdが提供されていない場合はBad Request
        if (!postId) {
            return new Response(JSON.stringify({ message: "Bad Request: Missing postId" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // 投稿の所有権を確認
        const postCheck = await env.DB.prepare(`
            SELECT user_id FROM user_posts WHERE post_id = ?
        `).bind(postId).first();

        if (!postCheck) {
            return new Response(JSON.stringify({ message: "Not Found: Post does not exist" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }

        if (postCheck.user_id !== userId) {
            return new Response(JSON.stringify({ message: "Forbidden: You do not own this post" }), {
                status: 403,
                headers: { "Content-Type": "application/json" },
            });
        }

        // 投稿を削除
        await env.DB.prepare(`
            DELETE FROM user_posts WHERE post_id = ?
        `).bind(postId).run();

        // 成功レスポンス
        return new Response(JSON.stringify({ message: "Post deleted successfully" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error during post deletion:", error);

        // サーバーエラーレスポンス
        return new Response(JSON.stringify({ message: "Internal Server Error", error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
