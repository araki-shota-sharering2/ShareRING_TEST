export async function onRequestGet(context) {
    const { request, env } = context;
    const cookieHeader = request.headers.get("Cookie");
    const cookies = new Map(cookieHeader?.split("; ").map(c => c.split("=")));
    const sessionId = cookies.get("session_id");

    if (!sessionId) {
        return new Response("Unauthorized", { status: 401 });
    }

    // セッションからユーザーIDを取得
    const session = await env.DB.prepare(`
        SELECT user_id FROM user_sessions WHERE session_id = ? AND expires_at > CURRENT_TIMESTAMP
    `).bind(sessionId).first();

    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }

    // ユーザーIDを基に投稿データを取得
    const posts = await env.DB.prepare(`
        SELECT post_id, image_url, caption, location, created_at, ring_color, address
        FROM user_posts
        WHERE user_id = ?
        ORDER BY created_at DESC
    `).bind(session.user_id).all();

    return new Response(JSON.stringify(posts.results), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
}
