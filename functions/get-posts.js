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

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page")) || 1; // ページ番号
    const itemsPerPage = 10; // 1ページあたりの件数
    const offset = (page - 1) * itemsPerPage;

    // 投稿データを取得 (ページング対応)
    const posts = await env.DB.prepare(`
        SELECT post_id, image_url, caption, location, created_at, ring_color, address
        FROM user_posts
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
    `).bind(session.user_id, itemsPerPage, offset).all();

    return new Response(JSON.stringify(posts.results), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
}
