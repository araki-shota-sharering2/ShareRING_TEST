export async function onRequestPost(context) {
    const { env, request } = context;

    const cookieHeader = request.headers.get("Cookie");
    const cookies = new Map(cookieHeader?.split("; ").map(c => c.split("=")));
    const sessionId = cookies.get("session_id");

    if (!sessionId) {
        return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    try {
        // Retrieve user ID from session
        const session = await env.DB.prepare(`
            SELECT user_id FROM user_sessions 
            WHERE session_id = ? AND expires_at > CURRENT_TIMESTAMP
        `).bind(sessionId).first();

        if (!session) {
            return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        const { destination, distance, activityType } = await request.json();

        if (!destination || !distance || !activityType) {
            return new Response(JSON.stringify({ message: "Missing required fields" }), { status: 400 });
        }

        // Retrieve user health info
        const healthInfo = await env.DB.prepare(`
            SELECT height, weight FROM user_health_info WHERE user_id = ?
        `).bind(session.user_id).first();

        if (!healthInfo) {
            return new Response(JSON.stringify({ message: "Health info not found" }), { status: 404 });
        }

        const { height, weight } = healthInfo;

        // Calculate calories burned (simple MET-based formula)
        const MET = activityType === "running" ? 8 : 3.5; // MET value based on activity
        const caloriesBurned = Math.round(MET * weight * (distance / 5)); // Approximation

        // Log activity in the database
        await env.DB.prepare(`
            INSERT INTO fitness_activities (user_id, activity_type, duration, distance, calories_burned, recorded_at)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `).bind(session.user_id, activityType, distance / 5, distance, caloriesBurned).run();

        return new Response(
            JSON.stringify({
                message: "Calories calculated successfully",
                caloriesBurned,
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error calculating calories:", error);
        return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
    }
}
