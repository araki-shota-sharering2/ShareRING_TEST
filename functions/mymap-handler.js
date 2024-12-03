export async function onRequestGet(context) {
    const { request, env } = context;

    // セッション情報を取得
    const cookieHeader = request.headers.get("Cookie");
    const cookies = new Map(cookieHeader?.split("; ").map(c => c.split("=")));
    const sessionId = cookies.get("session_id");

    if (!sessionId) {
        return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    // セッションを確認
    const session = await env.DB.prepare(`
        SELECT user_id FROM user_sessions WHERE session_id = ? AND expires_at > CURRENT_TIMESTAMP
    `).bind(sessionId).first();

    if (!session) {
        return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    // 投稿データを取得
    const posts = await env.DB.prepare(`
        SELECT post_id, image_url, caption, location, created_at
        FROM user_posts
        WHERE user_id = ?
    `).bind(session.user_id).all();

    return new Response(JSON.stringify(posts.results), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
}
