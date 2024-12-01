export async function onRequestPost(context) {
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

        const { group_id } = await request.json();

        if (!group_id) {
            return new Response(JSON.stringify({ message: "Group ID is required" }), { status: 400 });
        }

        await env.DB.prepare(`
            INSERT INTO user_group_members (group_id, user_id) 
            VALUES (?, ?)
        `).bind(group_id, session.user_id).run();

        return new Response(JSON.stringify({ message: "Joined group successfully" }), { status: 201 });
    } catch (error) {
        console.error("Error joining group:", error);
        return new Response(JSON.stringify({ message: "Failed to join group" }), { status: 500 });
    }
}
