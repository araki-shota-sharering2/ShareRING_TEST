export async function onRequestPost(context) {
    const db = context.env.DB;

    try {
        const formData = await context.request.formData();
        const id = formData.get('id');
        const file = formData.get('file');

        if (!id) {
            console.error('ID is missing');
            return new Response('ID is required', { status: 400 });
        }

        if (!file) {
            console.error('File is missing');
            return new Response('File is required', { status: 400 });
        }

        console.log('File received, processing to Base64');
        const reader = await file.arrayBuffer();
        const base64Image = Buffer.from(reader).toString('base64');
        
        // Base64エンコードされたデータをログに出力
        console.log('Base64 encoded image:', base64Image.substring(0, 100)); // 部分的に表示

        // `blog` カラムに画像を挿入
        await db.prepare('INSERT INTO photo (id, blog) VALUES (?, ?)').bind(id, base64Image).run();

        console.log('Image inserted successfully');
        return new Response('Image uploaded successfully', { status: 200 });
    } catch (error) {
        console.error('Error uploading image:', error); // エラーメッセージをログ出力
        return new Response('Error uploading image: ' + error.message, { status: 500 });
    }
}
