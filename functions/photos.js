export async function onRequestGet(context) {
    const db = context.env.DB;

    try {
        // 画像URLデータを全て取得
        const result = await db.prepare('SELECT * FROM photo').all();

        // 取得した画像URLをレスポンスとして返す
        const photos = result.results.map(photo => ({
            id: photo.id,
            url: photo.blog // URL形式で保存されていると仮定
        }));

        return new Response(JSON.stringify(photos), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error retrieving photos:', error); // デバッグ用ログ
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
        console.error('Error deleting image:', error); // デバッグ用ログ
        return new Response('Error deleting image: ' + error.message, { status: 500 });
    }
}
