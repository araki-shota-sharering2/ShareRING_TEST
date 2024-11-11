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
            SELECT user_id FROM user_sessions WHERE session_id = ? AND expires_at > CURRENT_TIMESTAMP
        `).bind(sessionId).first();

        if (!session) {
            return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        await env.DB.prepare(`DELETE FROM user_accounts WHERE user_id = ?`).bind(session.user_id).run();
        await env.DB.prepare(`DELETE FROM user_sessions WHERE user_id = ?`).bind(session.user_id).run();

        return new Response(JSON.stringify({ message: "Account deleted successfully" }), { status: 200 });
    } catch (error) {
        console.error("Account deletion error:", error);
        return new Response(JSON.stringify({ message: "Failed to delete account" }), { status: 500 });
    }
}
