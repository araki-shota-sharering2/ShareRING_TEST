export async function onRequestPost(context) {
    const { env, request } = context;

    // クッキーからセッションIDを取得
    const cookieHeader = request.headers.get("Cookie");
    const cookies = new Map(cookieHeader?.split("; ").map(c => c.split("=")));
    const sessionId = cookies.get("session_id");

    if (!sessionId) {
        console.error("Unauthorized access: No session ID found");
        return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    try {
        // 有効なセッションを確認し、ユーザーIDを取得
        const session = await env.DB.prepare(`
            SELECT user_id FROM user_sessions 
            WHERE session_id = ? AND expires_at > CURRENT_TIMESTAMP
        `).bind(sessionId).first();

        if (!session) {
            console.error("Unauthorized access: No valid session found");
            return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        // ユーザーアカウントを削除
        await env.DB.prepare(`
            DELETE FROM user_accounts WHERE user_id = ?
        `).bind(session.user_id).run();

        // 関連するセッションも削除（オプション）
        await env.DB.prepare(`
            DELETE FROM user_sessions WHERE user_id = ?
        `).bind(session.user_id).run();

        return new Response(JSON.stringify({ message: "アカウントが正常に削除されました" }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        console.error("Error deleting user account:", error);
        return new Response(JSON.stringify({ message: "Failed to delete user account", error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
