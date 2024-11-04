export async function onRequestPost(context) {
    const db = context.env.DB;
    const r2 = context.env.MY_R2_BUCKET; // R2バケットへのバインディング

    try {
        const formData = await context.request.formData();
        const file = formData.get('file');

        if (!file) {
            return new Response('File is required', { status: 400 });
        }

        // ファイルをR2にアップロード
        const key = `uploads/${Date.now()}_${file.name}`;
        await r2.put(key, file.stream(), {
            httpMetadata: {
                contentType: file.type,
            },
        });

        // 画像のURLを作成
        const imageUrl = `https://${context.env.R2_BUCKET_URL}/${key}`;

        // D1にURLを保存
        await db.prepare('INSERT INTO photo (blog) VALUES (?)').bind(imageUrl).run();

        return new Response('Image uploaded and URL saved successfully', { status: 200 });
    } catch (error) {
        console.error('Error uploading image:', error); // デバッグ用ログ
        return new Response('Error uploading image: ' + error.message, { status: 500 });
    }
}
