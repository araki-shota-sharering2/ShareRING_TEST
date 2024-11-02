export default {
    async fetch(request, env) {
        try {
            const stmt = env.sharering_db.prepare("SELECT * FROM test_db");
            const data = await stmt.all();

            return new Response(JSON.stringify(data), {
                headers: { "Content-Type": "application/json" },
            });
        } catch (error) {
            return new Response("データの取得に失敗しました", { status: 500 });
        }
    }
};
