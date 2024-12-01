export async function onRequestPost(context) {
    const { env, request } = context;
    const data = await request.json();
    const { duration, distance, calories } = data;

    const cookieHeader = request.headers.get("Cookie");
    const cookies = Object.fromEntries(
        cookieHeader.split("; ").map((c) => c.split("=").map(decodeURIComponent))
    );
    const sessionId = cookies.session_id;

    if (!sessionId || !duration || distance == null || calories == null) {
        return new Response(JSON.stringify({ message: "データが不足しています。" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    const session = await env.DB.prepare(
        "SELECT user_id FROM user_sessions WHERE session_id = ?"
    )
        .bind(sessionId)
        .first();

    if (!session) {
        return new Response(JSON.stringify({ message: "セッションが無効です。" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    const userId = session.user_id;

    await env.DB.prepare(
        `INSERT INTO fitness_activities (user_id, activity_type, duration, distance, calories_burned, recorded_at)
         VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
    )
        .bind(userId, "ランニング", duration, distance, calories)
        .run();

    return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
}
