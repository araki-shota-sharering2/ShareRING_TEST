export async function onRequestPost(context) {
    const db = context.env.DB;
    const r2 = context.env.MY_R2_BUCKET;
    const bucketUrl = context.env.R2_BUCKET_URL;  // 環境変数から正しく取得

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

        // ファイルキーを生成
        const key = `uploads/${Date.now()}_${file.name}`;
        await r2.put(key, file.stream(), {
            httpMetadata: {
                contentType: file.type,
            },
        });

        // URLを生成してDBに保存
        const imageUrl = `${bucketUrl}/${key}`;
        await db.prepare('INSERT INTO photo (id, url) VALUES (?, ?)').bind(id, imageUrl).run();

        return new Response('画像が正常にアップロードされ、URLが保存されました', { status: 200 });
    } catch (error) {
        console.error('画像アップロードエラー:', error);
        return new Response(`画像アップロードエラー: ${error.message}`, { status: 500 });
    }
}
