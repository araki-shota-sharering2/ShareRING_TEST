export async function onRequestPost(context) {
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

        const { height, weight } = await request.json();

        if (!height || !weight) {
            return new Response(JSON.stringify({ message: "Invalid data" }), { status: 400 });
        }

        await env.DB.prepare(`
            INSERT INTO user_health_info (user_id, height, weight) 
            VALUES (?, ?, ?) 
            ON CONFLICT(user_id) DO UPDATE 
            SET height = ?, weight = ?, updated_at = CURRENT_TIMESTAMP
        `).bind(session.user_id, height, weight, height, weight).run();

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error saving health info:", error);
        return new Response(JSON.stringify({ message: "Internal Server Error", error: error.message }), {
            status: 500,
        });
    }
}
