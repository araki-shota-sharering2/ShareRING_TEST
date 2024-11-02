export default {
    async fetch(request) {
        const data = [
            { id: 1, name: "Bs Beverages", location: "Tokyo" },
            { id: 2, name: "Another Drink", location: "Osaka" }
        ]; // ダミーデータ

        return new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
