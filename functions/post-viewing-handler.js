export async function onRequestGet(context) {
    const { request, env } = context;

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page")) || 1;
    const itemsPerPage = 10;
    const offset = (page - 1) * itemsPerPage;

    const posts = await env.DB.prepare(`
        SELECT post_id, image_url, caption, location, created_at, ring_color, address
        FROM user_posts
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
    `).bind(itemsPerPage, offset).all();

    return new Response(JSON.stringify(posts.results), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
}
