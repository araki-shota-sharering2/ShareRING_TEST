export async function onRequestGet(context) {
    const { request, env } = context;
    const cookieHeader = request.headers.get("Cookie");
    const cookies = new Map(cookieHeader?.split("; ").map(c => c.split("=")));
    const sessionId = cookies.get("session_id");

    if (!sessionId) {
        return new Response("Unauthorized", { status: 401 });
    }

    // セッションの有効性をD1で確認
    const session = await env.DB.prepare(`
        SELECT user_id FROM user_sessions
        WHERE session_id = ? AND expires_at > CURRENT_TIMESTAMP
    `).bind(sessionId).first();

    if (session) {
        return new Response("Authorized", {
            status: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: session.user_id })
        });
    } else {
        return new Response("Unauthorized", { status: 401 });
    }
}
