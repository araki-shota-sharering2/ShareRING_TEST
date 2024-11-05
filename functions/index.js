export async function onRequest(context) {
    const db = context.env.DB;

    switch (context.request.method) {
        case 'GET': {
            try {
                const photoResult = await db.prepare('SELECT * FROM photo').all();
                return new Response(JSON.stringify({ photo: photoResult.results }), {
                    headers: { 'Content-Type': 'application/json' },
                });
            } catch (error) {
                console.error('データベースのクエリエラー:', error);
                return new Response('データベースのクエリエラー: ' + error.message, { status: 500 });
            }
        }
        case 'DELETE': {
            try {
                const { table, id } = await context.request.json();

                if (table === 'photo') {
                    await db.prepare('DELETE FROM photo WHERE id = ?').bind(id).run();
                } else {
                    return new Response('無効なテーブル指定です', { status: 400 });
                }

                return new Response('データが正常に削除されました', { status: 200 });
            } catch (error) {
                console.error('データ削除エラー:', error);
                return new Response('データ削除エラー: ' + error.message, { status: 500 });
            }
        }
        default:
            return new Response('許可されていないメソッドです', { status: 405 });
    }
}
