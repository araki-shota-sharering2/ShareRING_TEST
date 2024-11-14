// UUID生成関数
export function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// ユーザー情報の取得関数
export async function getUserProfileImage(context) {
    const { request, env } = context;
    const db = env.DB;

    // クッキーからセッションIDを取得
    const cookies = request.headers.get('Cookie');
    const sessionId = cookies?.split('; ').find(row => row.startsWith('session_id='))?.split('=')[1];

    if (!sessionId) {
        throw new Error('セッションIDがありません');
    }

    // セッションからユーザーIDを取得
    const session = await db.prepare('SELECT user_id FROM user_sessions WHERE session_id = ?')
        .bind(sessionId)
        .first();

    if (!session) {
        throw new Error('無効なセッション');
    }

    // ユーザーIDからプロフィール画像を取得
    const user = await db.prepare('SELECT profile_image FROM user_accounts WHERE user_id = ?')
        .bind(session.user_id)
        .first();

    if (!user || !user.profile_image) {
        throw new Error('プロフィール画像がありません');
    }

    return user.profile_image;
}
