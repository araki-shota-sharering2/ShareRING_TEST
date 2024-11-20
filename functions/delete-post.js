export async function onRequestPost(context) {
    const { request, env } = context;
    const { postId } = await request.json();

    try {
        const result = await env.DB.prepare(`
            DELETE FROM user_posts WHERE post_id = ?
        `).bind(postId).run();

        if (result.success) {
            return new Response("Post deleted successfully", { status: 200 });
        } else {
            return new Response("Failed to delete post", { status: 500 });
        }
    } catch (error) {
        console.error("Error deleting post:", error);
        return new Response("Error deleting post", { status: 500 });
    }
}
