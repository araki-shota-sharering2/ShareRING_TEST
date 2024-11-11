export async function onRequestPost(context) {
    const { env, request } = context;

    const cookieHeader = request.headers.get("Cookie");
    const cookies = new Map(cookieHeader?.split("; ").map(c => c.split("=")));
    const sessionId = cookies.get("session_id");

    if (!sessionId) {
        console.error("Unauthorized access: No session ID found");
        return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    try {
        const session = await env.DB.prepare(`
            SELECT user_id FROM user_sessions 
            WHERE session_id = ? AND expires_at > CURRENT_TIMESTAMP
        `).bind(sessionId).first();

        if (!session) {
            console.error("Unauthorized access: No valid session found");
            return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        const formData = await request.formData();
        const updates = {};
        if (formData.has('username')) updates.username = formData.get('username');
        if (formData.has('email')) updates.email = formData.get('email');

        if (Object.keys(updates).length === 0) {
            return new Response(JSON.stringify({ message: "No valid fields provided for update" }), { status: 400 });
        }

        const setClauses = Object.keys(updates).map(field => `${field} = ?`).join(", ");
        const values = Object.values(updates);
        values.push(session.user_id);

        await env.DB.prepare(`
            UPDATE user_accounts SET ${setClauses} WHERE user_id = ?
        `).bind(...values).run();

        return new Response(JSON.stringify({ message: "User info updated successfully" }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        console.error("Error updating user info:", error);
        return new Response(JSON.stringify({ message: "Failed to update user info", error: error.message }), { status: 500 });
    }
}
