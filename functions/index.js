export async function onRequest(context) {
  // D1データベースのインスタンスを取得
  const db = context.env.DB;

  try {
      // クエリを実行
      const result = await db.prepare('SELECT * FROM test_db').all();

      // レスポンスを返す
      return new Response(JSON.stringify(result.results), {
          headers: { 'Content-Type': 'application/json' },
      });
  } catch (error) {
      return new Response('Error querying database: ' + error.message, { status: 500 });
  }
}
