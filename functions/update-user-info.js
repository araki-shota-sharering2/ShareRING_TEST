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

    // 必須フィールドが空でないか確認
    if (!username || !email) {
        return new Response("Invalid input", { status: 400 });
    }

    try {
        // ユーザー情報を更新
        await env.DB.prepare(`
            UPDATE user_accounts
            SET username = ?, email = ?, profile_image = ?
            WHERE user_id = ?
        `).bind(username, email, profile_image, session.user_id).run();

        return new Response("User info updated successfully", {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        console.error("データベースエラー:", error);
        return new Response("サーバーエラー", { status: 500 });
    }
}
