document.addEventListener('DOMContentLoaded', async () => {
    const awardsContainer = document.getElementById('awards-container');

    try {
        // ユーザーIDを取得
        const userId = await getUserId();

        // サーバーからアチーブメントデータを取得
        const awardsData = await fetch('/achievements-handler', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId }),
        }).then(res => res.json());

        // アチーブメントカードを生成
        awardsData.forEach(award => {
            const awardCard = document.createElement('div');
            awardCard.classList.add('award-card');
            if (!award.achieved_at) {
                awardCard.classList.add('locked');
            }

            awardCard.innerHTML = `
                <img src="${award.image_url || '/default-image.png'}" alt="${award.name}">
                <h3>${award.name}</h3>
                <p>${award.description}</p>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${(award.progress / award.goal) * 100}%"></div>
                </div>
            `;
            awardsContainer.appendChild(awardCard);
        });

        // スマホ向けに横幅を固定（デバイス幅に応じてカード幅調整）
        adjustCardLayout();
        window.addEventListener('resize', adjustCardLayout);

    } catch (error) {
        console.error('Error loading achievements:', error);
    }
});

// ユーザーIDを取得
async function getUserId() {
    try {
        const response = await fetch('/session-handler');
        const data = await response.json();
        return data.user_id;
    } catch (error) {
        console.error('Error fetching user ID:', error);
        throw error;
    }
}

// カードレイアウトを調整（画面幅に応じて列数を変更）
function adjustCardLayout() {
    const awardsContainer = document.getElementById('awards-container');
    const cards = awardsContainer.querySelectorAll('.award-card');
    const containerWidth = awardsContainer.offsetWidth;

    let columns = 1; // デフォルトは1列
    if (containerWidth >= 600) {
        columns = 2; // タブレット以上で2列
    }
    if (containerWidth >= 1024) {
        columns = 3; // デスクトップ以上で3列
    }

    const cardWidth = `${100 / columns - 2}%`; // カード幅を調整（余白を考慮）

    cards.forEach(card => {
        card.style.width = cardWidth;
        card.style.margin = '1%'; // カード間の余白を確保
    });
}
