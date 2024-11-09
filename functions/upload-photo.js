export async function onRequestPost(context) {
    const { request, env } = context;
    const formData = await request.formData();
    const file = formData.get('file');
    const id = request.headers.get('X-Photo-ID');

    if (!file || !id) {
        return new Response('No file or ID provided', { status: 400 });
    }

    // タイムスタンプを利用して一意のファイル名を作成
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}-${file.name}`; // ファイル名にタイムスタンプを追加
    const r2Key = `images/${uniqueFileName}`;

    const uploadOptions = {
        headers: {
            'Content-Type': file.type,
        },
        body: file.stream(),
    };

    try {
        // R2にファイルを保存
        await env.MY_R2_BUCKET.put(r2Key, uploadOptions.body, uploadOptions.headers);

        // 新しいURLを生成
        const url = `https://pub-ae948fe5f8c746a298df11804f9d8839.r2.dev/${r2Key}`;

        // D1データベースにURLを保存
        const db = env.DB;
        await db.prepare('INSERT INTO photo (id, url) VALUES (?, ?)').bind(id, url).run();

        return new Response(JSON.stringify({ message: 'Upload successful', url }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ message: 'Upload failed', error: error.message }), { status: 500 });
    }
}
