export async function onRequestPost(context) {
    const { env, request } = context;

    try {
        // クッキーからセッションIDを取得
        const cookieHeader = request.headers.get("Cookie");
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

        // フォームデータからグループIDを取得
        const formData = await request.formData();
        const groupId = formData.get("groupId");

        if (!groupId) {
            return new Response(JSON.stringify({ message: "グループIDが提供されていません。" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // グループに作成者をメンバーとして登録
        try {
            const addMemberQuery = `
                INSERT INTO user_group_members (group_id, user_id)
                VALUES (?, ?)
            `;
            console.log("Executing Query:", addMemberQuery, "with groupId:", groupId, "and userId:", userId);
            await env.DB.prepare(addMemberQuery).bind(groupId, userId).run();
        } catch (error) {
            console.error("メンバー登録クエリエラー:", error);
            return new Response(JSON.stringify({ message: "グループメンバー登録に失敗しました。" }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }

        return new Response(JSON.stringify({ message: "グループメンバー登録が正常に完了しました。" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("全体エラー:", error);
        return new Response(JSON.stringify({ message: "グループメンバー登録に失敗しました。", error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
