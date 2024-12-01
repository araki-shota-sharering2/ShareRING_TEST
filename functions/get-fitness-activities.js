export async function onRequestGet(context) {
    const { env, request } = context;

    try {
        // CookieからセッションIDを取得
        const cookieHeader = request.headers.get("Cookie");
        const cookies = new Map(cookieHeader?.split("; ").map((c) => c.split("=")));
        const sessionId = cookies.get("session_id");

        if (!sessionId) {
            return new Response("セッションが存在しません", { status: 401 });
        }

        // セッションテーブルからユーザーIDを取得
        const sessionResult = await env.DB.prepare(
            "SELECT user_id FROM user_sessions WHERE session_id = ? AND expires_at > CURRENT_TIMESTAMP"
        ).bind(sessionId).first();

        if (!sessionResult) {
            return new Response("セッションが無効です", { status: 401 });
        }

        const userId = sessionResult.user_id;

        // FITNESSアクティビティテーブルから運動データを取得
        const activitiesResult = await env.DB.prepare(
            "SELECT activity_type, duration, distance, calories_burned, steps, recorded_at FROM fitness_activities WHERE user_id = ? ORDER BY recorded_at DESC"
        ).bind(userId).all();

        return new Response(JSON.stringify(activitiesResult.results), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("エラー:", error);
        return new Response("サーバーエラーが発生しました", { status: 500 });
    }
}
