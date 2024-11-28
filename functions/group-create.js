export async function onRequestPost(context) {
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

    const { groupName, description, groupImageUrl } = await request.json();

    if (!groupName) {
        return new Response("グループ名は必須です。", { status: 400 });
    }

    // グループを作成
    const query = `
        INSERT INTO user_groups (group_name, description, group_image_url, created_by)
        VALUES (?, ?, ?, ?)
    `;
    try {
        await env.DB.prepare(query).bind(groupName, description, groupImageUrl, session.user_id).run();
        return new Response("グループが作成されました。", { status: 200 });
    } catch (error) {
        return new Response(`エラー: ${error.message}`, { status: 500 });
    }
}
