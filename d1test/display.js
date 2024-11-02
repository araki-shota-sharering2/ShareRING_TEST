document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("data-container");

    try {
        const response = await fetch("/fetch-data");
        const data = await response.json();

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
        console.error("Error fetching data:", error);
    }
});
