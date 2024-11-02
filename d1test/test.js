document.getElementById("fetch-data").addEventListener("click", async () => {
    try {
        // APIエンドポイントにGETリクエストを送信
        const response = await fetch('/functions/api/getData.js');
        
        // レスポンスがOKでなければエラーをスロー
        if (!response.ok) {
            throw new Error(`HTTPエラー! ステータス: ${response.status}`);
        }

        // JSONデータをパース
        const data = await response.json();

        // データを整形して出力
        document.getElementById("output").textContent = JSON.stringify(data, null, 2);
    } catch (error) {
        // エラーメッセージを出力
        document.getElementById("output").textContent = "エラーが発生しました: " + error.message;
    }
});
