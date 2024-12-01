export async function onRequestPost(context) {
    const { env, request } = context;

    try {
        // クッキーの取得
        const cookieHeader = request.headers.get("Cookie");
        console.log("Cookie Header:", cookieHeader);
        const cookies = new Map(cookieHeader?.split("; ").map((c) => c.split("=")));
        const sessionId = cookies.get("session_id");
        console.log("Session ID:", sessionId);

        if (!sessionId) {
            console.error("Unauthorized: No session ID found");
            return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        // セッションの確認
        const session = await env.DB.prepare(`
            SELECT user_id FROM user_sessions 
            WHERE session_id = ? AND expires_at > CURRENT_TIMESTAMP
        `).bind(sessionId).first();
        console.log("Session Data:", session);

        if (!session) {
            console.error("Unauthorized: Invalid session");
            return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        // リクエストデータの取得
        const body = await request.json();
        console.log("Request Body:", body);
        const { height, weight } = body;

        if (!height || !weight) {
            console.error("Invalid data: Missing height or weight");
            return new Response(JSON.stringify({ message: "Invalid data" }), { status: 400 });
        }

        // データベースへの保存
        const result = await env.DB.prepare(`
            INSERT INTO user_health_info (user_id, height, weight) 
            VALUES (?, ?, ?) 
            ON CONFLICT(user_id) DO UPDATE 
            SET height = ?, weight = ?, updated_at = CURRENT_TIMESTAMP
        `).bind(session.user_id, height, weight, height, weight).run();
        console.log("Database Result:", result);

        return new Response(JSON.stringify({ message: "Health info saved successfully" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error saving health info:", error);
        return new Response(JSON.stringify({ message: "Internal Server Error", error: error.message }), {
            status: 500,
        });
    }
}
