export async function onRequestGet(context) {
    const { request, env } = context;

    // リクエストURLからパラメータを取得
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page")) || 1; // 現在のページ番号
    const sort = url.searchParams.get("sort") || "latest"; // ソートの種類 (デフォルトは最新順)
    const lat = parseFloat(url.searchParams.get("lat")); // 現在地の緯度
    const lng = parseFloat(url.searchParams.get("lng")); // 現在地の経度
    const itemsPerPage = 8; // 1ページあたりの投稿数
    const offset = (page - 1) * itemsPerPage; // ページネーションのオフセット計算

    // ソートクエリの初期設定（デフォルトは最新順）
    let sortQuery = "ORDER BY posts.created_at DESC";
    let bindParams = [itemsPerPage, offset];

    // 現在地から近い順の場合、距離計算を使用
    if (sort === "nearby" && lat !== undefined && lng !== undefined) {
        sortQuery = `
            ORDER BY (
                (posts.location_lat - ?) * (posts.location_lat - ?) +
                (posts.location_lng - ?) * (posts.location_lng - ?)
            ) ASC
        `;
        bindParams = [lat, lat, lng, lng, itemsPerPage, offset];
    }

    // クエリの構築
    const query = `
        SELECT 
            posts.post_id, 
            posts.image_url, 
            posts.caption, 
            posts.address, 
            posts.created_at, 
            posts.ring_color, 
            posts.location_lat, 
            posts.location_lng,
            users.username, 
            users.profile_image
        FROM user_posts AS posts
        JOIN user_accounts AS users ON posts.user_id = users.user_id
        ${sortQuery}
        LIMIT ? OFFSET ?
    `;

    try {
        // クエリの実行
        const posts = await env.DB.prepare(query).bind(...bindParams).all();

        // 結果をJSONで返却
        return new Response(JSON.stringify(posts.results), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        // エラーハンドリング
        console.error("データベースクエリ中にエラーが発生しました:", error);
        return new Response(
            JSON.stringify({ error: "データの取得中に問題が発生しました" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
