export async function onRequest(context) {
    const { env, request } = context;
    const db = env.DB;

    if (request.method !== 'DELETE') {
        return new Response('許可されていないメソッドです', {
            status: 405,
            headers: { 'Access-Control-Allow-Origin': '*' }
        });
    }

    const cookieHeader = request.headers.get("Cookie");
    const cookies = new Map(cookieHeader?.split("; ").map(c => c.split("=")));
    const sessionId = cookies.get("session_id");

    if (!sessionId) {
        return new Response("Unauthorized", { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    try {
        console.log("セッションIDからユーザーIDを取得開始");
        const session = await db.prepare(`
            SELECT user_id FROM user_sessions
            WHERE session_id = ? AND expires_at > CURRENT_TIMESTAMP
        `).bind(sessionId).first();

        if (!session) {
            console.log("セッションが無効または期限切れです");
            return new Response("Unauthorized", { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } });
        }

        const userId = session.user_id;
        console.log("取得したユーザーID:", userId);

        // ユーザー情報を削除
        console.log("ユーザー情報の削除を開始");
        const deleteUserResult = await db.prepare(`DELETE FROM user_accounts WHERE user_id = ?`).bind(userId).run();

        // セッション情報も削除
        console.log("セッション情報の削除を開始");
        const deleteSessionResult = await db.prepare(`DELETE FROM user_sessions WHERE session_id = ?`).bind(sessionId).run();

        if (deleteUserResult.changes === 0) {
            console.log("ユーザーが見つかりませんでした");
            return new Response(JSON.stringify({ message: 'ユーザーが見つかりません' }), { 
                status: 404, 
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
            });
        }

        console.log("アカウントが正常に削除されました");
        return new Response(JSON.stringify({ message: 'アカウントが削除されました' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    } catch (error) {
        console.error('アカウント削除中にエラーが発生しました:', error);
        return new Response(JSON.stringify({ message: 'アカウント削除に失敗しました', error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }
}
