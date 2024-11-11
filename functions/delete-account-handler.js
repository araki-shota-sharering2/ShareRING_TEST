export async function onRequestDelete(context) {
    const { env, request } = context;
    const cookieHeader = request.headers.get("Cookie");
    const cookies = new Map(cookieHeader?.split("; ").map(c => c.split("=")));
    const sessionId = cookies.get("session_id");

    if (!sessionId) {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        // セッションIDからユーザーIDを取得
        console.log("セッションIDからユーザーIDを取得開始");
        const session = await env.DB.prepare(`
            SELECT user_id FROM user_sessions
            WHERE session_id = ? AND expires_at > CURRENT_TIMESTAMP
        `).bind(sessionId).first();

        if (!session) {
            console.log("セッションが無効または期限切れです");
            return new Response("Unauthorized", { status: 401 });
        }

        const userId = session.user_id;
        console.log("取得したユーザーID:", userId);

        // D1データベースからユーザーを削除
        console.log("ユーザー情報の削除を開始");
        const deleteResult = await env.DB.prepare(`DELETE FROM user_accounts WHERE user_id = ?`).bind(userId).run();

        // セッション情報も削除
        console.log("セッション情報の削除を開始");
        await env.DB.prepare(`DELETE FROM user_sessions WHERE session_id = ?`).bind(sessionId).run();

        if (deleteResult.changes === 0) {
            console.log("ユーザーが見つかりませんでした");
            return new Response(JSON.stringify({ message: 'ユーザーが見つかりません' }), { status: 404 });
        }

        console.log("アカウントが正常に削除されました");
        return new Response(JSON.stringify({ message: 'アカウントが削除されました' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('アカウント削除中にエラーが発生しました:', error);
        return new Response(JSON.stringify({ message: 'アカウント削除に失敗しました', error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
