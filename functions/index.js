export async function onRequest(context) {
    const db = context.env.DB;

    switch (context.request.method) {
        case 'GET': {
            try {
                // test_dbのデータ取得
                const testDbResult = await db.prepare('SELECT * FROM test_db').all();
                // photoテーブルのデータ取得
                const photoResult = await db.prepare('SELECT * FROM photo').all();

                // 結果を結合してレスポンスを返す
                const combinedResult = {
                    test_db: testDbResult.results,
                    photo: photoResult.results,
                };

                return new Response(JSON.stringify(combinedResult), {
                    headers: { 'Content-Type': 'application/json' },
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

                return new Response('データが正常に挿入されました', { status: 200 });
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

                return new Response('データが正常に削除されました', { status: 200 });
            } catch (error) {
                console.error('データ削除エラー:', error);
                return new Response('データ削除エラー: ' + error.message, { status: 500 });
            }
        }
        default: {
            return new Response('許可されていないメソッドです', { status: 405 });
        }
    }
}

export async function onRequestPost(context) {
    const db = context.env.DB;
    const r2 = context.env.MY_R2_BUCKET;

    try {
        const formData = await context.request.formData();
        const file = formData.get('file');
        const id = context.request.headers.get('X-Photo-ID');

        if (!file) {
            return new Response('ファイルが必要です', { status: 400 });
        }

        if (!id) {
            return new Response('IDが必要です', { status: 400 });
        }

        const key = `uploads/${Date.now()}_${file.name}`;
        await r2.put(key, file.stream(), {
            httpMetadata: {
                contentType: file.type,
            },
        });

        const imageUrl = `${context.env.R2_BUCKET_URL}/${key}`;

        await db.prepare('INSERT INTO photo (id, url) VALUES (?, ?)').bind(id, imageUrl).run();

        return new Response('画像が正常にアップロードされ、URLが保存されました', { status: 200 });
    } catch (error) {
        console.error('画像アップロードエラー:', error);
        return new Response(`画像アップロードエラー: ${error.message}`, { status: 500 });
    }
}
