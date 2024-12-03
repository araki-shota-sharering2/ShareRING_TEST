export async function onRequestGet(context) {
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

        // URLパラメータからgroup_idを取得
        const url = new URL(request.url);
        const groupId = url.searchParams.get("groupId");
        const page = parseInt(url.searchParams.get("page")) || 1;
        const postsPerPage = 8;
        const offset = (page - 1) * postsPerPage;

        if (!groupId) {
            return new Response(JSON.stringify({ error: "グループIDが指定されていません" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // 指定されたグループIDに関連する投稿を取得
        const groupPostsQuery = `
            SELECT 
                gp.group_post_id, gp.image_url, gp.caption, gp.location, gp.created_at, gp.ring_color, gp.address, 
                ua.username, ua.profile_image
            FROM group_posts gp
            JOIN user_accounts ua ON gp.user_id = ua.user_id
            WHERE gp.group_id = ?
            ORDER BY gp.created_at DESC
            LIMIT ? OFFSET ?
        `;
        const groupPosts = await env.DB.prepare(groupPostsQuery).bind(groupId, postsPerPage, offset).all();

        return new Response(JSON.stringify(groupPosts.results), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error in group-posts-handler:", error);
        return new Response(JSON.stringify({ error: "サーバーエラーが発生しました。" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
