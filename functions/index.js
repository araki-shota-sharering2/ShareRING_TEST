export async function onRequest(context) {
    const db = context.env.DB;

    switch (context.request.method) {
        case 'GET': {
            try {
                // test_db のデータ取得
                const testDbResult = await db.prepare('SELECT * FROM test_db').all();
                // photo テーブルのデータ取得
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
                return new Response('Error querying database: ' + error.message, { status: 500 });
            }
        }
        case 'POST': {
            try {
                const { table, data } = await context.request.json();

                if (table === 'test_db') {
                    await db.prepare('INSERT INTO test_db (id, name) VALUES (?, ?)').bind(data.id, data.name).run();
                } else if (table === 'photo') {
                    await db.prepare('INSERT INTO photo (blog) VALUES (?)').bind(data.blog).run();
                } else {
                    return new Response('Invalid table specified', { status: 400 });
                }

                return new Response('Data inserted successfully', { status: 200 });
            } catch (error) {
                return new Response('Error inserting data: ' + error.message, { status: 500 });
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
                    return new Response('Invalid table specified', { status: 400 });
                }

                return new Response('Data deleted successfully', { status: 200 });
            } catch (error) {
                return new Response('Error deleting data: ' + error.message, { status: 500 });
            }
        }
        default: {
            return new Response('Method not allowed', { status: 405 });
        }
    }
}
