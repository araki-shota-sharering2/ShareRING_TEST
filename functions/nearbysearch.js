const fetch = require('node-fetch'); // サーバーサイドの場合

async function handleRequest(req, res) {
    const { location, radius, type } = req.query;

    try {
        const apiResponse = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&type=${type}&key=AIzaSyCIbW8SaZBjgKXB3yt7ig0OYnzD0TIi2h8`);
        const data = await apiResponse.json();
        res.json(data); // JSONを返す
    } catch (error) {
        console.error("APIエラー:", error);
        res.status(500).send("サーバーエラー");
    }
}
