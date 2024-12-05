export async function onRequestGet(context) {
    const { env, request } = context;

    try {
        // クッキーからセッションIDを取得
        const cookieHeader = request.headers.get("Cookie");
        const cookies = new Map(cookieHeader?.split("; ").map((c) => c.split("=")));
        const sessionId = cookies.get("session_id");

        if (!sessionId) {
            return new Response(JSON.stringify({ error: "セッションが存在しません" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        // セッションからユーザーIDを取得
        const sessionQuery = `
            SELECT user_id FROM user_sessions WHERE session_id = ? AND expires_at > CURRENT_TIMESTAMP
        `;
        const sessionResult = await env.DB.prepare(sessionQuery).bind(sessionId).first();

        if (!sessionResult) {
            return new Response(JSON.stringify({ error: "無効なセッション" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        const userId = sessionResult.user_id;

        // アチーブメント情報を取得
        const achievementsQuery = `
            SELECT a.name, a.description, a.image_url
            FROM awards a
            INNER JOIN user_award_progress uap ON a.award_id = uap.award_id
            WHERE uap.user_id = ?
        `;
        const achievements = await env.DB.prepare(achievementsQuery).bind(userId).all();

        return new Response(JSON.stringify(achievements), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: "エラーが発生しました" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
