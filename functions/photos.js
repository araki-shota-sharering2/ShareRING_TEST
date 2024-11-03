export async function onRequestGet(context) {
    const db = context.env.DB;

    try {
        // 画像データを全て取得
        const result = await db.prepare('SELECT * FROM photo').all();

        // 取得した画像をレスポンスとして返す
        const photos = result.results.map(photo => ({
            title: photo.title,
            image: `data:image/jpeg;base64,${photo.image}` // Base64で画像を返す
        }));

        return new Response(JSON.stringify(photos), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response('Error retrieving photos: ' + error.message, { status: 500 });
    }
}
