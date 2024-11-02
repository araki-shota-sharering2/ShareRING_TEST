document.getElementById("fetch-data").addEventListener("click", async () => {
    try {
        const response = await fetch('/api/beverages'); // APIエンドポイントにリクエスト
        const data = await response.json(); // レスポンスをJSON形式でパース

        document.getElementById("output").textContent = JSON.stringify(data, null, 2); // 整形して表示
    } catch (error) {
        document.getElementById("output").textContent = "エラーが発生しました: " + error.message; // エラーメッセージを表示
    }
});
