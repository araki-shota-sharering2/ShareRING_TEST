export async function onRequestPost(context) {
    const db = context.env.DB;
    const bucketName = "my-photo-bucket"; // R2のバケット名
    const accountId = context.env.CLOUDFLARE_ACCOUNT_ID; // アカウントID
    const apiToken = context.env.R2_API_TOKEN; // APIトークン
    const bucketUrl = context.env.R2_BUCKET_URL.replace(/\/$/, ''); // URL末尾のスラッシュを削除

    try {
        const formData = await context.request.formData();
        const file = formData.get('file');
        const id = context.request.headers.get('X-Photo-ID');

        if (!file) {
            return new Response('ファイルが必要です', { status: 400 });
        }

        if (!id) {
            return new Response('IDが必要です', { status: 400 });
        }

        const key = `uploads/${Date.now()}_${encodeURIComponent(file.name)}`;
        const uploadUrl = `${bucketUrl}/${bucketName}/${key}`;

        // R2にファイルをアップロード
        const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': file.type,
            },
            body: file.stream()
        });

        if (!uploadResponse.ok) {
            throw new Error("R2へのファイルアップロードに失敗しました");
        }

        const imageUrl = `${bucketUrl}/${key}`;
        await db.prepare('INSERT INTO photo (id, url) VALUES (?, ?)').bind(id, imageUrl).run();

        return new Response('画像が正常にアップロードされ、URLが保存されました', { status: 200 });
    } catch (error) {
        console.error('画像アップロードエラー:', error);
        return new Response(`画像アップロードエラー: ${error.message}`, { status: 500 });
    }
}
