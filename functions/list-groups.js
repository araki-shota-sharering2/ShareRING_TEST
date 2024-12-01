export async function onRequestGet(context) {
    const { env, request } = context;

    const cookieHeader = request.headers.get("Cookie");
    const cookies = new Map(cookieHeader?.split("; ").map(c => c.split("=")));
    const sessionId = cookies.get("session_id");

    if (!sessionId) {
        return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    try {
        const session = await env.DB.prepare(`
            SELECT user_id FROM user_sessions 
            WHERE session_id = ? AND expires_at > CURRENT_TIMESTAMP
        `).bind(sessionId).first();

        if (!session) {
            return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        const groups = await env.DB.prepare(`
            SELECT g.group_id, g.group_name, g.description, g.group_image_url 
            FROM user_groups g
            JOIN user_group_members m ON g.group_id = m.group_id
            WHERE m.user_id = ?
        `).bind(session.user_id).all();

        return new Response(JSON.stringify(groups), { status: 200 });
    } catch (error) {
        console.error("Error listing groups:", error);
        return new Response(JSON.stringify({ message: "Failed to list groups" }), { status: 500 });
    }
}
