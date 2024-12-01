export async function onRequestPost(context) {
    const { env, request } = context;
    const userId = await getUserIdFromSession(request, env);
    const { height, weight } = await request.json();

    await env.DB.prepare(`
        INSERT INTO user_health_info (user_id, height, weight) 
        VALUES (?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET height = excluded.height, weight = excluded.weight
    `).bind(userId, height, weight).run();

    return new Response(JSON.stringify({ message: "Health info saved successfully" }), { status: 200 });
}
