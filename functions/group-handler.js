export async function onRequestGet(context) {
    const { env } = context;

    try {
        // 現在ログインしているユーザーのセッションIDを取得
        const cookieHeader = context.request.headers.get("Cookie");
        const cookies = Object.fromEntries(
            cookieHeader?.split("; ").map((c) => c.split("=").map(decodeURIComponent)) || []
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
        ).bind(sessionId).first();

        if (!session) {
            return new Response(JSON.stringify({ message: "セッションが無効または期限切れです。" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        const userId = session.user_id;

        // ユーザーが参加しているグループの取得
        try {
            const groupsQuery = `
                SELECT g.group_id, g.group_name
                FROM user_groups g
                JOIN user_group_members m ON g.group_id = m.group_id
                WHERE m.user_id = ?
            `;
            const groups = await env.DB.prepare(groupsQuery).bind(userId).all();

            return new Response(JSON.stringify(groups.results), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        } catch (error) {
            console.error("グループ取得エラー:", error);
            return new Response(JSON.stringify({ message: "グループの取得に失敗しました。" }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }
    } catch (error) {
        console.error("グループ取得中の全体エラー:", error);
        return new Response(JSON.stringify({ message: "グループ情報の取得に失敗しました。" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
