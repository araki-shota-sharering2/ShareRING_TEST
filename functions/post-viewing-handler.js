export async function onRequestGet(context) {
    const { request, env } = context;

    const posts = await env.DB.prepare(
        `SELECT 
            posts.post_id, 
            posts.image_url, 
            posts.caption, 
            posts.address, 
            posts.created_at, 
            posts.ring_color, 
            users.username
         FROM user_posts AS posts
         JOIN user_accounts AS users ON posts.user_id = users.user_id
         ORDER BY RANDOM()
         LIMIT 10`
    ).all();

    return new Response(JSON.stringify(posts.results), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
}
