export async function onRequestGet(context) {
    const { DB } = context.env;

    const query = `
        SELECT * FROM user_groups;
    `;
    try {
        const groups = await DB.prepare(query).all();
        return new Response(JSON.stringify(groups), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(`エラー: ${error.message}`, { status: 500 });
    }
}
