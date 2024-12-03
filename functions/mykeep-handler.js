export async function onRequestGet(context) {
    const { env, request } = context;

    try {
        // Retrieve session ID from cookies
        const cookieHeader = request.headers.get("Cookie");
        const cookies = new Map(cookieHeader?.split("; ").map((c) => c.split("=")));
        const sessionId = cookies.get("session_id");

        if (!sessionId) {
            return new Response(JSON.stringify({ error: "セッションが存在しません" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Fetch user ID from session
        const sessionQuery = `
            SELECT user_id FROM user_sessions WHERE session_id = ? AND expires_at > CURRENT_TIMESTAMP
        `;
        const sessionResult = await env.DB.prepare(sessionQuery).bind(sessionId).first();

        if (!sessionResult) {
            return new Response(JSON.stringify({ error: "無効なセッション" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        const userId = sessionResult.user_id;
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get("page")) || 1;
        const postsPerPage = 8;
        const offset = (page - 1) * postsPerPage;

        const keepQuery = `
            SELECT 
                p.post_id, p.image_url, p.caption, p.location, p.created_at, p.ring_color, p.address, 
                u.username, u.profile_image
            FROM post_keeps k
            JOIN user_posts p ON k.post_id = p.post_id
            JOIN user_accounts u ON p.user_id = u.user_id
            WHERE k.user_id = ?
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?
        `;
        const keeps = await env.DB.prepare(keepQuery).bind(userId, postsPerPage, offset).all();

        return new Response(JSON.stringify(keeps.results), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error in mykeep-handler:", error);
        return new Response(JSON.stringify({ error: "サーバーエラーが発生しました。" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
