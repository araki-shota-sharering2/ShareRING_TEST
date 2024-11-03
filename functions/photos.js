export async function onRequestGet(context) {
    const db = context.env.DB;

    try {
        // 画像データを全て取得
        const result = await db.prepare('SELECT * FROM photo').all();

        // 取得した画像をレスポンスとして返す
        const photos = result.results.map(photo => ({
            title: `Image ID: ${photo.id}`,
            blog: photo.blog // Base64形式の画像
        }));

        return new Response(JSON.stringify(photos), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error retrieving photos:', error); // デバッグ用ログ
        return new Response('Error retrieving photos: ' + error.message, { status: 500 });
    }
}
