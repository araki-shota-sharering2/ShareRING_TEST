export async function onRequestPost(context) {
    const { env, request } = context;

    try {
        // クッキーからセッションIDを取得
        const cookieHeader = request.headers.get("Cookie");
        const cookies = new Map(cookieHeader?.split("; ").map(c => c.split("=")));
        const sessionId = cookies.get("session_id");

        // セッションIDが存在しない場合
        if (!sessionId) {
            console.error("Unauthorized access: No session ID found");
            return new Response(JSON.stringify({ message: "Unauthorized" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        // セッション情報を取得して認証
        const session = await env.DB.prepare(`
            SELECT user_id FROM user_sessions 
            WHERE session_id = ? AND expires_at > CURRENT_TIMESTAMP
        `).bind(sessionId).first();

        if (!session) {
            console.error("Unauthorized access: No valid session found");
            return new Response(JSON.stringify({ message: "Unauthorized" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        const userId = session.user_id;

        // リクエストボディを解析して投稿IDを取得
        const requestBody = await request.json();
        const { postId } = requestBody;

        // 投稿IDが存在しない場合
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

        return new Response(JSON.stringify({ message: "Post deleted successfully" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error during post deletion:", error);
        return new Response(JSON.stringify({ message: "Internal Server Error", error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
