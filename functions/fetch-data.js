export default {
    async fetch(request, env) {
        try {
            // D1データベースへの接続とデータ取得
            const stmt = env.DB.prepare("SELECT * FROM test_db");
            const data = await stmt.all();

            return new Response(JSON.stringify(data), {
                headers: { "Content-Type": "application/json" },
            });
        } catch (error) {
            console.error("Error fetching data:", error);
            return new Response("Internal Server Error", { status: 500 });
        }
    }
};
