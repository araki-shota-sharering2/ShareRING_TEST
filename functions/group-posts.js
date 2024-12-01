export async function onRequestGet(context) {
    const { env, request } = context;

    const group_id = new URL(request.url).searchParams.get("group_id");

    if (!group_id) {
        return new Response(JSON.stringify({ message: "Group ID is required" }), { status: 400 });
    }

    try {
        const posts = await env.DB.prepare(`
            SELECT p.image_url, p.caption, p.created_at, u.username 
            FROM group_posts p
            JOIN user_accounts u ON p.user_id = u.user_id
            WHERE p.group_id = ?
        `).bind(group_id).all();

        return new Response(JSON.stringify(posts), { status: 200 });
    } catch (error) {
        console.error("Error fetching group posts:", error);
        return new Response(JSON.stringify({ message: "Failed to fetch group posts" }), { status: 500 });
    }
}
