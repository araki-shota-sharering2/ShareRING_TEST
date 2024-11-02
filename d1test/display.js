document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("data-container");

    try {
        const response = await fetch("/fetch-data");
        
        // レスポンスのステータスとヘッダーをログに出力
        console.log("Status:", response.status);
        console.log("Headers:", response.headers);

        // テキストとしてレスポンスを取得して出力
        const responseText = await response.text();
        console.log("Response Text:", responseText);

        // JSONとしてパースしてみる
        const data = JSON.parse(responseText);
        console.log("Parsed Data:", data);

        if (data.length > 0) {
            data.forEach(item => {
                const div = document.createElement("div");
                div.className = "data-item";
                div.textContent = `ID: ${item.id}, Name: ${item.name}`;
                container.appendChild(div);
            });
        } else {
            container.textContent = "データがありません。";
        }
    } catch (error) {
        container.textContent = "データの取得中にエラーが発生しました。";
        console.error("Error fetching or parsing data:", error);
    }
});
