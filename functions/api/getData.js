export default {
    async fetch(request, env) {
        try {
            // SQLクエリを準備して実行
            const { results } = await env.DB.prepare("SELECT id, name FROM test_db").all();

            // 取得した結果をJSONレスポンスで返す
            return new Response(JSON.stringify(results), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            // エラーハンドリング
            return new Response(`Error fetching data: ${error.message}`, { status: 500 });
        }
    }
};
