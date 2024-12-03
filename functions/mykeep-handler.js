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

        // Fetch keep posts for the user
        const keepQuery = `
            SELECT p.post_id, p.image_url, p.caption, p.address, p.created_at
            FROM post_keeps pk
            INNER JOIN user_posts p ON pk.post_id = p.post_id
            WHERE pk.user_id = ?
        `;
        const keeps = await env.DB.prepare(keepQuery).bind(userId).all();

        return new Response(JSON.stringify(keeps), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error retrieving keeps:", error);
        return new Response(JSON.stringify({ error: "サーバーエラーが発生しました" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
