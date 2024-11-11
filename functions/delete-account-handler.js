// delete-account-handler.js

export async function onRequestDelete({ request, env, ctx }) {
    try {
        const sessionID = request.headers.get('cookie').split('sessionID=')[1];
        
        if (!sessionID) {
            return new Response(JSON.stringify({ message: 'セッションが見つかりません' }), { status: 401 });
        }

        const userAccount = await env.DB.prepare(`
            SELECT user_id FROM user_sessions WHERE session_id = ?
        `).bind(sessionID).first();

        if (!userAccount) {
            return new Response(JSON.stringify({ message: 'ユーザーが見つかりません' }), { status: 404 });
        }

        const deleteResult = await env.DB.prepare(`
            DELETE FROM user_accounts WHERE user_id = ?
        `).bind(userAccount.user_id).run();

        if (deleteResult.success) {
            return new Response(JSON.stringify({ message: 'アカウントが削除されました' }), { status: 200 });
        } else {
            return new Response(JSON.stringify({ message: 'アカウントの削除に失敗しました' }), { status: 500 });
        }
    } catch (error) {
        return new Response(JSON.stringify({ message: 'エラーが発生しました', error: error.message }), { status: 500 });
    }
}
