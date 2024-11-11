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

    // クライアントから送信された新しいユーザー情報を取得
    const { username, email, profile_image } = await request.json();

    // 各フィールドがnullまたはundefinedでない場合のみ更新
    const updates = {};
    if (username !== undefined) updates.username = username;
    if (email !== undefined) updates.email = email;
    if (profile_image !== undefined) updates.profile_image = profile_image;

    // 更新がない場合、エラーメッセージを返す
    if (Object.keys(updates).length === 0) {
        return new Response("No valid fields provided for update", { status: 400 });
    }

    try {
        // SQL文の動的作成
        const setClauses = Object.keys(updates).map(field => `${field} = ?`).join(", ");
        const values = Object.values(updates);
        values.push(session.user_id);

        // ユーザー情報を更新
        await env.DB.prepare(`
            UPDATE user_accounts
            SET ${setClauses}
            WHERE user_id = ?
        `).bind(...values).run();

        return new Response("User info updated successfully", {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        console.error("データベースエラー:", error);
        return new Response("サーバーエラー", { status: 500 });
    }
}
