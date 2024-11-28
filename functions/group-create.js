export async function onRequestPost(context) {
    const { DB } = context.env;
    const { groupName, description, groupImageUrl, createdBy } = await context.request.json();

    if (!groupName || !createdBy) {
        return new Response("グループ名または作成者が不足しています。", { status: 400 });
    }

    const query = `
        INSERT INTO user_groups (group_name, description, group_image_url, created_by)
        VALUES (?, ?, ?, ?);
    `;
    try {
        await DB.prepare(query).bind(groupName, description, groupImageUrl, createdBy).run();
        return new Response("グループを作成しました。", { status: 200 });
    } catch (error) {
        return new Response(`エラー: ${error.message}`, { status: 500 });
    }
}
