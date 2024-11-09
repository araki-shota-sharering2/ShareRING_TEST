export async function onRequest(context) {
    const db = context.env.DB;

    switch (context.request.method) {
        case 'GET': {
            try {
                const testDbResult = await db.prepare('SELECT * FROM test_db').all();
                const photoResult = await db.prepare('SELECT * FROM photo').all();

                const combinedResult = {
                    test_db: testDbResult.results,
                    photo: photoResult.results,
                };

                return new Response(JSON.stringify(combinedResult), {
                    headers: { 
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*' // CORSヘッダーを追加
                    },
                });
            } catch (error) {
                console.error('データベースのクエリエラー:', error);
                return new Response('データベースのクエリエラー: ' + error.message, { status: 500 });
            }
        }
        case 'POST': {
            try {
                const { table, data } = await context.request.json();

                if (table === 'test_db') {
                    await db.prepare('INSERT INTO test_db (id, name) VALUES (?, ?)').bind(data.id, data.name).run();
                } else if (table === 'photo') {
                    await db.prepare('INSERT INTO photo (id, url) VALUES (?, ?)').bind(data.id, data.url).run();
                } else {
                    return new Response('無効なテーブル指定です', { status: 400 });
                }

                return new Response('データが正常に挿入されました', {
                    status: 200,
                    headers: { 'Access-Control-Allow-Origin': '*' } // CORSヘッダーを追加
                });
            } catch (error) {
                console.error('データ挿入エラー:', error);
                return new Response('データ挿入エラー: ' + error.message, { status: 500 });
            }
        }
        case 'DELETE': {
            try {
                const { table, id } = await context.request.json();

                if (table === 'test_db') {
                    await db.prepare('DELETE FROM test_db WHERE id = ?').bind(id).run();
                } else if (table === 'photo') {
                    await db.prepare('DELETE FROM photo WHERE id = ?').bind(id).run();
                } else {
                    return new Response('無効なテーブル指定です', { status: 400 });
                }

                return new Response('データが正常に削除されました', {
                    status: 200,
                    headers: { 'Access-Control-Allow-Origin': '*' } // CORSヘッダーを追加
                });
            } catch (error) {
                console.error('データ削除エラー:', error);
                return new Response('データ削除エラー: ' + error.message, { status: 500 });
            }
        }
        default:
            return new Response('許可されていないメソッドです', {
                status: 405,
                headers: { 'Access-Control-Allow-Origin': '*' } // CORSヘッダーを追加
            });
    }
}
