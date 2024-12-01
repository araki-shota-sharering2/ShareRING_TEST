export async function onRequestPost(context) {
    const { request, env } = context;

    // リクエストボディを取得
    const data = await request.json();
    const { height, weight } = data;

    // クッキーからセッションIDを取得
    const cookieHeader = request.headers.get("Cookie");
    const cookies = Object.fromEntries(
        cookieHeader.split("; ").map((c) => c.split("=").map(decodeURIComponent))
    );
    const sessionId = cookies.session_id;

    if (!sessionId) {
        return new Response("セッションIDが見つかりません", { status: 401 });
    }

    // セッションテーブルからユーザーIDを取得
    const sessionResult = await env.DB.prepare(
        `SELECT user_id FROM user_sessions WHERE session_id = ?`
    ).bind(sessionId).first();

    if (!sessionResult) {
        return new Response("無効なセッションです", { status: 401 });
    }

    const userId = sessionResult.user_id;

    // データベースに身長と体重を保存（既存の場合は更新）
    await env.DB.prepare(
        `INSERT INTO user_health_info (user_id, height, weight, updated_at) 
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id) DO UPDATE 
        SET height = excluded.height, weight = excluded.weight, updated_at = CURRENT_TIMESTAMP`
    ).bind(userId, height, weight).run();

    return new Response("健康情報が保存されました", { status: 200 });
}
