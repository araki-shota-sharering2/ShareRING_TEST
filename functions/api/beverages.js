export default {
    async fetch(request, env) {
        const { pathname } = new URL(request.url);

        if (pathname === "/api/beverages") {
            // ダミーデータを作成
            const data = [
                { id: 1, name: "Bs Beverages", location: "Tokyo" },
                { id: 2, name: "Another Drink", location: "Osaka" }
            ];

            // JSONレスポンスを返す
            return new Response(JSON.stringify(data), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 指定されたパス以外へのリクエストの場合、404を返す
        return new Response("Not Found", { status: 404 });
    }
};
