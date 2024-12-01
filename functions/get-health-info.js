export async function onRequestGet(context) {
    const { env, request } = context;

    try {
        // クッキーからセッションIDを取得
        const cookieHeader = request.headers.get("Cookie");
        const cookies = Object.fromEntries(
            cookieHeader.split("; ").map((c) => c.split("=").map(decodeURIComponent))
        );
        const sessionId = cookies.session_id;

        if (!sessionId) {
            return new Response(JSON.stringify({ message: "セッションIDがありません。" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // セッションからユーザーIDを取得
        const session = await env.DB.prepare(
            "SELECT user_id FROM user_sessions WHERE session_id = ? AND expires_at > CURRENT_TIMESTAMP"
        )
            .bind(sessionId)
            .first();

        if (!session) {
            return new Response(JSON.stringify({ message: "セッションが無効または期限切れです。" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        const userId = session.user_id;

        // 健康情報を取得
        const healthInfo = await env.DB.prepare(
            "SELECT height, weight FROM user_health_info WHERE user_id = ?"
        )
            .bind(userId)
            .first();

        return new Response(JSON.stringify(healthInfo || {}), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("エラー発生:", error);
        return new Response(JSON.stringify({ message: "データ取得中にエラーが発生しました。" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
