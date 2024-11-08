export async function onRequestPost(context) {
    const { request, env } = context;
    const formData = await request.formData();
    const file = formData.get('file');
    const id = request.headers.get('X-Photo-ID');

    if (!file || !id) {
        return new Response('No file or ID provided', { status: 400 });
    }

    const r2Key = `images/${file.name}`;
    const uploadOptions = {
        headers: {
            'Content-Type': file.type,
        },
        body: file.stream(),
    };

    try {
        await env.MY_R2_BUCKET.put(r2Key, uploadOptions.body, uploadOptions.headers);

        const url = `https://pub-ae948fe5f8c746a298df11804f9d8839.r2.dev/${r2Key}`;

        const db = env.DB;
        await db.prepare('INSERT INTO photo (id, url) VALUES (?, ?)').bind(id, url).run();

        return new Response(JSON.stringify({ message: 'Upload successful', url }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ message: 'Upload failed', error: error.message }), { status: 500 });
    }
}
