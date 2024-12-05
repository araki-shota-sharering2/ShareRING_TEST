// アチーブメントデータを取得
async function fetchAchievements() {
    try {
        // APIエンドポイント (/achievements) からデータを取得
        const response = await fetch('/achievements');
        const achievements = await response.json();

        if (achievements.error) {
            alert(achievements.error);
            return;
        }

        const container = document.getElementById('achievement-container');
        container.innerHTML = ''; // コンテナをクリア

        achievements.forEach((achievement) => {
            // カードを作成
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

            // カードをコンテナに追加
            container.appendChild(card);
        });
    } catch (error) {
        console.error('アチーブメントデータの取得に失敗しました:', error);
        alert('アチーブメントの取得中にエラーが発生しました。');
    }
}

// 初期化処理
fetchAchievements();
