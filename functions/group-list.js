export async function onRequestGet(context) {
    const { env } = context;

    try {
        const query = `SELECT group_name, description, group_image_url FROM user_groups`;
        const groups = await env.DB.prepare(query).all();

        return new Response(JSON.stringify(groups), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('エラー:', error);
        return new Response(JSON.stringify({ message: 'グループ取得失敗', error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
