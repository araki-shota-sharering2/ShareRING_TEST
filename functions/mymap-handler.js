export async function onRequestGet(context) {
    const { env, request } = context;
  
    try {
      // CookieからセッションIDを取得
      const cookieHeader = request.headers.get("Cookie");
      const cookies = new Map(cookieHeader?.split("; ").map((c) => c.split("=")));
      const sessionId = cookies.get("session_id");
  
      if (!sessionId) {
        console.error("セッションIDが取得できません");
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
  
      // セッションIDからユーザーIDを取得
      const sessionQuery = `
        SELECT user_id FROM user_sessions WHERE session_id = ?;
      `;
      const sessionResult = await env.DB.prepare(sessionQuery).bind(sessionId).first();
  
      if (!sessionResult) {
        console.error("セッションが見つかりません: sessionId =", sessionId);
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
  
      const userId = sessionResult.user_id;
  
      // ユーザーの投稿データを取得
      const postsQuery = `
        SELECT 
          posts.post_id, 
          posts.image_url, 
          posts.caption, 
          posts.location, 
          posts.created_at
        FROM user_posts AS posts
        WHERE posts.user_id = ?
        ORDER BY posts.created_at DESC;
      `;
      const postsResult = await env.DB.prepare(postsQuery).bind(userId).all();
  
      if (!postsResult.results || postsResult.results.length === 0) {
        console.error("投稿が見つかりません: userId =", userId);
        return new Response(JSON.stringify({ error: "No posts found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
  
      const posts = postsResult.results.map(post => ({
        post_id: post.post_id,
        image_url: post.image_url,
        caption: post.caption,
        location: JSON.parse(post.location), // locationがJSON形式で保存されていることを前提
        created_at: post.created_at,
      }));
  
      return new Response(JSON.stringify({ posts, center: posts[0]?.location || { lat: 0, lng: 0 } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("サーバーエラー:", error.message);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
  