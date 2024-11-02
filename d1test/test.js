document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("dataForm");
    const textInput = document.getElementById("textInput");
    const pngInput = document.getElementById("pngInput");
    const dataList = document.getElementById("dataList");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("text", textInput.value);
        formData.append("png", pngInput.files[0]);

        try {
            await fetch("/api/insert", {
                method: "POST",
                body: formData,
            });

            textInput.value = "";
            pngInput.value = "";
            alert("データが送信されました！");

            loadData();
        } catch (error) {
            console.error("データ送信エラー:", error);
        }
    });

    async function loadData() {
        try {
            const response = await fetch("/api/data");
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

    loadData();
});
