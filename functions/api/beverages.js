export default {
    async fetch(request) {
        const data = [
            { id: 1, name: "Bs Beverages", location: "Tokyo" }
            // 他のデータ
        ];

        return new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
