export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (url.pathname === "/api/insert" && request.method === "POST") {
            try {
                const data = await request.json();
                const { text, png } = data;

                await env.DB.prepare("INSERT INTO testDB (text, png) VALUES (?, ?)").bind(text, png).run();
                return new Response("データが挿入されました。", { status: 201 });
            } catch (error) {
                return new Response("挿入エラー: " + error.message, { status: 500 });
            }
        }

        return new Response("Not Found", { status: 404 });
    },
};
