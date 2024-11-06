export async function onRequestPost(context) {
    const db = context.env.DB;
    const r2 = context.env.MY_R2_BUCKET;
    const bucketUrl = context.env.R2_BUCKET_URL.replace(/\/$/, ''); // URL末尾のスラッシュを削除

    try {
        const formData = await context.request.formData();
        const file = formData.get('file');
        const id = formData.get('id'); // D1 に保存するための ID を取得

        if (!file) {
            return new Response('ファイルが必要です', { status: 400 });
        }

        if (!id) {
            return new Response('ID が必要です', { status: 400 });
        }

        // 特殊文字をエンコードしてファイルキーを生成
        const key = `uploads/${Date.now()}_${encodeURIComponent(file.name)}`;
        console.log('生成されたファイルキー:', key);

        // ファイルを R2 バケットにアップロード
        const putResult = await r2.put(key, file.stream(), {
            httpMetadata: {
                contentType: file.type,
            },
        });

        if (!putResult) {
            console.error('アップロード失敗');
            return new Response('ファイルのアップロードに失敗しました', { status: 500 });
        }

        // アップロードされたファイルの URL を生成
        const imageUrl = `${bucketUrl}/${key}`;
        console.log('生成された画像URL:', imageUrl);

        // URL を D1 に保存
        await db.prepare('INSERT INTO photo (id, url) VALUES (?, ?)').bind(id, imageUrl).run();

        return new Response('画像が正常にアップロードされ、URLが保存されました', { status: 200 });
    } catch (error) {
        console.error('画像アップロードエラー:', error);
        return new Response(`画像アップロードエラー: ${error.message}`, { status: 500 });
    }
}
