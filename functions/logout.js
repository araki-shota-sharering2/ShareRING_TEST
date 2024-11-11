export async function onRequestPost(context) {
    const { request, env } = context;
    const cookieHeader = request.headers.get("Cookie");
    const cookies = new Map(cookieHeader?.split("; ").map(c => c.split("=")));
    const sessionId = cookies.get("session_id");

    if (sessionId) {
        await env.DB.prepare(`DELETE FROM user_sessions WHERE session_id = ?`).bind(sessionId).run();
    }

    return new Response("Logout successful", {
        status: 200,
        headers: {
            "Set-Cookie": `session_id=; HttpOnly; Secure; Path=/; Max-Age=0`
        }
    });
}
