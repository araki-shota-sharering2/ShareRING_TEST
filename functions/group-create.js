import { generateUUID } from './utils';

export async function onRequestPost(context) {
    const { env, request } = context;
    const formData = await request.formData();
    const groupName = formData.get('groupName');
    const groupDescription = formData.get('groupDescription');
    const groupImage = formData.get('groupImage');

    if (!groupName || !groupImage) {
        return new Response(JSON.stringify({ message: 'グループ名と画像は必須です' }), { status: 400 });
    }

    const timestamp = Date.now();
    const uniqueFileName = `group-${timestamp}-${generateUUID()}`;
    const r2Key = `group_images/${uniqueFileName}`;

    try {
        // R2へ画像をアップロード
        await env.MY_R2_BUCKET.put(r2Key, groupImage.stream(), {
            headers: { 'Content-Type': groupImage.type }
        });

        const groupImageUrl = `https://pub-ae948fe5f8c746a298df11804f9d8839.r2.dev/${r2Key}`;

        // データベースにグループを登録
        const db = env.DB;
        await db.prepare(
            `INSERT INTO user_groups (group_name, description, group_image_url, created_by)
            VALUES (?, ?, ?, ?)`
        ).bind(groupName, groupDescription, groupImageUrl, 1 /* created_by をセッションで取得 */).run();

        return new Response(JSON.stringify({ message: 'グループ作成成功', groupImageUrl }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('エラー:', error);
        return new Response(JSON.stringify({ message: 'グループ作成失敗', error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
