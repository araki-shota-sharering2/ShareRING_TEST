export default {
    async fetch(request, env) {
        return new Response(JSON.stringify({ message: "Hello, this is a test response" }), {
            headers: { "Content-Type": "application/json" },
        });
    }
};
