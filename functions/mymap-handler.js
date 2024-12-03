export async function onRequestGet(context) {
    const { env } = context;

    try {
        const sessionId = context.request.headers.get("Cookie").match(/session_id=([^;]+)/)?.[1];
        if (!sessionId) return new Response("Unauthorized", { status: 401 });

        const sessionQuery = `
            SELECT user_id FROM user_sessions WHERE session_id = ?;
        `;
        const sessionResult = await env.DB.prepare(sessionQuery).bind(sessionId).first();
        if (!sessionResult) return new Response("Unauthorized", { status: 401 });

        const userId = sessionResult.user_id;
        const postsQuery = `
            SELECT 
                post_id, 
                image_url, 
                caption, 
                location, 
                created_at 
            FROM user_posts 
            WHERE user_id = ?;
        `;
        const postsResult = await env.DB.prepare(postsQuery).bind(userId).all();

        const posts = postsResult.results.map(post => ({
            post_id: post.post_id,
            image_url: post.image_url,
            caption: post.caption,
            location: JSON.parse(post.location),
            created_at: post.created_at,
        }));

        return new Response(JSON.stringify({ posts, center: posts[0]?.location || { lat: 0, lng: 0 } }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(error.message || "Internal Server Error", { status: 500 });
    }
}
