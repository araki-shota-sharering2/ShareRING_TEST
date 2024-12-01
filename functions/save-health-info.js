export async function onRequestPost(context) {
    const { env, request } = context;

    try {
        // リクエストボディを取得
        const data = await request.json();
        const { height, weight } = data;

        // クッキーからセッションIDを取得
        const cookieHeader = request.headers.get("Cookie");
        const cookies = Object.fromEntries(
            cookieHeader.split("; ").map((c) => c.split("=").map(decodeURIComponent))
        );
        const sessionId = cookies.session_id;

        if (!sessionId || !height || !weight) {
            return new Response(JSON.stringify({ message: "セッションIDまたは入力データが不足しています。" }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // セッションテーブルからユーザーIDを取得
        const session = await env.DB.prepare(
            "SELECT user_id FROM user_sessions WHERE session_id = ? AND expires_at > CURRENT_TIMESTAMP"
        )
            .bind(sessionId)
            .first();

        if (!session) {
            return new Response(JSON.stringify({ message: "セッションが無効または期限切れです。" }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const userId = session.user_id;

        // 健康情報をデータベースに保存
        await env.DB.prepare(
            `INSERT INTO user_health_info (user_id, height, weight, updated_at)
             VALUES (?, ?, ?, CURRENT_TIMESTAMP)
             ON CONFLICT(user_id) DO UPDATE 
             SET height = excluded.height, weight = excluded.weight, updated_at = CURRENT_TIMESTAMP`
        )
            .bind(userId, height, weight)
            .run();

        return new Response(JSON.stringify({ success: true, message: "健康情報が保存されました。" }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error("エラー発生:", error);
        return new Response(JSON.stringify({ message: "保存中にエラーが発生しました。", error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
