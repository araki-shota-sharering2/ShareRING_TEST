export default {
    async fetch(request, env) {
        const { pathname } = new URL(request.url);

        if (pathname === "/api/beverages") {
            // 'DB'はwrangler.tomlで定義したデータベースバインディング名と一致する必要があります
            const { results } = await env.DB.prepare(
                "SELECT * FROM Customers WHERE CompanyName = ?"
            )
            .bind("Bs Beverages")  // SQL文のパラメータをバインド
            .all();

            return new Response(JSON.stringify(results), {
                headers: { 'Content-Type': 'application/json' }  // JSON形式のレスポンス
            });
        }

        return new Response(
            "Call /api/beverages to see everyone who works at Bs Beverages"  // その他のパスへのデフォルトレスポンス
        );
    },
};
