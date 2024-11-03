export async function onRequestPost(context) {
    const db = context.env.DB;

    try {
        console.log('Starting form data processing...');
        const formData = await context.request.formData();
        const id = formData.get('id');
        const file = formData.get('file');

        if (!id) {
            console.error('Error: ID is missing');
            return new Response('ID is required', { status: 400 });
        }

        if (!file) {
            console.error('Error: File is missing');
            return new Response('File is required', { status: 400 });
        }

        console.log('File received:', file.name);

        // ファイルをBase64でエンコード
        const reader = await file.arrayBuffer();
        const base64Image = Buffer.from(reader).toString('base64');

        // Base64エンコードデータを一部表示（100文字まで）
        console.log('Base64 encoded image preview:', base64Image.substring(0, 100));

        console.log('Inserting image into the database...');
        await db.prepare('INSERT INTO photo (id, blog) VALUES (?, ?)').bind(id, base64Image).run();

        console.log('Image inserted successfully');
        return new Response('Image uploaded successfully', { status: 200 });
    } catch (error) {
        console.error('Error during image upload:', error.message);
        return new Response('Error uploading image: ' + error.message, { status: 500 });
    }
}
