export async function onRequestGet(context) {
    const db = context.env.DB;

    try {
        // 画像データを取得
        const result = await db.prepare('SELECT * FROM photo').all();
        
        if (result.results.length === 0) {
            return new Response('No images found', { status: 404 });
        }

        return new Response(JSON.stringify(result.results), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error retrieving photos:', error);
        return new Response('Error retrieving photos: ' + error.message, { status: 500 });
    }
}

export async function onRequestDelete(context) {
    const db = context.env.DB;

    try {
        const { id } = await context.request.json();
        await db.prepare('DELETE FROM photo WHERE id = ?').bind(id).run();

        return new Response('Image deleted successfully', { status: 200 });
    } catch (error) {
        console.error('Error deleting image:', error);
        return new Response('Error deleting image: ' + error.message, { status: 500 });
    }
}
