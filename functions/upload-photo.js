export async function onRequestPost(context) {
    const db = context.env.DB;

    try {
        const formData = await context.request.formData();
        const title = formData.get('title');
        const file = formData.get('file');

        if (!title || !file) {
            return new Response('Title and file are required', { status: 400 });
        }

        // 仮にファイルをBase64で保存するとして変換
        const reader = await file.arrayBuffer();
        const base64Image = Buffer.from(reader).toString('base64');

        // テーブルに挿入
        await db.prepare('INSERT INTO photo (title, image) VALUES (?, ?)').bind(title, base64Image).run();

        return new Response('Image uploaded successfully', { status: 200 });
    } catch (error) {
        return new Response('Error uploading image: ' + error.message, { status: 500 });
    }
}
