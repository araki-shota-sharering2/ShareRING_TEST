async function loadData() {
    try {
        const response = await fetch("/api/data");
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json();

        dataList.innerHTML = "";
        data.forEach(item => {
            const div = document.createElement("div");
            div.innerHTML = `
                <p>Text: ${item.text}</p>
                <img src="data:image/png;base64,${item.png}" alt="PNG Image" />
            `;
            dataList.appendChild(div);
        });
    } catch (error) {
        console.error("データ読み込みエラー:", error);
    }
}
