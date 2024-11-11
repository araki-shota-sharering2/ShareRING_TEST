export async function onRequestGet(context) {
    const { request, env } = context;
    const cookieHeader = request.headers.get("Cookie");
    const cookies = new Map(cookieHeader?.split("; ").map(c => c.split("=")));
    const sessionId = cookies.get("session_id");

    if (!sessionId) {
        return new Response("Unauthorized", { status: 401 });
    }

    // セッションからユーザーIDを取得
    const session = await env.DB.prepare(`
        SELECT user_id FROM user_sessions WHERE session_id = ? AND expires_at > CURRENT_TIMESTAMP
    `).bind(sessionId).first();

    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }

    // ユーザーIDを基にユーザー情報を取得
    const user = await env.DB.prepare(`
        SELECT username, email, created_at, profile_image FROM user_accounts WHERE user_id = ?
    `).bind(session.user_id).first();

    if (!user) {
        return new Response("User not found", { status: 404 });
    }

    return new Response(JSON.stringify(user), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
}
