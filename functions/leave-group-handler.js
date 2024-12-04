export async function onRequestPost(context) {
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
        const { groupId } = await request.json();

        if (!groupId) {
            return new Response(JSON.stringify({ message: "グループIDが指定されていません。" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // グループメンバーから削除
        await env.DB.prepare(
            "DELETE FROM user_group_members WHERE group_id = ? AND user_id = ?"
        )
            .bind(groupId, userId)
            .run();

        return new Response(JSON.stringify({ message: "グループを退出しました。" }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("グループ退出処理中にエラーが発生しました:", error);
        return new Response(JSON.stringify({ message: "エラーが発生しました。" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
