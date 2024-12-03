export async function onRequestGet(context) {
    const { request, env } = context;
    const cookieHeader = request.headers.get("Cookie");
    const cookies = new Map(cookieHeader?.split("; ").map(c => c.split("=")));
    const sessionId = cookies.get("session_id");
  
    if (!sessionId) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }
  
    const session = await env.DB.prepare(`
        SELECT user_id FROM user_sessions WHERE session_id = ? AND expires_at > CURRENT_TIMESTAMP
    `).bind(sessionId).first();
  
    if (!session) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }
  
    const url = new URL(request.url);
    const posts = await env.DB.prepare(`
        SELECT post_id, image_url, caption, location, created_at
        FROM user_posts
        WHERE user_id = ?
        ORDER BY created_at DESC
    `).bind(session.user_id).all();
  
    const formattedPosts = posts.results.map(post => ({
      ...post,
      location: JSON.parse(post.location) // 緯度経度を解析
    }));
  
    return new Response(JSON.stringify(formattedPosts), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  