export async function onRequestGet(context) {
    try {
        const { request, env } = context;
        const cookieHeader = request.headers.get("Cookie");
        const cookies = new Map(cookieHeader?.split("; ").map(c => c.split("=")));
        const sessionId = cookies.get("session_id");

        if (!sessionId) {
            console.log("セッションIDが見つかりません");
            return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        const session = await env.DB.prepare(`
            SELECT user_id FROM user_sessions WHERE session_id = ? AND expires_at > CURRENT_TIMESTAMP
        `).bind(sessionId).first();

        if (!session) {
            console.log("セッションが無効です");
            return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        const posts = await env.DB.prepare(`
            SELECT post_id, image_url, caption, location, created_at
            FROM user_posts
            WHERE user_id = ?
            ORDER BY created_at DESC
        `).bind(session.user_id).all();

        console.log("取得した投稿データ:", posts.results);

        const formattedPosts = posts.results.map(post => ({
            ...post,
            location: JSON.parse(post.location) // locationをJSON形式に変換
        }));

        return new Response(JSON.stringify(formattedPosts), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("ハンドラーでエラー発生:", error.message);
        return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
    }
}
