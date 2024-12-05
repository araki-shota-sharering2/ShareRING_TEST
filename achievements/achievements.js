// アチーブメントデータを取得
async function fetchAchievements() {
    try {
        // APIエンドポイントからデータを取得
        const response = await fetch('/achievements');
        const data = await response.json();

        // データ形式を確認
        if (!Array.isArray(data)) {
            console.error('取得したデータは配列ではありません:', data);
            alert('アチーブメントデータの形式が正しくありません。');
            return;
        }

        const container = document.getElementById('achievement-container');
        container.innerHTML = ''; // コンテナをクリア

        data.forEach((achievement) => {
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
