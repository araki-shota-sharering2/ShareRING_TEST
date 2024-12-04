export async function onRequestPost(context) {
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

        // リクエストからグループIDを取得
        const formData = await request.formData();
        const groupId = formData.get("groupId");

        if (!groupId) {
            return new Response(JSON.stringify({ error: "グループIDが提供されていません" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // グループが存在するかを確認
        const groupQuery = `
            SELECT group_id FROM user_groups WHERE group_id = ?
        `;
        const groupResult = await env.DB.prepare(groupQuery).bind(groupId).first();

        if (!groupResult) {
            return new Response(JSON.stringify({ error: "グループが存在しません" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }

        // 既にグループに参加しているかを確認
        const memberCheckQuery = `
            SELECT group_member_id FROM user_group_members WHERE group_id = ? AND user_id = ?
        `;
        const memberCheckResult = await env.DB.prepare(memberCheckQuery).bind(groupId, userId).first();

        if (memberCheckResult) {
            return new Response(JSON.stringify({ error: "既にこのグループに参加しています" }), {
                status: 409,
                headers: { "Content-Type": "application/json" },
            });
        }

        // グループに参加
        const joinGroupQuery = `
            INSERT INTO user_group_members (group_id, user_id, joined_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)
        `;
        await env.DB.prepare(joinGroupQuery).bind(groupId, userId).run();

        return new Response(JSON.stringify({ success: true, message: "グループに参加しました" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("グループ参加エラー:", error);
        return new Response(JSON.stringify({ error: "サーバーエラーが発生しました" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
