export async function onRequestPost(context) {
    const db = context.env.DB;
    const r2 = context.env.MY_R2_BUCKET;
    const bucketUrl = context.env.R2_BUCKET_URL.replace(/\/$/, ''); // URL末尾のスラッシュを削除

    try {
        if (!r2) {
            throw new Error("R2バケットが正しく設定されていません。環境変数 'MY_R2_BUCKET' を確認してください。");
        }

        const formData = await context.request.formData();
        const file = formData.get('file');
        const id = context.request.headers.get('X-Photo-ID');

        if (!file) {
            return new Response('ファイルが必要です', { status: 400 });
        }

        if (!id) {
            return new Response('IDが必要です', { status: 400 });
        }

        // 特殊文字をエンコードしてファイルキーを生成
        const key = `uploads/${Date.now()}_${encodeURIComponent(file.name)}`;
        const putResult = await r2.put(key, file.stream(), {
            httpMetadata: {
                contentType: file.type,
            },
        });

        if (!putResult) {
            throw new Error("R2へのファイルアップロードに失敗しました。");
        }

        // 生成されたURLをデータベースに保存
        const imageUrl = `${bucketUrl}/${key}`;
        await db.prepare('INSERT INTO photo (id, url) VALUES (?, ?)').bind(id, imageUrl).run();

        return new Response('画像が正常にアップロードされ、URLが保存されました', { status: 200 });
    } catch (error) {
        console.error('画像アップロードエラー:', error);
        return new Response(`画像アップロードエラー: ${error.message}`, { status: 500 });
    }
}
