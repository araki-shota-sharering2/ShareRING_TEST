export default {
    async fetch(request, env) {
        try {
            // 簡単なテストレスポンス
            return new Response(JSON.stringify({ message: "Hello, this is a test response" }), {
                headers: { "Content-Type": "application/json" },
            });
        } catch (error) {
            console.error("Error in function:", error);
            return new Response("Internal Server Error", { status: 500 });
        }
    }
};
