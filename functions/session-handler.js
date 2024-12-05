export async function onRequestGet(context) {
    const { request, env } = context;

    try {
        // クッキーからセッションIDを取得
        const cookies = request.headers.get('Cookie') || '';
        const sessionCookie = cookies
            .split(';')
            .find(cookie => cookie.trim().startsWith('session_id='));

        if (!sessionCookie) {
            return new Response(JSON.stringify({ error: 'No session found' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 401,
            });
        }

        const sessionId = sessionCookie.split('=')[1];

        // データベースからセッション情報を取得
        const db = env.DB; // Cloudflare D1 バインド名
        const sessionQuery = `
            SELECT user_id FROM user_sessions
            WHERE session_id = ? AND expires_at > CURRENT_TIMESTAMP
        `;
        const sessionResult = await db.prepare(sessionQuery).bind(sessionId).first();

        if (!sessionResult) {
            return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 401,
            });
        }

        // ユーザーIDを返す
        return new Response(JSON.stringify({ user_id: sessionResult.user_id }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (error) {
        console.error('Error in session handler:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500,
        });
    }
}
