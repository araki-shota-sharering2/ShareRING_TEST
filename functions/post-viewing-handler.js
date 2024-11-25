export async function onRequestGet(context) {
    const { request, env } = context;

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page")) || 1;
    const itemsPerPage = 8;
    const offset = (page - 1) * itemsPerPage;

    const posts = await env.DB.prepare(
        `SELECT 
            posts.post_id, 
            posts.image_url, 
            posts.caption, 
            posts.address, 
            posts.created_at, 
            posts.ring_color, 
            users.username, 
            users.profile_image
         FROM user_posts AS posts
         JOIN user_accounts AS users ON posts.user_id = users.user_id
         ORDER BY posts.created_at DESC
         LIMIT ? OFFSET ?`
    )
        .bind(itemsPerPage, offset)
        .all();

    return new Response(JSON.stringify(posts.results), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
}
