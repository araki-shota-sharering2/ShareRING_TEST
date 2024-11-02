document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("data-container");

    try {
        const response = await fetch("/fetch-data");
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // データが空の場合
        if (data.length === 0) {
            container.textContent = "データがありません。";
            return;
        }

        // データを表示
        container.innerHTML = "";
        data.forEach(item => {
            const div = document.createElement("div");
            div.className = "data-item";
            div.textContent = `ID: ${item.id}, Name: ${item.name}`;
            container.appendChild(div);
        });
    } catch (error) {
        container.textContent = "データの取得中にエラーが発生しました。";
        console.error("Error fetching or parsing data:", error);
    }
});
