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

        const groupId = new URL(request.url).searchParams.get("groupId");
        if (!groupId) {
            return new Response(JSON.stringify({ message: "グループIDが指定されていません。" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // グループメンバーリストを取得
        const members = await env.DB.prepare(
            `SELECT ua.username, ua.profile_image
             FROM user_group_members AS ugm
             JOIN user_accounts AS ua ON ua.user_id = ugm.user_id
             WHERE ugm.group_id = ?`
        )
            .bind(groupId)
            .all();

        return new Response(JSON.stringify(members.results || []), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("メンバーリスト取得中にエラーが発生しました:", error);
        return new Response(JSON.stringify({ message: "エラーが発生しました。" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
