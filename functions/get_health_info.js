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

        const healthInfo = await env.DB.prepare(`
            SELECT height, weight, bmi FROM user_health_info 
            WHERE user_id = ?
        `).bind(session.user_id).first();

        return new Response(JSON.stringify(healthInfo || {}), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error fetching health info:", error);
        return new Response(JSON.stringify({ message: "Internal Server Error" }), {
            status: 500,
        });
    }
}
