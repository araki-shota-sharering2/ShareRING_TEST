export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        if (url.pathname === "/api/insert" && request.method === "POST") {
            const formData = await request.formData();
            const text = formData.get("text");
            const png = formData.get("png");

            const reader = new FileReader();
            reader.readAsDataURL(png);
            reader.onloadend = async () => {
                const base64Data = reader.result.split(",")[1];

                await env.DB.prepare("INSERT INTO testDB (text, png) VALUES (?, ?)")
                    .bind(text, base64Data)
                    .run();
            };

            return new Response("データが挿入されました。", { status: 201 });
        } else if (url.pathname === "/api/data") {
            const { results } = await env.DB.prepare("SELECT * FROM testDB").all();
            return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
        }

        return new Response("Not Found", { status: 404 });
    },
};
