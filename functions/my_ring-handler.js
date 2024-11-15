export async function onRequest(context) {
    const { request, env } = context;

    if (request.method === "GET") {
        return await getUserPosts(context);
    } else if (request.method === "DELETE") {
        return await deleteUserPost(context);
    } else {
        return new Response("Method not allowed", { status: 405 });
    }
}

async function getUserPosts({ request, env }) {
    const userId = await getUserIdFromSession(request, env);
    if (!userId) {
        return new Response(JSON.stringify({ message: "セッションが無効です。再ログインしてください。" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    const query = `
        SELECT post_id, image_url, ring_color
        FROM user_posts
        WHERE user_id = ?;
    `;

    try {
        const posts = await env.DB.prepare(query).bind(userId).all();
        return new Response(JSON.stringify(posts.results), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("投稿の取得中にエラーが発生しました:", error);
        return new Response("エラーが発生しました", { status: 500 });
    }
}

async function deleteUserPost({ request, env }) {
    const userId = await getUserIdFromSession(request, env);
    if (!userId) {
        return new Response(JSON.stringify({ message: "セッションが無効です。再ログインしてください。" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    const { post_id } = await request.json();
    const query = `DELETE FROM user_posts WHERE post_id = ? AND user_id = ?`;

    try {
        await env.DB.prepare(query).bind(post_id, userId).run();
        return new Response("投稿を削除しました", { status: 200 });
    } catch (error) {
        console.error("投稿の削除中にエラーが発生しました:", error);
        return new Response("エラーが発生しました", { status: 500 });
    }
}

async function getUserIdFromSession(request, env) {
    const cookies = parseCookies(request.headers.get("Cookie"));
    const sessionId = cookies["session_id"];

    if (!sessionId) return null;

    try {
        const session = await env.DB.prepare(
            `SELECT user_id, expires_at FROM user_sessions WHERE session_id = ?`
        ).bind(sessionId).first();

        if (!session) return null;

        const now = new Date();
        const expiresAt = new Date(session.expires_at);

        if (expiresAt < now) return null;

        return session.user_id;
    } catch (error) {
        console.error("セッション情報の取得中にエラーが発生しました:", error);
        return null;
    }
}

function parseCookies(cookieString) {
    const cookies = {};
    if (!cookieString) return cookies;

    cookieString.split(";").forEach((cookie) => {
        const [key, value] = cookie.trim().split("=");
        cookies[key] = decodeURIComponent(value);
    });

    return cookies;
}
