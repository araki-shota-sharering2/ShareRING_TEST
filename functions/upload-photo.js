export async function onRequestPost(context) {
    const { request, env } = context;
    const formData = await request.formData();
    const file = formData.get('file'); // フォームからファイルを取得

    if (!file) {
        return new Response('No file uploaded', { status: 400 });
    }

    // R2オブジェクトを作成
    const r2Key = `images/${file.name}`; // ファイルの保存パス（例: images/filename.jpg）
    const uploadOptions = {
        headers: {
            'Content-Type': file.type,
        },
        body: file.stream(),
    };

    // R2バケットにファイルを保存
    try {
        await env.MY_R2_BUCKET.put(r2Key, uploadOptions.body, uploadOptions.headers);
        return new Response(JSON.stringify({ message: 'Upload successful', path: r2Key }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ message: 'Upload failed', error: error.message }), { status: 500 });
    }
}
