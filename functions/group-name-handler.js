export async function onRequestGet(context) {
    const { env, request } = context;

    try {
        // URLパラメータからグループIDを取得
        const url = new URL(request.url);
        const groupId = url.searchParams.get("groupId");

        if (!groupId) {
            return new Response(JSON.stringify({ error: "グループIDが指定されていません。" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // データベースからグループ名を取得
        const result = await env.DB.prepare(
            "SELECT group_name FROM user_groups WHERE group_id = ?"
        )
            .bind(groupId)
            .first();

        if (!result) {
            return new Response(JSON.stringify({ error: "指定されたグループが見つかりません。" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }

        // グループ名をJSONで返す
        return new Response(JSON.stringify({ groupName: result.group_name }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("グループ名取得中のエラー:", error);
        return new Response(JSON.stringify({ error: "サーバーエラーが発生しました。" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
