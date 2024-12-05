// アチーブメントデータを取得
async function fetchAchievements() {
    try {
        const response = await fetch('/achievements', {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            console.error("アチーブメントデータの取得に失敗しました:", response.status);
            alert("アチーブメントデータの取得に失敗しました。");
            return;
        }

        const data = await response.json();

        // データ形式を確認し、results配列を取得
        if (!data.success || !Array.isArray(data.results)) {
            console.error("取得したデータは正しい形式ではありません:", data);
            alert("アチーブメントデータの形式が正しくありません。");
            return;
        }

        const achievements = data.results;
        const container = document.getElementById('achievement-container');
        container.innerHTML = ''; // コンテナをクリア

        achievements.forEach((achievement) => {
            // アチーブメントカードを作成
            const card = document.createElement('div');
            card.className = 'achievement-card';

            // 画像セクション
            const imageContainer = document.createElement('div');
            imageContainer.className = 'achievement-image';

            const image = document.createElement('img');
            image.src = achievement.image_url;
            image.alt = achievement.name;
            imageContainer.appendChild(image);

            // タイトル
            const title = document.createElement('div');
            title.className = 'achievement-title';
            title.textContent = achievement.name;

            // 説明
            const description = document.createElement('div');
            description.className = 'achievement-description';
            description.textContent = achievement.description;

            // 各要素をカードに追加
            card.appendChild(imageContainer);
            card.appendChild(title);
            card.appendChild(description);

            // コンテナにカードを追加
            container.appendChild(card);
        });
    } catch (error) {
        console.error("アチーブメントデータの取得中にエラーが発生しました:", error);
        alert("アチーブメントデータの取得中にエラーが発生しました。");
    }
}

// DOMが読み込まれたらアチーブメントデータを取得
document.addEventListener("DOMContentLoaded", () => {
    console.log("アチーブメント画面が読み込まれました");
    fetchAchievements();
});
