import { generateUUID } from './utils.js';


export async function onRequestGet(context) {
    const { env, request } = context;
    const db = env.DB;
    const cookies = request.headers.get('Cookie') || '';
    const sessionCookie = cookies.split('; ').find(row => row.startsWith('session_id='));
    if (!sessionCookie) {
        return new Response(JSON.stringify({ message: 'ログインが必要です' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const sessionId = sessionCookie.split('=')[1];

    try {
        // セッション確認
        const session = await db.prepare(
            'SELECT user_id FROM user_sessions WHERE session_id = ? AND expires_at > CURRENT_TIMESTAMP'
        ).bind(sessionId).first();

        if (!session) {
            return new Response(JSON.stringify({ message: 'セッションが無効です' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // ユーザー投稿を取得
        const posts = await db.prepare(
            `SELECT post_id, image_url, caption, ring_color, created_at
             FROM user_posts
             WHERE user_id = ?
             ORDER BY created_at DESC`
        ).bind(session.user_id).all();

        return new Response(JSON.stringify(posts), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('エラー:', error);
        return new Response(JSON.stringify({ message: 'データ取得中にエラーが発生しました' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
