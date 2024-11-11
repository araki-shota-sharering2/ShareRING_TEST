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
        const session = await env.DB.prepare(`
            SELECT user_id FROM user_sessions
            WHERE session_id = ? AND expires_at > CURRENT_TIMESTAMP
        `).bind(sessionId).first();

        if (!session) {
            return new Response("Unauthorized", { status: 401 });
        }

        const userId = session.user_id;

        // プロフィール画像のURLを取得し、R2のキーを特定
        const userResult = await env.DB.prepare(`
            SELECT profile_image FROM user_accounts WHERE user_id = ?
        `).bind(userId).first();

        if (userResult && userResult.profile_image) {
            const r2Key = userResult.profile_image.split(`${env.R2_BUCKET_URL}/`)[1];
            await env.MY_R2_BUCKET.delete(r2Key);
        }

        // D1データベースからユーザーを削除
        const deleteResult = await env.DB.prepare(`DELETE FROM user_accounts WHERE user_id = ?`).bind(userId).run();

        // セッション情報も削除
        await env.DB.prepare(`DELETE FROM user_sessions WHERE session_id = ?`).bind(sessionId).run();

        if (deleteResult.changes === 0) {
            return new Response(JSON.stringify({ message: 'ユーザーが見つかりません' }), { status: 404 });
        }

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
