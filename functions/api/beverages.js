export default {
    async fetch(request) {
        const data = { message: "This is a JSON response" };
        return new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
