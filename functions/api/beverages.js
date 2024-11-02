export default {
    async fetch(request, env) {
        try {
            // データベースからidとnameを取得するSQLクエリを実行
            const { results } = await env.DB.prepare("SELECT id, name FROM test_db").all();

            // 取得したデータをJSONレスポンスとして返す
            return new Response(JSON.stringify(results), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            // エラーハンドリング：エラーメッセージを500エラーで返す
            return new Response(`Error fetching data: ${error.message}`, { status: 500 });
        }
    }
};
