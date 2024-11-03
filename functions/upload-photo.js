export async function onRequestPost(context) {
    const db = context.env.DB;

    try {
        const formData = await context.request.formData();
        const file = formData.get('file');

        if (!file) {
            console.error('File not found in formData');
            return new Response('File is required', { status: 400 });
        }

        try {
            const reader = await file.arrayBuffer();
            const base64Image = Buffer.from(reader).toString('base64');

            // `blog` カラムに画像を挿入
            await db.prepare('INSERT INTO photo (blog) VALUES (?)').bind(base64Image).run();
            console.log('Image inserted successfully');

            return new Response('Image uploaded successfully', { status: 200 });
        } catch (encodeError) {
            console.error('Error encoding or inserting image:', encodeError);
            return new Response('Error encoding image: ' + encodeError.message, { status: 500 });
        }
    } catch (error) {
        console.error('Error processing upload:', error);
        return new Response('Error processing upload: ' + error.message, { status: 500 });
    }
}
