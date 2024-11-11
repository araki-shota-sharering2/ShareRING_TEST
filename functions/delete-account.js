export async function onRequestPost(context) {
    const { env, request } = context;

    // Cookieからsession_idを取得
    const cookieHeader = request.headers.get("Cookie");
    const cookies = new Map(cookieHeader?.split("; ").map(c => c.split("=")));
    const sessionId = cookies.get("session_id");

    if (!sessionId) {
        console.error("Unauthorized access: No session ID found");
        return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    try {
        // セッションからユーザーIDを取得
        const session = await env.DB.prepare(`
            SELECT user_id FROM user_sessions WHERE session_id = ? AND expires_at > CURRENT_TIMESTAMP
        `).bind(sessionId).first();

        if (!session) {
            console.error("Unauthorized access: No valid session found");
            return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        // user_accountsテーブルからユーザーアカウントを削除
        try {
            await env.DB.prepare(`DELETE FROM user_accounts WHERE user_id = ?`).bind(session.user_id).run();
            console.log("User account deleted from user_accounts table");
        } catch (deleteAccountError) {
            console.error("Error deleting user account:", deleteAccountError);
            return new Response(JSON.stringify({ message: "Failed to delete user account" }), { status: 500 });
        }

        // user_sessionsテーブルからユーザーセッションを削除
        try {
            await env.DB.prepare(`DELETE FROM user_sessions WHERE user_id = ?`).bind(session.user_id).run();
            console.log("User session deleted from user_sessions table");
        } catch (deleteSessionError) {
            console.error("Error deleting user session:", deleteSessionError);
            return new Response(JSON.stringify({ message: "Failed to delete user session" }), { status: 500 });
        }

        return new Response(JSON.stringify({ message: "Account deleted successfully" }), { status: 200 });
    } catch (error) {
        console.error("Account deletion error:", error);
        return new Response(JSON.stringify({ message: "Failed to delete account", error: error.message }), { status: 500 });
    }
}
