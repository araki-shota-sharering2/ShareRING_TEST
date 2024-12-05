// アチーブメントデータを取得
async function fetchAchievements() {
    try {
        const response = await fetch('/achievements-handler', {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            console.error("アチーブメントデータの取得に失敗しました:", response.status);
            alert("アチーブメントデータの取得に失敗しました。");
            return;
        }

        const data = await response.json();

        // データ形式を確認し、resultsが配列かをチェック
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

            // 進捗バー
            const progressContainer = document.createElement('div');
            progressContainer.className = 'progress-container';

            const progressBar = document.createElement('div');
            progressBar.className = 'progress-bar';

            // 進捗率の計算 (進捗値 / 目標値 * 100)
            const progressPercentage = Math.min((achievement.progress / achievement.goal) * 100, 100);
            progressBar.style.width = `${progressPercentage}%`;
            progressBar.textContent = `${Math.floor(progressPercentage)}%`;

            progressContainer.appendChild(progressBar);

            // 各要素をカードに追加
            card.appendChild(imageContainer);
            card.appendChild(title);
            card.appendChild(description);
            card.appendChild(progressContainer);

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
