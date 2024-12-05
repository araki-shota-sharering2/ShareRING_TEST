export async function onRequestPost(context) {
    const { user_id } = await context.request.json();
    const db = context.env.DB; // D1のバインド名
    const query = `
        SELECT a.name, a.description, a.image_url, a.goal, uap.progress, uap.achieved_at
        FROM awards a
        LEFT JOIN user_award_progress uap
        ON a.award_id = uap.award_id AND uap.user_id = ?
    `;
    const result = await db.prepare(query).bind(user_id).all();
    return new Response(JSON.stringify(result.results), { headers: { 'Content-Type': 'application/json' } });
}
