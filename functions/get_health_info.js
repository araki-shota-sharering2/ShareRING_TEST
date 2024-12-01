export async function onRequestGet(context) {
    const { env, request } = context;
    const userId = await getUserIdFromSession(request, env);

    const healthInfo = await env.DB.prepare(`
        SELECT height, weight FROM user_health_info WHERE user_id = ?
    `).bind(userId).first();

    return new Response(JSON.stringify(healthInfo || {}), { status: 200 });
}
