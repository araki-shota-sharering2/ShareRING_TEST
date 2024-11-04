export async function onRequestPost(context) {
    const db = context.env.DB;
    const r2 = context.env.MY_R2_BUCKET;

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

        const key = `uploads/${Date.now()}_${file.name}`;
        await r2.put(key, file.stream(), {
            httpMetadata: {
                contentType: file.type,
            },
        });

        const imageUrl = `${context.env.R2_BUCKET_URL}/${key}`;

        await db.prepare('INSERT INTO photo (id, url) VALUES (?, ?)').bind(id, imageUrl).run();

        return new Response('画像が正常にアップロードされ、URLが保存されました', { status: 200 });
    } catch (error) {
        console.error('画像アップロードエラー:', error);
        return new Response(`画像アップロードエラー: ${error.message}`, { status: 500 });
    }
}

export async function onRequestGet(context) {
    const db = context.env.DB;

    try {
        const result = await db.prepare('SELECT * FROM photo').all();
        const photos = result.results.map(photo => ({
            id: photo.id,
            url: photo.url
        }));

        return new Response(JSON.stringify(photos), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('画像取得エラー:', error);
        return new Response(`画像取得エラー: ${error.message}`, { status: 500 });
    }
}

export async function onRequestDelete(context) {
    const db = context.env.DB;

    try {
        const { id } = await context.request.json();
        await db.prepare('DELETE FROM photo WHERE id = ?').bind(id).run();

        return new Response('画像が正常に削除されました', { status: 200 });
    } catch (error) {
        console.error('画像削除エラー:', error);
        return new Response(`画像削除エラー: ${error.message}`, { status: 500 });
    }
}
