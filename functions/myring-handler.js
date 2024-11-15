export async function onRequestGet(context) {
    const { env, request } = context;

    try {
        const cookieHeader = request.headers.get("Cookie");
        const cookies = new Map(cookieHeader?.split("; ").map(c => c.split("=")));
        const sessionId = cookies.get("session_id");

        if (!sessionId) {
            return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        const session = await env.DB.prepare(`
            SELECT user_id FROM user_sessions 
            WHERE session_id = ? AND expires_at > CURRENT_TIMESTAMP
        `).bind(sessionId).first();

        if (!session) {
            return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        const posts = await env.DB.prepare(`
            SELECT post_id, image_url, caption, latitude, longitude, created_at, address 
            FROM user_posts 
            WHERE user_id = ?
            ORDER BY created_at DESC
        `).bind(session.user_id).all();

        return new Response(JSON.stringify(posts.results), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error) {
        console.error("エラー:", error);
        return new Response(JSON.stringify({ message: "サーバーエラーが発生しました" }), { status: 500 });
    }
}
