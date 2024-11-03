export async function onRequestPost(context) {
    const db = context.env.DB;

    try {
        const formData = await context.request.formData();
        const id = formData.get('id');
        const file = formData.get('file');

        if (!id) {
            return new Response('ID is required', { status: 400 });
        }

        if (!file) {
            return new Response('File is required', { status: 400 });
        }

        console.log('ID received:', id);

        // ファイルをBase64でエンコード
        const reader = await file.arrayBuffer();
        const base64Image = Buffer.from(reader).toString('base64');

        // `blog` カラムに画像を挿入
        await db.prepare('INSERT INTO photo (id, blog) VALUES (?, ?)').bind(id, base64Image).run();

        console.log('Image inserted successfully');
        return new Response('Image uploaded successfully', { status: 200 });
    } catch (error) {
        console.error('Error uploading image:', error); // デバッグ用ログ
        return new Response('Error uploading image: ' + error.message, { status: 500 });
    }
}
