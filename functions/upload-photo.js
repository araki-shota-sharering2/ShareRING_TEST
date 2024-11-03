const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const r2Client = new S3Client({
    region: 'auto',
    endpoint: 'https://<your-account-id>.r2.cloudflarestorage.com',
    credentials: {
        accessKeyId: 'your-access-key-id',
        secretAccessKey: 'your-secret-access-key',
    },
});

export async function onRequestPost(context) {
    const db = context.env.DB;

    try {
        const formData = await context.request.formData();
        const id = formData.get('id');
        const file = formData.get('file');

        if (!id || !file) {
            return new Response('ID and file are required', { status: 400 });
        }

        // ファイルをR2にアップロード
        const objectKey = `${id}-${file.name}`;
        const command = new PutObjectCommand({
            Bucket: 'my-photo-bucket',
            Key: objectKey,
            Body: file.stream(),
            ContentType: file.type,
        });
        await r2Client.send(command);

        // アップロード後のURLを生成
        const imageUrl = `https://my-photo-bucket.<your-account-id>.r2.cloudflarestorage.com/${objectKey}`;

        // 画像URLをD1データベースに保存
        await db.prepare('INSERT INTO photo (id, blog) VALUES (?, ?)').bind(id, imageUrl).run();

        return new Response('Image uploaded successfully', { status: 200 });
    } catch (error) {
        console.error('Error uploading image:', error);
        return new Response('Error uploading image: ' + error.message, { status: 500 });
    }
}
