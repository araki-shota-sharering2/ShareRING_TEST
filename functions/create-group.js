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

        const { group_name, description, group_image_url } = await request.json();

        if (!group_name) {
            return new Response(JSON.stringify({ message: "Group name is required" }), { status: 400 });
        }

        const group = await env.DB.prepare(`
            INSERT INTO user_groups (group_name, description, group_image_url, created_by) 
            VALUES (?, ?, ?, ?)
        `).bind(group_name, description || null, group_image_url || null, session.user_id).run();

        await env.DB.prepare(`
            INSERT INTO user_group_members (group_id, user_id) 
            VALUES (?, ?)
        `).bind(group.meta.last_row_id, session.user_id).run();

        return new Response(JSON.stringify({ message: "Group created successfully" }), { status: 201 });
    } catch (error) {
        console.error("Error creating group:", error);
        return new Response(JSON.stringify({ message: "Failed to create group" }), { status: 500 });
    }
}
