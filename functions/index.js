export async function onRequest(context) {
    const db = context.env.DB;

    // HTTPメソッドの分岐
    switch (context.request.method) {
        case 'GET': {
            // データの取得
            try {
                const result = await db.prepare('SELECT * FROM test_db').all();
                return new Response(JSON.stringify(result.results), {
                    headers: { 'Content-Type': 'application/json' },
                });
            } catch (error) {
                return new Response('Error querying database: ' + error.message, { status: 500 });
            }
        }
        case 'POST': {
            // データの挿入
            try {
                const { name } = await context.request.json();
                await db.prepare('INSERT INTO test_db (name) VALUES (?)').bind(name).run();
                return new Response('Data inserted successfully', { status: 200 });
            } catch (error) {
                return new Response('Error inserting data: ' + error.message, { status: 500 });
            }
        }
        case 'DELETE': {
            // データの削除
            try {
                const { id } = await context.request.json();
                await db.prepare('DELETE FROM test_db WHERE id = ?').bind(id).run();
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
