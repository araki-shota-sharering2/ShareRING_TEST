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

    // ユーザーが参加しているグループを取得
    const query = `
        SELECT g.group_id, g.group_name, g.description, g.group_image_url, g.created_at 
        FROM user_groups g
        INNER JOIN user_group_members m ON g.group_id = m.group_id
        WHERE m.user_id = ?
    `;
    try {
        const groups = await env.DB.prepare(query).bind(session.user_id).all();
        return new Response(JSON.stringify(groups), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error) {
        return new Response(`エラー: ${error.message}`, { status: 500 });
    }
}
