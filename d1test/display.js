document.addEventListener('DOMContentLoaded', async () => {
    const dataContainer = document.getElementById('data-container');

    try {
        // 最初に作成した `index.js` のエンドポイントを指定
        const response = await fetch('/'); // ルートエンドポイントを指定
        if (!response.ok) {
            throw new Error('データの取得に失敗しました');
        }

        const data = await response.json();
        data.forEach(item => {
            const div = document.createElement('div');
            div.classList.add('data-item');
            div.textContent = `ID: ${item.id}, Name: ${item.name}`;
            dataContainer.appendChild(div);
        });
    } catch (error) {
        dataContainer.textContent = `エラー: ${error.message}`;
    }
});
