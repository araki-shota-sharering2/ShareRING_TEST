export async function onRequest(context) {
    const { request } = context;
    const url = new URL(request.url);
    const location = url.searchParams.get("location");
    const radius = url.searchParams.get("radius");
    const type = url.searchParams.get("type");
    const GOOGLE_API_KEY = "AIzaSyCIbW8SaZBjgKXB3yt7ig0OYnzD0TIi2h8"; // あなたのAPIキーをここに入力

    if (!location || !radius || !type) {
        return new Response("必要なパラメータが不足しています", { status: 400 });
    }

    try {
        const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&type=${type}&key=${GOOGLE_API_KEY}`;
        const apiResponse = await fetch(apiUrl);
        const apiData = await apiResponse.json();

        return new Response(JSON.stringify(apiData), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Google Places API の取得中にエラーが発生しました:", error);
        return new Response("内部サーバーエラー", { status: 500 });
    }
}
